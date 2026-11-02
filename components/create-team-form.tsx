"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import { isValidTeamName, isValidTeamSlug } from "@/lib/team-utils";
import { Field, INPUT, SettingsRow } from "@/components/team/settings-row";

/** Auto-generates a slug from a name (mirrors server-side logic without random suffix). */
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function CreateTeamForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const autoSlug = useMemo(() => nameToSlug(name), [name]);
  const displaySlug = slugEdited ? slug : autoSlug;

  const nameValid = isValidTeamName(name);
  const slugValid = isValidTeamSlug(displaySlug);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const finalSlug = slugEdited ? slug.trim() : autoSlug;

    if (!isValidTeamName(trimmedName)) {
      toast.error("Team name must be 1-100 characters");
      return;
    }
    if (!isValidTeamSlug(finalSlug)) {
      toast.error("Slug must be 2-50 chars, lowercase letters, numbers, and hyphens");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch("/api/dashboard/teams", {
        method: "POST",
        body: JSON.stringify({ name: trimmedName, slug: finalSlug }),
      });
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Failed to create team"));
      const team = (await res.json()) as { slug: string };

      toast.success(`Team "${trimmedName}" created`);
      router.push(`/dashboard/teams/${team.slug}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <SettingsRow rule={false} title="Team" description="The name people see, and the slug in the team's dashboard address.">
        <Field label="Team name" htmlFor="team-name">
          <input
            id="team-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Engineering"
            maxLength={100}
            autoComplete="off"
            className={INPUT}
          />
        </Field>
        <Field
          label="Slug"
          htmlFor="team-slug"
          hint={`2 to 50 lowercase letters, numbers and hyphens. Address: /dashboard/teams/${displaySlug || "..."}`}
          error={displaySlug && !slugValid ? "Use 2 to 50 lowercase letters, numbers and hyphens, not starting or ending with a hyphen." : null}
        >
          <input
            id="team-slug"
            value={displaySlug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
            }}
            placeholder="team-slug"
            maxLength={50}
            autoComplete="off"
            aria-invalid={displaySlug && !slugValid ? true : undefined}
            className={`${INPUT} font-mono`}
          />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={submitting || !nameValid || !slugValid}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Create team
          </Button>
        </div>
      </SettingsRow>
    </form>
  );
}
