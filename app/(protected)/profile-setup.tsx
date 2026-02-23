import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { pickImage, uploadAvatar } from "@/lib/image-upload";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useProfileSetupStore } from "@/stores/profile-setup-store";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ProfileStep {
  id: string;
  type:
    | "avatar"
    | "username"
    | "dob"
    | "multiselect"
    | "singleselect"
    | "textarea";
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  options?: string[];
  field?: string;
  optional?: boolean;
}

const POPULAR_GAMES = [
  "League of Legends",
  "Valorant",
  "CS2",
  "Dota 2",
  "Apex Legends",
  "Fortnite",
  "Call of Duty",
  "Overwatch 2",
  "Rocket League",
  "Minecraft",
  "Among Us",
  "Fall Guys",
];

const steps: ProfileStep[] = [
  {
    id: "1",
    type: "avatar",
    icon: "camera",
    title: "Add a Profile Picture",
    description: "Let other gamers see who you are! (Optional)",
    field: "avatarUrl",
    optional: true,
  },
  {
    id: "2",
    type: "username",
    icon: "person",
    title: "Choose Your Gamer Tag",
    description: "What username do you use on your favorite games?",
    field: "username",
  },
  {
    id: "3",
    type: "dob",
    icon: "calendar",
    title: "When's Your Birthday?",
    description: "We need this to verify your age.",
    field: "dateOfBirth",
  },
  {
    id: "4",
    type: "multiselect",
    icon: "game-controller-outline",
    title: "What Games Do You Play?",
    description: "Select all that apply. You can add more later!",
    options: POPULAR_GAMES,
    field: "favoriteGames",
  },
  {
    id: "5",
    type: "multiselect",
    icon: "hardware-chip-outline",
    title: "What Platforms?",
    description: "Select all that you use.",
    options: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
    field: "platforms",
  },
  {
    id: "6",
    type: "singleselect",
    icon: "trophy",
    title: "What's Your Playstyle?",
    description: "How do you like to play?",
    options: ["Casual", "Competitive", "Both"],
    field: "playstyle",
  },
  {
    id: "7",
    type: "multiselect",
    icon: "time-outline",
    title: "When Do You Usually Play?",
    description: "Select your typical gaming times.",
    options: [
      "Weekday Mornings",
      "Weekday Afternoons",
      "Weekday Evenings",
      "Weekend Mornings",
      "Weekend Afternoons",
      "Weekend Evenings",
      "Late Night",
    ],
    field: "availability",
  },
  {
    id: "8",
    type: "singleselect",
    icon: "mic",
    title: "Do You Use Voice Chat?",
    description: "Let others know your communication preference.",
    options: ["Yes, always", "Sometimes", "Prefer not to"],
    field: "voiceChat",
  },
  {
    id: "9",
    type: "textarea",
    icon: "chatbubble-ellipses-outline",
    title: "Tell Us About Yourself",
    description: "Write a short bio to help others get to know you. (Optional)",
    field: "bio",
    optional: true,
  },
];

const ProfileSetup = () => {
  const { colors } = useTheme();
  const { bottom, top } = useSafeAreaInsets();
  const { user, setProfile } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const { profileData, updateProfileData, resetProfileData } =
    useProfileSetupStore();

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / steps.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  const handleNext = async () => {
    if (currentIndex < steps.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Call the Supabase function to create profile
      const { data, error } = await supabase.rpc("create_profile", {
        p_avatar_url: profileData.avatarUrl!,
        p_username: profileData.username,
        p_dob: profileData.dateOfBirth!,
        p_favorite_games: profileData.favoriteGames,
        p_platforms: profileData.platforms,
        p_playstyle: profileData.playstyle!,
        p_availability: profileData.availability,
        p_voice_chat: profileData.voiceChat!,
        p_bio: profileData.bio,
      });

      if (error) throw error;

      if (data) {
        setProfile(data);
      }

      resetProfileData();
    } catch (error: any) {
      console.error("Profile creation error:", error);
      Alert.alert("Error", error.message || "Failed to create profile");
    } finally {
      setSaving(false);
    }
  };

  const isStepValid = () => {
    const step = steps[currentIndex];
    if (step.optional) return true;

    const field = step.field as keyof typeof profileData;
    const value = profileData[field];

    if (step.type === "username") {
      return typeof value === "string" && value.trim().length >= 3;
    }
    if (step.type === "dob") {
      return value !== null;
    }
    if (step.type === "multiselect") {
      return Array.isArray(value) && value.length > 0;
    }
    if (step.type === "singleselect") {
      return value !== null && value !== "";
    }
    return true;
  };

  const handlePickImage = async () => {
    if (!user) return;

    setUploading(true);
    try {
      const base64 = await pickImage();
      if (base64) {
        const result = await uploadAvatar(user.id, base64);
        if (result.success && result.url) {
          updateProfileData({ avatarUrl: result.url });
        } else {
          Alert.alert("Error", result.error || "Failed to upload image");
        }
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert("Error", "Failed to pick image");
    } finally {
      setUploading(false);
    }
  };

  const handleMultiSelect = (option: string, field: string) => {
    const currentValues = profileData[
      field as keyof typeof profileData
    ] as string[];
    const newValues = currentValues.includes(option)
      ? currentValues.filter((v) => v !== option)
      : [...currentValues, option];
    updateProfileData({ [field]: newValues });
  };

  const handleSingleSelect = (option: string, field: string) => {
    let value: string = option.toLowerCase();
    if (field === "voiceChat") {
      if (option === "Yes, always") value = "yes";
      else if (option === "Sometimes") value = "sometimes";
      else value = "no";
    } else if (field === "playstyle") {
      value = option.toLowerCase();
    }
    updateProfileData({ [field]: value });
  };

  const renderAvatarSlide = (step: ProfileStep) => (
    <ScrollView
      style={[{ width: SCREEN_WIDTH }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.slideContent}>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={handlePickImage}
            disabled={uploading}
            style={[
              styles.avatarContainer,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            {uploading ? (
              <Spinner size={40} color={colors.primary} />
            ) : profileData.avatarUrl ? (
              <Avatar alt={profileData.username}>
                <AvatarImage source={{ uri: profileData.avatarUrl }} />
                <AvatarFallback>
                  <Text>{profileData.username?.slice(0, 2)}</Text>
                </AvatarFallback>
              </Avatar>
            ) : (
              <Ionicons name="camera" size={60} color={colors.text + "60"} />
            )}
          </TouchableOpacity>
        </View>
        <Text className="font-bold" style={styles.title}>
          {step.title}
        </Text>
        <Text
          variant="muted"
          style={[styles.description, { marginBottom: 16 }]}
        >
          {step.description}
        </Text>
        <Button
          onPress={handlePickImage}
          disabled={uploading}
          variant="outline"
        >
          <Text>{uploading ? "Uploading..." : "Choose Photo"}</Text>
        </Button>
      </View>
    </ScrollView>
  );

  const renderUsernameSlide = (step: ProfileStep) => (
    <ScrollView
      style={[{ width: SCREEN_WIDTH }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.slideContent}>
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name={step.icon!} size={60} color={colors.primary} />
          </View>
        </View>
        <Text className="font-bold" style={styles.title}>
          {step.title}
        </Text>
        <Text
          variant="muted"
          style={[styles.description, { marginBottom: 32 }]}
        >
          {step.description}
        </Text>
        <Input
          placeholder="Enter your username"
          value={profileData.username}
          onChangeText={(text) => updateProfileData({ username: text })}
          autoCapitalize="none"
        />
      </View>
    </ScrollView>
  );

  const renderDOBSlide = (step: ProfileStep) => (
    <ScrollView
      style={[{ width: SCREEN_WIDTH }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.slideContent}>
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name={step.icon!} size={60} color={colors.primary} />
          </View>
        </View>
        <Text className="font-bold" style={styles.title}>
          {step.title}
        </Text>
        <Text
          variant="muted"
          style={[styles.description, { marginBottom: 32 }]}
        >
          {step.description}
        </Text>
        <TouchableOpacity
          style={[
            styles.dateButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={24} color={colors.text} />
          <Text style={{ fontSize: 16 }}>
            {profileData.dateOfBirth
              ? new Date(profileData.dateOfBirth).toLocaleDateString()
              : "Select Date"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={new Date(profileData.dateOfBirth || new Date())}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === "ios");
              if (selectedDate) {
                updateProfileData({ dateOfBirth: selectedDate.toISOString() });
              }
            }}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        )}
      </View>
    </ScrollView>
  );

  const renderTextAreaSlide = (step: ProfileStep) => (
    <ScrollView
      style={[{ width: SCREEN_WIDTH }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.slideContent}>
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name={step.icon!} size={60} color={colors.primary} />
          </View>
        </View>
        <Text className="font-bold" style={styles.title}>
          {step.title}
        </Text>
        <Text
          variant="muted"
          style={[styles.description, { marginBottom: 32 }]}
        >
          {step.description}
        </Text>
        <TextInput
          placeholder="Tell us about your gaming style, favorite moments, or what you're looking for in a squad..."
          placeholderTextColor={colors.text + "60"}
          value={profileData.bio}
          onChangeText={(text) => updateProfileData({ bio: text })}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={[
            styles.textArea,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
        />
      </View>
    </ScrollView>
  );

  const renderMultiSelectSlide = (step: ProfileStep) => (
    <ScrollView
      style={[{ width: SCREEN_WIDTH }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.slideContent}>
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name={step.icon!} size={60} color={colors.primary} />
          </View>
        </View>
        <Text className="font-bold" style={styles.title}>
          {step.title}
        </Text>
        <Text
          variant="muted"
          style={[styles.description, { marginBottom: 32 }]}
        >
          {step.description}
        </Text>
        <View style={styles.optionsContainer}>
          {step.options?.map((option) => {
            const currentValues = profileData[
              step.field as keyof typeof profileData
            ] as string[];
            const isSelected = currentValues?.includes(option);
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleMultiSelect(option, step.field!)}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: isSelected ? colors.background : colors.text,
                    },
                  ]}
                >
                  {option}
                </Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.background}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

  const renderSingleSelectSlide = (step: ProfileStep) => (
    <ScrollView
      style={[{ width: SCREEN_WIDTH }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.slideContent}>
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name={step.icon!} size={60} color={colors.primary} />
          </View>
        </View>
        <Text className="font-bold" style={styles.title}>
          {step.title}
        </Text>
        <Text
          variant="muted"
          style={[styles.description, { marginBottom: 32 }]}
        >
          {step.description}
        </Text>
        <View style={styles.optionsContainer}>
          {step.options?.map((option) => {
            let currentValue = profileData[
              step.field as keyof typeof profileData
            ] as string;

            // Map display values back to stored values
            let isSelected = false;
            if (step.field === "voiceChat") {
              if (option === "Yes, always") isSelected = currentValue === "yes";
              else if (option === "Sometimes")
                isSelected = currentValue === "sometimes";
              else isSelected = currentValue === "no";
            } else if (step.field === "playstyle") {
              isSelected = currentValue === option.toLowerCase();
            }

            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleSingleSelect(option, step.field!)}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: isSelected ? colors.background : colors.text,
                    },
                  ]}
                >
                  {option}
                </Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.background}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

  const renderSlide = ({ item }: { item: ProfileStep }) => {
    switch (item.type) {
      case "avatar":
        return renderAvatarSlide(item);
      case "username":
        return renderUsernameSlide(item);
      case "dob":
        return renderDOBSlide(item);
      case "multiselect":
        return renderMultiSelectSlide(item);
      case "singleselect":
        return renderSingleSelectSlide(item);
      case "textarea":
        return renderTextAreaSlide(item);
      default:
        return null;
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress Bar */}
      <View
        style={[
          styles.progressBarContainer,
          {
            paddingTop: top,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.progressHeader}>
          <Text variant="muted" style={styles.progressText}>
            {currentIndex + 1} of {steps.length}
          </Text>
        </View>
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
                backgroundColor: colors.primary,
                width: progressWidth,
              },
            ]}
          />
        </View>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
          );
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Navigation Buttons */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: bottom + 16,
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={styles.buttonRow}>
          {currentIndex > 0 && (
            <Button
              onPress={() => {
                flatListRef.current?.scrollToIndex({
                  index: currentIndex - 1,
                  animated: true,
                });
              }}
              variant="secondary"
              style={styles.backButton}
              disabled={saving}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={colors.text}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: colors.text }}>Back</Text>
            </Button>
          )}
          <Button
            onPress={handleNext}
            disabled={!isStepValid() || saving}
            style={[
              styles.nextButton,
              {
                backgroundColor: isStepValid() ? colors.primary : colors.border,
                flex: 1,
              },
            ]}
          >
            {saving ? (
              <Spinner size={20} color={colors.background} />
            ) : (
              <>
                <Text
                  className="font-bold"
                  style={[
                    styles.nextButtonText,
                    {
                      color: isStepValid()
                        ? colors.background
                        : colors.text + "60",
                    },
                  ]}
                >
                  {currentIndex === steps.length - 1
                    ? "Complete Profile"
                    : "Next"}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={isStepValid() ? colors.background : colors.text + "60"}
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ProfileSetup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressBarContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressHeader: {
    marginBottom: 12,
    paddingTop: 8,
  },
  progressText: {
    fontSize: 15,
    fontWeight: "600",
  },
  progressBarBackground: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  slideContent: {
    alignItems: "center",
    paddingHorizontal: 32,
    width: "100%",
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    width: "100%",
  },
  optionsContainer: {
    width: "100%",
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  textArea: {
    width: "100%",
    minHeight: 120,
    maxHeight: 200,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    fontSize: 15,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
