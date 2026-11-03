import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/firebase/server";
import { AccountNotProvisionedError, getTeam, getTeamMembers, getTeamShares } from "@/lib/dashboard-data";
import { AccountSetupState } from "@/components/account-setup-state";
import { TitleRow } from "@/components/analytics/title-row";
import { KpiRow } from "@/components/analytics/kpi-row";
import { SectionHead } from "@/components/analytics/section-head";
import { formatInt } from "@/components/analytics/analytics-format";
import { TeamTabs } from "@/components/team-nav";
import { ApiKeyManager } from "@/components/api-key-manager";
import { SettingsRow } from "@/components/team/settings-row";
import { TeamGeneralForm } from "@/components/team/team-general-form";
import { TeamDangerZone } from "@/components/team/team-danger-zone";
import { formatBytes } from "@/components/team/team-format";
import { roleLabel } from "@/components/team/role-label";

async function loadSettings(slug: string) {
  const team = await getTeam(slug);
  if (!team) return null;
  const [shareRows, members] = await Promise.all([getTeamShares(slug), getTeamMembers(slug)]);
  return { team, shares: shareRows.flatMap((row) => (row.shares ? [row.shares] : [])), members };
}

export default async function TeamSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);
  if (!user) redirect("/auth/login");

  let page: Awaited<ReturnType<typeof loadSettings>>;
  try {
    page = await loadSettings(slug);
  } catch (err) {
    if (err instanceof AccountNotProvisionedError) return <AccountSetupState />;
    throw err;
  }
  if (!page) redirect("/dashboard/teams");

  const { team, shares, members } = page;
  const isOwner = team.role === "owner";
  const views = shares.reduce((sum, s) => sum + (s.view_count ?? 0), 0);
  const bytes = shares.reduce((sum, s) => sum + (s.file_size ?? 0), 0);
  const plural = (n: number, word: string) => `${formatInt(n)} ${word}${n === 1 ? "" : "s"}`;
  const consequence = `Removes ${plural(members.length, "member")}, you included, and unlinks ${plural(shares.length, "link")} from the team. Personal links are not deleted.`;

  return (
    <>
      <TitleRow
        crumb={
          <>
            <Link href="/dashboard/teams" className="hover:text-card-foreground hover:underline hover:underline-offset-[3px]">Teams</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/dashboard/teams/${slug}`} className="truncate hover:text-card-foreground hover:underline hover:underline-offset-[3px]">{team.name}</Link>
          </>
        }
        title="Settings"
        finding={`${team.name}, ${roleLabel(team.plan)} plan. ${isOwner ? "Changes apply to everyone in the team." : "Only the owner can change the team's settings."}`}
      />
      <TeamTabs slug={slug} isOwner={isOwner} />

      <section aria-labelledby="usage-h">
        <SectionHead
          id="usage-h"
          title="Usage"
          aside={
            <Link href={`/dashboard/teams/${slug}`} className="text-sm font-medium text-card-foreground hover:underline hover:underline-offset-[3px]">
              View links
            </Link>
          }
        />
        <KpiRow
          items={[
            { label: "Links", value: formatInt(shares.length), note: "Published to the team" },
            { label: "Views", value: formatInt(views), note: "All time" },
            { label: "Storage used", value: formatBytes(bytes), note: "Sum of team link files" },
            { label: "Members", value: formatInt(members.length), note: `${roleLabel(team.plan)} plan` },
          ]}
        />
      </section>

      <TeamGeneralForm team={team} canEdit={isOwner} />
      <SettingsRow
        title="API keys"
        description={`Personal keys (shk_) act as you; team keys (sht_) act for ${team.name}. A key is shown once when it's created and stored only as a hash.`}
      >
        <ApiKeyManager team={{ id: team.id, name: team.name }} />
      </SettingsRow>
      {isOwner && <TeamDangerZone team={team} consequence={consequence} />}
    </>
  );
}
