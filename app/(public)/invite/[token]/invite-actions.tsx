"use client";

/**
 * Accept / decline buttons for a pending invite the signed-in visitor may answer.
 * The token comes from the route params, so it is not passed down as a prop.
 */

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { apiErrorDetail, authFetch } from "@/lib/api-client";

interface InviteActionsProps {
  /** Where to go after accepting; the team list when the API did not name the team. */
  teamSlug: string | null;
}

export function InviteActions({ teamSlug }: InviteActionsProps) {
  const router = useRouter();
  const { token } = useParams<{ token: string }>();
  const [pending, setPending] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        router.refresh();
        setPending(null);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(null);
    }
  }

  return (
    <div className="mt-6 space-y-2">
      {error && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button onClick={() => respond("accept")} disabled={pending !== null} className="w-full">
        {pending === "accept" && <Loader2 className="mr-2 size-4 animate-spin" />}
        {pending === "accept" ? "Accepting..." : "Accept Invite"}
      </Button>
      <Button
        variant="outline"
        onClick={() => respond("decline")}
        disabled={pending !== null}
        className="w-full"
      >
        {pending === "decline" && <Loader2 className="mr-2 size-4 animate-spin" />}
        {pending === "decline" ? "Declining..." : "Decline"}
      </Button>
    </div>
  );
}
