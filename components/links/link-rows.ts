import type { ShareListItem } from "@/types/share";
import type { TeamShareRow } from "@/types/team";

/** One row of the Links table, from a personal share or a team share. */
export interface LinkRow {
  id: string;
  slug: string;
  filename: string;
  title: string | null;
  mime_type: string;
  view_count: number;
  file_size: number | null;
  created_at: string | null;
  has_password: boolean;
  expires_at: string | null;
  burn_after_reading: boolean;
  burned: boolean;
}

export type LinkFilter = "all" | "md" | "html" | "protected";
export type LinkSort = "created" | "views" | "name" | "size";

export function isMarkdown(row: Pick<LinkRow, "mime_type" | "filename">): boolean {
  return row.mime_type.includes("markdown") || /\.(md|markdown)$/i.test(row.filename);
}

export function isHtml(row: Pick<LinkRow, "mime_type" | "filename">): boolean {
  return row.mime_type.includes("html") || /\.html?$/i.test(row.filename);
}

export function linkName(row: Pick<LinkRow, "title" | "filename" | "slug">): string {
  return row.title || row.filename || row.slug;
}

const FILTERS: Record<LinkFilter, (row: LinkRow) => boolean> = {
  all: () => true,
  md: isMarkdown,
  html: isHtml,
  protected: (row) => row.has_password,
};

export function filterRows(rows: LinkRow[], filter: LinkFilter, query: string): LinkRow[] {
  const needle = query.trim().toLowerCase();
  return rows.filter(
    (row) =>
      FILTERS[filter](row) &&
      (!needle ||
        [row.filename, row.title ?? "", row.slug].some((field) => field.toLowerCase().includes(needle))),
  );
}

export function countRows(rows: LinkRow[], filter: LinkFilter): number {
  return rows.filter(FILTERS[filter]).length;
}

const time = (iso: string | null) => (iso ? Date.parse(iso) : 0);
const SORTS: Record<LinkSort, (a: LinkRow, b: LinkRow) => number> = {
  created: (a, b) => time(b.created_at) - time(a.created_at),
  views: (a, b) => b.view_count - a.view_count,
  name: (a, b) => linkName(a).localeCompare(linkName(b)),
  size: (a, b) => (b.file_size ?? 0) - (a.file_size ?? 0),
};

export function sortRows(rows: LinkRow[], sort: LinkSort): LinkRow[] {
  return [...rows].sort(SORTS[sort]);
}

const int = new Intl.NumberFormat("en");
const plural = (n: number, one: string, many: string) => `${int.format(n)} ${n === 1 ? one : many}`;

/** The one-line finding under the Links title, or null when there is nothing to say. */
export function linksFinding(rows: LinkRow[]): string | null {
  if (!rows.length) return null;
  const total = rows.reduce((sum, row) => sum + row.view_count, 0);
  const links = plural(rows.length, "link", "links");
  if (!total) return `${links}, no views yet.`;
  const top = sortRows(rows, "views")[0];
  return `${links}, ${plural(total, "view", "views")} in total. Most read: ${linkName(top)} with ${plural(top.view_count, "view", "views")}.`;
}

export function personalLinkRows(shares: ShareListItem[]): LinkRow[] {
  return shares.map((s) => ({
    id: s.id,
    slug: s.slug,
    filename: s.filename ?? "",
    title: s.title ?? null,
    mime_type: s.mime_type ?? "",
    view_count: s.view_count,
    file_size: s.file_size ?? null,
    created_at: s.created_at,
    has_password: s.has_password,
    expires_at: s.expires_at ?? null,
    burn_after_reading: s.burn_after_reading,
    burned: s.burned,
  }));
}

/** A team's rows; a share deleted since it was added to the team arrives as null and is dropped. */
export function teamLinkRows(rows: TeamShareRow[]): LinkRow[] {
  return rows.flatMap(({ shares: s }) =>
    s
      ? [
          {
            id: s.id,
            slug: s.slug,
            filename: s.filename ?? "",
            title: s.title,
            mime_type: s.mime_type ?? "",
            view_count: s.view_count ?? 0,
            file_size: s.file_size,
            created_at: s.created_at,
            has_password: s.has_password ?? false,
            expires_at: s.expires_at ?? null,
            burn_after_reading: s.burn_after_reading ?? false,
            burned: s.burned ?? false,
          },
        ]
      : [],
  );
}

const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const dayMonthYear = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** "1 Nov" within the current year, "24 Dec 2025" outside it. */
export function formatShortDate(iso: string | null, now: Date = new Date()): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return (date.getFullYear() === now.getFullYear() ? dayMonth : dayMonthYear).format(date);
}

export type LinkStatusKind = "burned" | "expired" | "expiring" | "password" | "burn" | "public";

const DAY_MS = 24 * 60 * 60 * 1000;
/** A link counts as expiring when its expiry falls inside this window. */
const EXPIRING_WITHIN_DAYS = 7;

/** The one status a row shows, the most urgent fact first: burned, expired, expiring soon, password, burn on read, public. */
export function linkStatus(
  row: Pick<LinkRow, "has_password" | "expires_at" | "burn_after_reading" | "burned">,
  now: Date = new Date(),
): { kind: LinkStatusKind; label: string } {
  if (row.burned) return { kind: "burned", label: "Burned" };
  if (row.expires_at) {
    const left = Date.parse(row.expires_at) - now.getTime();
    if (left <= 0) return { kind: "expired", label: "Expired" };
    if (left < EXPIRING_WITHIN_DAYS * DAY_MS) {
      const days = Math.floor(left / DAY_MS);
      return { kind: "expiring", label: days === 0 ? "Expires today" : `Expires in ${plural(days, "day", "days")}` };
    }
  }
  if (row.has_password) return { kind: "password", label: "Password" };
  if (row.burn_after_reading) return { kind: "burn", label: "Burns after first read" };
  return { kind: "public", label: "Public" };
}
