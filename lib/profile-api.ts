import { authFetch } from "@/lib/api-client";

export interface ProfileUpdate {
  /** Required by the API on every call. */
  displayName: string;
  /** Only sent when it is being changed. */
  username?: string;
  isPublic?: boolean;
}

/** Response of `PUT /api/v1/profile`. */
export interface ProfileResponseBody {
  display_name?: unknown;
  avatar_url?: unknown;
  username?: unknown;
  is_public?: unknown;
}

export function putProfile({ displayName, username, isPublic }: ProfileUpdate): Promise<Response> {
  return authFetch("/api/v1/profile", {
    method: "PUT",
    body: JSON.stringify({
      display_name: displayName,
      ...(username !== undefined && { username }),
      ...(isPublic !== undefined && { is_public: isPublic }),
    }),
  });
}
