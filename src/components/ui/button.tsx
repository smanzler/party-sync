import { useTheme } from "@/src/providers/ThemeProvider";
import React, { forwardRef, memo, useCallback } from "react";
import {
  ActivityIndicator,
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

interface ButtonProps extends Omit<PressableProps, "style" | "onPress"> {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const Button = forwardRef<View, ButtonProps>(
  (
    {
      title,
      variant = "default",
      size = "medium",
      loading = false,
      fullWidth = false,
      icon,
      disabled,
      onPress,
      style,
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
      if (!loading && !disabled) {
        onPress();
      }
    }, [loading, disabled, onPress]);

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
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator
              color={disabled ? colors.text + "66" : buttonColors.text}
            />
          ) : (
            <>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text
                style={[
                  styles.text,
                  textSizeStyles[size],
                  {
                    color: disabled ? colors.text + "66" : buttonColors.text,
                  },
                ]}
              >
                {title}
              </Text>
            </>
          )}
        </View>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
  },
  iconContainer: {
    marginRight: 8,
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
