/**
 * Client-side checks for the auth forms. They run before any request, so an
 * incomplete email or an empty password never reaches Firebase, and each
 * returns the inline message shown under its field (null when the value is fine).
 * Firebase still has the final say on sign-in and sign-up.
 */

/** Firebase Auth's minimum password length, applied when choosing a password. */
export const MIN_PASSWORD_LENGTH = 6;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return "Enter your email address.";
  if (!EMAIL.test(email)) return "That email address looks incomplete.";
  return null;
}

/**
 * `minLength` is 0 when signing in (any stored password is accepted for the
 * check) and MIN_PASSWORD_LENGTH when creating an account or a new password.
 */
export function validatePassword(value: string, minLength = 0): string | null {
  if (!value) return "Enter your password.";
  if (minLength > 0 && value.length < minLength) return `Use at least ${minLength} characters.`;
  return null;
}

export type CredentialErrors = { email: string | null; password: string | null };

/** Both checks for a sign-in or sign-up form. */
export function validateCredentials(email: string, password: string, mode: "signin" | "signup"): CredentialErrors {
  return {
    email: validateEmail(email),
    password: validatePassword(password, mode === "signup" ? MIN_PASSWORD_LENGTH : 0),
  };
}

export function hasErrors(errors: Partial<Record<string, string | null>>): boolean {
  return Object.values(errors).some(Boolean);
}
