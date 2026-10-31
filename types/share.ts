import type { components } from "@/lib/api-types";

/** A share as the dashboard lists it: the API's share metadata (no password hash, no delete token). */
export type ShareListItem = components["schemas"]["ShareMeta"];

export interface Share {
  id: string;
  slug: string;
  filename: string;
  storage_path: string;
  content_text: string | null;
  file_size: number | null;
  mime_type: string;
  delete_token: string;
  user_id: string | null;
  title: string | null;
  custom_slug: string | null;
  source: string | null;
  is_private: boolean;
  password_hash: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
  view_count: number;
  max_downloads: number | null;
  download_count: number;
  group_id: string | null;
  burn_after_reading: boolean;
  is_encrypted: boolean;
  burned: boolean;
}

export interface ShareGroup {
  id: string;
  slug: string;
  user_id: string | null;
  created_at: string;
}

/** A sibling share in the same group, as the API lists it on a share page. */
export type GroupShare = components["schemas"]["GroupFile"];

export interface SearchResult {
  slug: string;
  filename: string;
  created_at: string;
  view_count: number;
  expires_at: string;
  snippet: string;
  rank: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  shareCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  share_count?: number;
}
