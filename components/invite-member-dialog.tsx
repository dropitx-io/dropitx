"use client";

/**
 * Invite member dialog: creates an invite through the API and shows the link to send.
 * Pending invites are listed and managed in the members table, not here.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { isValidEmail } from "@/lib/validation";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import { CopyLinkButton } from "@/components/analytics/copy-link-button";
import { Field, INPUT } from "@/components/team/settings-row";
import type { TeamRole, CreateInviteResponse } from "@/types/team";

interface InviteMemberDialogProps {
  teamSlug: string;
  teamName: string;
  open: boolean;
  onClose: () => void;
  pendingEmails: string[];
}

export function InviteMemberDialog({ teamSlug, teamName, open, onClose, pendingEmails }: InviteMemberDialogProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("viewer");
  const [submitting, setSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset transient state whenever the dialog opens (adjust state during render, no effect).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setInviteUrl(null);
      setError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !isValidEmail(trimmed)) {
      setError("Enter a full email address, with an @ and a domain.");
      return;
    }
    if (pendingEmails.includes(trimmed)) {
      setError(`${trimmed} already has an invite waiting. Resend it from the members list.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await authFetch(`/api/dashboard/teams/${teamSlug}/invites`, {
        method: "POST",
        body: JSON.stringify({ email: trimmed, role }),
      });
      if (res.status === 429) {
        setError("Too many invites sent recently. Wait a while before sending more.");
        return;
      }
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Failed to create invite"));
      const data = (await res.json()) as CreateInviteResponse;
      setInviteUrl(data.invite_url);
      toast.success(`Invite created for ${trimmed}`);
      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invite");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="w-[min(480px,calc(100vw-32px))] rounded-xl border-border bg-sheet text-card-foreground shadow-none">
        <DialogTitle className="text-lg font-semibold">Invite to {teamName}</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Create an invite, then send them the link it gives you.
        </DialogDescription>

        {inviteUrl ? (
          <div className="grid gap-3">
            <Field label="Invite link" htmlFor="invite-url" hint="Anyone with this link can accept the invite until it expires.">
              <div className="flex items-center gap-1">
                <input id="invite-url" readOnly value={inviteUrl} className={`${INPUT} font-mono text-[13px]`} />
                <CopyLinkButton url={inviteUrl} />
              </div>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setInviteUrl(null)}>
                Invite someone else
              </Button>
              <Button type="button" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="grid gap-4">
            <Field label="Email" htmlFor="invite-email" error={error}>
              <input
                id="invite-email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="Their email address"
                maxLength={255}
                aria-invalid={error ? true : undefined}
                className={INPUT}
              />
            </Field>
            <Field label="Role" htmlFor="invite-role">
              <select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as TeamRole)} className={INPUT}>
                <option value="viewer">Viewer: opens the team&apos;s links</option>
                <option value="editor">Editor: also invites people and publishes links</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Send invite
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
