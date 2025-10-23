import { useTheme } from "@/src/providers/ThemeProvider";
import React, { memo, useCallback } from "react";
import { Text as RNText, StyleSheet, TextProps, TextStyle } from "react-native";

type Variant = "default" | "secondary" | "tertiary" | "success" | "destructive";
type Size = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";

interface Props extends Omit<TextProps, "style"> {
  variant?: Variant;
  size?: Size;
  bold?: boolean;
  style?: TextProps["style"];
}

const Text = ({
  children,
  style,
  bold = false,
  variant = "default",
  size = "md",
  ...props
}: Props) => {
  const { colors } = useTheme();

  const getTextColor = useCallback(() => {
    const variantColors: Record<Variant, string> = {
      default: colors.text,
      secondary: colors.text + "99",
      tertiary: colors.text + "66",
      success: colors.success,
      destructive: colors.destructive,
    };
    return variantColors[variant];
  }, [colors, variant]);

  return (
    <RNText
      style={[
        textSizeStyles[size],
        { color: getTextColor() },
        bold && styles.bold,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: "bold",
  },
});

const textSizeStyles: Record<Size, TextStyle> = {
  sm: { fontSize: 12 },
  md: { fontSize: 16 },
  lg: { fontSize: 20 },
  xl: { fontSize: 24 },
  "2xl": { fontSize: 28 },
  "3xl": { fontSize: 32 },
  "4xl": { fontSize: 36 },
  "5xl": { fontSize: 40 },
};

Text.displayName = "Text";

export default memo(Text);
