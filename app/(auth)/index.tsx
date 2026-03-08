import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/providers/ThemeProvider";
import { useProfileSetupStore } from "@/stores/profile-setup-store";
import { router } from "expo-router";
import { Gamepad2 } from "lucide-react-native";
import { View } from "react-native";

export default function Index() {
  const { colors } = useTheme();
  const { setWelcomeCompleted } = useProfileSetupStore();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 100,
        padding: 16,
      }}
    >
      <View style={{ gap: 8, alignItems: "center" }}>
        <Gamepad2 size={150} color={colors.text} />
        <Text variant="h1">PartySync</Text>
      </View>

      <View style={{ gap: 8, width: "100%" }}>
        <Button variant="outline" onPress={() => setWelcomeCompleted(false)}>
          <Text>Reset Welcome</Text>
        </Button>
        <Button onPress={() => router.push("/login")}>
          <Text>Login</Text>
        </Button>
        <Button onPress={() => router.push("/sign-up")} variant="secondary">
          <Text>Sign Up</Text>
        </Button>
      </View>
    </View>
  );
}
