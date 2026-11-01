/** Event types the activity feed knows how to describe. */
export type TeamEventType =
  | "invite.created"
  | "invite.sent"
  | "invite.accepted"
  | "invite.declined"
  | "invite.revoked"
  | "invite.expired"
  | "member.joined"
  | "member.left"
  | "member.role_changed"
  | "member.removed"
  | "share.added"
  | "share.removed";

/**
 * One row of `GET /api/dashboard/teams/{slug}/events`. `event_type` is free text in
 * the database, so it may be a type the feed does not know; `payload` is the parsed
 * jsonb object, empty when the event recorded nothing.
 */
export interface TeamEvent {
  id: string;
  team_id: string | null;
  user_id: string | null;
  event_type: string;
  payload: Record<string, unknown> | null;
  created_at: string;
}

/** Values of the `status` column on team invites (a pending invite past its expiry stays `pending`). */
export type TeamInviteStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "revoked";
