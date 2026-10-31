/**
 * Legacy invite link: /invite/accept?token=xxx. Invite links now carry the token in
 * the path (/invite/[token], the form the API puts in `invite_url`), so this only
 * forwards there.
 */

import { redirect } from "next/navigation";
import { InviteStatusCard } from "@/components/invite-status-card";

interface Props {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function InviteAcceptRedirectPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const value = Array.isArray(token) ? token[0] : token;

  if (!value) {
    return <InviteStatusCard variant="not_found" message="No invite token provided." />;
  }
  redirect(`/invite/${encodeURIComponent(value)}`);
}
