/**
 * Team members page — server component.
 * Fetches members and invites server-side, no useEffect data fetching.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/server";
import { getSessionUser } from "@/lib/firebase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TeamMemberRow } from "@/components/team-member-row";
import { MembersPageClient } from "@/components/members-page-client";
import type { TeamRole, TeamInvite } from "@/types/team";

interface MemberRow {
  user_id: string;
  role: TeamRole;
  joined_at: string;
  display_name?: string | null;
  avatar_url?: string | null;
}

interface Props {
  params: Promise<{ slug: string }>;
}

async function getTeamData(slug: string) {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const { data: team, error: teamError } = await admin
    .from("teams")
    .select("id, name, slug, plan, created_by")
    .eq("slug", slug)
    .single();

  if (!team || teamError) redirect("/dashboard/teams");

  const { data: membership } = await admin
    .from("team_members")
    .select("role")
    .eq("team_id", team.id)
    .eq("user_id", user.uid)
    .single();

  if (!membership) redirect("/dashboard/teams");

  const [membersRes, invitesRes] = await Promise.all([
    admin
      .from("team_members")
      .select("user_id, role, joined_at, user_profiles(display_name, avatar_url)")
      .eq("team_id", team.id)
      .order("joined_at", { ascending: true }),
    admin
      .from("team_invites")
      .select("id, email, role, status, expires_at, created_at, invited_by")
      .eq("team_id", team.id)
      .order("created_at", { ascending: false }),
  ]);

  const members = (membersRes.data ?? []).map((m) => {
    const profile = Array.isArray(m.user_profiles)
      ? m.user_profiles[0]
      : m.user_profiles;
    return {
      user_id: m.user_id,
      role: m.role as TeamRole,
      joined_at: m.joined_at,
      display_name: (profile as { display_name: string | null } | null)
        ?.display_name,
      avatar_url: (profile as { avatar_url: string | null } | null)
        ?.avatar_url,
    };
  });

  const invites = invitesRes.data ?? [];

  return {
    team,
    user,
    userRole: membership.role as TeamRole,
    members: members as MemberRow[],
    invites: invites as TeamInvite[],
  };
}

export default async function TeamMembersPage({ params }: Props) {
  const { slug } = await params;
  const { team, user, userRole, members, invites } = await getTeamData(slug);
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
                key={m.user_id}
                userId={m.user_id}
                displayName={m.display_name ?? null}
                avatarUrl={m.avatar_url ?? null}
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
