"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TitleRow } from "@/components/analytics/title-row";

/**
 * A dashboard screen that fails to render keeps the shell: the error sits inside the sheet with a
 * Retry. Retry refreshes the server render first, since `reset` alone re-renders the same failure.
 */
export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <>
      <TitleRow title="Something went wrong" />
      <div className="flex items-center gap-2.5 rounded-lg border border-border px-3.5 py-3 text-sm">
        <CircleAlert className="size-4 shrink-0 text-destructive" strokeWidth={1.5} aria-hidden />
        <span className="flex-1 text-card-foreground">This page could not be loaded. Your links are not affected.</span>
        <Button type="button" variant="outline" size="sm" onClick={retry}>
          Retry
        </Button>
      </div>
    </>
  );
}
