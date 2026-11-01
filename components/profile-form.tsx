"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { apiErrorDetail } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProfilePublicSection, type ProfileSaveResult } from "@/components/profile-public-section";
import { putProfile, type ProfileResponseBody } from "@/lib/profile-api";

interface ProfileFormProps {
  userId: string;
  displayName: string;
  avatarUrl: string;
  username: string | null;
  isPublic: boolean;
  email: string;
  providers: string[];
}

export function ProfileForm({
  displayName,
  avatarUrl,
  username: initialUsername,
  isPublic: initialIsPublic,
  email,
  providers,
}: ProfileFormProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const initial = (name || email || "U")[0].toUpperCase();

  // What the server last confirmed. Every save sends the display name (the API requires it) and only changes the
  // fields it names, so saving one field never resets another.
  const [saved, setSaved] = useState({ displayName, username: initialUsername, isPublic: initialIsPublic });

  async function saveProfile(patch: { displayName?: string; username?: string; isPublic?: boolean }): Promise<ProfileSaveResult> {
    const displayNameToSend = patch.displayName ?? (saved.displayName.trim() || email.split("@")[0] || "User");
    try {
      const res = await putProfile({
        displayName: displayNameToSend,
        username: patch.username,
        isPublic: patch.isPublic ?? saved.isPublic,
      });
      if (!res.ok) {
        return { ok: false, status: res.status, message: await apiErrorDetail(res, "Failed to update profile") };
      }
      const body = (await res.json().catch(() => null)) as ProfileResponseBody | null;
      setSaved((prev) => ({
        displayName: typeof body?.display_name === "string" ? body.display_name : displayNameToSend,
        username: typeof body?.username === "string" && body.username ? body.username : (patch.username ?? prev.username),
        isPublic: typeof body?.is_public === "boolean" ? body.is_public : (patch.isPublic ?? prev.isPublic),
      }));
      router.refresh();
      return { ok: true };
    } catch {
      return { ok: false, status: 0, message: "Something went wrong. Please try again." };
    }
  }

  async function handleSave() {
    const trimmed = name.trim().slice(0, 100);
    if (!trimmed) {
      toast.error("Display name cannot be empty");
      return;
    }
    setSaving(true);
    const result = await saveProfile({ displayName: trimmed });
    setSaving(false);
    if (result.ok) {
      setName(trimmed);
      toast.success("Profile updated");
    } else {
      toast.error(result.message);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
      setSigningOut(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Profile Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="size-16 rounded-md"
              />
            ) : (
              <div className="size-16 rounded-md bg-primary flex items-center justify-center text-white text-xl font-bold">
                {initial}
              </div>
            )}
            <div>
              <p className="font-medium">{name || email}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          {/* Display name */}
          <div className="space-y-1.5">
            <label htmlFor="display-name" className="text-sm font-medium">
              Display Name
            </label>
            <div className="flex gap-2">
              <Input
                id="display-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                maxLength={100}
              />
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>

          <ProfilePublicSection username={saved.username} isPublic={saved.isPublic} save={saveProfile} />

          {/* Connected providers */}
          {providers.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Connected Providers</p>
              <div className="flex gap-2">
                {providers.map((p) => (
                  <Badge key={p} variant="secondary">{p}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sign out */}
      <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
        {signingOut ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4" />
        )}
        Sign Out
      </Button>
    </div>
  );
}
