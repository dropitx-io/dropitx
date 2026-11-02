"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { updateUserPassword } from "@/lib/firebase/auth";
import { body, notice, squareButton } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";
import { PasswordField } from "../_ui/auth-fields";
import { AuthShell, authTitle } from "../_ui/auth-shell";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authChecking } = useAuth();

  useEffect(() => {
    if (authChecking) return;
    if (!user) window.location.href = "/auth/login?error=session_expired";
  }, [authChecking, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateUserPassword(password);
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/requires-recent-login") {
        setError("For security, please sign out and sign back in, then change your password.");
      } else {
        setError((err as Error)?.message ?? "Could not update password.");
      }
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <AuthShell>
        <h1 className={authTitle}>Choose a new password</h1>
        <p role="status" className={cn(body, "text-muted-foreground")}>
          Checking your session
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className={authTitle}>Choose a new password</h1>

      {error && (
        <p role="alert" className={cn(body, notice.error)}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid gap-7">
        <PasswordField
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint="At least 6 characters."
        />
        <button type="submit" disabled={loading} aria-busy={loading} className={cn(squareButton(), "w-full")}>
          {loading ? "Saving your password" : "Save the new password"}
        </button>
      </form>
    </AuthShell>
  );
}
