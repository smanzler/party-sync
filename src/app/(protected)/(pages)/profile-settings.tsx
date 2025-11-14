import Avatar from "@/src/components/ui/avatar";
import Input from "@/src/components/ui/input";
import Text from "@/src/components/ui/text";
import {
  deleteAvatar,
  pickImage,
  takePhoto,
  uploadAvatar,
} from "@/src/lib/image-upload";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";
import { useTheme } from "@/src/providers/ThemeProvider";
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
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const ProfileSettingsPage = () => {
  const { colors } = useTheme();
  const { profile, user, setProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    profile?.dob ? new Date(profile.dob) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Can be either a base64 string or a URL (for existing/social avatars)
  const [avatarData, setAvatarData] = useState<string | null>(
    profile?.avatar_url || null
  );
  const [isAvatarUrl, setIsAvatarUrl] = useState(!!profile?.avatar_url);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const hasUsernameChanged = username !== profile?.username;
    const hasAvatarChanged = avatarData !== profile?.avatar_url;
    const hasFirstNameChanged = firstName !== profile?.first_name;
    const hasLastNameChanged = lastName !== profile?.last_name;
    const hasDateOfBirthChanged =
      dateOfBirth?.toISOString() !==
      (profile?.dob ? new Date(profile.dob).toISOString() : null);
    setHasChanges(
      hasUsernameChanged ||
        hasAvatarChanged ||
        hasFirstNameChanged ||
        hasLastNameChanged ||
        hasDateOfBirthChanged
    );
  }, [username, avatarData, firstName, lastName, dateOfBirth, profile]);

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
        }
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

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "User not found");
      return;
    }

    setLoading(true);

    if (username.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters");
      return;
    }
    if (username.length > 20) {
      Alert.alert("Error", "Username must be less than 20 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert(
        "Error",
        "Username can only contain letters, numbers, and underscores"
      );
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
        console.log(profile.avatar_url);
        await deleteAvatar(profile.avatar_url);
        newAvatarUrl = null;
      }

      // Update profile
      const { data, error } = await supabase.rpc("update_profile", {
        p_username: username,
        p_avatar_url: newAvatarUrl,
        p_first_name: firstName,
        p_last_name: lastName,
        p_dob: dateOfBirth,
      });

      setLoading(false);

      if (error) {
        Alert.alert("Error", error.message);
        setLoading(false);
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

  return (
    <KeyboardAwareScrollView style={{ flex: 1, padding: 16 }}>
      <Stack.Screen
        options={{
          headerTitle: "Profile Settings",
          headerBackButtonDisplayMode: "minimal",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={!hasChanges || loading}
              style={{ opacity: !hasChanges || loading ? 0.5 : 1 }}
            >
              <Text style={[styles.saveBtn, { color: colors.primary }]}>
                Save
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View>
        {/* Avatar Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Profile Photo
          </Text>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePhotoSelection}>
              <Avatar
                source={
                  avatarData
                    ? isAvatarUrl
                      ? avatarData
                      : `data:image/jpeg;base64,${avatarData}`
                    : undefined
                }
                fallback={username}
                size={120}
              />
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

        <View style={styles.form}>
          <Input
            label="First Name"
            placeholder="Enter your first name"
            autoCapitalize="none"
            value={firstName}
            onChangeText={setFirstName}
          />

          <Input
            label="Last Name"
            placeholder="Enter your last name"
            autoCapitalize="none"
            value={lastName}
            onChangeText={setLastName}
          />

          <Input
            label="Date of Birth"
            placeholder="Select your date of birth"
            autoCapitalize="none"
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
            helperText="Tap to select date"
            leftIcon={
              <Ionicons name="calendar" size={20} color={colors.text} />
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
                      <Text style={{ color: colors.primary }}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                      Select Date
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={styles.modalButton}
                    >
                      <Text style={{ color: colors.primary }}>Done</Text>
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

          <Input
            label="Username"
            placeholder="Enter your username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            helperText="3-20 characters, letters, numbers, and underscores only"
            leftIcon={<Ionicons name="at" size={20} color={colors.text} />}
          />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account
          </Text>
          <View
            style={[
              styles.infoContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.infoLabel, { color: colors.text + "99" }]}>
              Email
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user?.email}
            </Text>
          </View>
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
    gap: 16,
    marginBottom: 24,
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
  signOutBtn: {
    marginTop: 16,
    borderWidth: 2,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveBtn: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 12,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
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
