import Button from "@/src/components/ui/button";
import { router } from "expo-router";
import { View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        padding: 16,
      }}
    >
      <Button onPress={() => router.push("/login")} fullWidth>
        Login
      </Button>
      <Button
        onPress={() => router.push("/sign-up")}
        variant="secondary"
        fullWidth
      >
        Sign Up
      </Button>
    </View>
  );
}
