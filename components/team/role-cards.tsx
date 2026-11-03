import { TEAM_ROLES } from "@/lib/team-utils";
import type { TeamInvite, TeamMember } from "@/types/team";
import { PersonAvatar } from "./person-avatar";
import { memberName } from "./member-names";
import { roleLabel } from "./role-label";

/** What each role may do, as the API enforces it. */
const CAN: Record<(typeof TEAM_ROLES)[number], string> = {
  owner: "Changes roles, removes members, renames the team and can delete it.",
  editor: "Invites people and publishes links to the team.",
  viewer: "Opens the team's links and sees its activity.",
};

/** One card per role: who holds it, how many are invited to it, and what it allows. */
export function RoleCards({ members, invites }: { members: TeamMember[]; invites: TeamInvite[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {TEAM_ROLES.map((role) => {
        const people = members.filter((m) => m.role === role);
        const invited = invites.filter((i) => i.role === role).length;
        return (
          <div key={role} className="grid content-start gap-2 rounded-lg border border-border p-5">
            <h3 className="text-sm font-semibold text-card-foreground">{roleLabel(role)}</h3>
            <div className="flex min-h-[22px] flex-wrap items-center gap-1.5">
              {people.slice(0, 6).map((m) => (
                <PersonAvatar key={m.id} id={m.user_id} name={memberName(m)} imageUrl={m.user_profiles?.avatar_url} size="sm" />
              ))}
              <span className="text-xs text-muted-foreground">
                {people.length} {people.length === 1 ? "person" : "people"}
                {invited > 0 && `, ${invited} invited`}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{CAN[role]}</p>
          </div>
        );
      })}
    </div>
  );
}
