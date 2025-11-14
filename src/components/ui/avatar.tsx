import { useTheme } from "@/src/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type ImageSource = string | number | string[] | null | undefined;

interface AvatarProps {
  source?: ImageSource;
  fallback?: string;
  size?: number;
  style?: ViewStyle;
  showLoadingIndicator?: boolean;
  backgroundColor?: string;
}

export default function Avatar({
  source,
  fallback,
  size = 32,
  style,
  showLoadingIndicator = true,
  backgroundColor,
}: AvatarProps) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { colors, dark } = useTheme();

  const shouldShowFallback = !source || hasError;

  // Prepare image source for expo-image
  const imageSource = source
    ? typeof source === "string"
      ? source
      : source
    : undefined;

  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 },
    style,
  ];

  // Calculate font size based on avatar size
  const fontSize = Math.max(size * 0.4, 12);
  const iconSize = Math.max(size * 0.5, 16);

  // Fallback view (initials or icon)
  if (shouldShowFallback) {
    const initials = fallback?.slice(0, 2).toUpperCase() || "";

    return (
      <View
        style={[
          containerStyle,
          styles.fallback,
          {
            backgroundColor:
              backgroundColor || (dark ? colors.card : "#E5E5E5"),
          },
        ]}
      >
        {initials ? (
          <Text
            style={[
              styles.fallbackText,
              { fontSize, color: dark ? colors.text : "#666666" },
            ]}
          >
            {initials}
          </Text>
        ) : (
          <Ionicons
            name="person-outline"
            size={iconSize}
            color={dark ? colors.text + "66" : "#999999"}
          />
        )}
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {loading && showLoadingIndicator && (
        <View
          style={[
            styles.loadingContainer,
            {
              backgroundColor:
                backgroundColor || (dark ? colors.card : "#F5F5F5"),
            },
          ]}
        >
          <ActivityIndicator size="small" />
        </View>
      )}

      <Image
        source={imageSource}
        style={[
          styles.image,
          loading && showLoadingIndicator && styles.imageLoading,
        ]}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        onError={() => {
          setHasError(true);
          setLoading(false);
        }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageLoading: {
    opacity: 0,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: {
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
