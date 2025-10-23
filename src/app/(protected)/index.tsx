import { Text } from "@/src/components/ui/text";
import { View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Protected page</Text>
    </View>
  );
}
