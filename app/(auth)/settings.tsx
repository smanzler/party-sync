import { Text } from "@/components/ui/text";
import { useTheme } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Stack.Screen
        options={{
          headerTitle: "Settings",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Text>Settings</Text>

    </SafeAreaView>
  );
}