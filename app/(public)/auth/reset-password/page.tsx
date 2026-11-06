"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { sendPasswordReset } from "@/lib/firebase/auth";
import { notice } from "@/app/(content)/_ui/public-styles";
import { EmailField } from "../_ui/auth-fields";
import { AuthShell, authTitle } from "../_ui/auth-shell";
import { validateEmail } from "../_ui/validate-auth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const invalid = validateEmail(email);
    setEmailError(invalid);
    if (invalid) {
      emailRef.current?.focus();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error && err.message ? err.message : "Could not send the reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h1 className={authTitle}>Reset your password</h1>
      <p className="lead rise" style={{ "--i": 1 } as React.CSSProperties}>
        {sent ? "Check your email for a reset link." : "Enter the email you signed up with, and we will send a link to choose a new password."}
      </p>

      {error && <p role="alert" className={`${notice.error} mt-6`}>{error}</p>}

      {sent ? (
        <div className="auth-panel">
          <p role="status" className={notice.success}>
            We sent a password reset link to <strong className="font-medium">{email.trim()}</strong>. Check your inbox.
          </p>
          <Link href="/auth/login" className="btn btn-primary btn-lg btn-block">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="auth-panel" data-testid="auth-reset-form">
          <EmailField
            ref={emailRef}
            value={email}
            onChange={(v) => {
              setEmail(v);
              if (emailError) setEmailError(validateEmail(v));
            }}
            error={emailError}
          />
          <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-dark btn-lg btn-block" data-testid="auth-reset-submit">
            {loading ? "Sending the link" : "Send the reset link"}
          </button>
          <p className="auth-note">
            Remember your password? <Link href="/auth/login">Sign in</Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
