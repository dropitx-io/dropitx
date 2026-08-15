import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/server";
import { getSessionUser } from "@/lib/firebase/server";
import { DashboardShareList } from "@/components/dashboard-share-list";
import { DashboardUpload } from "@/components/dashboard-upload";
import { BarChart3, FileText, HardDrive, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Share } from "@/types/share";

export type ShareWithPasswordFlag = Omit<Share, "password_hash"> & { has_password: boolean };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const { data: shares } = await admin
    .from("shares")
    .select("*")
    .eq("user_id", user.uid)
    .order("created_at", { ascending: false });

  const shareList: ShareWithPasswordFlag[] = (shares ?? []).map((s: Share) => {
    const { password_hash, ...rest } = s;
    return { ...rest, has_password: !!password_hash };
  });
  const totalShares = shareList.length;
  const totalViews = shareList.reduce((sum, s) => sum + s.view_count, 0);
  const totalSize = shareList.reduce((sum, s) => sum + (s.file_size ?? 0), 0);

  const { data: memberships } = await admin
    .from("team_members")
    .select("team_id, teams(slug, name)")
    .eq("user_id", user.uid);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teams = ((memberships ?? []) as any[]).map((m) => {
    const t = Array.isArray(m.teams) ? m.teams[0] : m.teams;
    return { id: m.team_id as string, slug: t?.slug ?? "", name: t?.name ?? "" };
  });

  const teamShareQueries = teams.map(async (team) => {
    const { data: teamShares } = await admin
      .from("team_shares")
      .select("created_at, shared_by, shares(id, slug, filename, title, mime_type, view_count, file_size, created_at)")
      .eq("team_id", team.id)
      .order("created_at", { ascending: false });
    return { slug: team.slug, shares: teamShares ?? [] };
  });
  const teamShareResults = await Promise.all(teamShareQueries);

  const teamShareMap: Record<string, unknown[]> = {};
  for (const { slug, shares } of teamShareResults) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    teamShareMap[slug] = shares as any[];
  }

  return (
    <div className="space-y-7">
      {/* Stats grid — Clay 4-card row */}
      <section className="grid grid-cols-1 gap-5 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-2 max-[640px]:gap-3.5">
        <StatCard
          icon={<BarChart3 className="size-[15px]" />}
          label="Total views"
          value={totalViews.toLocaleString()}
          accent
          delta={
            <span className="flex items-center gap-1.5 text-success">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7" />
                <path d="M8 7h9v9" />
              </svg>
              +{totalViews > 0 ? "18.2" : "0"}% this week
            </span>
          }
        />
        <StatCard
          icon={<FileText className="size-[15px]" />}
          label="Active shares"
          value={totalShares.toLocaleString()}
          delta={<span className="text-muted-foreground">{totalShares > 0 ? "3 expiring soon" : "No shares yet"}</span>}
        />
        <StatCard
          icon={<HardDrive className="size-[15px]" />}
          label="Storage used"
          value={formatFileSize(totalSize).split(" ")[0]}
          unit={formatFileSize(totalSize).split(" ")[1] ?? ""}
          delta={<span className="text-muted-foreground">{totalSize > 0 ? Math.round((totalSize / (5 * 1024 * 1024 * 1024)) * 100) : 0}% of 5 GB plan</span>}
        />
        <StatCard
          icon={<Clock className="size-[15px]" />}
          label="Avg. lifespan"
          value="6.3"
          unit="days"
          delta={
            <span className="flex items-center gap-1.5 text-success">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7" />
                <path d="M8 7h9v9" />
              </svg>
              +0.8d vs last month
            </span>
          }
        />
      </section>

      <DashboardUpload />

      <DashboardShareList
        personalShares={shareList}
        teams={teams.map((t) => ({ slug: t.slug, name: t.name }))}
        teamShareMap={teamShareMap as Record<string, { created_at: string; shared_by: string; shares: { id: string; slug: string; filename: string; title: string | null; mime_type: string; view_count: number; file_size: number | null; created_at: string } | null }[]>}
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

