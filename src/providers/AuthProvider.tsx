import { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    setSession(null);
    await supabase.auth.signOut();
  };

  useEffect(() => {
    let isInitializing = true;

    const handleAuthChange = (session: Session | null) => {
      if (isInitializing) return;

      setSession(session);
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
        }

        return subscription;
      } catch (error) {
        setSession(null);
        return null;
      } finally {
        setLoading(false);
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
        loading,
        signOut,
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
