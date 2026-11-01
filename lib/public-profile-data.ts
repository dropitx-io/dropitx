import "server-only";
import { cache } from "react";
import { ApiError, serverApiFetch, serverApiFetchOrNull } from "@/lib/server-api";
import { USERNAME_PATTERN } from "@/lib/username";
import type { ProfileSharesResponse, PublicProfile } from "@/types/public-profile";

export const SHARES_PAGE_SIZE = 20;

/**
 * A user's public profile, deduplicated per request so `generateMetadata` and the page share one call.
 * An unknown or non-public username (404) and a malformed one resolve to `null`; other failures throw.
 * Never authenticated: the page is the same for every visitor.
 */
export const getPublicProfile = cache(async (username: string): Promise<PublicProfile | null> => {
  if (!USERNAME_PATTERN.test(username)) return null;
  return serverApiFetchOrNull<PublicProfile>(`/api/u/${encodeURIComponent(username)}`, { auth: "none" });
});

/** One page of a user's public shares; a profile that went away between the two calls reads as empty. */
export async function getPublicProfileShares(username: string, page: number): Promise<ProfileSharesResponse> {
  try {
    return await serverApiFetch<ProfileSharesResponse>(
      `/api/u/${encodeURIComponent(username)}/shares?page=${page}&limit=${SHARES_PAGE_SIZE}`,
      { auth: "none" },
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { shares: [], page, limit: SHARES_PAGE_SIZE, has_more: false };
    }
    throw err;
  }
}
