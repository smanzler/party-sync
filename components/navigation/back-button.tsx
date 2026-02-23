import { useTheme } from "@/providers/ThemeProvider";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { PressableProps, StyleProp, ViewProps } from "react-native";
import { Button } from "../ui/button";
import { Text } from "../ui/text";

const BackButton = ({
  style,
  ...props
}: Omit<PressableProps, "style" | "onPress"> & {
  style?: StyleProp<ViewProps>;
}) => {
  const { colors } = useTheme();

  return (
    <Button
      onPress={() => {
        router.back();
      }}
      style={[{ width: 100 }, style]}
      size="sm"
      variant="outline"
      {...props}
    >
      <ChevronLeft color={colors.text} size={16} />
      <Text>Back</Text>
    </Button>
  );
};

export default BackButton;
