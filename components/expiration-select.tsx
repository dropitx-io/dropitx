"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";

/**
 * Each value is what the API reads as `expires_in`: a named period it knows, or a whole number of seconds
 * (60 to 30 days). Choices it cannot express, such as "forever", are not offered.
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
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function ExpirationSelect({
  value,
  onChange,
  disabled = false,
  compact = false,
}: ExpirationSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={compact ? "h-8 w-[140px]" : "w-full"}>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted-foreground" />
          <SelectValue placeholder="Expiration" />
        </div>
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
