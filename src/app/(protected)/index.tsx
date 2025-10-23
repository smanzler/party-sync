import Text from "@/src/components/ui/text";
import { useAuth } from "@/src/providers/AuthProvider";
import { Stack } from "expo-router";
import { Button, View } from "react-native";

export default function Index() {
  const { signOut } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack.Screen
        options={{
          headerTitle: "Protected",
          headerRight: () => (
            <Button title="Logout" onPress={() => signOut()} />
          ),
        }}
      />
      <Text>Protected page</Text>
    </View>
  );
}
