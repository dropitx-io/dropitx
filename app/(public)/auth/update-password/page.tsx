"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { updateUserPassword } from "@/lib/firebase/auth";
import { notice } from "@/app/(content)/_ui/public-styles";
import { PasswordField } from "../_ui/auth-fields";
import { AuthShell, authTitle } from "../_ui/auth-shell";
import { MIN_PASSWORD_LENGTH, validatePassword } from "../_ui/validate-auth";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { user, loading: authChecking } = useAuth();

  useEffect(() => {
    if (authChecking) return;
    if (!user) window.location.href = "/auth/login?error=session_expired";
  }, [authChecking, user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const invalid = validatePassword(password, MIN_PASSWORD_LENGTH);
    setPasswordError(invalid);
    if (invalid) {
      passwordRef.current?.focus();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateUserPassword(password);
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const code = typeof err === "object" && err !== null && "code" in err ? String((err as { code: unknown }).code) : "";
      setError(
        code === "auth/requires-recent-login"
          ? "For security, please sign out and sign back in, then change your password."
          : err instanceof Error && err.message
            ? err.message
            : "Could not update the password.",
      );
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <AuthShell>
        <h1 className={authTitle}>Choose a new password</h1>
        <p role="status" className="lead">Checking your session</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className={authTitle}>Choose a new password</h1>
      <p className="lead rise" style={{ "--i": 1 } as React.CSSProperties}>Pick a password you have not used here before.</p>

      {error && <p role="alert" className={`${notice.error} mt-6`}>{error}</p>}

      <form onSubmit={handleSubmit} noValidate className="auth-panel" data-testid="auth-update-form">
        <PasswordField
          ref={passwordRef}
          label="New password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            if (passwordError) setPasswordError(validatePassword(v, MIN_PASSWORD_LENGTH));
          }}
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          error={passwordError}
        />
        <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-dark btn-lg btn-block" data-testid="auth-update-submit">
          {loading ? "Saving your password" : "Save the new password"}
        </button>
      </form>
    </AuthShell>
  );
}
