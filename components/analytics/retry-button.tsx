"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** Re-runs the current page's server render, for a block whose data failed to load. */
export function RetryButton() {
  const router = useRouter();
  return (
    <Button type="button" variant="outline" size="sm" onClick={() => router.refresh()}>
      Retry
    </Button>
  );
}
