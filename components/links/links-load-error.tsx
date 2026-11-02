"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** The Links screen when its list could not be loaded: the title stays, the error sits in the list's place. */
export function LinksLoadError() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold tracking-[-0.01em] text-card-foreground max-sm:text-[22px]">Links</h1>
      <p className="mb-5 text-sm text-muted-foreground">Links could not be loaded.</p>
      <div role="alert" className="flex flex-wrap items-center gap-2.5 rounded-lg border border-border px-3.5 py-3 text-sm">
        <CircleAlert className="size-4 shrink-0 text-destructive" strokeWidth={1.5} aria-hidden />
        <span className="min-w-0 flex-1">The list of your links did not load. Nothing was changed.</span>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
          <RotateCw className="size-3.5" strokeWidth={1.5} aria-hidden />
          {pending ? "Retrying" : "Retry"}
        </Button>
      </div>
    </>
  );
}
