"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import { Field, INPUT, SettingsRow } from "./settings-row";

interface TeamDangerZoneProps {
  team: { name: string; slug: string };
  /** What deleting removes, computed from the page's rows. */
  consequence: string;
}

/** Delete the team, confirmed by typing its slug. */
export function TeamDangerZone({ team, consequence }: TeamDangerZoneProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await authFetch(`/api/dashboard/teams/${team.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Failed to delete team"));
      toast.success(`Deleted ${team.name}`);
      router.push("/dashboard/teams");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete team");
      setDeleting(false);
    }
  }

  return (
    <SettingsRow title="Danger zone" description="This removes the team. It asks you to confirm by typing its slug.">
      <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <p className="text-sm font-medium text-card-foreground">Delete team</p>
          <p className="mt-0.5 max-w-[56ch] text-sm text-muted-foreground">{consequence}</p>
        </div>
        <Button type="button" variant="outline" size="sm" className="text-destructive" onClick={() => { setTyped(""); setOpen(true); }}>
          Delete team
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(480px,calc(100vw-32px))] rounded-xl border-border bg-sheet text-card-foreground shadow-none">
          <DialogTitle className="text-lg font-semibold">Delete {team.name}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{consequence} This cannot be undone.</DialogDescription>
          <Field label={`Type ${team.slug} to confirm`} htmlFor="delete-confirm">
            <input id="delete-confirm" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" className={`${INPUT} font-mono`} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="outline" size="sm" className="text-destructive" disabled={typed.trim() !== team.slug || deleting} onClick={handleDelete}>
              {deleting && <Loader2 className="size-4 animate-spin" />}
              Delete team
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SettingsRow>
  );
}
