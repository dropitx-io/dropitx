import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/server";
import { AccountNotProvisionedError, getAllShares, getTeamShares, getTeams } from "@/lib/dashboard-data";
import { AccountSetupState } from "@/components/account-setup-state";
import { DashboardShareList } from "@/components/dashboard-share-list";
import { DashboardUpload } from "@/components/dashboard-upload";
import { LinksLoadError } from "@/components/links/links-load-error";
import { linksFinding, personalLinkRows } from "@/components/links/link-rows";
import type { TeamShareRow } from "@/types/team";

async function loadDashboardHome() {
  const [shareList, memberships] = await Promise.all([getAllShares(), getTeams()]);

  const teams = memberships.flatMap((m) => (m.teams ? [{ slug: m.teams.slug, name: m.teams.name }] : []));
  const teamShareResults = await Promise.all(
    teams.map(async (team) => [team.slug, await getTeamShares(team.slug)] as const),
  );
  const teamShareMap: Record<string, TeamShareRow[]> = Object.fromEntries(teamShareResults);

  return { shareList, teams, teamShareMap };
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  let home: Awaited<ReturnType<typeof loadDashboardHome>>;
  try {
    home = await loadDashboardHome();
  } catch (err) {
    if (err instanceof AccountNotProvisionedError) return <AccountSetupState />;
    console.error("dashboard: links could not be loaded", err);
    return <LinksLoadError />;
  }
  const { shareList, teams, teamShareMap } = home;

  const empty =
    shareList.length === 0 && teams.every((t) => (teamShareMap[t.slug] ?? []).every((row) => row.shares === null));

  return (
    <DashboardUpload finding={linksFinding(personalLinkRows(shareList))} empty={empty}>
      <DashboardShareList personalShares={shareList} teams={teams} teamShareMap={teamShareMap} />
    </DashboardUpload>
  );
}
