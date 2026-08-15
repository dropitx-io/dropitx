import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/server";
import { getSessionUser } from "@/lib/firebase/server";
import { AnalyticsStatsCards } from "@/components/analytics/analytics-stats-cards";
import { AnalyticsViewChart } from "@/components/analytics/analytics-view-chart";
import { AnalyticsReferrerChart } from "@/components/analytics/analytics-referrer-chart";
import { AnalyticsGeoChart } from "@/components/analytics/analytics-geo-chart";
import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import { ArrowLeft, Link as LinkIcon, Copy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShareAnalytics, ViewTimeSeriesPoint, ReferrerBreakdown, GeoBreakdown } from "@/types/analytics";

interface PerShareAnalyticsPageProps {
  params: Promise<{ slug: string }>;
}

const EMPTY_ANALYTICS: ShareAnalytics = {
  total_views: 0,
  unique_views: 0,
  views_today: 0,
  views_7d: 0,
  avg_daily_views: 0,
};

export default async function PerShareAnalyticsPage({ params }: PerShareAnalyticsPageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const { data: share } = await admin
    .from("shares")
    .select("id, user_id, slug, title, filename")
    .eq("slug", slug)
    .eq("user_id", user.uid)
    .single();

  if (!share) notFound();
  const [analyticsRes, timeseriesRes, referrersRes, geoRes] = await Promise.all([
    admin.rpc("get_share_analytics", { p_share_id: share.id, p_days: 30 }),
    admin.rpc("get_share_view_timeseries", { p_share_id: share.id, p_days: 30 }),
    admin.rpc("get_share_referrers", { p_share_id: share.id, p_days: 30 }),
    admin.rpc("get_share_geo", { p_share_id: share.id, p_days: 30 }),
  ]);

  const analytics: ShareAnalytics = (analyticsRes.data as ShareAnalytics[])?.[0] ?? EMPTY_ANALYTICS;
  const timeseries: ViewTimeSeriesPoint[] = (timeseriesRes.data as ViewTimeSeriesPoint[]) ?? [];
  const referrers: ReferrerBreakdown[] = (referrersRes.data as ReferrerBreakdown[]) ?? [];
  const geo: GeoBreakdown[] = (geoRes.data as GeoBreakdown[]) ?? [];

  const title = share.title ?? share.filename;
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://dropitx.com"}/s/${share.slug}`;
  const hasData = analytics.total_views > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <Link
          href="/dashboard/analytics"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-0.5 gap-1.5")}
        >
          <ArrowLeft className="size-3.5" /> Back
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-[20px] font-bold tracking-tight">{title}</h1>
          <p className="font-mono text-xs text-muted-foreground">/{share.slug}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <LinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <code className="flex-1 truncate font-mono text-xs text-muted-foreground">{shareUrl}</code>
        <button
          type="button"
          className="copy-url-btn rounded-md p-1.5 hover:bg-muted"
          data-url={shareUrl}
          title="Copy link"
        >
          <Copy className="size-3.5" />
        </button>
      </div>

      {hasData ? (
        <>
          <AnalyticsStatsCards analytics={analytics} />

          <div className="rounded-lg border border-border bg-card p-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Views over time (30d)
            </p>
            <AnalyticsViewChart data={timeseries} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                Traffic sources
              </p>
              {referrers.length > 0 ? (
                <AnalyticsReferrerChart data={referrers} />
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No referrer data</p>
              )}
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                Geography
              </p>
              {geo.length > 0 ? (
                <AnalyticsGeoChart data={geo} />
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No geo data</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <AnalyticsEmptyState />
      )}
    </div>
  );
}

