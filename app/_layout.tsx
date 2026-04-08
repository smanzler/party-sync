import "@/global.css";
import { queryClient } from "@/lib/query";
import { NAV_THEME } from "@/lib/theme";
import { TextSizeProvider } from "@/providers/TextSizeProvider";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useUniwind } from "uniwind";
import { AuthProvider, useAuth } from "../providers/AuthProvider";

const RootLayout = () => {
  const { theme } = useUniwind();

  return (
    <KeyboardProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TextSizeProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <ThemeProvider value={NAV_THEME[theme]}>
                <RootLayoutNav />
                <PortalHost />
              </ThemeProvider>
            </GestureHandlerRootView>
          </TextSizeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </KeyboardProvider>
  );
};

function RootLayoutNav() {
  const { isAuthenticated, initializing } = useAuth();

  useEffect(() => {
    if (!initializing) {
      SplashScreen.hideAsync();
    }
  }, [initializing]);

  if (initializing) {
    return null;
  }

  return (
    <Stack>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default RootLayout;
