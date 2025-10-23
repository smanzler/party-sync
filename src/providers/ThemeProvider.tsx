import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  Theme,
  useTheme as useNavigationTheme,
} from "@react-navigation/native";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

const THEME_STORAGE_KEY = "@theme_mode";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  theme: CustomTheme;
}

export interface CustomTheme extends Theme {
  colors: Theme["colors"] & {
    destructive: string;
    success: string;
    warning: string;
    info: string;
  };
}

const customThemeProps = {
  light: {
    colors: {
      primary: "#007aff",
      background: "#f2f2f2",
      card: "#ffffff",
      text: "#1c1c1e",
      border: "#d8d8d8",
      notification: "#ff3b30",
      destructive: "#ff3b30",
      success: "#30d158",
      warning: "#ff9500",
      info: "#5856d6",
    },
  },
  dark: {
    colors: {
      primary: "#0a84ff",
      background: "#010101",
      card: "#121212",
      text: "#e5e5e7",
      border: "#272729",
      notification: "#ff453a",
      destructive: "#ff453a",
      success: "#30d158",
      warning: "#ff9f0a",
      info: "#5e5ce6",
    },
  },
};

const lightTheme: CustomTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...customThemeProps.light.colors,
  },
};

const darkTheme: CustomTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...customThemeProps.dark.colors,
  },
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedMode) => {
      if (
        savedMode === "light" ||
        savedMode === "dark" ||
        savedMode === "system"
      ) {
        setMode(savedMode);
      }
    });
  }, []);

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  const theme =
    mode === "system"
      ? systemColorScheme === "dark"
        ? darkTheme
        : lightTheme
      : mode === "dark"
      ? darkTheme
      : lightTheme;

  console.log("theme", theme);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode: handleSetMode,
        theme,
      }}
    >
      <NavigationThemeProvider value={theme}>
        {children}
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const theme = useNavigationTheme();
  return theme as CustomTheme;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeProvider");
  }
  return context;
}
