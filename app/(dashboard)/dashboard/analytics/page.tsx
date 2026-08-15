import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/server";
import { getSessionUser } from "@/lib/firebase/server";
import { AnalyticsTopPerformers } from "@/components/analytics/analytics-top-performers";
import { cn } from "@/lib/utils";
import type { TopShare } from "@/types/analytics";
import type { Share } from "@/types/share";

export default async function GlobalAnalyticsPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const { data: shares } = await admin
    .from("shares")
    .select("id, view_count")
    .eq("user_id", user.uid);

  const { data: topShares } = await admin.rpc("get_user_top_shares", {
    p_user_id: user.uid,
    p_limit: 10,
  });

  const shareList = (shares ?? []) as Pick<Share, "id" | "view_count">[];
  const topSharesList = (topShares ?? []) as TopShare[];

  const totalViews = shareList.reduce((sum, s) => sum + s.view_count, 0);
  const totalUniqueViews = topSharesList.reduce((sum, s) => sum + s.unique_views, 0);
  const sharesWithViews = topSharesList.filter((s) => s.total_views > 0).length;
  const avgViewsPerShare = shareList.length > 0
    ? Math.round((totalViews / shareList.length) * 10) / 10
    : 0;

  const hasData = topSharesList.some((s) => s.total_views > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Track how your shares are performing.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-card p-1 clay-raised">
          {["7d", "30d", "90d"].map((r) => (
            <button
              key={r}
              type="button"
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
              data-active={r === "30d"}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <StatTile label="Total Views" value={totalViews.toLocaleString()} accent />
        <StatTile label="Unique Visitors" value={totalUniqueViews.toLocaleString()} />
        <StatTile label="Shares with Views" value={sharesWithViews.toString()} />
        <StatTile label="Avg Views/Share" value={avgViewsPerShare.toString()} />
      </div>

      {/* Views-over-time placeholder */}
      <div className="rounded-[22px] bg-card p-5 clay-raised">
        <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
          Views over time
        </p>
        <div className="grid h-[180px] place-items-center rounded-[14px] border border-dashed border-border bg-background text-xs uppercase tracking-wider text-muted-foreground/70">
          [ views-over-time chart ]
        </div>
      </div>

      {hasData ? (
        <div className="space-y-3">
          <h2 className="font-mono text-sm font-semibold">Top Performers (30d)</h2>
          <AnalyticsTopPerformers shares={topSharesList} />
        </div>
      ) : (
        <div className="grid place-items-center rounded-[34px] border-2 border-dashed border-border bg-card py-16 text-center clay-raised">
          <p className="font-display text-lg font-bold">No data yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Once your shares start getting views, you&apos;ll see them ranked here.
          </p>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-[22px] bg-card p-5 clay-raised">
      <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{label}</p>
      <p className={cn(
        "mt-3.5 font-display text-[32px] font-extrabold leading-none tracking-[-0.03em]",
        accent && "text-primary"
      )}>
        {value}
      </p>
    </div>
  );
}

