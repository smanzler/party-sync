import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface ProfileSetupData {
  // Basic info
  username: string;
  dateOfBirth: string | null;
  avatarUrl: string | null;

  // Gaming preferences
  favoriteGames: string[];
  platforms: string[];
  playstyle: "casual" | "competitive" | "both" | null;
  availability: string[];
  voiceChat: "yes" | "no" | "sometimes" | null;
  bio: string;
}

interface ProfileSetupStore {
  // Welcome screen completion (simple 2-3 slide intro)
  welcomeCompleted: boolean;
  setWelcomeCompleted: (completed: boolean) => void;

  // Profile setup data
  profileData: ProfileSetupData;
  updateProfileData: (data: Partial<ProfileSetupData>) => void;
  resetProfileData: () => void;
}

const initialProfileData: ProfileSetupData = {
  username: "",
  dateOfBirth: null,
  avatarUrl: null,
  favoriteGames: [],
  platforms: [],
  playstyle: null,
  availability: [],
  voiceChat: null,
  bio: "",
};

export const useProfileSetupStore = create<ProfileSetupStore>()(
  persist(
    (set) => ({
      welcomeCompleted: false,
      setWelcomeCompleted: (completed) => set({ welcomeCompleted: completed }),

      profileData: initialProfileData,
      updateProfileData: (data) =>
        set((state) => ({
          profileData: { ...state.profileData, ...data },
        })),
      resetProfileData: () => set({ profileData: initialProfileData }),
    }),
    {
      name: "profile-setup-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
