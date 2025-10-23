import { useTheme } from "@/src/providers/ThemeProvider";
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Text from "./text";

type Size = "sm" | "md" | "lg";
type Variant = "default" | "outlined" | "filled";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  variant?: Variant;
  size?: Size;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
}

const Input = forwardRef<TextInput, InputProps>(
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
      style,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => inputRef.current as TextInput);

    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    const handleContainerPress = useCallback(() => {
      inputRef.current?.focus();
    }, []);

    const getBorderColor = useCallback(() => {
      if (error) return colors.destructive;
      if (isFocused) return colors.text + "77";
      return colors.border || "#E5E5E5";
    }, [error, isFocused, colors]);

    return (
      <Pressable
        style={[styles.container, containerStyle]}
        onPress={handleContainerPress}
      >
        {label && (
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        )}

        <View
          style={[
            styles.inputContainer,
            sizeStyles[size],
            variantStyles[variant],
            { borderColor: getBorderColor() },
          ]}
        >
          {leftIcon}

          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { color: colors.text },
              sizeStyles[size],
              style,
            ]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={colors.text + "66"}
            {...props}
          />

          {rightIcon}
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
    gap: 8,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    backgroundColor: "red",
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

const sizeStyles: Record<Size, ViewStyle & TextStyle> = {
  sm: {
    height: 40,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  md: {
    height: 45,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  lg: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 18,
  },
};

const variantStyles: Record<Variant, ViewStyle> = {
  default: {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderBottomWidth: 1,
    borderRadius: 0,
  },
  outlined: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderRadius: 8,
  },
  filled: {
    backgroundColor: "#f5f5f5",
    borderWidth: 0,
    borderRadius: 8,
  },
};

export default memo(Input);
