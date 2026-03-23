import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stack } from "expo-router";
import { useRef } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TriggerRef } from "@rn-primitives/select";
import { Uniwind, useUniwind } from "uniwind";
import { Text } from "@/components/ui/text";

interface ThemeData {
  label: string;
  value: "light" | "dark" | "system";
}

interface SizeData {
  label: string;
  value: "sm" | "md" | "lg";
}

export default function Settings() {
  const themeData: ThemeData[] = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" },
  ];
  const sizeData: SizeData[] = [
    { label: "Small", value: "sm" },
    { label: "Medium", value: "md" },
    { label: "Large", value: "lg" },
  ];

  const themeSelectRef = useRef<TriggerRef>(null);
  const sizeSelectRef = useRef<TriggerRef>(null);

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const { theme, hasAdaptiveThemes } = useUniwind();
  const activeTheme = hasAdaptiveThemes ? "system" : theme;

  const currentTheme = {
    value: activeTheme,
    label: themeData.find((t) => t.value === activeTheme)?.label ?? "system",
  };

  return (
    <View className="flex-1 p-4 gap-6">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Settings",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <View className="gap-2">
        <Text className="text-2xl font-bold">Sample Header</Text>
        <Text className="text-muted-foreground">
          This is a preview of your theme and size settings.
        </Text>
      </View>

      <Field className="gap-1">
        <FieldLabel>Theme</FieldLabel>

        <Select
          ref={themeSelectRef}
          value={currentTheme}
          onValueChange={(theme) => {
            if (!theme) return;
            console.log("settings new theme", theme.value);
            Uniwind.setTheme(theme.value as "light" | "dark" | "system");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent insets={contentInsets}>
            {themeData.map((t) => (
              <SelectItem key={t.value} value={t.value} label={t.label}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field className="gap-1">
        <FieldLabel>Size:</FieldLabel>
        <Select ref={sizeSelectRef}>
          <SelectTrigger>
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent insets={contentInsets}>
            {sizeData.map((t) => (
              <SelectItem key={t.value} value={t.value} label={t.label}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </View>
  );
}

