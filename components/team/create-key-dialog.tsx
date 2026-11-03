"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import { CopyLinkButton } from "@/components/analytics/copy-link-button";
import { Field, INPUT } from "./settings-row";

interface CreateKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The team a team key acts for; without one only personal keys can be made. */
  team?: { id: string; name: string };
  onCreated: () => void;
}

/** Names a key and picks who it acts as, then shows the raw key once; the API stores only its hash. */
export function CreateKeyDialog({ open, onOpenChange, team, onCreated }: CreateKeyDialogProps) {
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"team" | "personal">(team ? "team" : "personal");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ name: string; key: string } | null>(null);

  function change(next: boolean) {
    if (!next) {
      setCreated(null);
      setName("");
      setError(null);
    }
    onOpenChange(next);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the key a name so you can tell it apart later.");
      return;
    }
    setCreating(true);
    try {
      const res = await authFetch("/api/v1/keys", {
        method: "POST",
        body: JSON.stringify({ name: trimmed, ...(scope === "team" && team ? { team_id: team.id } : {}) }),
      });
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Failed to create key"));
      const body = (await res.json()) as { name: string; key: string };
      setCreated({ name: body.name, key: body.key });
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent className="w-[min(480px,calc(100vw-32px))] rounded-xl border-border bg-sheet text-card-foreground shadow-none">
        <DialogTitle className="text-lg font-semibold">{created ? `Key created: ${created.name}` : "Create an API key"}</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {created ? "Copy it now. DropItX stores only a hash, so this key can't be shown again." : "Use it with the CLI or an MCP client to publish and manage links."}
        </DialogDescription>
        {created ? (
          <>
            <Field label="Your new key" htmlFor="key-raw">
              <div className="flex items-center gap-1">
                <input id="key-raw" readOnly value={created.key} onFocus={(e) => e.target.select()} className={`${INPUT} font-mono text-[13px]`} />
                <CopyLinkButton url={created.key} />
              </div>
            </Field>
            <div className="flex justify-end pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => change(false)}>
                Done
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleCreate} noValidate className="grid gap-4">
            <Field label="Name" htmlFor="key-name" error={error}>
              <input
                id="key-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="What will use this key, e.g. Docs CI"
                maxLength={100}
                autoComplete="off"
                aria-invalid={error ? true : undefined}
                className={INPUT}
              />
            </Field>
            {team && (
              <Field label="Acts as" htmlFor="key-scope">
                <select id="key-scope" value={scope} onChange={(e) => setScope(e.target.value as "team" | "personal")} className={INPUT}>
                  <option value="team">{team.name} (team key, sht_)</option>
                  <option value="personal">You (personal key, shk_)</option>
                </select>
              </Field>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => change(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={creating}>
                {creating && <Loader2 className="size-4 animate-spin" />}
                Create key
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
