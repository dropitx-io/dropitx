"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { EmailField, PasswordField } from "./auth-fields";
import { MIN_PASSWORD_LENGTH, hasErrors, validateCredentials, type CredentialErrors } from "./validate-auth";

const NO_ERRORS: CredentialErrors = { email: null, password: null };

interface CredentialsFormProps {
  mode: "signin" | "signup";
  busy: boolean;
  /** Called only once both fields pass the inline checks. */
  onSubmit: (email: string, password: string) => void;
}

/**
 * The email and password panel. Submitting runs the inline checks first and
 * focuses the first bad field; nothing is sent until both pass. The form has
 * no action and is never submitted by the browser, so the password cannot end
 * up in a URL.
 */
export function CredentialsForm({ mode, busy, onSubmit }: CredentialsFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<CredentialErrors>(NO_ERRORS);
  const [checked, setChecked] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function recheck(nextEmail: string, nextPassword: string) {
    // After a failed submit, errors update as the reader fixes them.
    if (checked) setErrors(validateCredentials(nextEmail, nextPassword, mode));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateCredentials(email, password, mode);
    setErrors(found);
    setChecked(true);
    if (found.email) return emailRef.current?.focus();
    if (found.password) return passwordRef.current?.focus();
    if (!hasErrors(found)) onSubmit(email.trim(), password);
  }

  return (
    <form className="auth-panel" onSubmit={handleSubmit} noValidate data-testid={`auth-${mode}-form`}>
      <EmailField ref={emailRef} value={email} onChange={(v) => { setEmail(v); recheck(v, password); }} error={errors.email} />
      <PasswordField
        ref={passwordRef}
        label="Password"
        value={password}
        onChange={(v) => { setPassword(v); recheck(email, v); }}
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        hint={mode === "signup" ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
        error={errors.password}
        aside={mode === "signin" && <Link href="/auth/reset-password" data-testid="auth-forgot-link">Forgot password?</Link>}
      />
      <button className="btn btn-dark btn-lg btn-block" type="submit" disabled={busy} aria-busy={busy} data-testid={`auth-${mode}-submit`}>
        {busy ? (mode === "signin" ? "Signing in" : "Creating your account") : mode === "signin" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
