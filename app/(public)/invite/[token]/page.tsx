/**
 * Public invite page: /invite/[token], the link the API returns as `invite_url`.
 *
 * The API's lookup decides what to show. It answers 404 for an unknown token and 410
 * for a pending invite past its expiry; otherwise it reports the invite's status and,
 * for a signed-in visitor, whether their verified email matches the invitee. The
 * invitee's address is only shown when the API returned it.
 */

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { components } from "@/lib/api-types";
import { getSessionUser } from "@/lib/firebase/server";
import { ApiError, serverApiFetch } from "@/lib/server-api";
import { InviteStatusCard } from "@/components/invite-status-card";
import { InviteActions } from "./invite-actions";
import { SwitchAccountButton } from "./switch-account-button";

type InviteLookup = components["schemas"]["InviteLookup"];

export const metadata: Metadata = {
  title: "Team invite",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ token: string }>;
}

/** The lookup, or the status code the API used for "no such invite" (404) or "expired" (410). */
async function lookupInvite(token: string): Promise<InviteLookup | 404 | 410> {
  try {
    return await serverApiFetch<InviteLookup>(`/api/invites/${encodeURIComponent(token)}`);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 410)) return err.status;
    throw err;
  }
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const invite = await lookupInvite(token);

  if (invite === 404) {
    return (
      <InviteStatusCard
        variant="not_found"
        message="This invite does not exist or may have been cancelled."
      />
    );
  }
  if (invite === 410) {
    return (
      <InviteStatusCard
        variant="expired"
        message="This invite has expired."
        subMessage="Please request a new invite."
      />
    );
  }

  const teamName = invite.team_name ?? "a team";
  const teamSlug = invite.team_slug ?? null;

  switch (invite.status) {
    case "accepted":
      // The invitee who accepted lands on the team; anyone else just sees the status.
      if (invite.email_matches === true && teamSlug) redirect(`/dashboard/teams/${teamSlug}`);
      return (
        <InviteStatusCard variant="already_used" message="This invite has already been accepted." />
      );
    case "declined":
      return (
        <InviteStatusCard
          variant="declined"
          message="This invitation was declined. Contact the team owner for a new invite."
        />
      );
    case "revoked":
      return <InviteStatusCard variant="revoked" message="This invite has been revoked." />;
    case "pending":
      break;
    default:
      return (
        <InviteStatusCard variant="not_found" message="This invite is no longer available." />
      );
  }

  const inviter = invite.inviter_display_name ? ` by ${invite.inviter_display_name}` : "";
  const message = `You have been invited${inviter} to join ${teamName} as ${invite.role}.`;
  const next = encodeURIComponent(`/invite/${encodeURIComponent(token)}`);

  if (invite.email_matches == null) {
    return (
      <InviteStatusCard
        variant="not_logged_in"
        message={message}
        subMessage="Sign in with the email address the invite was sent to."
        loginUrl={`/auth/login?next=${next}`}
        signupUrl={`/auth/login?mode=signup&next=${next}`}
      />
    );
  }

  if (!invite.email_matches) {
    const user = await getSessionUser(await cookies());
    return (
      <InviteStatusCard
        variant="email_mismatch"
        message="This invite was sent to a different email address, or your email address is not verified."
        currentUserEmail={user?.email ?? undefined}
      >
        <SwitchAccountButton loginUrl={`/auth/login?next=${next}`} />
      </InviteStatusCard>
    );
  }

  return (
    <InviteStatusCard
      variant="invite_info"
      message={message}
      inviteEmail={invite.invitee_email ?? undefined}
    >
      <InviteActions teamSlug={teamSlug} />
    </InviteStatusCard>
  );
}
