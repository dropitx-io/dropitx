"use client";

import { useAuth } from "@/components/auth-provider";

/**
 * Returns the current user ({id, email}) or null.
 * Thin shim over the Firebase AuthProvider so legacy callers
 * (public-nav, header-nav, header-mobile-drawer, invite-notification-bell)
 * keep working during the Supabase→Firebase cutover. Prefer useAuth() directly.
 */
export function useAuthUser(): { id: string; email?: string } | null {
  const { user } = useAuth();
  if (!user) return null;
  return { id: user.uid, email: user.email ?? undefined };
}
