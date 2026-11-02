"use client";

import { useState } from "react";
import { sendPasswordReset } from "@/lib/firebase/auth";
import { body, notice, small, squareButton, textLink } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";
import { EmailField } from "../_ui/auth-fields";
import { AuthShell, authTitle } from "../_ui/auth-shell";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h1 className={authTitle}>Reset your password</h1>
      <p className={cn(body, "max-w-[34em]")}>
        {sent
          ? "Check your email for a reset link."
          : "Enter the email you signed up with, and we will send a link to choose a new password."}
      </p>

      {error && (
        <p role="alert" className={cn(body, notice.error)}>
          {error}
        </p>
      )}

      {sent ? (
        <div className="grid gap-7">
          <p role="status" className={cn(body, notice.success)}>
            We sent a password reset link to <strong className="font-medium">{email}</strong>. Check your inbox.
          </p>
          <a href="/auth/login" className={cn(squareButton("quiet"), "w-full")}>
            Back to sign in
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="stagger-in grid gap-7">
          <EmailField value={email} onChange={setEmail} />
          <button type="submit" disabled={loading} aria-busy={loading} className={cn(squareButton(), "w-full")}>
            {loading ? "Sending the link" : "Send the reset link"}
          </button>
          <p className={cn(small, "text-muted-foreground")}>
            Remember your password?{" "}
            <a href="/auth/login" className={textLink}>
              Sign in
            </a>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
