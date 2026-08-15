import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14;

let initialized = false;

function ensureAdmin(): void {
  if (initialized) return;
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Firebase Admin misconfigured: set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY",
      );
    }
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
  initialized = true;
}

export interface SessionUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
}

export async function getSessionUser(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): Promise<SessionUser | null> {
  const cookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    ensureAdmin();
    const claims = await getAuth().verifySessionCookie(cookie, true);
    return {
      uid: claims.uid,
      email: claims.email ?? null,
      emailVerified: Boolean(claims.email_verified),
      name: (claims.name as string | undefined) ?? null,
      picture: (claims.picture as string | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

export async function createSessionCookie(idToken: string): Promise<string> {
  ensureAdmin();
  return getAuth().createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

export async function revokeUserSessions(uid: string): Promise<void> {
  ensureAdmin();
  await getAuth().revokeRefreshTokens(uid);
}

export async function verifySessionClaimsForLogout(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): Promise<string | null> {
  const cookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    ensureAdmin();
    const claims = await getAuth().verifySessionCookie(cookie, false);
    return claims.uid;
  } catch {
    return null;
  }
}

export function assertSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
