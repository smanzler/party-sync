import { Text } from "@/components/ui/text";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function Profile() {
  const { id } = useLocalSearchParams();

  console.log(id);

  return (
    <View>
      <Text>Profile</Text>
    </View>
  );
}
