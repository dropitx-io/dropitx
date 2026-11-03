"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthUser } from "@/lib/use-auth-user";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Invite {
  id: string;
  role: string;
  token: string;
  created_at: string;
  status: string;
  teams: { name: string; slug: string };
  user_profiles: { display_name: string | null } | null;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

export function InviteNotificationBell() {
  const user = useAuthUser();
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await authFetch("/api/dashboard/invitations");
        if (res.ok && !cancelled) {
          // The API lists every invite addressed to the user's email, whatever its status.
          // The embedded team is null when its row is gone; there is nothing to join then.
          const rows = (await res.json()) as Invite[];
          setInvites(rows.filter((invite) => invite.status === "pending" && invite.teams));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user]);

  if (!user) return null;

  const count = invites.length;

  async function handleAccept(token: string, teamSlug: string) {
    const key = `accept:${token}`;
    setLoadingAction(key);
    try {
      const res = await authFetch("/api/invite/accept", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        toast.success("Joined the team");
        setInvites((prev) => prev.filter((i) => i.token !== token));
        router.push(`/dashboard/teams/${teamSlug}`);
      } else {
        toast.error(await apiErrorDetail(res, "Failed to accept"));
      }
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleDecline(token: string) {
    const key = `decline:${token}`;
    setLoadingAction(key);
    try {
      const res = await authFetch("/api/invite/decline", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        toast.success("Invite declined");
        setInvites((prev) => prev.filter((i) => i.token !== token));
      } else {
        toast.error(await apiErrorDetail(res, "Failed to decline"));
      }
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <Popover>
      <PopoverTrigger
        className="relative grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-active hover:text-foreground max-md:size-11"
        aria-label={`Invitations${count > 0 ? ` (${count} pending)` : ""}`}
      >
        <Bell className="size-4" strokeWidth={1.5} />
        {count > 0 && (
          <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[11px] font-medium tabular-nums leading-none text-primary-foreground max-md:right-1.5 max-md:top-1.5">
            {count}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 gap-2 p-2 shadow-none ring-1 ring-border" align="end">
        <PopoverHeader className="px-1 pt-1">
          <PopoverTitle>Team invitations</PopoverTitle>
        </PopoverHeader>
        {invites.length === 0 && (
          <p className="px-1 pb-2 text-sm text-muted-foreground">
            {loading ? "Checking for invitations." : "No invitations waiting for you."}
          </p>
        )}
        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
          {invites.map((invite) => (
            <div key={invite.id} className="rounded-md border border-border p-2.5">
              <p className="truncate text-sm font-medium">{invite.teams.name}</p>
              <p className="text-xs text-muted-foreground">
                From {invite.user_profiles?.display_name ?? "a teammate"}, as {invite.role},{" "}
                <span className="tabular-nums">{formatTimeAgo(invite.created_at)}</span>
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={!!loadingAction}
                  onClick={() => handleAccept(invite.token, invite.teams.slug)}
                >
                  {loadingAction === `accept:${invite.token}` ? "Joining" : "Join team"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={!!loadingAction}
                  onClick={() => handleDecline(invite.token)}
                >
                  {loadingAction === `decline:${invite.token}` ? "Declining" : "Decline"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
