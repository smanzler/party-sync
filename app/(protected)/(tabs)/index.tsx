import FollowButton from "@/components/follow-button";
import RefetchControl from "@/components/refresh-control";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Database } from "@/lib/database-types";
import { supabase } from "@/lib/supabase";
import { useTextSize } from "@/providers/TextSizeProvider";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

function Row({
  record,
}: {
  record: Database["public"]["Functions"]["get_friend_recommendations"]["Returns"][number];
}) {
  const handleViewProfile = () => {
    router.push({
      pathname: "/profile",
      params: { id: record.recommended_id },
    });
  };

  const { textSize } = useTextSize();
  const fontSize = textSize === "sm" ? 14 : textSize === "md" ? 18 : 20;

  return (
    <Pressable
      key={record.recommended_id}
      className="bg-card p-4 gap-4 rounded-lg"
      onPress={handleViewProfile}
    >
      <View className="flex flex-row gap-2 items-center">
        <Avatar alt={record.username}>
          <AvatarImage source={{ uri: record.avatar_url }} />
          <AvatarFallback>
            <Text>{record.username?.slice(0, 2)}</Text>
          </AvatarFallback>
        </Avatar>
        <Text className="font-bold" style={{ fontSize }}>{record.username}</Text>
        <FollowButton className="ml-auto" userId={record.recommended_id} />
      </View>
      <Text className="text-muted-foreground" style={{ fontSize }}>
        {!record.bio ? "User has no bio" : record.bio}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {record.favorite_games.map((g, i) => (
          <Badge key={g + i} variant="outline">
            <Text>{g}</Text>
          </Badge>
        ))}
      </View>
    </Pressable>
  );
}

export default function Index() {
  const {
    data: recommendations,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["friend-recommendations"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_friend_recommendations");

      if (error || !data) throw error;

      return data;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Spinner />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefetchControl refetch={refetch} />}
    >
      {!recommendations || recommendations.length === 0 ? (
        <View>
          <Text>No recommendations found</Text>
        </View>
      ) : (
        recommendations.map((r) => <Row key={r.recommended_id} record={r} />)
      )}
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
  row: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  avatar: {
    borderRadius: 16,
    width: "100%",
  },
});
