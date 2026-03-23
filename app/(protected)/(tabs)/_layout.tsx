import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { Link, Tabs } from "expo-router";
import React from "react";

const Layout = () => {
  const { profile } = useAuth();

  const tabOptions = (
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    iconUnfocused: keyof typeof Ionicons.glyphMap,
  ) => {
    return {
      title: title,
      tabBarLabel: ({
        color,
        focused,
      }: {
        color: string;
        focused: boolean;
      }) => (
        <Text
          variant="default"
          style={{
            fontSize: 12,
            fontWeight: focused ? "bold" : "normal",
            color,
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
              <Avatar alt={profile.username ?? ""}>
                <AvatarImage
                  source={{ uri: profile.avatar_url ?? undefined }}
                />
                <AvatarFallback>
                  <Text>{profile.username?.slice(0, 2)}</Text>
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : null,
        headerShadowVisible: false,
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
