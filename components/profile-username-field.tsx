"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import { usernameError } from "@/lib/username";

interface ProfileUsernameFieldProps {
  /** The saved display name; the profile endpoint requires it alongside any other field. */
  displayName: string;
  /** Null when the API has not assigned a username; the public-profile link is hidden then. */
  initialUsername: string | null;
}

export function ProfileUsernameField({ displayName, initialUsername }: ProfileUsernameFieldProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialUsername);
  const [value, setValue] = useState(initialUsername ?? "");
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const validationError = value ? usernameError(value) : null;
  const error = validationError ?? serverError;
  const unchanged = value === (saved ?? "");

  async function handleSave() {
    const invalid = usernameError(value);
    if (invalid) {
      setServerError(invalid);
      return;
    }
    setSaving(true);
    setServerError(null);
    try {
      const res = await authFetch("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify(displayName ? { display_name: displayName, username: value } : { username: value }),
      });
      if (res.status === 409) {
        setServerError("That username is already taken.");
        return;
      }
      if (res.status === 422) {
        setServerError(await apiErrorDetail(res, "That username is invalid or reserved."));
        return;
      }
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Failed to update username"));
      setSaved(value);
      toast.success("Username updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update username");
    } finally {
      setSaving(false);
    }
  }

  return (
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
        <Button onClick={handleSave} disabled={saving || unchanged || !value || !!validationError}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
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
      {saved && (
        <Link href={`/u/${saved}`} className="inline-block text-sm text-primary hover:underline">
          View public profile
        </Link>
      )}
    </div>
  );
}
