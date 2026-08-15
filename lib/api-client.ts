import { auth } from "@/lib/firebase/client";

const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!envApiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is required. Set it in Vercel Project Settings → Environment Variables and redeploy.");
}
const API_URL = envApiUrl;

export function getApiUrl(path: string): string {
  return `${API_URL.trim()}${path}`;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};
  const idToken = await user.getIdToken();
  return idToken ? { Authorization: `Bearer ${idToken}` } : {};
}

/**
 * Authenticated fetch with 401 retry.
 * Firebase SDK auto-refreshes ID tokens; on 401 we force-refresh once and retry.
 */
export async function authFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers || {});
  const authHeaders = await getAuthHeaders();
  if (authHeaders.Authorization) headers.set("Authorization", authHeaders.Authorization);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(getApiUrl(path), { ...options, headers });

  if (res.status === 401 && authHeaders.Authorization) {
    const user = auth.currentUser;
    if (user) {
      const refreshed = await user.getIdToken(true);
      if (refreshed) {
        headers.set("Authorization", `Bearer ${refreshed}`);
        return fetch(getApiUrl(path), { ...options, headers });
      }
    }
  }

  return res;
}
