/** The profile fields read from `GET /api/auth/session`, whose body is `{id, email, email_verified, profile: {...}}`. */
export interface SessionProfileFields {
  display_name: string | null;
  avatar_url: string | null;
  /** Null until the API has assigned one. */
  username: string | null;
  /** New profiles are private. */
  is_public: boolean;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

/** Reads the nested `profile` object of a session body; anything missing or mistyped falls back to empty/private. */
export function readSessionProfile(session: unknown): SessionProfileFields {
  const profile =
    session && typeof session === "object" ? (session as { profile?: unknown }).profile : undefined;
  const fields = profile && typeof profile === "object" ? (profile as Record<string, unknown>) : {};
  return {
    display_name: text(fields.display_name),
    avatar_url: text(fields.avatar_url),
    username: text(fields.username),
    is_public: fields.is_public === true,
  };
}
