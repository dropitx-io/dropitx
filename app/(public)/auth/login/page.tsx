"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { notice } from "@/app/(content)/_ui/public-styles";
import { AuthShell, authTitle } from "../_ui/auth-shell";
import { CredentialsForm } from "../_ui/credentials-form";

type Mode = "signin" | "signup";

const COPY: Record<Mode, { title: string; lead: string }> = {
  signin: { title: "Sign in to DropItX", lead: "Your links, their options and who has opened them, in one place." },
  signup: { title: "Create your DropItX account", lead: "Share your first page in under a minute. Free covers 10 active links." },
};

/** Same-origin paths sign-in may return to: a share, an invite, the editor, or a dashboard page. */
function isValidRedirect(path: string | null): boolean {
  if (!path) return false;
  const allowed =
    path.startsWith("/s/") ||
    path.startsWith("/invite/") ||
    path === "/editor" ||
    path.startsWith("/editor?") ||
    path === "/dashboard" ||
    path.startsWith("/dashboard/") ||
    path.startsWith("/dashboard?");
  return allowed && !path.includes("//") && !path.includes("\\");
}

const messageOf = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

function LoginContent() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const targetPath = isValidRedirect(nextPath) && nextPath ? nextPath : "/dashboard";
  const errorParam = searchParams.get("error");

  const [mode, setMode] = useState<Mode>(searchParams.get("mode") === "signup" ? "signup" : "signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "confirmation_failed"
      ? "Email confirmation failed. Please try again."
      : errorParam === "session_expired"
        ? "Your session ended. Sign in again to continue."
        : null,
  );

  const { user, loading: authChecking, ensureSession, signInWithGoogle, signInWithGitHub, signInWithEmail, signUpWithEmail } = useAuth();

  // Already signed in with Firebase (e.g. the session cookie expired but local auth persists):
  // re-mint the cookie, then continue to the target.
  useEffect(() => {
    if (authChecking || !user) return;
    ensureSession()
      .then(() => {
        window.location.href = targetPath;
      })
      .catch((err: unknown) => {
        console.error("Restoring the session failed; staying on sign-in", err);
      });
  }, [authChecking, user, ensureSession, targetPath]);

  useEffect(() => {
    document.title = mode === "signup" ? "Create a DropItX account" : "Sign in to DropItX";
  }, [mode]);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    // Keep the choice (and any next=) in the address so a reload lands on the same panel.
    const params = new URLSearchParams(window.location.search);
    if (next === "signup") params.set("mode", "signup");
    else params.delete("mode");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  async function withEmail(email: string, password: string) {
    setBusy(true);
    setError(null);
    try {
      if (mode === "signin") await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
      window.location.href = targetPath;
    } catch (err: unknown) {
      setError(mode === "signin" ? "Invalid email or password." : messageOf(err, "Could not create the account."));
      setBusy(false);
    }
  }

  async function withProvider(provider: "google" | "github") {
    setError(null);
    try {
      if (provider === "google") await signInWithGoogle();
      else await signInWithGitHub();
      window.location.href = targetPath;
    } catch (err: unknown) {
      setError(messageOf(err, "Sign-in failed."));
    }
  }

  return (
    <AuthShell>
      <h1 className={authTitle} id="auth-title">{COPY[mode].title}</h1>
      <p className="lead rise" style={{ "--i": 1 } as React.CSSProperties}>{COPY[mode].lead}</p>

      <nav className="tabs rise" style={{ "--i": 2 } as React.CSSProperties} aria-label="Sign in or create an account">
        <button type="button" aria-current={mode === "signin"} onClick={() => switchMode("signin")} data-testid="auth-tab-signin">Sign in</button>
        <button type="button" aria-current={mode === "signup"} onClick={() => switchMode("signup")} data-testid="auth-tab-signup">Create an account</button>
      </nav>

      {error && <p role="alert" className={`${notice.error} mt-6`}>{error}</p>}

      <CredentialsForm key={mode} mode={mode} busy={busy} onSubmit={withEmail} />

      <div className="mt-5 grid gap-5">
        <p className="or">or</p>
        <div className="oauth">
          <button type="button" className="btn btn-primary" onClick={() => withProvider("google")} data-testid="auth-google-button">Continue with Google</button>
          <button type="button" className="btn btn-primary" onClick={() => withProvider("github")} data-testid="auth-github-button">Continue with GitHub</button>
        </div>
        {mode === "signin" ? (
          <p className="auth-note">
            New here? <a href="?mode=signup" onClick={(e) => { e.preventDefault(); switchMode("signup"); }}>Create an account</a> in under a minute.
          </p>
        ) : (
          <p className="auth-note">Free includes 10 active links and 1 GB of storage. No card needed.</p>
        )}
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell>
          <h1 className={authTitle}>Sign in to DropItX</h1>
          <p role="status" className="lead">Loading the sign-in form</p>
        </AuthShell>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
