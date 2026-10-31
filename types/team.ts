import type { TeamInviteStatus } from "@/types/team-event";

export type TeamRole = "owner" | "editor" | "viewer";
export type TeamPlan = "free" | "pro";

export interface Team {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  plan: TeamPlan;
  created_at: string;
  /** Populated via join — only when querying with member context */
  member_count?: number;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: TeamRole;
  invited_at: string;
  joined_at: string;
  /** Populated via join with user_profiles */
  display_name?: string;
  avatar_url?: string;
}

export interface TeamInvite {
  id: string;
  team_id: string;
  email: string;
  role: TeamRole;
  token: string;
  expires_at: string;
  /** Invite lifecycle status */
  status: TeamInviteStatus;
  accepted_at: string | null;
  invited_by: string;
  created_at: string;
  /** Populated via join with user_profiles */
  inviter_name?: string;
}

export interface TeamShare {
  share_id: string;
  team_id: string;
  shared_by: string;
  created_at: string;
}

/** Row from the team_shares query with the nested shares embed (many-to-one
 *  join object). View-side type mirroring the generated Database row shape. */
export interface TeamShareRow {
  created_at: string | null;
  shared_by: string;
  shares: {
    id: string;
    slug: string;
    filename: string;
    title: string | null;
    mime_type: string | null;
    view_count: number | null;
    file_size: number | null;
    created_at: string | null;
    has_password?: boolean;
  } | null;
}

/** One row of `GET /api/dashboard/teams`: the caller's membership with the team embedded.
 *  The endpoint has no response schema, so this mirrors the rows it returns. */
export interface TeamMembership {
  team_id: string;
  role: "owner" | "editor" | "viewer" | "member" | "admin";
  joined_at: string | null;
  teams: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    owner_id: string | null;
    plan: TeamPlan;
    created_at: string;
    updated_at: string;
  } | null;
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
