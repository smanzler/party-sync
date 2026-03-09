import RefetchControl from "@/components/refresh-control";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Database } from "@/lib/database-types";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router"; // Added for navigation
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type SlimProfile = Pick<Profile, "id" | "username" | "avatar_url" | "bio">;

export default function ChatPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const { colors } = useTheme();
  const [mode, setMode] = useState<"list" | "new">("list");

  // 1. Fetch Existing Conversations
  const conversationsQuery = useQuery({
    queryKey: ["my-conversations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // 1. Get ONLY my own membership rows (allowed by the "dumb" policy)
      const { data: myMemberships, error: memErr } = await supabase
        .from("conversation_member")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (memErr || !myMemberships.length) return [];

      const convoIds = myMemberships.map(m => m.conversation_id);

      // 2. Use a Service Role RPC or a refined query to get the "others" 
      // For now, let's just get the profiles of everyone in those conversations
      // that ISN'T you.
      const { data: others, error: othersErr } = await supabase
        .from("conversation_member")
        .select(`
        conversation_id,
        profiles!inner (id, username, avatar_url, bio)
      `)
        .in("conversation_id", convoIds)
        .neq("user_id", user.id);

      if (othersErr) throw othersErr;
      return others;
    },
  });

  // 2. Fetch Mutual Friends for New Chat
  const friendsQuery = useQuery({
    queryKey: ["mutual-friends-filtered"],
    enabled: mode === "new",
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // 1. Get mutual friends (intersection logic)
      const [f1, f2] = await Promise.all([
        supabase.from("follows").select("target_user_id").eq("user_id", user.id),
        supabase.from("follows").select("user_id").eq("target_user_id", user.id)
      ]);
      const mutualIds = (f1.data?.map(f => f.target_user_id) || [])
        .filter(id => (f2.data?.map(f => f.user_id) || []).includes(id));

      if (mutualIds.length === 0) return [];

      // 2. Get IDs of people you ALREADY have a chat with
      const { data: existingChats } = await supabase
        .from("conversation_member")
        .select("user_id")
        .in("conversation_id", (
          await supabase.from("conversation_member").select("conversation_id").eq("user_id", user.id)
        ).data?.map(c => c.conversation_id) || [])
        .neq("user_id", user.id);

      const chattedIds = existingChats?.map(c => c.user_id) || [];

      // 3. Filter mutual friends to exclude those with existing chats
      const finalIds = mutualIds.filter(id => !chattedIds.includes(id));

      if (finalIds.length === 0) return [];

      const { data: profiles } = await supabase.from("profiles").select("id, username, avatar_url, bio").in("id", finalIds);
      return profiles || [];
    },
  });

  const handleCreateChat = async (friendId: string) => {
    try {
      // 1. Identify the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to start a chat.");

      // 2. Check if a direct conversation already exists using the RPC
      const { data: existing, error: rpcError } = await supabase.rpc('get_existing_conversation', {
        p_user_id: user.id,
        p_friend_id: friendId
      });

      if (rpcError) throw rpcError;

      // If it exists, skip creation and jump straight to the chat
      if (existing && existing.length > 0) {
        setMode("list");
        router.push(`/chat/${existing[0].conversation_id}`);
        return;
      }

      // 3. Create the new conversation record
      // This triggers the "Users can create conversations" RLS policy
      const { data: convo, error: convoErr } = await supabase
        .from("conversation")
        .insert({
          type: "direct",
          created_by_user_id: user.id // Matches auth.uid() for the RLS check
        })
        .select("id")
        .single();

      if (convoErr) throw convoErr;

      // 4. Add both users to the conversation_member table
      // This triggers the "Users can insert conversation members" RLS policy
      const { error: memberErr } = await supabase.from("conversation_member").insert([
        { conversation_id: convo.id, user_id: user.id },
        { conversation_id: convo.id, user_id: friendId }
      ]);

      if (memberErr) throw memberErr;

      // 5. Update the UI and navigate
      await qc.invalidateQueries({ queryKey: ["my-conversations"] });
      setMode("list");
      router.push(`/chat/${convo.id}`);

    } catch (e: any) {
      console.error("Chat Creation Error:", e);
      Alert.alert("Error", e.message || "Failed to start conversation");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefetchControl refetch={async () => {
        mode === "new" ? await friendsQuery.refetch() : await conversationsQuery.refetch();
      }} />}
    >
      <View style={styles.headerRow}>
        <Text className="text-2xl font-bold" style={{ flex: 1 }}>
          {mode === "list" ? "Messages" : "New Chat"}
        </Text>
        <Button onPress={() => setMode(mode === "list" ? "new" : "list")}>
          <Text>{mode === "list" ? "+" : "Back"}</Text>
        </Button>
      </View>

      {mode === "list" ? (
        <View style={{ gap: 12 }}>
          {conversationsQuery.isLoading ? <Spinner /> :
            conversationsQuery.data?.length === 0 ? (
              <View style={styles.centered}><Text>No active conversations.</Text></View>
            ) : (
              conversationsQuery.data?.map((item) => (
                <View key={item.conversation_id} style={[styles.row, { backgroundColor: colors.card }]}>
                  <Avatar alt={item.profiles.username ?? "User"}>
                    <AvatarImage source={{ uri: item.profiles.avatar_url ?? undefined }} />
                    <AvatarFallback><Text>{item.profiles.username?.[0]}</Text></AvatarFallback>
                  </Avatar>
                  <View style={{ flex: 1 }}>
                    <Text className="font-bold">{item.profiles.username}</Text>
                  </View>
                  <Button onPress={() => router.push(`/chat/${item.conversation_id}`)}>
                    <Text>Open</Text>
                  </Button>
                </View>
              ))
            )
          }
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {friendsQuery.isLoading ? <Spinner /> : friendsQuery.data?.map((friend) => (
            <View key={friend.id} style={[styles.row, { backgroundColor: colors.card }]}>
              <Avatar alt={friend.username ?? "User"}>
                <AvatarImage source={{ uri: friend.avatar_url ?? undefined }} />
                <AvatarFallback><Text>{friend.username?.[0]}</Text></AvatarFallback>
              </Avatar>
              <View style={{ flex: 1 }}>
                <Text className="font-bold">{friend.username}</Text>
              </View>
              <Button onPress={() => handleCreateChat(friend.id)}>
                <Text>Message</Text>
              </Button>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: { padding: 16, gap: 12, flexGrow: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, gap: 12 },
  centered: { padding: 40, alignItems: "center" }
});