import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { PressableProps, StyleProp, ViewProps } from "react-native";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Icon } from "../ui/icon";

const BackButton = ({
  style,
  ...props
}: Omit<PressableProps, "style" | "onPress"> & {
  style?: StyleProp<ViewProps>;
}) => {
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
      <Icon as={ChevronLeft} />
      <Text>Back</Text>
    </Button>
  );
};

export default BackButton;
