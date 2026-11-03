"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import { formatDay } from "@/components/analytics/analytics-format";
import type { TeamInvite } from "@/types/team";
import { PersonAvatar } from "./person-avatar";
import { RowMenu } from "./row-menu";
import { roleLabel } from "./role-label";
import { ACTIONS, LINE2, TD, TR, WIDE } from "./table-classes";

interface InviteRowProps {
  invite: TeamInvite;
  teamSlug: string;
  /** Name of the member who sent it; null when they have left. */
  invitedBy: string | null;
  canManage: boolean;
  /** Past its expiry at render time; the API keeps such invites as `pending`. */
  expired: boolean;
}

/** A pending invite as a member-table row: dashed avatar, its status pill, and Resend / Revoke. */
export function InviteRow({ invite, teamSlug, invitedBy, canManage, expired }: InviteRowProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(path: string, init: RequestInit, done: string, failed: string) {
    setBusy(true);
    try {
      const res = await authFetch(path, init);
      if (!res.ok) throw new Error(await apiErrorDetail(res, failed));
      toast.success(done);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : failed);
    } finally {
      setBusy(false);
    }
  }

  const base = `/api/dashboard/teams/${teamSlug}/invites`;
  const pill = (
    <span className={`inline-flex h-[22px] items-center rounded-full px-2 text-xs font-medium ${expired ? "bg-pill-negative text-pill-negative-foreground" : "bg-rule text-card-foreground"}`}>
      {expired ? "Expired" : "Pending"}
    </span>
  );

  return (
    <tr className={TR}>
      <td className={TD}>
        <div className="flex min-w-0 items-center gap-3">
          <PersonAvatar id={invite.email} name={invite.email} pending />
          <span className="min-w-0">
            <span className="block truncate font-medium text-card-foreground">{invite.email}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {invitedBy ? `Invited by ${invitedBy}, ` : ""}
              {expired ? "expired" : "expires"} {formatDay(invite.expires_at)}
            </span>
          </span>
        </div>
      </td>
      <td className={`${TD} ${WIDE}`}>{roleLabel(invite.role)}</td>
      <td className={`${TD} ${WIDE} text-right text-muted-foreground`}>—</td>
      <td className={`${TD} ${WIDE} text-right`}>{pill}</td>
      <td className={`${TD} ${LINE2}`}>
        {pill} {roleLabel(invite.role)}, sent {formatDay(invite.created_at)}
      </td>
      <td className={`${TD} ${ACTIONS} w-11`}>
        {canManage && (
          <RowMenu
            label={`Actions for the invite to ${invite.email}`}
            busy={busy}
            items={[
              {
                label: "Resend invite",
                onSelect: () => act(`${base}/${invite.id}/resend`, { method: "POST" }, `Invite resent to ${invite.email}`, "Failed to resend invite"),
              },
              {
                label: "Revoke invite",
                danger: true,
                separated: true,
                onSelect: () =>
                  act(base, { method: "DELETE", body: JSON.stringify({ invite_id: invite.id }) }, `Revoked the invite to ${invite.email}`, "Failed to revoke invite"),
              },
            ]}
          />
        )}
      </td>
    </tr>
  );
}
