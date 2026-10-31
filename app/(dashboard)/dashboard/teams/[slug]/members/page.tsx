/**
 * Team members page — server component.
 * Fetches members and invites server-side, no useEffect data fetching.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/server";
import {
  AccountNotProvisionedError,
  getTeam,
  getTeamInvites,
  getTeamMembers,
} from "@/lib/dashboard-data";
import { AccountSetupState } from "@/components/account-setup-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TeamMemberRow } from "@/components/team-member-row";
import { MembersPageClient } from "@/components/members-page-client";

interface Props {
  params: Promise<{ slug: string }>;
}

async function loadMembersPage(slug: string) {
  const team = await getTeam(slug);
  if (!team) return null;
  const [members, invites] = await Promise.all([getTeamMembers(slug), getTeamInvites(slug)]);
  return { team, members, invites };
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

  const { team, members, invites } = page;
  const userRole = team.role;
  const canInvite = userRole === "owner" || userRole === "editor";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          eyebrow={`/dashboard/teams/${slug}/members`}
          title="Members"
          subtitle={`${team.name} · ${members.length} member${members.length !== 1 ? "s" : ""}`}
        />
        <MembersPageClient
          teamSlug={slug}
          canInvite={canInvite}
          pendingInvites={invites.filter((i) => i.status === "pending")}
        />
      </div>

      <Card className="border border-border rounded-[var(--radius-card)] shadow-[var(--shadow)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {members.map((m) => (
              <TeamMemberRow
                key={m.id}
                userId={m.user_id}
                displayName={m.user_profiles?.display_name ?? null}
                avatarUrl={m.user_profiles?.avatar_url ?? null}
                role={m.role}
                viewerRole={userRole}
                isSelf={m.user_id === user.uid}
                teamSlug={slug}
              />
            ))}
          </div>
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">
              No members found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
