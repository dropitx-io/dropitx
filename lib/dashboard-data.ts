import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
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

async function loginRedirectPath(): Promise<string> {
  const current = (await headers()).get("x-dashboard-path");
  const safe = current && current.startsWith("/dashboard") && !current.startsWith("//") ? current : null;
  return safe ? `/auth/login?next=${encodeURIComponent(safe)}` : "/auth/login";
}

/**
 * Runs a dashboard API call. A 401 with `user_not_provisioned` throws
 * `AccountNotProvisionedError` so the layout and pages can render the setup
 * state; any other 401 means the session is gone, so the visitor is sent to sign
 * in again. Every other failure propagates to the error boundary.
 */
async function dashboardCall<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      if (isNotProvisioned(err.detail)) throw new AccountNotProvisionedError();
      redirect(await loginRedirectPath());
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
 * Totals over all of the caller's shares. `total_views` and `total_size` are
 * lifetime; `unique_views` and `shares_with_views` cover the last 30 days.
 */
export async function getShareTotals(): Promise<ShareTotals> {
  const res = await dashboardCall(() =>
    serverApiFetch<TopSharesResponse>("/api/dashboard/analytics/top-shares?limit=1"),
  );
  return res.totals;
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
