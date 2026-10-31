import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/server";
import { getTeams } from "@/lib/dashboard-data";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  const displayName = user.name ?? user.email?.split("@")[0] ?? "User";
  const email = user.email ?? "";
  const initials = displayName
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const memberships = await getTeams();
  const teams = memberships.flatMap((m) =>
    m.teams ? [{ slug: m.teams.slug, name: m.teams.name }] : [],
  );

  return (
    <DashboardShell
      user={{ displayName, email, initials }}
      teams={teams}
    >
      {children}
    </DashboardShell>
  );
}
