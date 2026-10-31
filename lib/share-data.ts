import "server-only";
import { cache } from "react";
import type { components } from "@/lib/api-types";
import { ApiError, serverApiFetch, serverApiFetchOrNull } from "@/lib/server-api";

export type ShareMeta = components["schemas"]["ShareMeta"];

/** The part of `GET /api/shares/{slug}/content` the page reads. */
export interface ShareContent {
  content: string;
  password_protected: boolean;
}

/**
 * Metadata and access state for a share, deduplicated per request so
 * `generateMetadata` and the page share one call. Missing, private-to-others
 * (404) and expired (410) shares all resolve to `null`; other failures throw.
 * Never reads content, so it never counts a view or burns a share.
 */
export const getShareMeta = cache(async (slug: string): Promise<ShareMeta | null> => {
  try {
    return await serverApiFetchOrNull<ShareMeta>(`/api/shares/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 410) return null;
    throw err;
  }
});

/**
 * Reads a share's content. Counts a view, so call it only on a path that is
 * rendering the content. A share that vanished or lapsed between the metadata
 * call and this one resolves to `null`.
 */
export async function getShareContent(slug: string): Promise<ShareContent | null> {
  try {
    return await serverApiFetch<ShareContent>(`/api/shares/${encodeURIComponent(slug)}/content`);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 410)) return null;
    throw err;
  }
}
