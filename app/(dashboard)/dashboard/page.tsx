import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/server";
import { getAllShares, getShareTotals, getTeamShares, getTeams } from "@/lib/dashboard-data";
import { DashboardShareList } from "@/components/dashboard-share-list";
import { DashboardUpload } from "@/components/dashboard-upload";
import { BarChart3, FileText, HardDrive, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamShareRow } from "@/types/team";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  const [totals, shareList, memberships] = await Promise.all([
    getShareTotals(),
    getAllShares(),
    getTeams(),
  ]);

  const teams = memberships.flatMap((m) =>
    m.teams ? [{ slug: m.teams.slug, name: m.teams.name }] : [],
  );
  const teamShareResults = await Promise.all(
    teams.map(async (team) => [team.slug, await getTeamShares(team.slug)] as const),
  );
  const teamShareMap: Record<string, TeamShareRow[]> = Object.fromEntries(teamShareResults);

  const totalSize = totals.total_size;

  return (
    <div className="space-y-7">
      {/* Stats grid — Clay 4-card row */}
      <section className="grid grid-cols-1 gap-5 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-2 max-[640px]:gap-3.5">
        <StatCard
          icon={<BarChart3 className="size-[15px]" />}
          label="Total views"
          value={totals.total_views.toLocaleString()}
          accent
          delta={<span className="text-muted-foreground">All time</span>}
        />
        <StatCard
          icon={<FileText className="size-[15px]" />}
          label="Total shares"
          value={totals.share_count.toLocaleString()}
          delta={
            <span className="text-muted-foreground">
              {totals.share_count > 0 ? "Includes expired shares" : "No shares yet"}
            </span>
          }
        />
        <StatCard
          icon={<HardDrive className="size-[15px]" />}
          label="Storage used"
          value={formatFileSize(totalSize).split(" ")[0]}
          unit={formatFileSize(totalSize).split(" ")[1] ?? ""}
          delta={<span className="text-muted-foreground">{totalSize > 0 ? Math.round((totalSize / (5 * 1024 * 1024 * 1024)) * 100) : 0}% of 5 GB plan</span>}
        />
        <StatCard
          icon={<Users className="size-[15px]" />}
          label="Unique views"
          value={totals.unique_views.toLocaleString()}
          unit="30 days"
          delta={
            <span className="text-muted-foreground">
              {totals.shares_with_views.toLocaleString()} shares viewed
            </span>
          }
        />
      </section>

      <DashboardUpload />

      <DashboardShareList
        personalShares={shareList}
        teams={teams}
        teamShareMap={teamShareMap}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  accent,
  delta,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
  delta?: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] bg-card p-5 px-5.5 clay-raised">
      <div className="mb-3.5 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-[0.06em]">{label}</span>
      </div>
      <div className={cn(
        "font-display text-[32px] font-extrabold leading-none tracking-[-0.03em]",
        accent && "text-primary"
      )}>
        {value}
        {unit && <span className="ml-1 text-[15px] font-semibold text-muted-foreground">{unit}</span>}
      </div>
      {delta && (
        <div className="mt-2.5 font-mono text-[11px] tracking-[0.02em]">{delta}</div>
      )}
    </div>
  );
}

