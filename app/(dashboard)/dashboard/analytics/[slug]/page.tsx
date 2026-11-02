import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getSessionUser } from "@/lib/firebase/server";
import { AccountNotProvisionedError, getShareAnalytics } from "@/lib/dashboard-data";
import { AccountSetupState } from "@/components/account-setup-state";
import { buttonVariants } from "@/components/ui/button";
import { TitleRow } from "@/components/analytics/title-row";
import { KpiRow } from "@/components/analytics/kpi-row";
import { SectionHead } from "@/components/analytics/section-head";
import { ShareTable } from "@/components/analytics/share-table";
import { CopyLinkButton } from "@/components/analytics/copy-link-button";
import { AnalyticsViewChart } from "@/components/analytics/analytics-view-chart";
import { busiestDay, fillDaily } from "@/components/analytics/chart-data";
import { countryName, formatDay, formatInt } from "@/components/analytics/analytics-format";
import { foldRows } from "@/components/analytics/share-rows";
import type { ShareAnalyticsResponse } from "@/types/analytics";
import { SITE_URL } from "@/lib/site-url";

interface PerShareAnalyticsPageProps {
  params: Promise<{ slug: string }>;
}

const ANALYTICS_DAYS = 30;

const sum = (rows: { count: number }[]) => rows.reduce((total, r) => total + r.count, 0);

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
  const title = share.title || share.filename || share.slug;
  const shareUrl = `${SITE_URL}/s/${share.slug}`;
  const shownUrl = `${new URL(SITE_URL).host}/s/${share.slug}`;
  const series = fillDaily(timeseries, days, new Date().toISOString().slice(0, 10));
  const peak = busiestDay(series);
  const range = `${formatDay(series[0].date)} to ${formatDay(series[series.length - 1].date)}`;

  const referrerRows = referrers
    .map((r) => ({ label: r.referrer_source.charAt(0).toUpperCase() + r.referrer_source.slice(1), count: r.views }))
    .sort((a, b) => b.count - a.count);
  const countryRows = geo.map((g) => ({ label: countryName(g.country_code), count: g.views })).sort((a, b) => b.count - a.count);

  const finding = peak ? (
    <>
      Busiest on <b>{formatDay(peak.date)}</b> with {formatInt(peak.views)} {peak.views === 1 ? "view" : "views"}; {formatInt(summary.views_7d)} in the last 7 days.
    </>
  ) : (
    `No views in the last ${days} days.`
  );

  return (
    <>
      <TitleRow
        crumb={
          <>
            <Link href="/dashboard/analytics" className="hover:text-card-foreground hover:underline hover:underline-offset-[3px]">
              Analytics
            </Link>
            <span aria-hidden="true">/</span>
            <span className="truncate">{title}</span>
          </>
        }
        title={title}
        meta={
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="truncate font-mono text-[13px] text-card-foreground">{shownUrl}</span>
            <CopyLinkButton url={shareUrl} />
          </div>
        }
        finding={finding}
        actions={
          <>
            <a href={`/s/${share.slug}`} target="_blank" rel="noopener" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <ExternalLink className="size-4 text-muted-foreground" strokeWidth={1.5} />
              Open
            </a>
            <CopyLinkButton url={shareUrl} label="Copy link" primary />
          </>
        }
      />

      <KpiRow
        items={[
          { label: "Views", value: formatInt(summary.total_views), note: `Last ${days} days`, lead: true },
          { label: "Unique visitors", value: formatInt(summary.unique_views), note: `Last ${days} days` },
          { label: "Views today", value: formatInt(summary.views_today), note: "Since 00:00 UTC" },
          { label: "Avg views per day", value: summary.avg_daily_views.toLocaleString("en-US", { maximumFractionDigits: 1 }), note: `Last ${days} days` },
        ]}
      />

      <section className="mb-10" aria-label="Views per day">
        <SectionHead title="Views per day" description={`${range}, UTC.`} />
        {peak ? (
          <AnalyticsViewChart data={series} />
        ) : (
          <p className="flex min-h-[38px] items-center rounded-lg border border-dashed border-input px-3 text-sm text-muted-foreground">
            No views in this period. The chart starts with the first read.
          </p>
        )}
      </section>

      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-2">
        <ShareTable
          title="Referrers"
          description="Where readers clicked the link."
          head="Referrer"
          rows={foldRows(referrerRows)}
          total={sum(referrerRows)}
          empty={`No referrers in the last ${days} days.`}
        />
        <ShareTable
          title="Countries"
          description="Where readers were when they opened it."
          head="Country"
          rows={foldRows(countryRows)}
          total={sum(countryRows)}
          empty={`No views in the last ${days} days.`}
        />
      </div>
    </>
  );
}
