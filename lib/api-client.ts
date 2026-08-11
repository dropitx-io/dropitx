import { createClient } from "@/utils/supabase/client";

const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!envApiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is required. Set it in Vercel Project Settings → Environment Variables and redeploy.");
}
const API_URL = envApiUrl;

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) _supabase = createClient();
  return _supabase;
}

export function getApiUrl(path: string): string {
  return `${API_URL.trim()}${path}`;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

/**
 * Authenticated fetch with 401 retry.
 * On 401, refreshes session once and retries.
 */
export async function authFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers || {});
  const auth = await getAuthHeaders();
  if (auth.Authorization) headers.set("Authorization", auth.Authorization);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(getApiUrl(path), { ...options, headers });

  // Retry once on 401 — session may have expired
  if (res.status === 401 && auth.Authorization) {
    const supabase = getSupabase();
    await supabase.auth.refreshSession();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
      return fetch(getApiUrl(path), { ...options, headers });
    }
  }

  return res;
}
