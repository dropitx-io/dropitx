"use client";

import { useState } from "react";
import { sendPasswordReset } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
      <path d="M19 8.839l-7.556 3.778a2.75 2.75 0 01-2.888 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
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
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6">
      {/* Background dot pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo */}
        <a href="/" className="mb-10 inline-flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <DropIcon className="size-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">DropItX</span>
        </a>

        <div className="mb-6">
          <h1 className="font-display text-[28px] font-bold tracking-tight text-foreground">
            Reset password
          </h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground">
            {sent ? "Check your email for a reset link" : "Enter your email to receive a reset link"}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive">
            {error}
          </div>
        )}

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-success/20 bg-success/5 p-4 text-sm text-success">
              We&apos;ve sent a password reset link to <strong>{email}</strong>. Please check your inbox.
            </div>
            <Button variant="outline" className="h-11 w-full font-medium" onClick={() => (window.location.href = "/auth/login")}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button type="submit" disabled={loading} className="h-11 w-full text-[15px] font-semibold">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4 animate-spin" />
                  Sending...
                </span>
              ) : "Send Reset Link"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <a href="/auth/login" className="font-semibold text-primary hover:underline">
                Sign in
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
