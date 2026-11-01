"use client";

/**
 * Offered when the signed-in visitor's email does not match the invite: signs out, then
 * opens the login page with `next` pointing back at the invite. A full navigation is used
 * so the server sees the cleared session cookie.
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";

interface SwitchAccountButtonProps {
  /** Same-origin login URL carrying `next` back to the invite. */
  loginUrl: string;
}

export function SwitchAccountButton({ loginUrl }: SwitchAccountButtonProps) {
  const { signOut } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      await signOut();
      window.location.href = loginUrl;
    } catch {
      setError("Could not sign you out. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="mt-6 space-y-2">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button onClick={handleClick} disabled={pending} className="w-full">
        {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Sign in with a different account
      </Button>
    </div>
  );
}
