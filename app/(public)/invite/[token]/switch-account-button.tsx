"use client";

/**
 * Offered when the signed-in visitor's email does not match the invite: signs out, then
 * opens the login page with `next` pointing back at the invite. A full navigation is used
 * so the server sees the cleared session cookie.
 */

import { useState } from "react";
import { small, squareButton } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";
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
    <div className="mt-3 grid gap-3">
      {error && (
        <p role="alert" className={cn(small, "font-medium text-destructive")}>
          {error}
        </p>
      )}
      <div>
        <button type="button" onClick={handleClick} disabled={pending} aria-busy={pending} className={squareButton()}>
          {pending ? "Signing you out" : "Sign in with a different account"}
        </button>
      </div>
    </div>
  );
}
