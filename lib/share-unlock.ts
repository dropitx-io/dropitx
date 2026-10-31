import { getApiUrl } from "@/lib/api-client";

export type UnlockResult =
  | { status: "ok"; content: string }
  | { status: "wrong" }
  | { status: "limited"; message: string }
  | { status: "gone" }
  | { status: "error" };

/**
 * "Try again in 3 minutes" from a Retry-After header. The API sends the value as
 * either a number of seconds or an absolute Unix timestamp, so both are accepted.
 */
function describeWait(retryAfter: string | null): string {
  const value = Number(retryAfter);
  if (!retryAfter || !Number.isFinite(value) || value <= 0) return "Too many attempts. Try again later.";
  const seconds = value > 1e9 ? value - Date.now() / 1000 : value;
  if (seconds <= 0) return "Too many attempts. Try again later.";
  if (seconds < 60) return `Too many attempts. Try again in ${Math.ceil(seconds)} seconds.`;
  const minutes = Math.ceil(seconds / 60);
  return `Too many attempts. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`;
}

/**
 * Posts a password to the API's unlock endpoint and returns the share content.
 * A plain fetch, not `authFetch`: its 401 retry would send a second attempt and
 * spend the rate limit. The password and content are returned to the caller only.
 */
export async function unlockShare(slug: string, password: string): Promise<UnlockResult> {
  try {
    const res = await fetch(getApiUrl(`/api/shares/${encodeURIComponent(slug)}/unlock`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const data = (await res.json()) as { content?: string };
      return { status: "ok", content: data.content ?? "" };
    }
    if (res.status === 401) return { status: "wrong" };
    if (res.status === 429) return { status: "limited", message: describeWait(res.headers.get("Retry-After")) };
    if (res.status === 404 || res.status === 410) return { status: "gone" };
    return { status: "error" };
  } catch {
    return { status: "error" };
  }
}
