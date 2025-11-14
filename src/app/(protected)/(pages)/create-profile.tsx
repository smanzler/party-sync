import Avatar from "@/src/components/ui/avatar";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Spinner from "@/src/components/ui/spinner";
import Text from "@/src/components/ui/text";
import { pickImage, takePhoto, uploadAvatar } from "@/src/lib/image-upload";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";
import { useTheme } from "@/src/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack } from "expo-router";
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

const CompleteProfilePage = () => {
  const { colors } = useTheme();
  const { user, setProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [isAvatarUrl, setIsAvatarUrl] = useState(false);

  useEffect(() => {
    console.log(showDatePicker);
  }, [showDatePicker]);

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

  const handleComplete = async () => {
    if (!user) {
      Alert.alert("Error", "User not found");
      return;
    }

    setLoading(true);

    try {
      let finalAvatarUrl = avatarData;
      if (avatarData && !isAvatarUrl) {
        const result = await uploadAvatar(user.id, avatarData);
        if (result.success && result.url) {
          finalAvatarUrl = result.url;
        } else {
          Alert.alert("Upload Error", result.error || "Failed to upload photo");
          setLoading(false);
          return;
        }
      }

      const { data, error: profileError } = await supabase.rpc(
        "create_profile",
        {
          p_username: username,
          p_avatar_url: finalAvatarUrl,
          p_first_name: firstName,
          p_last_name: lastName,
          p_dob: dateOfBirth,
        }
      );

      setLoading(false);

      console.log(data, profileError);

      if (profileError) {
        if (profileError.code === "23505") {
          Alert.alert("Error", "Username is already taken");
        } else {
          Alert.alert("Error", profileError.message);
        }
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (err) {
      setLoading(false);
      console.error("Error creating profile:", err);
      Alert.alert("Error", "Failed to create profile");
    }
  };

  return (
    <KeyboardAwareScrollView>
      <Stack.Screen
        options={{
          headerTitle: "Complete Your Profile",
          headerBackVisible: false,
        }}
      />

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          One more step!
        </Text>
        <Text style={[styles.subtitle, { color: colors.text + "99" }]}>
          Choose a username to complete your profile
        </Text>

        {/* Avatar Section */}
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
              {avatarData ? "Change photo" : "Add photo (optional)"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Username Section */}
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

        <Button onPress={handleComplete} disabled={!username.trim()}>
          {loading && <Spinner color={colors.text} size={20} />}
          Complete Profile
        </Button>

        <Text style={[styles.helperText, { color: colors.text + "66" }]}>
          You can always change these later in settings
        </Text>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default CompleteProfilePage;

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
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
    marginBottom: 24,
    gap: 16,
  },
  btnPrimary: {
    marginVertical: 4,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  helperText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
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
