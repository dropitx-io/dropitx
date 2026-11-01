import "server-only";
import { cache } from "react";
import type { components } from "@/lib/api-types";
import { collectPages } from "@/lib/collect-pages";
import { readSessionProfile } from "@/lib/session-profile";
import { ApiError, serverApiFetch, serverApiFetchOrNull } from "@/lib/server-api";
import type { ShareAnalyticsResponse, ShareTotals, TopSharesResponse } from "@/types/analytics";
import type { ShareListItem } from "@/types/share";
import type { TeamEvent } from "@/types/team-event";
import type {
  TeamDetail,
  TeamInvite,
  TeamMember,
  TeamMembership,
  TeamShareRow,
} from "@/types/team";

type ShareListResponse = components["schemas"]["ShareListResponse"];
type FavoriteShare = components["schemas"]["FavoriteShare"];
type SessionProfile = components["schemas"]["SessionProfile"];

const SHARE_PAGE_SIZE = 100;
const MAX_PAGES = 20;
const TEAM_SHARES_LIMIT = 200;

/** The API verified the token but has no user row for it yet; `GET /api/auth/session` creates one. */
export class AccountNotProvisionedError extends Error {
  constructor() {
    super("The account has not been set up on the API yet");
    this.name = "AccountNotProvisionedError";
  }
}

function isNotProvisioned(detail: unknown): boolean {
  const inner = (detail as { detail?: unknown } | null | undefined)?.detail;
  if (inner === "user_not_provisioned") return true;
  return (inner as { code?: unknown } | null | undefined)?.code === "user_not_provisioned";
}

/**
 * Runs a dashboard API call. A 401 with `user_not_provisioned` throws
 * `AccountNotProvisionedError` so the layout and pages can render the setup
 * state; any other 401 throws a descriptive error. The frontend has already verified
 * the session cookie, so that 401 means the API and the frontend disagree about
 * the session, and a redirect to sign-in would loop silently. Every other
 * failure propagates to the error boundary.
 */
async function dashboardCall<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      if (isNotProvisioned(err.detail)) throw new AccountNotProvisionedError();
      throw new Error(
        "The API rejected the signed-in session. Check that the API's FIREBASE_PROJECT_ID matches the frontend's Firebase project and that the API can fetch Google's signing certificates.",
      );
    }
    throw err;
  }
}

/** The caller's team memberships, shared by the layout and the page within one render. */
export const getTeams = cache(async (): Promise<TeamMembership[]> =>
  dashboardCall(() => serverApiFetch<TeamMembership[]>("/api/dashboard/teams")),
);

/** Every share the caller owns, newest first, following pages until a short page ends the list. */
export async function getAllShares(): Promise<ShareListItem[]> {
  const shares = await dashboardCall(() =>
    collectPages(
      (page) =>
        serverApiFetch<ShareListResponse>(
          `/api/dashboard/shares?page=${page}&limit=${SHARE_PAGE_SIZE}`,
        ),
      {
        limit: SHARE_PAGE_SIZE,
        maxPages: MAX_PAGES,
        onCapReached: (maxPages) =>
          console.error(
            `dashboard share list stopped after ${maxPages} pages of ${SHARE_PAGE_SIZE}; later shares are not shown`,
          ),
      },
    ),
  );
  return shares.map((s) => ({
    id: s.id,
    slug: s.slug,
    filename: s.filename,
    title: s.title,
    mime_type: s.mime_type,
    file_size: s.file_size,
    view_count: s.view_count,
    created_at: s.created_at,
    has_password: s.has_password,
  }));
}

/**
 * The caller's top shares by last-30-day views plus totals over all their shares.
 * `totals.total_views` is lifetime; `totals.unique_views` and `totals.shares_with_views`
 * cover the last 30 days.
 */
export async function getTopShares(limit: number): Promise<TopSharesResponse> {
  return dashboardCall(() =>
    serverApiFetch<TopSharesResponse>(`/api/dashboard/analytics/top-shares?limit=${limit}`),
  );
}

/** Totals over all of the caller's shares, shared by the layout and the page within one render; see `getTopShares` for the windows. */
export const getShareTotals = cache(async (): Promise<ShareTotals> => (await getTopShares(1)).totals);

/**
 * One share's analytics over the last `days` UTC calendar days, or `null` when the
 * slug does not exist or the caller does not own it (the API answers both with 404).
 */
export async function getShareAnalytics(
  slug: string,
  days: number,
): Promise<ShareAnalyticsResponse | null> {
  return dashboardCall(() =>
    serverApiFetchOrNull<ShareAnalyticsResponse>(
      `/api/dashboard/shares/${encodeURIComponent(slug)}/analytics?days=${days}`,
    ),
  );
}

/** A team's shares, newest first, following offset pages. Only the fields the list renders leave this function. */
export async function getTeamShares(slug: string): Promise<TeamShareRow[]> {
  const rows = await dashboardCall(() =>
    collectPages(
      async (page) => ({
        items: await serverApiFetch<TeamShareRow[]>(
          `/api/dashboard/teams/${encodeURIComponent(slug)}/shares?limit=${TEAM_SHARES_LIMIT}&offset=${(page - 1) * TEAM_SHARES_LIMIT}`,
        ),
      }),
      {
        limit: TEAM_SHARES_LIMIT,
        maxPages: MAX_PAGES,
        onCapReached: (maxPages) =>
          console.error(
            `team share list for ${slug} stopped after ${maxPages} pages of ${TEAM_SHARES_LIMIT}; later shares are not shown`,
          ),
      },
    ),
  );
  return rows.map((row) => ({
    created_at: row.created_at,
    shared_by: row.shared_by,
    shares: row.shares && {
      id: row.shares.id,
      slug: row.shares.slug,
      filename: row.shares.filename,
      title: row.shares.title,
      mime_type: row.shares.mime_type,
      view_count: row.shares.view_count,
      file_size: row.shares.file_size,
      created_at: row.shares.created_at,
      has_password: row.shares.has_password,
    },
  }));
}

/**
 * One team with the caller's role, or `null` when the API answers with a client
 * error other than 401 or 429 (not a member, no such team): the caller sends the
 * visitor back to the team list. Server errors and rate limits still propagate.
 */
export async function getTeam(slug: string): Promise<TeamDetail | null> {
  return dashboardCall(async () => {
    try {
      return await serverApiFetch<TeamDetail>(`/api/dashboard/teams/${encodeURIComponent(slug)}`);
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status >= 400 &&
        err.status < 500 &&
        err.status !== 401 &&
        err.status !== 429
      ) {
        return null;
      }
      throw err;
    }
  });
}

/** A team's members, earliest joined first (the API does not order them). */
export async function getTeamMembers(slug: string): Promise<TeamMember[]> {
  const members = await dashboardCall(() =>
    serverApiFetch<TeamMember[]>(`/api/dashboard/teams/${encodeURIComponent(slug)}/members`),
  );
  const joined = (m: TeamMember) => Date.parse(m.joined_at ?? m.created_at);
  return [...members].sort((a, b) => joined(a) - joined(b));
}

/**
 * A team's invites in every status, newest first (the API does not order them).
 * The API includes each invite's `token` for team owners; it is a credential no page
 * renders, so it is dropped here and never reaches the page or a client component.
 */
export async function getTeamInvites(slug: string): Promise<TeamInvite[]> {
  const rows = await dashboardCall(() =>
    serverApiFetch<(TeamInvite & { token?: string })[]>(
      `/api/dashboard/teams/${encodeURIComponent(slug)}/invites`,
    ),
  );
  const invites: TeamInvite[] = rows.map((row) => ({
    id: row.id,
    team_id: row.team_id,
    email: row.email,
    role: row.role,
    status: row.status,
    invited_by: row.invited_by,
    expires_at: row.expires_at,
    created_at: row.created_at,
  }));
  return invites.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

/** A team's most recent events, newest first. */
export async function getTeamEvents(slug: string, limit: number): Promise<TeamEvent[]> {
  return dashboardCall(() =>
    serverApiFetch<TeamEvent[]>(
      `/api/dashboard/teams/${encodeURIComponent(slug)}/events?limit=${limit}`,
    ),
  );
}

/** The caller's bookmarked shares, most recently favorited first. */
export async function getFavorites(): Promise<FavoriteShare[]> {
  return dashboardCall(() => serverApiFetch<FavoriteShare[]>("/api/v1/favorites"));
}

export interface DashboardProfile {
  email: string;
  displayName: string;
  avatarUrl: string;
  /** Null until the API has assigned one. */
  username: string | null;
  isPublic: boolean;
}

/** Signed-in profile from the session endpoint (which also provisions the user row on first call). */
export async function getProfile(): Promise<DashboardProfile> {
  const session = await dashboardCall(() => serverApiFetch<SessionProfile>("/api/auth/session"));
  const profile = readSessionProfile(session);
  return {
    email: session.email ?? "",
    displayName: profile.display_name ?? "",
    avatarUrl: profile.avatar_url ?? "",
    username: profile.username,
    isPublic: profile.is_public,
  };
}
