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
      <Button title="Login" onPress={() => router.push("/login")} fullWidth />
      <Button
        title="Sign Up"
        onPress={() => router.push("/sign-up")}
        variant="secondary"
        fullWidth
      />
    </View>
  );
}
