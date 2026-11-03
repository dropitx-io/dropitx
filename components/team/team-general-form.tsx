"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import { isValidTeamName, isValidTeamSlug } from "@/lib/team-utils";
import { Field, INPUT, SettingsRow } from "./settings-row";
import { roleLabel } from "./role-label";

interface TeamGeneralFormProps {
  team: { name: string; slug: string; plan: string };
  /** Only the owner may change these; everyone else sees them read-only. */
  canEdit: boolean;
}

/** Team name and slug with one Save for the panel; a slug change moves the page to the new address. */
export function TeamGeneralForm({ team, canEdit }: TeamGeneralFormProps) {
  const router = useRouter();
  const [name, setName] = useState(team.name);
  const [slug, setSlug] = useState(team.slug);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const trimmedName = name.trim();
  const trimmedSlug = slug.trim();
  const nameError = isValidTeamName(trimmedName) ? null : "The team needs a name of up to 100 characters.";
  const slugError = isValidTeamSlug(trimmedSlug) ? null : "Use 2 to 50 lowercase letters, numbers and hyphens, not starting or ending with a hyphen.";
  const dirty = trimmedName !== team.name || trimmedSlug !== team.slug;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty || nameError || slugError) return;

    const updates: Record<string, string> = {};
    if (trimmedName !== team.name) updates.name = trimmedName;
    if (trimmedSlug !== team.slug) updates.slug = trimmedSlug;

    setSaving(true);
    try {
      const res = await authFetch(`/api/dashboard/teams/${team.slug}`, { method: "PATCH", body: JSON.stringify(updates) });
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Failed to update team"));
      toast.success("Team settings saved");
      setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
      if (updates.slug) router.push(`/dashboard/teams/${updates.slug}/settings`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update team");
    } finally {
      setSaving(false);
    }
  }

  const stamp = !canEdit ? "Only the owner can change these." : dirty ? "Unsaved changes" : savedAt ? `Saved at ${savedAt}` : "No unsaved changes";

  return (
    <form onSubmit={handleSave}>
      <SettingsRow rule={false} title="General" description="The team's name, and the slug in its dashboard address.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Team name" htmlFor="team-name" error={canEdit && nameError ? nameError : null}>
            <input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              autoComplete="off"
              disabled={!canEdit}
              aria-invalid={canEdit && nameError ? true : undefined}
              className={INPUT}
            />
          </Field>
          <Field label="Slug" htmlFor="team-slug" hint="Changing it changes the team's address." error={canEdit && slugError ? slugError : null}>
            <input
              id="team-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              maxLength={50}
              autoComplete="off"
              disabled={!canEdit}
              aria-invalid={canEdit && slugError ? true : undefined}
              className={`${INPUT} font-mono`}
            />
          </Field>
        </div>
        <div className="grid gap-1">
          <span className="text-sm font-medium text-card-foreground">Plan</span>
          <span className="text-sm text-muted-foreground">{roleLabel(team.plan)}</span>
        </div>
        <div className="flex items-center justify-end gap-3 pt-1">
          <span className="mr-auto text-xs text-muted-foreground" aria-live="polite">{stamp}</span>
          {canEdit && (
            <Button type="submit" variant="outline" size="sm" disabled={saving || !dirty || !!nameError || !!slugError}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          )}
        </div>
      </SettingsRow>
    </form>
  );
}
