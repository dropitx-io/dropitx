"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Each value is what the API reads as `expires_in`: a named period it knows, or a whole number of seconds.
 * The upload API additionally requires 60 seconds to 30 days; publish applies no bounds. Choices it cannot
 * express, such as "forever", are not offered.
 */
export const EXPIRATION_OPTIONS = [
  { value: "300", label: "5 minutes" },
  { value: "600", label: "10 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "6h", label: "6 hours" },
  { value: "43200", label: "12 hours" },
  { value: "24h", label: "1 day" },
  { value: "7d", label: "1 week" },
  { value: "30d", label: "1 month" },
] as const;

export type ExpirationValue = (typeof EXPIRATION_OPTIONS)[number]["value"];

interface ExpirationSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Shown while no period is chosen, e.g. "Keep current" when editing an existing share. */
  placeholder?: string;
}

export function ExpirationSelect({
  id,
  value,
  onChange,
  disabled = false,
  placeholder = "Choose a period",
}: ExpirationSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className="h-8 w-[140px] border-input bg-sheet shadow-none max-md:h-11">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {EXPIRATION_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
