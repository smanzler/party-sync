import { useProfileSetupStore } from "@/src/stores/profile-setup-store";
import { Stack } from "expo-router";
import React from "react";

const Layout = () => {
  const { welcomeCompleted } = useProfileSetupStore();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={welcomeCompleted}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="sign-up" />
      </Stack.Protected>
      <Stack.Protected guard={!welcomeCompleted}>
        <Stack.Screen name="welcome" />
      </Stack.Protected>
    </Stack>
  );
};

export default Layout;
