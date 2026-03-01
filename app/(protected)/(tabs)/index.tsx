import RefetchControl from "@/components/refresh-control";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Database } from "@/lib/database-types";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

function Row({
  record,
}: {
  record: Database["public"]["Functions"]["get_friend_recommendations"]["Returns"][number];
}) {
  const { colors } = useTheme();

  const handleAddUser = () => {};
  return (
    <View
      key={record.recommended_id}
      style={[styles.row, { backgroundColor: colors.card }]}
    >
      <View className="flex flex-row gap-2 items-center">
        <Avatar alt={record.username}>
          <AvatarImage source={{ uri: record.avatar_url }} />
          <AvatarFallback>
            <Text>{record.username?.slice(0, 2)}</Text>
          </AvatarFallback>
        </Avatar>
        <Text className="font-bold">{record.username}</Text>
        <Button
          className="ml-auto rounded-full"
          size="sm"
          onPress={handleAddUser}
        >
          <Text>Add User</Text>
          <Icon as={Plus} className="text-primary-foreground" />
        </Button>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {record.favorite_games.map((g, i) => (
          <Badge key={g + i} variant="outline">
            <Text>{g}</Text>
          </Badge>
        ))}
      </View>
      <Text className="text-muted-foreground">
        {!record.bio ? "User has no bio" : record.bio}
      </Text>
    </View>
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
