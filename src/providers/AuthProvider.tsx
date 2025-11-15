import { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  profile: Profile | null;
  profileLoading: boolean;
  initializing: boolean;
  setProfile: (profile: Profile | null) => void;
}

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  dob: string;
  first_name: string;
  last_name: string;
  favorite_games: string[];
  platforms: string[];
  playstyle: string;
  availability: string[];
  voice_chat: string;
  bio: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  const fetchProfile = useCallback(async (userId?: string) => {
    if (!userId) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) {
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error in profile fetch flow:", error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  useEffect(() => {
    let isInitializing = true;

    const handleAuthChange = (session: Session | null) => {
      if (isInitializing) return;

      setSession(session);

      if (session?.user?.id) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    };

    const initialize = async () => {
      try {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_, session) =>
          handleAuthChange(session)
        );

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          setSession(null);
        } else {
          setSession(session);
          if (session?.user?.id) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        }

        return subscription;
      } catch (error) {
        setSession(null);
        setProfile(null);
        return null;
      } finally {
        setInitializing(false);
        isInitializing = false;
      }
    };

    const subscriptionPromise = initialize();

    return () => {
      subscriptionPromise.then((sub) => sub?.unsubscribe());
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        isAuthenticated: !!session?.user && !session?.user.is_anonymous,
        signOut,
        profile,
        profileLoading,
        setProfile,
        initializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}
