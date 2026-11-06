"use client";

import { forwardRef, useState } from "react";

interface FieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Inline message under the field; the input is marked invalid while it is set. */
  error?: string | null;
}

/** The design's email field: label, input and an inline error. */
export const EmailField = forwardRef<HTMLInputElement, FieldProps>(function EmailField({ value, onChange, error }, ref) {
  return (
    <div className="field">
      <label htmlFor="email">Email</label>
      <input
        ref={ref}
        id="email"
        name="email"
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="email"
        placeholder="you@company.com"
        aria-invalid={Boolean(error)}
        aria-describedby="email-err"
        data-testid="auth-email-input"
      />
      <p className="field-error" id="email-err">{error ?? ""}</p>
    </div>
  );
});

interface PasswordFieldProps extends FieldProps {
  label: string;
  autoComplete: "current-password" | "new-password";
  /** Shown under the field, e.g. the length rule when choosing a password. */
  hint?: string;
  /** Sits at the right of the label row, e.g. a "Forgot password?" link. */
  aside?: React.ReactNode;
}

/** A password field with a Show / Hide switch, a hint and an inline error. */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { label, value, onChange, autoComplete, hint, aside, error },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const describedBy = [hint ? "password-help" : null, "password-err"].filter(Boolean).join(" ");

  return (
    <div className="field">
      <div className="label-row">
        <label htmlFor="password">{label}</label>
        {aside}
      </div>
      <div className="relative">
        {/* No name attribute: the password is only ever read by the submit handler, never serialised into a URL. */}
        <input
          ref={ref}
          id="password"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="w-full pr-20"
          data-testid="auth-password-input"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          aria-pressed={showPassword}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-1 min-w-11 px-3 font-sans text-sm text-fg-2 transition-colors hover:text-foreground"
          data-testid="auth-password-toggle"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      {hint && <p className="field-help" id="password-help">{hint}</p>}
      <p className="field-error" id="password-err">{error ?? ""}</p>
    </div>
  );
});
