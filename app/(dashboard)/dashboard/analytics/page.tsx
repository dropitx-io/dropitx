import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/firebase/server";
import { AccountNotProvisionedError, getTopShares } from "@/lib/dashboard-data";
import { AccountSetupState } from "@/components/account-setup-state";
import { TitleRow } from "@/components/analytics/title-row";
import { KpiRow } from "@/components/analytics/kpi-row";
import { ShareTable } from "@/components/analytics/share-table";
import { formatInt } from "@/components/analytics/analytics-format";
import type { ShareRow } from "@/components/analytics/share-rows";
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
  const rows: ShareRow[] = top
    .filter((s) => s.total_views > 0)
    .map((s) => ({ label: s.title || s.slug, count: s.total_views, href: `/dashboard/analytics/${s.slug}` }));
  const listed = rows.reduce((sum, r) => sum + r.count, 0);
  // The listed rows add up to every 30-day view only when no share with views was left out of the ranking.
  const total30 = rows.length >= totals.shares_with_views ? listed : null;

  let finding: ReactNode;
  if (rows.length === 0) {
    finding = totals.total_views > 0 ? "No views in the last 30 days." : "No views yet. Share a link and its readers show up here.";
  } else {
    finding = (
      <>
        <b>{rows[0].label}</b> drew {formatInt(rows[0].count)}
        {total30 !== null && ` of ${formatInt(total30)}`} views in the last 30 days.
      </>
    );
  }

  const avg = totals.share_count > 0 ? (totals.total_views / totals.share_count).toFixed(1) : null;

  return (
    <>
      <TitleRow title="Analytics" finding={finding} />
      <KpiRow
        items={[
          { label: "Views", value: formatInt(totals.total_views), note: "All time", lead: true },
          { label: "Unique visitors", value: formatInt(totals.unique_views), note: "Last 30 days" },
          {
            label: "Links with views",
            value: (
              <>
                {formatInt(totals.shares_with_views)}
                <small>of {formatInt(totals.share_count)}</small>
              </>
            ),
            note: "Last 30 days",
          },
          {
            label: "Avg views per link",
            value: avg ?? <span className="text-muted-foreground">—</span>,
            note: `All time, across ${formatInt(totals.share_count)} ${totals.share_count === 1 ? "link" : "links"}`,
          },
        ]}
      />
      <ShareTable
        className="max-w-3xl"
        title="Top links"
        description="Which pages were read most in the last 30 days."
        head="Link"
        rows={rows}
        total={total30}
        empty="No link was opened in the last 30 days."
        aside={
          <Link href="/dashboard" className="text-sm font-medium text-card-foreground hover:underline hover:underline-offset-[3px]">
            All links
          </Link>
        }
        note={
          total30 === null && rows.length > 0
            ? `The ${rows.length} most-read links. Open one for its daily views, referrers and countries.`
            : rows.length > 0
              ? "Open a link for its daily views, referrers and countries."
              : undefined
        }
      />
    </>
  );
}
