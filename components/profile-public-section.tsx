"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usernameError } from "@/lib/username";

export type ProfileSaveResult = { ok: true } | { ok: false; status: number; message: string };

interface ProfilePublicSectionProps {
  /** Saved values; the parent owns them so a display-name save and these never overwrite each other. */
  username: string | null;
  isPublic: boolean;
  save: (patch: { username?: string; isPublic?: boolean }) => Promise<ProfileSaveResult>;
}

/** Username, the public-profile switch, and the link to the page they control. */
export function ProfilePublicSection({ username, isPublic, save }: ProfilePublicSectionProps) {
  const [value, setValue] = useState(username ?? "");
  const [serverError, setServerError] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);
  const [togglingPublic, setTogglingPublic] = useState(false);

  const validationError = value ? usernameError(value) : null;
  const error = validationError ?? serverError;

  async function handleSaveUsername() {
    const invalid = usernameError(value);
    if (invalid) {
      setServerError(invalid);
      return;
    }
    setSavingUsername(true);
    setServerError(null);
    const result = await save({ username: value });
    setSavingUsername(false);
    if (result.ok) {
      toast.success("Username updated");
    } else if (result.status === 409) {
      setServerError("That username is already taken.");
    } else if (result.status === 422) {
      setServerError(result.message || "That username is invalid or reserved.");
    } else {
      toast.error(result.message);
    }
  }

  async function handleTogglePublic(next: boolean) {
    setTogglingPublic(true);
    const result = await save({ isPublic: next });
    setTogglingPublic(false);
    if (result.ok) toast.success(next ? "Profile is now public" : "Profile is now private");
    else toast.error(result.message);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <div className="flex gap-2">
          <Input
            id="username"
            value={value}
            onChange={(e) => {
              setValue(e.target.value.toLowerCase());
              setServerError(null);
            }}
            placeholder="your-username"
            maxLength={30}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby="username-hint"
          />
          <Button
            onClick={handleSaveUsername}
            disabled={savingUsername || value === (username ?? "") || !value || !!validationError}
          >
            {savingUsername ? <Loader2 className="size-4 animate-spin" /> : "Save"}
          </Button>
        </div>
        {error ? (
          <p id="username-hint" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : (
          <p id="username-hint" className="text-xs text-muted-foreground">
            3-30 characters: lowercase letters, numbers and hyphens.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="public-profile" className="flex items-center gap-2 text-sm font-medium">
          <input
            id="public-profile"
            type="checkbox"
            role="switch"
            checked={isPublic}
            disabled={togglingPublic}
            onChange={(e) => handleTogglePublic(e.target.checked)}
            className="size-4 accent-primary"
          />
          Public profile
          {togglingPublic && <Loader2 className="size-3.5 animate-spin" />}
        </label>
        <p className="text-xs text-muted-foreground">
          Anyone can open your profile page, which lists only your public shares.
        </p>
        {username && isPublic && (
          <Link href={`/u/${username}`} className="inline-block text-sm text-primary hover:underline">
            View public profile
          </Link>
        )}
      </div>
    </div>
  );
}
