import type { TeamInviteStatus } from "@/types/team-event";

export type TeamRole = "owner" | "editor" | "viewer";
export type TeamPlan = "free" | "pro";

/*
 * The team endpoints have no response schemas in the generated types, so the
 * shapes below mirror the rows the API returns (dropitx-api `app/dashboard/teams.py`
 * and `team_invites.py`, columns from `infra/init/01_schema.sql`).
 */

/** A `teams` row. */
export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string | null;
  plan: TeamPlan;
  created_at: string;
  updated_at: string;
}

/** `GET /api/dashboard/teams/{slug}`: the team plus the caller's role in it. */
export interface TeamDetail extends Team {
  role: TeamRole;
}

/** One row of `GET /api/dashboard/teams/{slug}/members`. */
export interface TeamMember {
  id: string;
  team_id: string | null;
  /** Nullable in the schema, but every member the API creates has one. */
  user_id: string;
  role: TeamRole;
  created_at: string;
  joined_at: string | null;
  /** To-one embed; null when the member has no profile row. */
  user_profiles: { display_name: string | null; avatar_url: string | null } | null;
}

/**
 * One row of `GET /api/dashboard/teams/{slug}/invites`, for every status, without its
 * `token`. The API adds the token to the rows only for a team owner, and no page
 * renders it, so `getTeamInvites` drops it before the rows reach any component.
 */
export interface TeamInvite {
  id: string;
  team_id: string | null;
  email: string;
  role: Exclude<TeamRole, "owner">;
  status: TeamInviteStatus;
  invited_by: string | null;
  expires_at: string;
  created_at: string;
}

/** `POST /api/dashboard/teams/{slug}/invites`: the created invite plus the link to send. */
export interface CreateInviteResponse {
  invite_url: string;
}

/** Row from the team shares query: the join row with the shares embed (null when the share is gone). */
export interface TeamShareRow {
  created_at: string | null;
  shared_by: string;
  shares: {
    id: string;
    slug: string;
    filename: string | null;
    title: string | null;
    mime_type: string | null;
    view_count: number | null;
    file_size: number | null;
    created_at: string | null;
    has_password?: boolean;
  } | null;
}

/** One row of `GET /api/dashboard/teams`: the caller's membership with the team embedded. */
export interface TeamMembership {
  team_id: string;
  role: "owner" | "editor" | "viewer" | "member" | "admin";
  joined_at: string | null;
  teams: Team | null;
}

/** For the "create team" form payload */
export interface CreateTeamInput {
  name: string;
  slug: string;
}

/** For the "invite member" form payload */
export interface CreateInviteInput {
  email: string;
  role: TeamRole;
}
