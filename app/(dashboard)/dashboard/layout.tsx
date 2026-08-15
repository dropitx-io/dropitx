import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/server";
import { getSessionUser } from "@/lib/firebase/server";
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

  const admin = createAdminClient();
  const { data: memberships } = await admin
    .from("team_members")
    .select("teams(slug, name)")
    .eq("user_id", user.uid);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teams = ((memberships ?? []) as any[]).map((m) => {
    const t = Array.isArray(m.teams) ? m.teams[0] : m.teams;
    return { slug: t?.slug ?? "", name: t?.name ?? "" };
  });

  return (
    <DashboardShell
      user={{ displayName, email, initials }}
      teams={teams}
    >
      {children}
    </DashboardShell>
  );
}

