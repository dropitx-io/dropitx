import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/firebase/server";
import { AccountNotProvisionedError, getShareAnalytics } from "@/lib/dashboard-data";
import { AccountSetupState } from "@/components/account-setup-state";
import { AnalyticsStatsCards } from "@/components/analytics/analytics-stats-cards";
import { AnalyticsViewChart } from "@/components/analytics/analytics-view-chart";
import { AnalyticsReferrerChart } from "@/components/analytics/analytics-referrer-chart";
import { AnalyticsGeoChart } from "@/components/analytics/analytics-geo-chart";
import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import { ArrowLeft, Link as LinkIcon, Copy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShareAnalyticsResponse } from "@/types/analytics";

interface PerShareAnalyticsPageProps {
  params: Promise<{ slug: string }>;
}

const ANALYTICS_DAYS = 30;

export default async function PerShareAnalyticsPage({ params }: PerShareAnalyticsPageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  let data: ShareAnalyticsResponse | null;
  try {
    data = await getShareAnalytics(slug, ANALYTICS_DAYS);
  } catch (err) {
    if (err instanceof AccountNotProvisionedError) return <AccountSetupState />;
    throw err;
  }

  if (!data) notFound();

  const { share, summary, timeseries, referrers, geo, days } = data;
  const title = share.title ?? share.filename ?? share.slug;
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://dropitx.com"}/s/${share.slug}`;
  const hasData = summary.total_views > 0;

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
          <AnalyticsStatsCards analytics={summary} days={days} />

          <div className="rounded-lg border border-border bg-card p-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Views over time (last {days} days)
            </p>
            <AnalyticsViewChart data={timeseries} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                Traffic sources (last {days} days)
              </p>
              {referrers.length > 0 ? (
                <AnalyticsReferrerChart data={referrers} />
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No referrer data</p>
              )}
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                Geography (last {days} days)
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
        <AnalyticsEmptyState message={`No views in the last ${days} days.`} />
      )}
    </div>
  );
}

