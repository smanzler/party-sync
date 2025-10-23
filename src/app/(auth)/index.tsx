import { Button } from "@/src/components/ui/button";
import { router } from "expo-router";
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
      <Button title="Login" onPress={() => router.push("/login")} />
      <Button
        title="Sign Up"
        onPress={() => router.push("/sign-up")}
        variant="secondary"
      />
    </View>
  );
}
