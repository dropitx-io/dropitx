"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Needed when no <label htmlFor> names the switch. */
  "aria-label"?: string;
  "aria-describedby"?: string;
}

/** An on/off switch: grey track when off, ink track when on. */
export function Switch({ id, checked, onChange, disabled, ...aria }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      {...aria}
      className={cn(
        "relative h-5 w-8 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-card-foreground" : "bg-input",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-0.5 top-0.5 size-4 rounded-full bg-sheet transition-transform duration-200",
          checked && "translate-x-3",
        )}
      />
    </button>
  );
}
