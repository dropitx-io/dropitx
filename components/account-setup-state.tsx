"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRoundCog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center gap-3 pb-2">
          <div className="flex size-14 items-center justify-center rounded-lg bg-primary/10">
            <UserRoundCog className="size-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Setting up your account</CardTitle>
          <CardDescription>
            Your account is not ready yet. Try again in a moment.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-col justify-center gap-3">
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleRetry} disabled={retrying}>
            {retrying ? <Loader2 className="size-4 animate-spin" /> : "Retry"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
