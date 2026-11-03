"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import type { TeamMemberRole, TeamRole } from "@/types/team";
import { TEAM_ROLES } from "@/lib/team-utils";
import { formatDay } from "@/components/analytics/analytics-format";
import { PersonAvatar } from "@/components/team/person-avatar";
import { RowMenu } from "@/components/team/row-menu";
import { roleLabel } from "@/components/team/role-label";
import { ACTIONS, LINE2, TD, TR, WIDE } from "@/components/team/table-classes";

interface TeamMemberRowProps {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: TeamMemberRole;
  joinedAt: string;
  /** Links this member added to the team. */
  linkCount: number;
  /** Current user's role — determines edit permissions. */
  viewerRole: TeamMemberRole;
  /** Whether this row is the current user. */
  isSelf: boolean;
  teamSlug: string;
}

export function TeamMemberRow({ userId, displayName, avatarUrl, role, joinedAt, linkCount, viewerRole, isSelf, teamSlug }: TeamMemberRowProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const canEditRole = viewerRole === "owner" && !isSelf;
  const canRemove = viewerRole === "owner" || isSelf;

  async function handleChangeRole(newRole: TeamRole) {
    setBusy(true);
    try {
      const res = await authFetch(`/api/dashboard/teams/${teamSlug}/members`, {
        method: "PATCH",
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Failed to update role"));
      toast.success(`${displayName} is now ${roleLabel(newRole).toLowerCase()}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    const action = isSelf ? "leave the team" : `remove ${displayName} from the team`;
    if (!confirm(`Are you sure you want to ${action}?`)) return;

    setBusy(true);
    try {
      const res = await authFetch(`/api/dashboard/teams/${teamSlug}/members`, {
        method: "DELETE",
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Failed to remove member"));
      toast.success(isSelf ? "You left the team" : `Removed ${displayName}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setBusy(false);
    }
  }

  const menu = [
    ...(canEditRole ? TEAM_ROLES.map((r) => ({ label: roleLabel(r), checked: r === role, onSelect: () => r !== role && handleChangeRole(r) })) : []),
    ...(canRemove ? [{ label: isSelf ? "Leave team" : "Remove from team", danger: true, separated: canEditRole, onSelect: handleRemove }] : []),
  ];
  const links = `${linkCount} ${linkCount === 1 ? "link" : "links"}`;

  return (
    <tr className={TR}>
      <td className={TD}>
        <div className="flex min-w-0 items-center gap-3">
          <PersonAvatar id={userId} name={displayName} imageUrl={avatarUrl} />
          <span className="flex min-w-0 items-center gap-1.5 font-medium text-card-foreground">
            <span className="truncate">{displayName}</span>
            {isSelf && <span className="rounded-sm bg-raised px-1.5 text-xs font-normal text-muted-foreground">You</span>}
          </span>
        </div>
      </td>
      <td className={`${TD} ${WIDE}`}>{roleLabel(role)}</td>
      <td className={`${TD} ${WIDE} text-right`}>{linkCount}</td>
      <td className={`${TD} ${WIDE} text-right whitespace-nowrap`}>{formatDay(joinedAt)}</td>
      <td className={`${TD} ${LINE2}`}>
        {roleLabel(role)}, {links}, joined {formatDay(joinedAt)}
      </td>
      <td className={`${TD} ${ACTIONS} w-11`}>
        {menu.length > 0 && <RowMenu label={`Actions for ${displayName}`} items={menu} busy={busy} />}
      </td>
    </tr>
  );
}
