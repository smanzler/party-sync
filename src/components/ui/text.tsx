import { useTheme } from "@/src/providers/ThemeProvider";
import { Text as RNText, StyleSheet, TextProps } from "react-native";

interface Props extends TextProps {
  variant?: "default" | "secondary" | "tertiary" | "success" | "destructive";
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  bold?: boolean;
}

export const Text = ({
  children,
  style,
  bold = false,
  variant = "default",
  size = "md",
  ...props
}: Props) => {
  const { colors } = useTheme();

  const getColor = () => {
    switch (variant) {
      case "secondary":
        return colors.text + "99";
      case "tertiary":
        return colors.text + "66";
      case "success":
        return colors.success;
      case "destructive":
        return colors.destructive;
      default:
        return colors.text;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "sm":
        return 12;
      case "md":
        return 16;
      case "lg":
        return 20;
      case "xl":
        return 24;
      case "2xl":
        return 28;
      case "3xl":
        return 32;
      case "4xl":
        return 36;
      case "5xl":
        return 40;
      default:
        return 16;
    }
  };

  return (
    <RNText
      style={[
        { color: getColor(), fontSize: getFontSize() },
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
