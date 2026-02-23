import { useTheme } from "@/providers/ThemeProvider";
import { Loader2 } from "lucide-react-native";
import React, { memo } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SpinnerProps {
  size?: number;
  color?: string;
  speed?: "slow" | "normal" | "fast";
}

const AnimatedLoader2 = Animated.createAnimatedComponent(Loader2);

const Spinner = ({ size = 24, color, speed = "normal" }: SpinnerProps) => {
  const { colors } = useTheme();
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    const duration = speed === "slow" ? 1500 : speed === "fast" ? 750 : 1000;

    rotation.value = 0;
    rotation.value = withRepeat(
      withTiming(360, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [speed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <AnimatedLoader2
      stroke={color || colors.text}
      style={animatedStyle}
      size={size}
    />
  );
};

Spinner.displayName = "Spinner";

export default memo(Spinner);
