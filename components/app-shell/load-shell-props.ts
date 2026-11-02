import "server-only";
import { AccountNotProvisionedError, getShareTotals, getTeams } from "@/lib/dashboard-data";

export interface ShellUser {
  displayName: string;
  email: string;
  initials: string;
}

export interface ShellProps {
  user: ShellUser;
  teams: { slug: string; name: string }[];
  /** Total bytes across the caller's shares; null when the API could not report it. */
  storageUsedBytes: number | null;
  /** True when the API has no user row for this account yet. */
  needsSetup: boolean;
}

/** Everything the framed shell renders around a signed-in page: who, which teams, how much storage. */
export async function loadShellProps(session: { name?: string | null; email?: string | null }): Promise<ShellProps> {
  const displayName = session.name ?? session.email?.split("@")[0] ?? "User";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const user = { displayName, email: session.email ?? "", initials };

  try {
    const memberships = await getTeams();
    const teams = memberships.flatMap((m) => (m.teams ? [{ slug: m.teams.slug, name: m.teams.name }] : []));
    let storageUsedBytes: number | null = null;
    try {
      storageUsedBytes = (await getShareTotals()).total_size;
    } catch (err) {
      console.error("shell: storage total unavailable", err);
    }
    return { user, teams, storageUsedBytes, needsSetup: false };
  } catch (err) {
    if (!(err instanceof AccountNotProvisionedError)) throw err;
    return { user, teams: [], storageUsedBytes: null, needsSetup: true };
  }
}
