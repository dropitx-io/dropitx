import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/server";
import {
  AccountNotProvisionedError,
  getTeam,
  getTeamEvents,
  getTeamMembers,
  getTeamShares,
} from "@/lib/dashboard-data";
import { AccountSetupState } from "@/components/account-setup-state";
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

const RECENT_EVENTS = 10;

async function loadOverview(slug: string) {
  const team = await getTeam(slug);
  if (!team) return null;
  const [shareRows, members, events] = await Promise.all([
    getTeamShares(slug),
    getTeamMembers(slug),
    getTeamEvents(slug, RECENT_EVENTS),
  ]);
  return { team, shareRows, memberCount: members.length, events };
}

export default async function TeamOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  let overview: Awaited<ReturnType<typeof loadOverview>>;
  try {
    overview = await loadOverview(slug);
  } catch (err) {
    if (err instanceof AccountNotProvisionedError) return <AccountSetupState />;
    throw err;
  }
  if (!overview) redirect("/dashboard/teams");

  const { team, shareRows, memberCount, events } = overview;
  const userRole = team.role;

  // Keep only rows that still have a share attached.
  const validShares = shareRows.flatMap((row) =>
    row.shares ? [{ created_at: row.created_at, shared_by: row.shared_by, share: row.shares }] : [],
  );

  const totalViews = validShares.reduce((sum, r) => sum + (r.share.view_count ?? 0), 0);

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
          <Badge variant={userRole}>{userRole}</Badge>
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
        <StatCard icon={Users} value={memberCount} label="Members" />
      </div>

      {/* Recent Activity */}
      {events.length > 0 && (
        <Card className="border border-border rounded-[var(--radius-card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamActivityFeed events={events} />
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
          {validShares.map((row) => (
            <TeamShareCard
              key={row.share.id}
              share={row.share}
              teamName={team.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
