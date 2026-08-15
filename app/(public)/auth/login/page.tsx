"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function isValidRedirect(path: string | null): boolean {
  if (!path) return false;
  return (path.startsWith("/s/") || path.startsWith("/invite/")) && !path.includes("//") && !path.includes("\\");
}

/* ─── Icons ─── */

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
  );
}

function EyeSlashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.092 1.092a4 4 0 00-5.558-5.558z" clipRule="evenodd" />
      <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.025l2.91 2.91A4 4 0 0010.748 13.93z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
      <path d="M19 8.839l-7.556 3.778a2.75 2.75 0 01-2.888 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
  );
}

function DropIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z" />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ─── Login Content ─── */

function LoginContent() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const isShareRedirect = isValidRedirect(nextPath);
  const errorParam = searchParams.get("error");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* ─── Background Dot Pattern ─── */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ─── Form Side ─── */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-12 md:px-12">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <a href="/" className="mb-10 inline-flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <DropIcon className="size-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">DropItX</span>
          </a>

          {/* Mode Toggle — pill tabs */}
          <div className="mb-8">
            <div className="inline-flex rounded-lg bg-muted p-1">
              {(["signin", "signup"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setMode(tab); resetMessages(); }}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                    mode === tab
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-display text-[28px] font-bold tracking-tight text-foreground">
              {mode === "signin" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="mt-1.5 text-[15px] text-muted-foreground">
              {mode === "signin"
                ? "Enter your credentials to access your account"
                : "Get started with DropItX — it's free"}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 rounded-lg border border-success/20 bg-success/5 p-3.5 text-sm text-success">
              {successMessage}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Email/Password Form */}
          {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-background pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  {mode === "signin" && (
                    <a
                      href="/auth/reset-password"
                      className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <LockIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11 bg-background pl-10 pr-10"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" disabled={loading} className="relative h-11 w-full text-[15px] font-semibold">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="size-4 animate-spin" />
                    Please wait...
                  </span>
                ) : mode === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-background px-3 text-muted-foreground">or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="h-11 flex-1 gap-2.5 font-medium" onClick={() => login("google")}>
              <GoogleIcon className="size-4" />
              Google
            </Button>
            <Button variant="outline" className="h-11 flex-1 gap-2.5 font-medium" onClick={() => login("github")}>
              <GitHubIcon className="size-4" />
              GitHub
            </Button>
          </div>

          {/* Mode switch footer */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => { setMode("signup"); resetMessages(); }} className="font-semibold text-primary hover:underline">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => { setMode("signin"); resetMessages(); }} className="font-semibold text-primary hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* ─── Branding Side ─── */}
      <div
        className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 p-12 md:flex"
        style={{ flex: "0 0 50%" }}
      >
        {/* Subtle grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-[400px] rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-[500px] rounded-full bg-primary/[0.03] blur-3xl" />

        <div className="relative z-10 max-w-md space-y-10">
          {/* Geometric decoration */}
          <div className="relative h-28 w-28">
            <div className="absolute left-0 top-0 size-14 rotate-12 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm" />
            <div className="absolute bottom-0 right-0 size-10 rounded-full border border-primary/15 bg-primary/10" />
            <div className="absolute bottom-6 left-4 size-6 rounded-lg bg-primary/20" />
            <div className="absolute right-2 top-4 size-3 rounded-full bg-primary/40" />
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-[44px] font-bold leading-[1.1] tracking-tight text-foreground">
              Drop.<br />
              <span className="text-primary">Share.</span><br />
              Collaborate.
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Share HTML &amp; Markdown files with short, shareable links.
              No bloat, no friction — just drop and go.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {["Instant links", "Password protect", "Team workspaces", "Analytics"].map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-border bg-background/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Spinner className="size-4 animate-spin" />
            Loading...
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
