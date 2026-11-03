import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/server";
import { AccountSetupState } from "@/components/account-setup-state";
import { DashboardShell } from "@/components/dashboard-shell";
import { loadShellProps } from "@/components/app-shell/load-shell-props";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = await getSessionUser(cookieStore);

  if (!session) redirect("/auth/login");

  const { needsSetup, ...shell } = await loadShellProps(session);

  return <DashboardShell {...shell}>{needsSetup ? <AccountSetupState /> : children}</DashboardShell>;
}
