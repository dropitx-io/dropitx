import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/firebase/server";
import { AccountNotProvisionedError, getProfile, type DashboardProfile } from "@/lib/dashboard-data";
import { getPublicProfile, getPublicProfileShares } from "@/lib/public-profile-data";
import { AccountSetupState } from "@/components/account-setup-state";
import { ProfileForm } from "@/components/profile-form";
import { ApiKeyManager } from "@/components/api-key-manager";
import { SettingsRow } from "@/components/team/settings-row";
import { TitleRow } from "@/components/analytics/title-row";
import { ProfilePreview } from "@/components/team/profile-preview";
import { formatInt } from "@/components/analytics/analytics-format";
import { SITE_URL } from "@/lib/site-url";
import type { ProfileShare, PublicProfile } from "@/types/public-profile";

/** The public page as visitors see it; hidden profiles read as null. */
async function loadPreview(username: string | null, isPublic: boolean) {
  if (!username || !isPublic) return { profile: null, shares: [] as ProfileShare[], failed: false };
  try {
    const [profile, page] = await Promise.all([getPublicProfile(username), getPublicProfileShares(username, 1)]);
    return { profile: profile as PublicProfile | null, shares: page.shares, failed: false };
  } catch {
    return { profile: null, shares: [] as ProfileShare[], failed: true };
  }
}

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

  const siteHost = new URL(SITE_URL).host;
  const preview = await loadPreview(profile.username, profile.isPublic);
  const linkCount = preview.profile?.share_count ?? preview.shares.length;

  let finding: ReactNode = "Your public page is hidden. Your links still work for anyone who has them.";
  if (!profile.username) finding = "Choose a username to get a public page.";
  else if (preview.failed)
    finding = (
      <>
        Your public page is <b>{`${siteHost}/u/${profile.username}`}</b>.
      </>
    );
  else if (preview.profile)
    finding = (
      <>
        Your public page is <b>{`${siteHost}/u/${profile.username}`}</b>, showing {formatInt(linkCount)} {linkCount === 1 ? "link" : "links"}.
      </>
    );

  return (
    <>
      <TitleRow title="Profile" finding={finding} />
      <div className="grid items-start gap-x-4 gap-y-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
        <ProfileForm
          userId={user.uid}
          displayName={profile.displayName}
          avatarUrl={profile.avatarUrl}
          username={profile.username}
          isPublic={profile.isPublic}
          email={profile.email || user.email || ""}
          siteHost={siteHost}
        />
        <ProfilePreview
          userId={user.uid}
          siteUrl={SITE_URL}
          siteHost={siteHost}
          username={profile.username}
          profile={preview.profile}
          shares={preview.shares}
          failed={preview.failed}
        />
      </div>
      <div id="api-keys" className="mt-10 scroll-mt-16">
        <SettingsRow
          title="API keys"
          description="Personal keys (shk_) publish as you from the CLI or an MCP client. A key is shown once when it's created and stored only as a hash. Team keys live in each team's settings."
        >
          <ApiKeyManager />
        </SettingsRow>
      </div>
    </>
  );
}
