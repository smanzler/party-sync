import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  deleteAvatar,
  pickImage,
  takePhoto,
  uploadAvatar,
} from "@/lib/image-upload";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

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

const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"];

const AVAILABILITY_OPTIONS = [
  "Weekday Mornings",
  "Weekday Afternoons",
  "Weekday Evenings",
  "Weekend Mornings",
  "Weekend Afternoons",
  "Weekend Evenings",
  "Late Night",
];

const ProfileSettingsPage = () => {
  const { colors } = useTheme();
  const { profile, user, setProfile, signOut } = useAuth();

  const [loading, setLoading] = useState(false);

  // Basic info
  const [username, setUsername] = useState(profile?.username || "");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    profile?.dob ? new Date(profile.dob) : null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatarData, setAvatarData] = useState<string | null>(
    profile?.avatar_url || null,
  );
  const [isAvatarUrl, setIsAvatarUrl] = useState(!!profile?.avatar_url);

  // Gaming preferences
  const [favoriteGames, setFavoriteGames] = useState<string[]>(
    profile?.favorite_games || [],
  );
  const [platforms, setPlatforms] = useState<string[]>(
    profile?.platforms || [],
  );
  const [playstyle, setPlaystyle] = useState<string | null>(
    profile?.playstyle || null,
  );
  const [availability, setAvailability] = useState<string[]>(
    profile?.availability || [],
  );
  const [voiceChat, setVoiceChat] = useState<string | null>(
    profile?.voice_chat || null,
  );
  const [bio, setBio] = useState(profile?.bio || "");

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const hasUsernameChanged = username !== profile?.username;
    const hasAvatarChanged = avatarData !== profile?.avatar_url;
    const hasDateOfBirthChanged =
      dateOfBirth?.toISOString() !==
      (profile?.dob ? new Date(profile.dob).toISOString() : null);
    const hasGamesChanged =
      JSON.stringify(favoriteGames) !==
      JSON.stringify(profile?.favorite_games || []);
    const hasPlatformsChanged =
      JSON.stringify(platforms) !== JSON.stringify(profile?.platforms || []);
    const hasPlaystyleChanged = playstyle !== profile?.playstyle;
    const hasAvailabilityChanged =
      JSON.stringify(availability) !==
      JSON.stringify(profile?.availability || []);
    const hasVoiceChatChanged = voiceChat !== profile?.voice_chat;
    const hasBioChanged = bio !== (profile?.bio || "");

    setHasChanges(
      hasUsernameChanged ||
        hasAvatarChanged ||
        hasDateOfBirthChanged ||
        hasGamesChanged ||
        hasPlatformsChanged ||
        hasPlaystyleChanged ||
        hasAvailabilityChanged ||
        hasVoiceChatChanged ||
        hasBioChanged,
    );
  }, [
    username,
    avatarData,
    dateOfBirth,
    favoriteGames,
    platforms,
    playstyle,
    availability,
    voiceChat,
    bio,
    profile,
  ]);

  const handlePhotoSelection = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: avatarData
            ? ["Cancel", "Take Photo", "Choose from Library", "Remove Photo"]
            : ["Cancel", "Take Photo", "Choose from Library"],
          destructiveButtonIndex: avatarData ? 3 : undefined,
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            const base64 = await takePhoto();
            if (base64) {
              setAvatarData(base64);
              setIsAvatarUrl(false);
            }
          } else if (buttonIndex === 2) {
            const base64 = await pickImage();
            if (base64) {
              setAvatarData(base64);
              setIsAvatarUrl(false);
            }
          } else if (buttonIndex === 3 && avatarData) {
            setAvatarData(null);
            setIsAvatarUrl(false);
          }
        },
      );
    } else {
      const options = avatarData
        ? [
            { text: "Cancel", style: "cancel" },
            {
              text: "Take Photo",
              onPress: async () => {
                const base64 = await takePhoto();
                if (base64) {
                  setAvatarData(base64);
                  setIsAvatarUrl(false);
                }
              },
            },
            {
              text: "Choose from Library",
              onPress: async () => {
                const base64 = await pickImage();
                if (base64) {
                  setAvatarData(base64);
                  setIsAvatarUrl(false);
                }
              },
            },
            {
              text: "Remove Photo",
              style: "destructive",
              onPress: () => {
                setAvatarData(null);
                setIsAvatarUrl(false);
              },
            },
          ]
        : [
            { text: "Cancel", style: "cancel" },
            {
              text: "Take Photo",
              onPress: async () => {
                const base64 = await takePhoto();
                if (base64) {
                  setAvatarData(base64);
                  setIsAvatarUrl(false);
                }
              },
            },
            {
              text: "Choose from Library",
              onPress: async () => {
                const base64 = await pickImage();
                if (base64) {
                  setAvatarData(base64);
                  setIsAvatarUrl(false);
                }
              },
            },
          ];

      Alert.alert("Profile Photo", "Select an option", options as any);
    }
  };

  const toggleArrayItem = (
    array: string[],
    item: string,
    setter: (arr: string[]) => void,
  ) => {
    if (array.includes(item)) {
      setter(array.filter((i) => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "User not found");
      return;
    }

    setLoading(true);

    if (username.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters");
      setLoading(false);
      return;
    }

    try {
      let newAvatarUrl = avatarData;

      // Handle avatar upload if it's base64 (not a URL)
      if (avatarData && !isAvatarUrl) {
        const result = await uploadAvatar(user.id, avatarData);
        if (result.success && result.url) {
          newAvatarUrl = result.url;
        } else {
          Alert.alert("Upload Error", result.error || "Failed to upload photo");
          setLoading(false);
          return;
        }
      }

      // Handle avatar deletion
      if (!avatarData && profile?.avatar_url) {
        await deleteAvatar(profile.avatar_url);
        newAvatarUrl = null;
      }

      // Update profile with all fields
      const { data, error } = await supabase.rpc("update_profile", {
        p_username: username,
        p_avatar_url: newAvatarUrl!,
        p_dob: dateOfBirth?.toISOString(),
        p_favorite_games: favoriteGames,
        p_platforms: platforms,
        p_playstyle: playstyle!,
        p_availability: availability,
        p_voice_chat: voiceChat!,
        p_bio: bio,
      });

      setLoading(false);

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      if (data) {
        setProfile(data);
      }

      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      setLoading(false);
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <KeyboardAwareScrollView style={{ flex: 1, padding: 16 }}>
      <Stack.Screen
        options={{
          headerTitle: "Edit Profile",
          headerBackButtonDisplayMode: "minimal",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={!hasChanges || loading}
              style={{ opacity: !hasChanges || loading ? 0.5 : 1 }}
            >
              <Text style={styles.saveBtn}>
                {loading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View>
        {/* Avatar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePhotoSelection}>
              <Avatar className="size-24" alt={username}>
                <AvatarImage
                  source={{
                    uri: avatarData
                      ? isAvatarUrl
                        ? avatarData
                        : `data:image/jpeg;base64,${avatarData}`
                      : undefined,
                  }}
                />
                <AvatarFallback>
                  <Text>{username?.slice(0, 2)}</Text>
                </AvatarFallback>
              </Avatar>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.changePhotoBtn}
              onPress={handlePhotoSelection}
            >
              <Text style={[styles.changePhotoText, { color: colors.primary }]}>
                {avatarData ? "Change photo" : "Add photo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Info Section */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Input
            placeholder="Enter your username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <View>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              placeholder="Tell others about yourself..."
              placeholderTextColor={colors.text + "60"}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
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

          <Input
            placeholder="Select your date of birth"
            editable={false}
            value={
              dateOfBirth
                ? dateOfBirth.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : undefined
            }
            onPress={() => setShowDatePicker(true)}
          />

          {Platform.OS === "ios" ? (
            <Modal
              visible={showDatePicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View
                style={[
                  styles.modalOverlay,
                  { backgroundColor: colors.background + "CC" },
                ]}
              >
                <View
                  style={[
                    styles.modalContent,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={styles.modalButton}
                    >
                      <Text>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Select Date</Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={styles.modalButton}
                    >
                      <Text>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={dateOfBirth || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(event: any, selectedDate?: Date) => {
                      if (selectedDate) {
                        setDateOfBirth(selectedDate);
                      }
                    }}
                    maximumDate={new Date()}
                    style={{ backgroundColor: colors.card }}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            showDatePicker && (
              <DateTimePicker
                value={dateOfBirth || new Date()}
                mode="date"
                display="default"
                onChange={(event: any, selectedDate?: Date) => {
                  setShowDatePicker(false);
                  if (event.type === "set" && selectedDate) {
                    setDateOfBirth(selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )
          )}
        </View>

        {/* Gaming Preferences Section */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Gaming Preferences</Text>

          <View>
            <Text style={styles.label}>Favorite Games</Text>
            <View style={styles.optionsGrid}>
              {POPULAR_GAMES.map((game) => (
                <TouchableOpacity
                  key={game}
                  style={[
                    styles.chipButton,
                    {
                      backgroundColor: favoriteGames.includes(game)
                        ? colors.primary
                        : colors.card,
                      borderColor: favoriteGames.includes(game)
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() =>
                    toggleArrayItem(favoriteGames, game, setFavoriteGames)
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: favoriteGames.includes(game)
                          ? colors.background
                          : colors.text,
                      },
                    ]}
                  >
                    {game}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Platforms</Text>
            <View style={styles.optionsGrid}>
              {PLATFORMS.map((platform) => (
                <TouchableOpacity
                  key={platform}
                  style={[
                    styles.chipButton,
                    {
                      backgroundColor: platforms.includes(platform)
                        ? colors.primary
                        : colors.card,
                      borderColor: platforms.includes(platform)
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() =>
                    toggleArrayItem(platforms, platform, setPlatforms)
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: platforms.includes(platform)
                          ? colors.background
                          : colors.text,
                      },
                    ]}
                  >
                    {platform}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Playstyle</Text>
            <View style={styles.optionsColumn}>
              {["casual", "competitive", "both"].map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        playstyle === style ? colors.primary : colors.card,
                      borderColor:
                        playstyle === style ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setPlaystyle(style)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          playstyle === style ? colors.background : colors.text,
                      },
                    ]}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </Text>
                  {playstyle === style && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.background}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Availability & Communication Section */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Availability & Communication</Text>

          <View>
            <Text style={styles.label}>When do you usually play?</Text>
            <View style={styles.optionsGrid}>
              {AVAILABILITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.chipButton,
                    {
                      backgroundColor: availability.includes(option)
                        ? colors.primary
                        : colors.card,
                      borderColor: availability.includes(option)
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() =>
                    toggleArrayItem(availability, option, setAvailability)
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: availability.includes(option)
                          ? colors.background
                          : colors.text,
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Voice Chat</Text>
            <View style={styles.optionsColumn}>
              {[
                { value: "yes", label: "Yes, always" },
                { value: "sometimes", label: "Sometimes" },
                { value: "no", label: "Prefer not to" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        voiceChat === option.value
                          ? colors.primary
                          : colors.card,
                      borderColor:
                        voiceChat === option.value
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => setVoiceChat(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          voiceChat === option.value
                            ? colors.background
                            : colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {voiceChat === option.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.background}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View
            style={[
              styles.infoContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          //Add Settings Button Here
          <Button onPress={() => router.push("/settings")} variant="outline">
            <Text>Settings</Text>
          </Button>
          <Button onPress={handleSignOut} variant="outline">
            <Text>Sign Out</Text>
          </Button>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ProfileSettingsPage;

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  avatarSection: {
    alignItems: "center",
    gap: 12,
  },
  changePhotoBtn: {
    padding: 8,
  },
  changePhotoText: {
    fontSize: 16,
    fontWeight: "600",
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionsColumn: {
    gap: 12,
  },
  chipButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
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
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    fontSize: 15,
  },
  infoContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveBtn: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalButton: {
    padding: 8,
    minWidth: 60,
  },
});
