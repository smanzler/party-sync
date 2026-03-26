import { useAuth } from "@/providers/AuthProvider";
import { Stack } from "expo-router";
import React from "react";

const Layout = () => {
  const { profile } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!profile}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(pages)/profile-settings"
          options={{ presentation: "modal", headerShown: true }}
        />
        <Stack.Screen
          name="(pages)/settings"
          options={{ headerShown: true, headerTitle: "Settings" }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!profile}>
        <Stack.Screen name="profile-setup" />
      </Stack.Protected>
    </Stack>
  );
};

export default Layout;
