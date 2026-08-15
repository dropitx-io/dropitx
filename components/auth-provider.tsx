"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  onAuthStateChanged,
  signInWithGoogle as fbGoogle,
  signInWithGitHub as fbGitHub,
  signInWithEmail as fbEmail,
  signUpWithEmail as fbSignUp,
  signOut as fbSignOut,
  handleRedirectResult,
} from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/client";
import { authFetch } from "@/lib/api-client";

export interface UserProfile {
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  ensureSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithGitHub: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  ensureSession: async () => {},
  signOut: async () => {},
});

async function postSessionLogin(idToken: string): Promise<void> {
  await fetch("/api/auth/session-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

async function postSessionLogout(): Promise<void> {
  await fetch("/api/auth/session-logout", { method: "POST" });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const lastProfileUid = useRef<string | null>(null);
  const lastSyncUid = useRef<string | null>(null);

  const refreshProfile = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) {
      setProfile(null);
      return;
    }
    if (lastProfileUid.current === current.uid && profile !== null) return;
    lastProfileUid.current = current.uid;
    try {
      const res = await authFetch("/api/auth/session");
      if (res.ok) {
        setProfile((await res.json()) as UserProfile);
      }
    } catch {
      /* provisioning best-effort; cookie may still be valid */
    }
  }, [profile]);

  const ensureSession = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) return;
    if (lastSyncUid.current === current.uid) {
      await refreshProfile();
      return;
    }
    lastSyncUid.current = current.uid;
    const idToken = await current.getIdToken();
    await postSessionLogin(idToken);
    await refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    handleRedirectResult()
      .then((u) => (u ? ensureSession() : Promise.resolve()))
      .catch(() => {});
    const unsub = onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
      if (u) void refreshProfile();
      else setProfile(null);
    });
    return () => unsub();
  }, [ensureSession, refreshProfile]);

  const signInWithGoogle = useCallback(async () => {
    await fbGoogle();
    await ensureSession();
  }, [ensureSession]);

  const signInWithGitHub = useCallback(async () => {
    await fbGitHub();
    await ensureSession();
  }, [ensureSession]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await fbEmail(email, password);
    await ensureSession();
  }, [ensureSession]);

  const signUpWithEmail = useCallback(async (email: string, password: string, displayName?: string) => {
    await fbSignUp(email, password, displayName);
    await ensureSession();
  }, [ensureSession]);

  const signOut = useCallback(async () => {
    await postSessionLogout();
    lastSyncUid.current = null;
    lastProfileUid.current = null;
    setProfile(null);
    await fbSignOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithGitHub,
        signInWithEmail,
        signUpWithEmail,
        ensureSession,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
