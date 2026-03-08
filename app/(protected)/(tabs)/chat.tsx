import RefetchControl from "@/src/components/refresh-control";
import Avatar from "@/src/components/ui/avatar";
import Button from "@/src/components/ui/button";
import Spinner from "@/src/components/ui/spinner";
import Text from "@/src/components/ui/text";
import { Database } from "@/src/lib/database-types";
import { supabase } from "@/src/lib/supabase";
import { useTheme } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type SlimProfile = Pick<Profile, "id" | "username" | "avatar_url" | "bio">;

type Conversation = Database["public"]["Tables"]["conversation"]["Row"];

type ConversationListItem = {
  conversation: Conversation;
  otherUser: SlimProfile;
};

function ConversationRow({
  item,
  onPress,
}: {
  item: ConversationListItem;
  onPress?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: colors.card }]}>
      <Avatar
        source={item.otherUser.avatar_url ?? undefined}
        fallback={(item.otherUser.username ?? "?").charAt(0)}
        size={96}
        style={styles.smallAvatar}
      />
      <View style={{ flex: 1, gap: 4 }}>
        <Text bold>{item.otherUser.username ?? "Unknown user"}</Text>
        {!item.otherUser.bio ? <Text>User has no bio</Text> : <Text>{item.otherUser.bio}</Text>}
      </View>

      <Button onPress={onPress ?? (() => {})}>Open</Button>
    </View>
  );
}

function FriendPickRow({
  friend,
  onPick,
}: {
  friend: SlimProfile; // ✅ was Profile, but friendsQuery returns SlimProfile
  onPick: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: colors.card }]}>
      <Avatar
        source={friend.avatar_url ?? undefined}
        fallback={(friend.username ?? "?").charAt(0)}
        size={96}
        style={styles.smallAvatar}
      />
      <View style={{ flex: 1, gap: 4 }}>
        <Text bold>{friend.username ?? "Unknown user"}</Text>
        {!friend.bio ? <Text>User has no bio</Text> : <Text>{friend.bio}</Text>}
      </View>
      <Button onPress={onPick}>Message</Button>
    </View>
  );
}

async function getMyUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("Not logged in");

  return user.id;
}

/**
 * Creates (or reuses) a direct 1:1 conversation between userId and friendId.
 */
async function createOrGetDirectConversation(userId: string, friendId: string) {
  // Find candidate conversations where both users are members
  const { data: myMemberships, error: memErrA } = await supabase
    .from("conversation_member")
    .select("conversation_id")
    .eq("user_id", userId);

  if (memErrA) throw memErrA;

  const myConversationIds = (myMemberships ?? []).map((m) => m.conversation_id);

  if (myConversationIds.length > 0) {
    const { data: friendMemberships, error: memErrB } = await supabase
      .from("conversation_member")
      .select("conversation_id")
      .eq("user_id", friendId)
      .in("conversation_id", myConversationIds);

    if (memErrB) throw memErrB;

    const sharedIds = (friendMemberships ?? []).map((m) => m.conversation_id);

    if (sharedIds.length > 0) {
      const { data: existing, error: convErr } = await supabase
        .from("conversation")
        .select("id,type")
        .eq("type", "direct")
        .in("id", sharedIds)
        .limit(1)
        .maybeSingle();

      if (convErr) throw convErr;
      if (existing?.id) return existing.id;
    }
  }

  // Create new conversation
  const { data: created, error: createErr } = await supabase
    .from("conversation")
    .insert({ type: "direct", created_by_user_id: userId })
    .select("id")
    .single();

  if (createErr) throw createErr;

  const conversationId = created.id;

  // Add both members
  const { error: membersErr } = await supabase.from("conversation_member").insert([
    { conversation_id: conversationId, user_id: userId },
    { conversation_id: conversationId, user_id: friendId },
  ]);

  if (membersErr) throw membersErr;

  return conversationId;
}

export default function Page() {
  const qc = useQueryClient();
  const [mode, setMode] = useState<"list" | "new">("list");

  // ----- Conversations list -----
  const conversationsQuery = useQuery({
    queryKey: ["my-conversations"],
    queryFn: async (): Promise<ConversationListItem[]> => {
      const myId = await getMyUserId();

      // memberships for me
      const { data: memberships, error: memErr } = await supabase
        .from("conversation_member")
        .select("conversation_id")
        .eq("user_id", myId);

      if (memErr) throw memErr;

      const conversationIds = (memberships ?? []).map((m) => m.conversation_id);
      if (conversationIds.length === 0) return [];

      // conversations (direct only)
      const { data: conversations, error: convErr } = await supabase
        .from("conversation")
        .select("id,created_at,type,created_by_user_id")
        .eq("type", "direct")
        .in("id", conversationIds)
        .order("created_at", { ascending: false });

      if (convErr) throw convErr;

      const convs = conversations ?? [];
      if (convs.length === 0) return [];

      // members for these conversations
      const { data: allMembers, error: allMemErr } = await supabase
        .from("conversation_member")
        .select("conversation_id,user_id")
        .in(
          "conversation_id",
          convs.map((c) => c.id)
        );

      if (allMemErr) throw allMemErr;

      const members = allMembers ?? [];

      const otherIds = Array.from(
        new Set(
          members
            .filter((m) => m.user_id !== myId)
            .map((m) => m.user_id)
            .filter(Boolean)
        )
      );

      if (otherIds.length === 0) return [];

      // fetch slim profiles for other users
      const { data: profiles, error: profErr } = await supabase
        .from("profiles")
        .select("id,username,avatar_url,bio")
        .in("id", otherIds);

      if (profErr) throw profErr;

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      const items: ConversationListItem[] = [];
      for (const c of convs) {
        const otherMember = members.find(
          (m) => m.conversation_id === c.id && m.user_id !== myId
        );
        const otherUser = otherMember ? profileMap.get(otherMember.user_id) : undefined;
        if (otherUser) items.push({ conversation: c, otherUser });
      }

      return items;
    },
  });

  // ----- Friends list for "new conversation" picker -----
  const friendsQuery = useQuery({
    queryKey: ["my-friends-for-new-convo", mode],
    enabled: mode === "new",
    queryFn: async (): Promise<SlimProfile[]> => {
      const myId = await getMyUserId();

      const { data: rels, error: relErr } = await supabase
        .from("relationships")
        .select("user_a,user_b,status")
        .eq("status", "friends")
        .or(`user_a.eq.${myId},user_b.eq.${myId}`);

      if (relErr) throw relErr;

      const friendIds = Array.from(
        new Set(
          (rels ?? [])
            .map((r) => (r.user_a === myId ? r.user_b : r.user_a))
            .filter(Boolean)
        )
      );

      if (friendIds.length === 0) return [];

      const { data: profiles, error: profErr } = await supabase
        .from("profiles")
        .select("id,username,avatar_url,bio")
        .in("id", friendIds);

      if (profErr) throw profErr;

      return profiles ?? [];
    },
  });

  const isLoading =
    conversationsQuery.isLoading || (mode === "new" && friendsQuery.isLoading);

  const error =
    conversationsQuery.error || (mode === "new" ? friendsQuery.error : null);

  const listContent = useMemo(() => {
    if (mode === "list") {
      const items = conversationsQuery.data ?? [];
      if (items.length === 0) {
        return (
          <View>
            <Text>No conversations found</Text>
          </View>
        );
      }
      return items.map((item) => (
        <ConversationRow
          key={item.conversation.id}
          item={item}
          onPress={() => {
            Alert.alert("TODO", `Open conversation ${item.conversation.id}`);
          }}
        />
      ));
    }

    const friends = friendsQuery.data ?? [];
    if (friends.length === 0) {
      return (
        <View>
          <Text>No friends found</Text>
        </View>
      );
    }

    return friends.map((f) => (
      <FriendPickRow
        key={f.id}
        friend={f}
        onPick={async () => {
          try {
            const myId = await getMyUserId();
            const convoId = await createOrGetDirectConversation(myId, f.id);

            await qc.invalidateQueries({ queryKey: ["my-conversations"] });
            setMode("list");

            Alert.alert("Conversation ready", `Conversation ID: ${convoId}`);
          } catch (e: any) {
            console.error("create convo failed", e);
            Alert.alert("Error", e?.message ?? String(e));
          }
        }}
      />
    ));
  }, [mode, conversationsQuery.data, friendsQuery.data, qc]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Spinner />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { padding: 16 }]}>
        <Text bold>Failed to load</Text>
        <Text>{String((error as any)?.message ?? error)}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefetchControl
          refetch={async () => {
            if (mode === "list") await conversationsQuery.refetch();
            else await friendsQuery.refetch();
          }}
        />
      }
    >
      <View style={styles.headerRow}>
        <Text bold style={{ flex: 1 }}>
          {mode === "list" ? "Chats" : "New Conversation"}
        </Text>

        {mode === "list" ? (
          <Button onPress={() => setMode("new")}>New</Button>
        ) : (
          <Button onPress={() => setMode("list")}>Back</Button>
        )}
      </View>

      {listContent}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    gap: 12,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  row: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  smallAvatar: {
    borderRadius: 16,
  },
});