"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { field, small } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";
import { fieldLabel } from "./auth-shell";

interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function EmailField({ value, onChange }: EmailFieldProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor="email" className={fieldLabel}>
        Email
      </label>
      <Input
        id="email"
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className={field}
        autoComplete="email"
      />
    </div>
  );
}

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  /** Shown under the field, e.g. the length rule when choosing a password. */
  hint?: string;
  /** Sits at the right of the label row, e.g. a "Forgot password?" link. */
  aside?: React.ReactNode;
}

/** A password field with a Show / Hide switch; minimum length 6, as Firebase requires. */
export function PasswordField({ label, value, onChange, autoComplete, hint, aside }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor="password" className={fieldLabel}>
          {label}
        </label>
        {aside}
      </div>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={6}
          className={cn(field, "pr-20")}
          autoComplete={autoComplete}
          aria-describedby={hint ? "password-hint" : undefined}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-pressed={showPassword}
          className="absolute inset-y-0 right-1 min-w-11 px-3 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      {hint && (
        <p id="password-hint" className={cn(small, "text-muted-foreground")}>
          {hint}
        </p>
      )}
    </div>
  );
}
