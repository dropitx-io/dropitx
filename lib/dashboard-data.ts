import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { components } from "@/lib/api-types";
import { collectPages } from "@/lib/collect-pages";
import { ApiError, serverApiFetch } from "@/lib/server-api";
import type { ShareListItem } from "@/types/share";
import type { TeamMembership, TeamShareRow } from "@/types/team";

type ShareListResponse = components["schemas"]["ShareListResponse"];
type ShareTotals = components["schemas"]["ShareTotals"];
type TopSharesResponse = components["schemas"]["TopSharesResponse"];
type FavoriteShare = components["schemas"]["FavoriteShare"];
type SessionProfile = components["schemas"]["SessionProfile"];

const SHARE_PAGE_SIZE = 100;
const MAX_SHARE_PAGES = 20;
const TEAM_SHARES_LIMIT = 200;

/**
 * Runs a dashboard API call. A 401 means the session is gone or not provisioned
 * on the API, so the visitor is sent to sign in again; every other failure
 * propagates to the error boundary.
 */
async function dashboardCall<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/auth/login");
    throw err;
  }
}

/** The caller's team memberships, shared by the layout and the page within one render. */
export const getTeams = cache(async (): Promise<TeamMembership[]> =>
  dashboardCall(() => serverApiFetch<TeamMembership[]>("/api/dashboard/teams")),
);

/** Every share the caller owns, newest first, following pages until a short page ends the list. */
export async function getAllShares(): Promise<ShareListItem[]> {
  return dashboardCall(() =>
    collectPages(
      (page) =>
        serverApiFetch<ShareListResponse>(
          `/api/dashboard/shares?page=${page}&limit=${SHARE_PAGE_SIZE}`,
        ),
      {
        limit: SHARE_PAGE_SIZE,
        maxPages: MAX_SHARE_PAGES,
        onCapReached: (maxPages) =>
          console.error(
            `dashboard share list stopped after ${maxPages} pages of ${SHARE_PAGE_SIZE}; later shares are not shown`,
          ),
      },
    ),
  );
}

/**
 * Totals over all of the caller's shares. `total_views` and `total_size` are
 * lifetime; `unique_views` and `shares_with_views` cover the last 30 days.
 */
export async function getShareTotals(): Promise<ShareTotals> {
  const res = await dashboardCall(() =>
    serverApiFetch<TopSharesResponse>("/api/dashboard/analytics/top-shares?limit=1"),
  );
  return res.totals;
}

/** A team's shares, newest first. Only the fields the list renders leave this function. */
export async function getTeamShares(slug: string): Promise<TeamShareRow[]> {
  const rows = await dashboardCall(() =>
    serverApiFetch<TeamShareRow[]>(
      `/api/dashboard/teams/${encodeURIComponent(slug)}/shares?limit=${TEAM_SHARES_LIMIT}`,
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

/** The caller's bookmarked shares, most recently favorited first. */
export async function getFavorites(): Promise<FavoriteShare[]> {
  return dashboardCall(() => serverApiFetch<FavoriteShare[]>("/api/v1/favorites"));
}

export interface DashboardProfile {
  email: string;
  displayName: string;
  avatarUrl: string;
}

/** Signed-in profile from the session endpoint (which also provisions the user row on first call). */
export async function getProfile(): Promise<DashboardProfile> {
  const session = await dashboardCall(() => serverApiFetch<SessionProfile>("/api/auth/session"));
  const { display_name, avatar_url } = session.profile;
  return {
    email: session.email ?? "",
    displayName: typeof display_name === "string" ? display_name : "",
    avatarUrl: typeof avatar_url === "string" ? avatar_url : "",
  };
}
