import { useTheme } from "@/src/providers/ThemeProvider";
import React, { forwardRef, memo, useCallback } from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Text from "./text";

type Size = "small" | "medium" | "large";
type Variant =
  | "default"
  | "primary"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost";

interface ButtonProps
  extends Omit<PressableProps, "style" | "onPress" | "children"> {
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const Button = forwardRef<View, ButtonProps>(
  (
    {
      variant = "default",
      size = "medium",
      fullWidth = false,
      disabled,
      onPress,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();

    const getColors = useCallback(() => {
      const baseColors = {
        default: {
          background: colors.text,
          text: colors.background,
          border: "transparent",
        },
        primary: {
          background: colors.primary,
          text: "#fff",
          border: "transparent",
        },
        secondary: {
          background: colors.border + "77",
          text: colors.text,
          border: "transparent",
        },
        destructive: {
          background: colors.destructive,
          text: "#fff",
          border: "transparent",
        },
        outline: {
          background: colors.text + "11",
          text: colors.text,
          border: colors.border,
        },
        ghost: {
          background: "transparent",
          text: colors.text,
          border: "transparent",
        },
      };

      return baseColors[variant];
    }, [colors, variant]);

    const handlePress = useCallback(() => {
      if (!disabled) {
        onPress();
      }
    }, [disabled, onPress]);

    const buttonColors = getColors();

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          sizeStyles[size],
          {
            backgroundColor: buttonColors.background,
            borderColor: buttonColors.border,
            width: fullWidth ? "100%" : "auto",
            opacity: pressed ? 0.8 : 1,
          },
          disabled && styles.disabled,
          style,
        ]}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (typeof child === "string") {
            return (
              <Text
                style={[
                  styles.text,
                  textSizeStyles[size],
                  {
                    color: buttonColors.text,
                  },
                ]}
              >
                {child}
              </Text>
            );
          }
          return child;
        })}
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});

const sizeStyles: Record<Size, ViewStyle> = {
  small: {
    height: 32,
    paddingHorizontal: 12,
  },
  medium: {
    height: 44,
    paddingHorizontal: 16,
  },
  large: {
    height: 56,
    paddingHorizontal: 24,
  },
};

const textSizeStyles: Record<Size, { fontSize: number }> = {
  small: { fontSize: 14 },
  medium: { fontSize: 16 },
  large: { fontSize: 18 },
};

Button.displayName = "Button";

export default memo(Button);
