"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRoundCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiErrorDetail, authFetch } from "@/lib/api-client";

/** Shown when the API does not know the signed-in account yet; Retry provisions it and reloads. */
export function AccountSetupState() {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry() {
    setRetrying(true);
    setError(null);
    try {
      const res = await authFetch("/api/auth/session");
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Account setup failed"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account setup failed");
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-[-0.01em] text-card-foreground max-sm:text-[22px]">Setting up your account</h1>
      <p className="mb-5 mt-1 text-sm text-muted-foreground">Your account is not ready yet. Try again in a moment.</p>
      <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-border px-3.5 py-3 text-sm">
        <UserRoundCog className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
        <span className="min-w-0 flex-1">
          {error ? <span role="alert" className="text-destructive">{error}</span> : "The API has not created your account record yet."}
        </span>
        <Button size="sm" variant="outline" onClick={handleRetry} disabled={retrying}>
          {retrying ? "Retrying" : "Retry"}
        </Button>
      </div>
    </div>
  );
}
