"use client";

import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/** A failed analytics load stays inside the sheet, with a Retry that re-runs the page. */
export default function AnalyticsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border px-3.5 py-3 text-sm">
      <CircleAlert className="size-4 shrink-0 text-destructive" strokeWidth={1.5} />
      <span className="flex-1 text-card-foreground">Analytics could not be loaded.</span>
      <Button type="button" variant="outline" size="sm" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
