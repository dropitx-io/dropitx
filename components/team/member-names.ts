import type { TeamMember } from "@/types/team";

/** A member's shown name: their display name, else a short id so the row is never blank. */
export function memberName(member: TeamMember): string {
  return member.user_profiles?.display_name || `Member ${member.user_id.slice(0, 6)}`;
}

/** Display names by user id. */
export function memberNames(members: TeamMember[]): Record<string, string> {
  return Object.fromEntries(members.map((m) => [m.user_id, memberName(m)]));
}
