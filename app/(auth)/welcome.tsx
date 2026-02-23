import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/providers/ThemeProvider";
import { useProfileSetupStore } from "@/stores/profile-setup-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface WelcomeSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const slides: WelcomeSlide[] = [
  {
    id: "1",
    icon: "game-controller",
    title: "Find Your Perfect Squad",
    description:
      "Connect with gamers who share your interests, playstyle, and schedule. No more playing solo!",
    color: "#8B5CF6",
  },
  {
    id: "2",
    icon: "people",
    title: "Build Your Gaming Community",
    description:
      "Create lasting friendships with players who match your vibe. Team up and dominate together!",
    color: "#EC4899",
  },
  {
    id: "3",
    icon: "trophy",
    title: "Level Up Your Experience",
    description:
      "Whether casual or competitive, find teammates who make every game session epic!",
    color: "#F59E0B",
  },
];

const Welcome = () => {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const { setWelcomeCompleted } = useProfileSetupStore();

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / slides.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    setWelcomeCompleted(true);
  };

  const renderSlide = ({ item }: { item: WelcomeSlide }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: item.color + "20",
            },
          ]}
        >
          <Ionicons name={item.icon} size={100} color={item.color} />
        </View>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text variant="muted" style={styles.description}>
        {item.description}
      </Text>
    </View>
  );

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
          );
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Footer with progress and buttons */}
      <View
        style={[
          styles.footer,
          { paddingBottom: bottom + 24, backgroundColor: colors.card },
        ]}
      >
        {/* Progress Bar */}
        <View
          style={[
            styles.progressBarBackground,
            { backgroundColor: colors.border },
          ]}
        >
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: slides[currentIndex].color,
                width: progressWidth,
              },
            ]}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {currentIndex === slides.length - 1 ? (
            <Button onPress={handleGetStarted}>Get Started</Button>
          ) : (
            <>
              <Button
                onPress={handleGetStarted}
                variant="ghost"
                style={styles.skipButton}
              >
                <Text style={{ color: colors.text + "80" }}>Skip</Text>
              </Button>
              <Button onPress={handleNext} style={{ flex: 1 }}>
                <Text style={{ color: colors.background }}>Next</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={colors.background}
                  style={{ marginLeft: 8 }}
                />
              </Button>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 48,
  },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 17,
    lineHeight: 26,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 24,
  },
  progressBarBackground: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  skipButton: {
    paddingHorizontal: 16,
  },
});
