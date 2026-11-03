"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { apiErrorDetail } from "@/lib/api-client";
import { usernameError } from "@/lib/username";
import { putProfile, type ProfileResponseBody } from "@/lib/profile-api";
import { Button } from "@/components/ui/button";
import { Field, INPUT, SettingsRow } from "@/components/team/settings-row";
import { PersonAvatar } from "@/components/team/person-avatar";

interface ProfileFormProps {
  userId: string;
  displayName: string;
  avatarUrl: string;
  username: string | null;
  isPublic: boolean;
  email: string;
  /** Host shown before the username, e.g. dropitx.site. */
  siteHost: string;
}

type SaveResult = { ok: true } | { ok: false; status: number; message: string };

const SWITCH =
  "relative h-5 w-8 shrink-0 cursor-pointer appearance-none rounded-full bg-input transition-colors duration-200 after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-sheet after:transition-transform after:duration-200 checked:bg-card-foreground checked:after:translate-x-3 disabled:cursor-not-allowed";

export function ProfileForm({ userId, displayName, avatarUrl, username: initialUsername, isPublic: initialIsPublic, email, siteHost }: ProfileFormProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  // What the server last confirmed. Every save sends the display name (the API requires it) and only changes the
  // fields it names, so saving one field never resets another.
  const [saved, setSaved] = useState({ displayName, username: initialUsername, isPublic: initialIsPublic });
  const [name, setName] = useState(displayName);
  const [username, setUsername] = useState(initialUsername ?? "");
  const [usernameServerError, setUsernameServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function saveProfile(patch: { displayName?: string; username?: string; isPublic?: boolean }): Promise<SaveResult> {
    const displayNameToSend = patch.displayName ?? (saved.displayName.trim() || email.split("@")[0] || "User");
    try {
      const res = await putProfile({ displayName: displayNameToSend, username: patch.username, isPublic: patch.isPublic ?? saved.isPublic });
      if (!res.ok) return { ok: false, status: res.status, message: await apiErrorDetail(res, "Failed to update profile") };
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

  const trimmedName = name.trim().slice(0, 100);
  const nameError = trimmedName ? null : "Your display name can't be empty.";
  const usernameChanged = username !== (saved.username ?? "");
  const usernameInvalid = usernameChanged && username ? usernameError(username) : null;
  const shownUsernameError = usernameInvalid ?? usernameServerError;
  const dirty = trimmedName !== saved.displayName || (usernameChanged && !!username);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty || nameError || usernameInvalid) return;
    setSaving(true);
    setUsernameServerError(null);
    const result = await saveProfile({ displayName: trimmedName, ...(usernameChanged && username ? { username } : {}) });
    setSaving(false);
    if (result.ok) {
      setName(trimmedName);
      setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
      toast.success("Profile saved");
    } else if (result.status === 409) {
      setUsernameServerError("That username is already taken.");
    } else if (result.status === 422) {
      setUsernameServerError(result.message || "That username is invalid or reserved.");
    } else {
      toast.error(result.message);
    }
  }

  async function handleTogglePublic(next: boolean) {
    setToggling(true);
    const result = await saveProfile({ isPublic: next });
    setToggling(false);
    if (result.ok) toast.success(next ? "Profile is now public" : "Profile is now hidden");
    else toast.error(result.message);
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

  const url = saved.username ? `${siteHost}/u/${saved.username}` : null;
  const publicNote = !url
    ? "Choose a username below to get a public page."
    : saved.isPublic
      ? `On: ${url} lists your public links.`
      : `Off: ${url} shows "Page not found".`;

  return (
    <div>
      <SettingsRow rule={false} title="Public profile" description="A page that lists your public links, with their view counts.">
        <div className="flex items-start justify-between gap-4">
          <div>
            <label htmlFor="public-profile" className="text-sm font-medium text-card-foreground">Show my public profile</label>
            <p id="public-note" className="mt-0.5 text-sm text-muted-foreground">{publicNote}</p>
          </div>
          <input
            id="public-profile"
            type="checkbox"
            role="switch"
            checked={saved.isPublic}
            disabled={toggling}
            aria-describedby="public-note"
            onChange={(e) => handleTogglePublic(e.target.checked)}
            className={SWITCH}
          />
        </div>
      </SettingsRow>

      <form onSubmit={handleSave} noValidate>
        <SettingsRow title="Details" description="Your name appears on your profile and beside links you publish.">
          <div className="grid gap-2">
            <span className="text-sm font-medium text-card-foreground">Photo</span>
            <div className="flex items-center gap-4">
              <PersonAvatar id={userId} name={trimmedName || email} imageUrl={avatarUrl || null} size="lg" />
              <p className="text-xs text-muted-foreground">{avatarUrl ? "From your sign-in provider." : "Without a photo your initials are shown."}</p>
            </div>
          </div>
          <Field label="Display name" htmlFor="display-name" error={nameError}>
            <input id="display-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="name" aria-invalid={nameError ? true : undefined} className={INPUT} />
          </Field>
          <Field label="Username" htmlFor="username" error={shownUsernameError} hint="Lowercase letters, numbers and hyphens, 3 to 30 characters. Changing it breaks your old profile URL.">
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-raised px-2.5 font-mono text-[13px] text-muted-foreground">{siteHost}/u/</span>
              <input
                id="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value.toLowerCase()); setUsernameServerError(null); }}
                maxLength={30}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="username"
                aria-invalid={shownUsernameError ? true : undefined}
                className={`${INPUT} rounded-l-none font-mono text-[13px]`}
              />
            </div>
          </Field>
          <Field label="Email" htmlFor="email" hint="You sign in with this address. It's never shown on your profile.">
            <input id="email" type="email" value={email} readOnly className={`${INPUT} bg-raised text-muted-foreground`} />
          </Field>
          <div className="flex items-center justify-end gap-3 pt-1">
            <span className="mr-auto text-xs text-muted-foreground" aria-live="polite">{dirty ? "Unsaved changes" : savedAt ? `Saved at ${savedAt}` : "All changes saved"}</span>
            <Button type="submit" size="sm" disabled={saving || !dirty || !!nameError || !!usernameInvalid}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save profile
            </Button>
          </div>
        </SettingsRow>
      </form>

      <SettingsRow title="Session" description="Sign out of DropItX on this device.">
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={handleSignOut} disabled={signingOut}>
            {signingOut && <Loader2 className="size-4 animate-spin" />}
            Sign out
          </Button>
        </div>
      </SettingsRow>
    </div>
  );
}
