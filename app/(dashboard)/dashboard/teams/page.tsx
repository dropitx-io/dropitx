import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/firebase/server";
import { AccountNotProvisionedError, getTeams } from "@/lib/dashboard-data";
import { AccountSetupState } from "@/components/account-setup-state";
import { buttonVariants } from "@/components/ui/button";
import { TitleRow } from "@/components/analytics/title-row";
import { formatDay } from "@/components/analytics/analytics-format";
import { PersonAvatar } from "@/components/team/person-avatar";
import { roleLabel } from "@/components/team/role-label";
import { LINE2, TABLE, TBODY, TD, TH, THEAD, TR, WIDE } from "@/components/team/table-classes";
import type { TeamMembership } from "@/types/team";

export default async function TeamsPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  let memberships: TeamMembership[];
  try {
    memberships = await getTeams();
  } catch (err) {
    if (err instanceof AccountNotProvisionedError) return <AccountSetupState />;
    throw err;
  }

  // A membership whose team row is gone has nothing to show.
  const teams = memberships.flatMap((m) => (m.teams ? [{ ...m.teams, role: m.role }] : []));
  const owned = teams.filter((t) => t.role === "owner").length;
  const finding =
    teams.length === 0
      ? "You are not in a team yet."
      : `You are in ${teams.length} ${teams.length === 1 ? "team" : "teams"} and own ${owned === 0 ? "none" : owned}.`;

  return (
    <>
      <TitleRow
        title="Teams"
        finding={finding}
        actions={
          <Link href="/dashboard/teams/new" className={buttonVariants({ size: "sm" })}>
            Create team
          </Link>
        }
      />
      <section aria-labelledby="teams-h">
        <h2 id="teams-h" className="sr-only">
          Your teams
        </h2>
        {teams.length === 0 ? (
          <p className="flex min-h-[38px] items-center rounded-lg border border-dashed border-input px-3 text-sm text-muted-foreground">
            Create a team to publish links together and share API keys.
          </p>
        ) : (
          <table className={TABLE}>
            <thead className={THEAD}>
              <tr>
                <th scope="col" className={TH}>Team</th>
                <th scope="col" className={TH}>Your role</th>
                <th scope="col" className={TH}>Plan</th>
                <th scope="col" className={`${TH} text-right`}>Created</th>
              </tr>
            </thead>
            <tbody className={TBODY}>
              {teams.map((team) => (
                <tr key={team.id} className={TR}>
                  <td className={TD}>
                    <Link href={`/dashboard/teams/${team.slug}`} className="group flex min-w-0 items-center gap-3">
                      <PersonAvatar id={team.id} name={team.name} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-card-foreground group-hover:underline group-hover:underline-offset-[3px]">{team.name}</span>
                        <span className="block truncate font-mono text-xs text-muted-foreground">{team.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className={`${TD} ${WIDE}`}>{roleLabel(team.role)}</td>
                  <td className={`${TD} ${WIDE}`}>{roleLabel(team.plan)}</td>
                  <td className={`${TD} ${WIDE} text-right whitespace-nowrap`}>{formatDay(team.created_at)}</td>
                  <td className={`${TD} ${LINE2}`}>
                    {roleLabel(team.role)}, {roleLabel(team.plan)} plan, created {formatDay(team.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
