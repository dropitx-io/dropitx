import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/firebase/server";
import {
  AccountNotProvisionedError,
  getTeam,
  getTeamInvites,
  getTeamMembers,
  getTeamShares,
} from "@/lib/dashboard-data";
import { AccountSetupState } from "@/components/account-setup-state";
import { TitleRow } from "@/components/analytics/title-row";
import { SectionHead } from "@/components/analytics/section-head";
import { formatDay } from "@/components/analytics/analytics-format";
import { TeamTabs } from "@/components/team-nav";
import { TeamMemberRow } from "@/components/team-member-row";
import { MembersPageClient } from "@/components/members-page-client";
import { InviteRow } from "@/components/team/invite-row";
import { RoleCards } from "@/components/team/role-cards";
import { memberName, memberNames } from "@/components/team/member-names";
import { TABLE, TBODY, TH, THEAD } from "@/components/team/table-classes";

interface Props {
  params: Promise<{ slug: string }>;
}

const ROLE_ORDER: Record<string, number> = { owner: 0, admin: 1, editor: 2, member: 3, viewer: 4 };

async function loadMembersPage(slug: string) {
  const team = await getTeam(slug);
  if (!team) return null;
  const [members, invites, shares] = await Promise.all([getTeamMembers(slug), getTeamInvites(slug), getTeamShares(slug)]);
  // Invite ages and expiry are judged against the time of this request.
  return { team, members, invites, shares, now: Date.now() };
}

export default async function TeamMembersPage({ params }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);
  if (!user) redirect("/auth/login");

  let page: Awaited<ReturnType<typeof loadMembersPage>>;
  try {
    page = await loadMembersPage(slug);
  } catch (err) {
    if (err instanceof AccountNotProvisionedError) return <AccountSetupState />;
    throw err;
  }
  if (!page) redirect("/dashboard/teams");

  const { team, members, invites, shares, now } = page;
  const viewerRole = team.role;
  const canInvite = viewerRole === "owner" || viewerRole === "editor";
  const names = memberNames(members);
  const pending = invites.filter((i) => i.status === "pending");
  const linksBy = (userId: string) => shares.filter((s) => s.shares && s.shared_by === userId).length;
  const sorted = [...members].sort((a, b) => (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9));

  // The finding: the invite that has waited longest, else the headcount.
  const oldest = [...pending].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))[0];
  let finding: ReactNode = `${members.length} ${members.length === 1 ? "member" : "members"}, no invites waiting.`;
  if (oldest) {
    const days = Math.floor((now - Date.parse(oldest.created_at)) / 86_400_000);
    const sent = days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
    const expired = Date.parse(oldest.expires_at) < now;
    finding = (
      <>
        <b>{oldest.email}</b> has not accepted the invite sent {sent}. It {expired ? "expired" : "expires"} on {formatDay(oldest.expires_at)}.
      </>
    );
  }

  return (
    <>
      <TitleRow
        crumb={
          <>
            <Link href="/dashboard/teams" className="hover:text-card-foreground hover:underline hover:underline-offset-[3px]">Teams</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/dashboard/teams/${slug}`} className="truncate hover:text-card-foreground hover:underline hover:underline-offset-[3px]">{team.name}</Link>
          </>
        }
        title="Members"
        finding={finding}
        actions={
          <MembersPageClient teamSlug={slug} teamName={team.name} canInvite={canInvite} pendingEmails={pending.map((i) => i.email.toLowerCase())} />
        }
      />
      <TeamTabs slug={slug} isOwner={viewerRole === "owner"} />

      <section aria-labelledby="members-h">
        <SectionHead
          id="members-h"
          title="Members"
          aside={`${members.length} ${members.length === 1 ? "member" : "members"}${pending.length ? `, ${pending.length} ${pending.length === 1 ? "invite" : "invites"} pending` : ""}`}
        />
        <table className={TABLE}>
          <thead className={THEAD}>
            <tr>
              <th scope="col" className={TH}>Name</th>
              <th scope="col" className={TH}>Role</th>
              <th scope="col" className={`${TH} text-right`}>Links</th>
              <th scope="col" className={`${TH} text-right`}>Joined</th>
              <th scope="col" className={`${TH} w-11`}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className={TBODY}>
            {sorted.map((m) => (
              <TeamMemberRow
                key={m.id}
                userId={m.user_id}
                displayName={memberName(m)}
                avatarUrl={m.user_profiles?.avatar_url ?? null}
                role={m.role}
                joinedAt={m.joined_at ?? m.created_at}
                linkCount={linksBy(m.user_id)}
                viewerRole={viewerRole}
                isSelf={m.user_id === user.uid}
                teamSlug={slug}
              />
            ))}
            {pending.map((inv) => (
              <InviteRow
                key={inv.id}
                invite={inv}
                teamSlug={slug}
                invitedBy={inv.invited_by ? (names[inv.invited_by] ?? null) : null}
                canManage={canInvite}
                expired={Date.parse(inv.expires_at) < now}
              />
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-10" aria-labelledby="roles-h">
        <SectionHead id="roles-h" title="Roles" aside={viewerRole === "owner" ? "Change a role from a member's actions menu" : undefined} />
        <RoleCards members={members} invites={pending} />
      </section>
    </>
  );
}
