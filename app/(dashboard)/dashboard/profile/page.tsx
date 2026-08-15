import { cookies } from "next/headers";
import { createAdminClient } from "@/utils/supabase/server";
import { getSessionUser } from "@/lib/firebase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("user_profiles")
    .select("display_name, avatar_url")
    .eq("id", user.uid)
    .maybeSingle();

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
          displayName={profile?.display_name ?? ""}
          avatarUrl={profile?.avatar_url ?? ""}
          email={user.email ?? ""}
          providers={providers}
        />
      </div>
    </div>
  );
}

