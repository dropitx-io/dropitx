"use client";

/**
 * Accept / decline buttons for a pending invite the signed-in visitor may answer.
 * The token comes from the route params, so it is not passed down as a prop.
 */

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { small, squareButton } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import { useAuth } from "@/components/auth-provider";

interface InviteActionsProps {
  /** Where to go after accepting; the team list when the API did not name the team. */
  teamSlug: string | null;
}

export function InviteActions({ teamSlug }: InviteActionsProps) {
  const router = useRouter();
  const { token } = useParams<{ token: string }>();
  const { loading: authLoading } = useAuth();
  const [pending, setPending] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, startRefresh] = useTransition();

  async function respond(action: "accept" | "decline") {
    setPending(action);
    setError(null);
    try {
      const res = await authFetch(`/api/invite/${action}`, {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        setError(await apiErrorDetail(res, `Failed to ${action} invite`));
        setPending(null);
        return;
      }
      if (action === "accept") {
        router.push(teamSlug ? `/dashboard/teams/${teamSlug}` : "/dashboard/teams");
      } else {
        // The lookup now reports the invite as declined, so the page re-renders its status card.
        // Keep the buttons disabled until the refreshed status has rendered, then release them.
        startRefresh(() => {
          router.refresh();
          setPending(null);
        });
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(null);
    }
  }

  const busy = pending !== null || refreshing || authLoading;

  return (
    <div className="mt-3 grid gap-3">
      {error && (
        <p role="alert" className={cn(small, "font-medium text-destructive")}>
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => respond("accept")}
          disabled={busy}
          aria-busy={pending === "accept"}
          className={squareButton()}
        >
          {pending === "accept" ? "Accepting" : "Accept the invite"}
        </button>
        <button
          type="button"
          onClick={() => respond("decline")}
          disabled={busy}
          aria-busy={pending === "decline"}
          className={squareButton("quiet")}
        >
          {pending === "decline" ? "Declining" : "Decline"}
        </button>
      </div>
    </div>
  );
}
