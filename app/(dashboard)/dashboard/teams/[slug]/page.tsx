import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/server";
import { getSessionUser } from "@/lib/firebase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, FileText, Eye, Settings, UserPlus, Activity } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyStateCard } from "@/components/empty-state-card";
import { TeamShareCard } from "@/components/team-share-card";
import { TeamActivityFeed } from "@/components/team-activity-feed";
import type { TeamEvent } from "@/types/team-event";

export default async function TeamOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  const admin = createAdminClient();

  // Fetch team
  const { data: team, error: teamError } = await admin
    .from("teams")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!team) redirect("/dashboard/teams");

  // Verify membership
  const { data: membership, error: memberError } = await admin
    .from("team_members")
    .select("role")
    .eq("team_id", team.id)
    .eq("user_id", user.uid)
    .single();

  if (!membership) redirect("/dashboard/teams");

  const userRole = String(membership.role);

  // Fetch team shares — Supabase returns shares as nested array from join
  const { data: teamShareRows } = await admin
    .from("team_shares")
    .select("created_at, shared_by, shares(id, slug, filename, title, mime_type, view_count, file_size, created_at)")
    .eq("team_id", team.id)
    .order("created_at", { ascending: false });

  // Flatten Supabase join rows: `shares` is an array from the join
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validShares = ((teamShareRows ?? []) as any[])
    .map((row) => {
      const sharesArr = Array.isArray(row.shares) ? row.shares : row.shares ? [row.shares] : [];
      if (sharesArr.length === 0) return null;
      return { created_at: row.created_at, shared_by: row.shared_by, share: sharesArr[0] };
    })
    .filter(Boolean);

  // Count members
  const { count: memberCount } = await admin
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team.id);

  // Fetch recent activity events
  const { data: events } = await admin
    .from("team_events")
    .select("id, event_type, actor_id, target_user_id, metadata, created_at")
    .eq("team_id", team.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalViews = validShares.reduce((sum: number, r: any) => sum + (r.share?.view_count ?? 0), 0);

  const isOwnerOrEditor = userRole === "owner" || userRole === "editor";

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between max-[920px]:flex-col max-[920px]:gap-4">
        <PageHeader
          eyebrow={`/dashboard/teams/${slug}`}
          title={team.name}
          subtitle={`${team.slug} · ${team.plan} plan`}
        >
          <Badge variant={userRole as "owner" | "editor" | "viewer"}>{userRole}</Badge>
        </PageHeader>
        <div className="flex gap-2 mt-2">
          {isOwnerOrEditor && (
            <Link href={`/dashboard/teams/${slug}/members`}>
              <Button variant="outline" size="sm">
                <UserPlus className="size-4" />
                Members
              </Button>
            </Link>
          )}
          {userRole === "owner" && (
            <Link href={`/dashboard/teams/${slug}/settings`}>
              <Button variant="outline" size="sm">
                <Settings className="size-4" />
                Settings
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 max-[920px]:grid-cols-1 gap-4">
        <StatCard icon={FileText} value={validShares.length} label="Shares" />
        <StatCard icon={Eye} value={totalViews} label="Total Views" />
        <StatCard icon={Users} value={memberCount ?? 0} label="Members" />
      </div>

      {/* Recent Activity */}
      {events && events.length > 0 && (
        <Card className="border border-border rounded-[var(--radius-card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamActivityFeed events={events as TeamEvent[]} />
          </CardContent>
        </Card>
      )}

      {/* Shares list */}
      {validShares.length === 0 ? (
        <EmptyStateCard
          icon={FileText}
          title="No shares in this team yet"
          description={isOwnerOrEditor ? "Use the API with a team API key to create team shares." : undefined}
        />
      ) : (
        <div className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {validShares.map((row: any) => (
            <TeamShareCard
              key={row.share.id}
              share={row.share as never}
              teamName={team.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
