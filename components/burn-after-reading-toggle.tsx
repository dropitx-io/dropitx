"use client";

import { Switch } from "@/components/app-shell/switch";

interface BurnAfterReadingToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

/** A switch labelled "Burn after reading", with what it does spelled out under the label. */
export function BurnAfterReadingToggle({ enabled, onChange, disabled = false }: BurnAfterReadingToggleProps) {
  return (
    <div className="flex items-center gap-2.5">
      <Switch
        id="opt-burn"
        checked={enabled}
        onChange={onChange}
        disabled={disabled}
        aria-describedby="opt-burn-hint"
      />
      <label htmlFor="opt-burn" className="cursor-pointer whitespace-nowrap text-sm font-medium">
        Burn after reading
        <span id="opt-burn-hint" className="block text-xs font-normal text-muted-foreground max-xl:sr-only">
          {enabled ? "Burns after first read" : "Deleted after the first view"}
        </span>
      </label>
    </div>
  );
}
