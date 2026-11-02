import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/firebase/server";
import {
  AccountNotProvisionedError,
  getTeam,
  getTeamEvents,
  getTeamMembers,
  getTeamShares,
} from "@/lib/dashboard-data";
import { AccountSetupState } from "@/components/account-setup-state";
import { TitleRow } from "@/components/analytics/title-row";
import { KpiRow } from "@/components/analytics/kpi-row";
import { SectionHead } from "@/components/analytics/section-head";
import { formatInt } from "@/components/analytics/analytics-format";
import { TeamTabs } from "@/components/team-nav";
import { TeamShareRow } from "@/components/team-share-card";
import { TeamActivityFeed } from "@/components/team-activity-feed";
import { formatBytes } from "@/components/team/team-format";
import { memberNames } from "@/components/team/member-names";
import { roleLabel } from "@/components/team/role-label";
import { TABLE, TBODY, TH, THEAD } from "@/components/team/table-classes";

const RECENT_EVENTS = 10;

async function loadOverview(slug: string) {
  const team = await getTeam(slug);
  if (!team) return null;
  const [shareRows, members, events] = await Promise.all([
    getTeamShares(slug),
    getTeamMembers(slug),
    getTeamEvents(slug, RECENT_EVENTS),
  ]);
  return { team, shareRows, members, events };
}

export default async function TeamOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const { team, shareRows, members, events } = overview;
  const names = memberNames(members);

  // Keep only rows that still have a share attached.
  const shares = shareRows.flatMap((row) => (row.shares ? [{ sharedBy: row.shared_by, share: row.shares }] : []));
  const totalViews = shares.reduce((sum, r) => sum + (r.share.view_count ?? 0), 0);
  const totalBytes = shares.reduce((sum, r) => sum + (r.share.file_size ?? 0), 0);
  const canPublish = team.role === "owner" || team.role === "editor";

  const finding =
    shares.length === 0
      ? `No links in ${team.name} yet.`
      : `${formatInt(shares.length)} ${shares.length === 1 ? "link" : "links"} with ${formatInt(totalViews)} views, from a team of ${formatInt(members.length)}.`;

  return (
    <>
      <TitleRow
        crumb={
          <Link href="/dashboard/teams" className="hover:text-card-foreground hover:underline hover:underline-offset-[3px]">
            Teams
          </Link>
        }
        title={team.name}
        finding={finding}
      />
      <TeamTabs slug={slug} isOwner={team.role === "owner"} />

      <KpiRow
        items={[
          { label: "Links", value: formatInt(shares.length), note: "Published to the team", lead: true },
          { label: "Views", value: formatInt(totalViews), note: "All time, across team links" },
          { label: "Members", value: formatInt(members.length), note: `${roleLabel(team.plan)} plan` },
          { label: "Storage used", value: formatBytes(totalBytes), note: "Sum of team link files" },
        ]}
      />

      <div className="grid items-start gap-x-4 gap-y-10 lg:grid-cols-12">
        <section className="min-w-0 lg:col-span-8" aria-labelledby="links-h">
          <SectionHead id="links-h" title="Links" aside={`${formatInt(shares.length)} total`} />
          {shares.length === 0 ? (
            <p className="flex min-h-[38px] items-center rounded-lg border border-dashed border-input px-3 text-sm text-muted-foreground">
              {canPublish ? "Publish with a team API key (sht_) and links appear here." : "Links that members publish to the team appear here."}
            </p>
          ) : (
            <table className={TABLE}>
              <thead className={THEAD}>
                <tr>
                  <th scope="col" className={TH}>Name</th>
                  <th scope="col" className={TH}>Shared by</th>
                  <th scope="col" className={`${TH} text-right`}>Views</th>
                  <th scope="col" className={`${TH} text-right`}>Size</th>
                  <th scope="col" className={`${TH} text-right`}>Added</th>
                </tr>
              </thead>
              <tbody className={TBODY}>
                {shares.map((row) => (
                  <TeamShareRow key={row.share.id} share={row.share} sharedByName={names[row.sharedBy] ?? null} />
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="min-w-0 lg:col-span-4" aria-labelledby="activity-h">
          <SectionHead id="activity-h" title="Activity" aside={events.length ? `Latest ${events.length}` : undefined} />
          <TeamActivityFeed events={events} names={names} />
        </section>
      </div>
    </>
  );
}
