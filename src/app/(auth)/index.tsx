import Button from "@/src/components/ui/button";
import Text from "@/src/components/ui/text";
import { useTheme } from "@/src/providers/ThemeProvider";
import { router } from "expo-router";
import { Gamepad2 } from "lucide-react-native";
import { View } from "react-native";

export default function Index() {
  const { colors } = useTheme();

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
        <Text size="5xl" bold>
          PartySync
        </Text>
      </View>

      <View style={{ gap: 8, width: "100%" }}>
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
    </View>
  );
}
