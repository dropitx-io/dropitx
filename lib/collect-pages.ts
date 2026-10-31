export interface PageResult<T> {
  items: T[];
}

export interface CollectPagesOptions {
  /** Page size requested from the API; a page with fewer items than this is the last one. */
  limit: number;
  /** Upper bound on requests, so a misbehaving endpoint cannot loop forever. */
  maxPages: number;
  /** Called once when the bound is reached while the API still returned full pages. */
  onCapReached?: (maxPages: number) => void;
}

/**
 * Follows 1-based pages until one returns fewer than `limit` items.
 * Stops after `maxPages` requests and reports it through `onCapReached`.
 */
export async function collectPages<T>(
  fetchPage: (page: number) => Promise<PageResult<T>>,
  { limit, maxPages, onCapReached }: CollectPagesOptions,
): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const { items } = await fetchPage(page);
    all.push(...items);
    if (items.length < limit) return all;
  }
  onCapReached?.(maxPages);
  return all;
}
