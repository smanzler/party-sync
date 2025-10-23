import { useTheme } from "@/src/providers/ThemeProvider";
import React, { forwardRef, useRef, useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Text } from "./text";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  variant?: "default" | "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconPress,
      variant = "outlined",
      size = "md",
      containerStyle,
      inputStyle,
      style,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const localRef = useRef<TextInput>(null);
    const inputRef = (ref || localRef) as React.RefObject<TextInput>;

    const getSizeStyles = () => {
      switch (size) {
        case "sm":
          return {
            height: 40,
            paddingHorizontal: 12,
            fontSize: 14,
          };
        case "lg":
          return {
            height: 56,
            paddingHorizontal: 16,
            fontSize: 18,
          };
        default:
          return {
            height: 45,
            paddingHorizontal: 14,
            fontSize: 16,
          };
      }
    };

    const getVariantStyles = () => {
      const sizeStyles = getSizeStyles();

      switch (variant) {
        case "filled":
          return {
            backgroundColor: colors.card,
            borderWidth: 0,
            borderRadius: 12,
            ...sizeStyles,
          };
        case "default":
          return {
            backgroundColor: "transparent",
            borderWidth: 0,
            borderBottomWidth: 1,
            borderRadius: 0,
            ...sizeStyles,
          };
        default:
          return {
            backgroundColor: colors.background,
            borderWidth: 2,
            borderRadius: 12,
            ...sizeStyles,
          };
      }
    };

    const getBorderColor = () => {
      if (error) return colors.destructive;
      if (isFocused) return colors.text + "77";
      return colors.border || "#E5E5E5";
    };

    const inputContainerStyle = [
      styles.inputContainer,
      getVariantStyles(),
      {
        borderColor: getBorderColor(),
      },
      inputStyle,
    ];

    return (
      <Pressable
        style={[styles.container, containerStyle]}
        onPress={() => inputRef.current?.focus()}
      >
        {label && (
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        )}

        <View style={inputContainerStyle}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                color: colors.text,
                fontSize: getSizeStyles().fontSize,
              },
              leftIcon ? styles.inputWithLeftIcon : null,
              rightIcon ? styles.inputWithRightIcon : null,
              style,
            ]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {rightIcon && (
            <TouchableOpacity
              style={styles.rightIconContainer}
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>

        {(error || helperText) && (
          <Text
            style={[
              styles.helperText,
              {
                color: error ? colors.destructive : colors.text + "99",
              },
            ]}
          >
            {error || helperText}
          </Text>
        )}
      </Pressable>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  leftIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  rightIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
