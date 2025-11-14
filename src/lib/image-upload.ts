import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "./supabase";

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Request camera permissions
 */
export const requestCameraPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === "granted";
};

/**
 * Request media library permissions
 */
export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === "granted";
};

/**
 * Pick an image from the media library
 */
export const pickImage = async (): Promise<string | null> => {
  const hasPermission = await requestMediaLibraryPermissions();

  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].base64 || null;
  }

  return null;
};

/**
 * Take a photo with the camera
 */
export const takePhoto = async (): Promise<string | null> => {
  const hasPermission = await requestCameraPermissions();

  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].base64 || null;
  }

  return null;
};

/**
 * Upload an image to Supabase storage
 * @param userId - The user's ID
 * @param base64 - Base64 encoded image string (without data:image prefix)
 */
export const uploadAvatar = async (
  userId: string,
  base64: string
): Promise<ImageUploadResult> => {
  try {
    // Generate a unique filename
    const fileName = `${userId}/${Date.now()}.jpg`;

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
};

/**
 * Delete an avatar from storage
 */
export const deleteAvatar = async (avatarUrl: string): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    const url = new URL(avatarUrl);
    const pathParts = url.pathname.split("/avatars/");

    if (pathParts.length < 2) {
      return false;
    }

    const filePath = pathParts[1];

    const { error } = await supabase.storage.from("avatars").remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Delete error:", error);
    return false;
  }
};
