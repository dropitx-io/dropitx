"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { body, notice, small, squareButton, textLink } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";
import { EmailField, PasswordField } from "../_ui/auth-fields";
import { AuthShell, authTitle } from "../_ui/auth-shell";

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

function LoginContent() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const isShareRedirect = isValidRedirect(nextPath);
  const errorParam = searchParams.get("error");

  const [mode, setMode] = useState<"signin" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "confirmation_failed" ? "Email confirmation failed. Please try again." : null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    user: authUser,
    loading: authChecking,
    ensureSession,
    signInWithGoogle,
    signInWithGitHub,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const targetPath = isShareRedirect && nextPath ? nextPath : "/dashboard";

  // Already signed in via Firebase (e.g. session cookie expired but local auth persists):
  // re-mint the cookie, then continue to the target.
  useEffect(() => {
    if (authChecking || !authUser) return;
    ensureSession()
      .then(() => {
        window.location.href = targetPath;
      })
      .catch(() => {
        /* stay on login if session restore fails */
      });
  }, [authChecking, authUser, ensureSession, targetPath]);

  const login = async (provider: "google" | "github") => {
    setError(null);
    try {
      if (provider === "google") await signInWithGoogle();
      else await signInWithGitHub();
      window.location.href = targetPath;
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Sign-in failed.");
    }
  };

  const handleEmailSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      window.location.href = targetPath;
    } catch {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password);
      window.location.href = targetPath;
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Could not create account.");
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin") handleEmailSignIn();
    else handleEmailSignUp();
  };

  const resetMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const switchMode = (next: "signin" | "signup") => {
    setMode(next);
    resetMessages();
  };

  const tab = (active: boolean) =>
    cn(
      body,
      "border-b-[3px] py-1.5 transition-colors",
      active ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
    );

  return (
    <AuthShell>
      <h1 className={authTitle}>{mode === "signin" ? "Sign in to DropItX" : "Create your account"}</h1>

      <div role="group" aria-label="Sign in or create an account" className="flex gap-7">
        <button type="button" aria-pressed={mode === "signin"} onClick={() => switchMode("signin")} className={tab(mode === "signin")}>
          Sign in
        </button>
        <button type="button" aria-pressed={mode === "signup"} onClick={() => switchMode("signup")} className={tab(mode === "signup")}>
          Create an account
        </button>
      </div>

      {successMessage && (
        <p role="status" className={cn(body, notice.success)}>
          {successMessage}
        </p>
      )}

      {error && (
        <p role="alert" className={cn(body, notice.error)}>
          {error}
        </p>
      )}

      {!successMessage && (
        <form onSubmit={handleSubmit} className="grid gap-7">
          <div className="grid gap-[22px]">
            <EmailField value={email} onChange={setEmail} />
            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              hint={mode === "signup" ? "At least 6 characters." : undefined}
              aside={
                mode === "signin" && (
                  <a href="/auth/reset-password" className={cn(small, textLink)}>
                    Forgot password?
                  </a>
                )
              }
            />
          </div>

          <button type="submit" disabled={loading} aria-busy={loading} className={cn(squareButton(), "w-full")}>
            {loading
              ? mode === "signin"
                ? "Signing in"
                : "Creating your account"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
      )}

      <div className="grid gap-3">
        <p className={cn(small, "text-center text-muted-foreground")}>or</p>
        <div className="grid gap-3 min-[421px]:grid-cols-2 min-[861px]:max-[1100px]:grid-cols-1">
          <button type="button" className={cn(squareButton("quiet"), "px-3")} onClick={() => login("google")}>
            Continue with Google
          </button>
          <button type="button" className={cn(squareButton("quiet"), "px-3")} onClick={() => login("github")}>
            Continue with GitHub
          </button>
        </div>
      </div>

      <p className={cn(small, "text-muted-foreground")}>
        {mode === "signin" ? (
          <>
            New here?{" "}
            <button type="button" onClick={() => switchMode("signup")} className={textLink}>
              Create an account
            </button>{" "}
            in under a minute.
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button type="button" onClick={() => switchMode("signin")} className={textLink}>
              Sign in
            </button>
          </>
        )}
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell>
          <h1 className={authTitle}>Sign in to DropItX</h1>
          <p role="status" className={cn(body, "text-muted-foreground")}>
            Loading the sign-in form
          </p>
        </AuthShell>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
