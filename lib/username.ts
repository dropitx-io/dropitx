/** A username is 3-30 characters of lowercase letters, digits and hyphens. */
export const USERNAME_PATTERN = /^[a-z0-9-]{3,30}$/;

/** Inline validation message for a username, or `null` when it is well-formed. Reserved names are the API's call (422). */
export function usernameError(value: string): string | null {
  if (value.length < 3) return "Username must be at least 3 characters.";
  if (value.length > 30) return "Username must be at most 30 characters.";
  if (!USERNAME_PATTERN.test(value)) return "Use lowercase letters, numbers and hyphens only.";
  return null;
}
