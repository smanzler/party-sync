import { useTheme } from "@/src/providers/ThemeProvider";
import { forwardRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Text } from "./text";

interface ButtonProps extends Omit<PressableProps, "style"> {
  style?: StyleProp<ViewStyle>;
  title: string;
  variant?: "primary" | "secondary" | "destructive" | "outline";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<View, ButtonProps>(
  (
    {
      title,
      variant = "primary",
      size = "medium",
      loading = false,
      fullWidth = false,
      icon,
      disabled,
      onPress,
      style,
    },
    ref
  ) => {
    const { colors } = useTheme();

    const getBackgroundColor = () => {
      switch (variant) {
        case "primary":
          return colors.primary;
        case "secondary":
          return colors.card;
        case "destructive":
          return colors.destructive;
        case "outline":
          return "transparent";
        default:
          return colors.primary;
      }
    };

    const getBorderColor = () => {
      if (variant === "outline") return colors.text + "33";
      return "transparent";
    };

    const getTextColor = () => {
      if (disabled) return colors.text + "66";

      switch (variant) {
        case "primary":
          return "#fff";
        case "secondary":
          return colors.text;
        case "destructive":
          return "#fff";
        case "outline":
          return colors.text;
        default:
          return "#fff";
      }
    };

    const getHeight = () => {
      switch (size) {
        case "small":
          return 32;
        case "large":
          return 56;
        default:
          return 44;
      }
    };

    const getPadding = () => {
      switch (size) {
        case "small":
          return 12;
        case "large":
          return 24;
        default:
          return 16;
      }
    };

    const getFontSize = () => {
      switch (size) {
        case "small":
          return 14;
        case "large":
          return 18;
        default:
          return 16;
      }
    };

    return (
      <Pressable
        onPress={loading || disabled ? undefined : onPress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            height: getHeight(),
            paddingHorizontal: getPadding(),
            opacity: pressed ? 0.8 : 1,
            width: fullWidth ? "100%" : "auto",
          },
          disabled && {
            opacity: 0.5,
          },
          style,
        ]}
        ref={ref}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color={getTextColor()} />
          ) : (
            <>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text
                style={[
                  styles.text,
                  { color: getTextColor(), fontSize: getFontSize() },
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
});
