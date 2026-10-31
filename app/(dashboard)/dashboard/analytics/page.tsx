import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/server";
import { AccountNotProvisionedError, getTopShares } from "@/lib/dashboard-data";
import { AccountSetupState } from "@/components/account-setup-state";
import { AnalyticsTopPerformers } from "@/components/analytics/analytics-top-performers";
import { cn } from "@/lib/utils";
import type { TopSharesResponse } from "@/types/analytics";

const TOP_SHARES_LIMIT = 10;

export default async function GlobalAnalyticsPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  let data: TopSharesResponse;
  try {
    data = await getTopShares(TOP_SHARES_LIMIT);
  } catch (err) {
    if (err instanceof AccountNotProvisionedError) return <AccountSetupState />;
    throw err;
  }

  const { totals, top } = data;
  const avgViewsPerShare = totals.share_count > 0
    ? Math.round((totals.total_views / totals.share_count) * 10) / 10
    : 0;

  const hasData = top.some((s) => s.total_views > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Track how your shares are performing.
          </p>
        </div>
        <span className="rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground clay-raised">
          Last 30 days
        </span>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <StatTile label="Total Views" window="All time" value={totals.total_views.toLocaleString()} accent />
        <StatTile label="Unique Visitors" window="Last 30 days" value={totals.unique_views.toLocaleString()} />
        <StatTile label="Shares with Views" window="Last 30 days" value={totals.shares_with_views.toLocaleString()} />
        <StatTile label="Avg Views/Share" window="All time" value={avgViewsPerShare.toLocaleString()} />
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
          <h2 className="font-mono text-sm font-semibold">Top Performers (last 30 days)</h2>
          <AnalyticsTopPerformers shares={top} />
        </div>
      ) : (
        <div className="grid place-items-center rounded-[34px] border-2 border-dashed border-border bg-card py-16 text-center clay-raised">
          <p className="font-display text-lg font-bold">
            {totals.total_views > 0 ? "No views in the last 30 days" : "No data yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {totals.total_views > 0
              ? "Shares that get views over the next 30 days will be ranked here."
              : "Once your shares start getting views, you’ll see them ranked here."}
          </p>
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  window,
  value,
  accent,
}: {
  label: string;
  window: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[22px] bg-card p-5 clay-raised">
      <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{label}</p>
      <p className={cn(
        "mt-3.5 font-display text-[32px] font-extrabold leading-none tracking-[-0.03em]",
        accent && "text-primary"
      )}>
        {value}
      </p>
      <p className="mt-2 text-[11px] text-muted-foreground">{window}</p>
    </div>
  );
}
