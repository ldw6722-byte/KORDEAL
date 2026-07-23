import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, authAPI } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                        children,
                                                                      }) => {
  const isSupabaseConfigured = Boolean(
      import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // eslint-disable-next-line no-console
      console.warn("Supabase credentials missing. Auth features will be disabled.");
      return;
    }

    const checkSession = async () => {
      try {
        const { session } = await authAPI.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error("Failed to check session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user || null);
          setIsLoading(false);
        }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [isSupabaseConfigured]);

  const handleSignOut = async () => {
    try {
      await authAPI.signOut();
      setUser(null);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};