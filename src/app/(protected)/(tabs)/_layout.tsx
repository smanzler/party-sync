import Avatar from "@/src/components/ui/avatar";
import Text from "@/src/components/ui/text";
import { useAuth } from "@/src/providers/AuthProvider";
import { useTheme } from "@/src/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { Link, Tabs } from "expo-router";
import React from "react";

const Layout = () => {
  const { colors } = useTheme();
  const { profile } = useAuth();

  const tabOptions = (
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    iconUnfocused: keyof typeof Ionicons.glyphMap,
  ) => {
    return {
      title: title,
      tabBarLabel: ({ focused }: { focused: boolean }) => (
        <Text
          variant="default"
          bold={focused}
          style={{
            fontSize: 12,
            color: focused ? colors.primary : colors.text,
          }}
        >
          {title}
        </Text>
      ),
      tabBarIcon: ({
        color,
        size,
        focused,
      }: {
        color: string;
        size: number;
        focused: boolean;
      }) => (
        <Ionicons
          name={focused ? icon : iconUnfocused}
          size={size}
          color={color}
        />
      ),
    };
  };

  return (
    <Tabs
      screenOptions={{
        headerLeft: () =>
          profile ? (
            <Link
              href="/(protected)/(pages)/profile-settings"
              style={{ marginLeft: 16 }}
            >
              <Avatar
                source={profile?.avatar_url || undefined}
                fallback={profile?.username}
                size={28}
                backgroundColor={colors.background}
              />
            </Link>
          ) : null,
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
          padding: 16,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={tabOptions("Find Friends", "person", "person-outline")}
      />
      <Tabs.Screen
        name="chat"
        options={tabOptions("Chat", "chatbox", "chatbox-outline")}
      />
    </Tabs>
  );
};

export default Layout;
