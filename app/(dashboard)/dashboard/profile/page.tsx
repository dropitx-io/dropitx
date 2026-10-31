import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/firebase/server";
import { AccountNotProvisionedError, getProfile, type DashboardProfile } from "@/lib/dashboard-data";
import { AccountSetupState } from "@/components/account-setup-state";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  let profile: DashboardProfile;
  try {
    profile = await getProfile();
  } catch (err) {
    if (err instanceof AccountNotProvisionedError) return <AccountSetupState />;
    throw err;
  }

  const providers: string[] = [];

  return (
    <div className="mx-auto max-w-[680px] space-y-5">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Manage your account information and preferences.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <ProfileForm
          userId={user.uid}
          displayName={profile.displayName}
          avatarUrl={profile.avatarUrl}
          email={profile.email || user.email || ""}
          providers={providers}
        />
      </div>
    </div>
  );
}
