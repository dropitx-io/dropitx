import { auth } from "@/lib/firebase/client";

const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!envApiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is required. Set it in Vercel Project Settings → Environment Variables and redeploy.");
}
const API_URL = envApiUrl;

export function getApiUrl(path: string): string {
  return `${API_URL.trim()}${path}`;
}

/**
 * The API's `detail` as one message: a string as is, a FastAPI validation list joined by its `msg` fields,
 * anything else the fallback.
 */
export async function apiErrorDetail(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { detail?: unknown } | null;
  const detail = body?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail.map((d) => (d && typeof (d as { msg?: unknown }).msg === "string" ? (d as { msg: string }).msg : null));
    const joined = messages.filter(Boolean).join("; ");
    if (joined) return joined;
  }
  return fallback;
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
