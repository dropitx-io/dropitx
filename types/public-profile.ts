/**
 * Responses of `GET /api/u/{username}` and `GET /api/u/{username}/shares`. The generated API types
 * leave both bodies as `unknown`, so the fields the page reads are declared here.
 */

export interface PublicProfile {
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  share_count?: number;
  total_views?: number;
  total_stars?: number;
}

export interface ProfileShare {
  slug: string;
  filename: string;
  title?: string | null;
  tags?: string[];
  view_count?: number;
  star_count?: number;
  created_at: string;
}

export interface ProfileSharesResponse {
  shares: ProfileShare[];
  page: number;
  limit: number;
  has_more: boolean;
}
