"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InviteMemberDialog } from "@/components/invite-member-dialog";

interface MembersPageClientProps {
  teamSlug: string;
  teamName: string;
  canInvite: boolean;
  /** Emails that already have an invite waiting, so the dialog can say so before sending another. */
  pendingEmails: string[];
}

/** The members page's one primary action and the dialog it opens. */
export function MembersPageClient({ teamSlug, teamName, canInvite, pendingEmails }: MembersPageClientProps) {
  const [inviteOpen, setInviteOpen] = useState(false);

  if (!canInvite) return null;
  return (
    <>
      <Button size="sm" onClick={() => setInviteOpen(true)}>
        Invite member
      </Button>
      <InviteMemberDialog
        teamSlug={teamSlug}
        teamName={teamName}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        pendingEmails={pendingEmails}
      />
    </>
  );
}
