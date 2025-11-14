import { useAuth } from "@/src/providers/AuthProvider";
import { Stack } from "expo-router";
import React from "react";

const Layout = () => {
  const { profile } = useAuth();

  return (
    <Stack>
      <Stack.Protected guard={!!profile}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={!profile}>
        <Stack.Screen name="(pages)/create-profile" />
      </Stack.Protected>
    </Stack>
  );
};

export default Layout;
