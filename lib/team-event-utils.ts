import type { TeamEventType } from "@/types/team-event";
import {
  Activity,
  Mail,
  MailCheck,
  MailX,
  MailMinus,
  Clock,
  UserPlus,
  UserMinus,
  Shield,
  UserX,
  FilePlus,
  FileMinus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Map event type to its corresponding lucide icon; a type the feed does not know gets a generic one. */
export function getEventIcon(eventType: string): LucideIcon {
  const iconMap: Record<TeamEventType, LucideIcon> = {
    "invite.created": Mail,
    "invite.sent": Mail,
    "invite.accepted": MailCheck,
    "invite.declined": MailX,
    "invite.revoked": MailMinus,
    "invite.expired": Clock,
    "member.joined": UserPlus,
    "member.left": UserMinus,
    "member.role_changed": Shield,
    "member.removed": UserX,
    "share.added": FilePlus,
    "share.removed": FileMinus,
  };
  return iconMap[eventType as TeamEventType] ?? Activity;
}

/** Map event type to a tailwind text-color class. */
export function getEventColor(eventType: string): string {
  const colorMap: Record<TeamEventType, string> = {
    "invite.created": "text-blue-500",
    "invite.sent": "text-blue-500",
    "invite.accepted": "text-success",
    "invite.declined": "text-yellow-500",
    "invite.revoked": "text-red-500",
    "invite.expired": "text-muted-foreground",
    "member.joined": "text-success",
    "member.left": "text-yellow-500",
    "member.role_changed": "text-blue-500",
    "member.removed": "text-red-500",
    "share.added": "text-success",
    "share.removed": "text-red-500",
  };
  return colorMap[eventType as TeamEventType] ?? "text-muted-foreground";
}

/** What a share event's payload names the share by: title, then filename, then slug. */
function shareLabel(metadata: Record<string, unknown>): string {
  for (const key of ["title", "filename", "slug"]) {
    const value = metadata[key];
    if (typeof value === "string" && value) return `"${value}"`;
  }
  return "a share";
}

/** Human-readable description for a team event. */
export function formatEventDescription(
  eventType: string,
  payload: Record<string, unknown> | null,
): string {
  const metadata = payload ?? {};
  switch (eventType) {
    case "invite.created":
    case "invite.sent":
      return `Invited ${metadata.email ?? "someone"} as ${metadata.role ?? "viewer"}`;
    case "invite.accepted":
      return `${metadata.email ?? "Someone"} accepted the invite`;
    case "invite.declined":
      return `${metadata.email ?? "Someone"} declined the invite`;
    case "invite.revoked":
      return `Revoked invite for ${metadata.email ?? "someone"}`;
    case "invite.expired":
      return `Invite for ${metadata.email ?? "someone"} expired`;
    case "member.joined":
      return `${metadata.email ?? "Someone"} joined the team${metadata.role ? ` as ${metadata.role}` : ""}`;
    case "member.left":
      return `${metadata.role ?? "Member"} left the team`;
    case "member.role_changed":
      // The API records the new role as `role` and the old one as `previous_role`.
      return `Changed role from ${metadata.previous_role ?? metadata.old_role ?? "?"} to ${metadata.role ?? metadata.new_role ?? "?"}`;
    case "member.removed":
      return `Removed ${metadata.role ?? "member"} from the team`;
    case "share.added":
      return `Added ${shareLabel(metadata)} to the team`;
    case "share.removed":
      return `Removed ${shareLabel(metadata)} from the team`;
    default:
      return eventType;
  }
}

/** Group events into Today / Yesterday / Earlier buckets. */
export function groupEventsByDate<T extends { created_at: string }>(
  events: T[],
): { label: string; events: T[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);

  const groups: { label: string; events: typeof events }[] = [
    { label: "Today", events: [] },
    { label: "Yesterday", events: [] },
    { label: "Earlier", events: [] },
  ];

  for (const event of events) {
    const date = new Date(event.created_at);
    if (date >= today) {
      groups[0].events.push(event);
    } else if (date >= yesterday) {
      groups[1].events.push(event);
    } else {
      groups[2].events.push(event);
    }
  }

  return groups.filter((g) => g.events.length > 0);
}

/** Format an ISO date string as a relative time label (e.g. "3h ago"). */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
