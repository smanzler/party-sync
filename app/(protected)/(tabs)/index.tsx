import RefetchControl from "@/components/refresh-control";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Database } from "@/lib/database-types";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useUniwind } from "uniwind";

function Row({
  record,
}: {
  record: Database["public"]["Functions"]["get_friend_recommendations"]["Returns"][number];
}) {
  const { theme } = useUniwind();

  const handleAddUser = () => {};

  const handlePress = () => {
    router.push({
      pathname: "/(protected)/(pages)/profile",
      params: { id: record.recommended_id },
    });
  };

  return (
    <TouchableOpacity
      key={record.recommended_id}
      className="p-4 gap-2 rounded-xl bg-card"
      onPress={handlePress}
    >
      <View className="flex flex-row gap-2 items-center">
        <Avatar alt={record.username}>
          <AvatarImage source={{ uri: record.avatar_url }} />
          <AvatarFallback>
            <Text>{record.username?.slice(0, 2)}</Text>
          </AvatarFallback>
        </Avatar>
        <Text className="font-medium">{record.username}</Text>
      </View>
      <Text variant="muted" className="mb-4">
        {!record.bio ? "User has no bio" : record.bio}
      </Text>
      <Button onPress={handleAddUser}>
        <Text>Add User</Text>
        <Icon as={Plus} className="text-primary-foreground" />
      </Button>
    </TouchableOpacity>
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

      console.log(error, data);

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
