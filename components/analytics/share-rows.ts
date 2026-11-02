/** One row of a share table: a label and how many views it drew. */
export interface ShareRow {
  label: string;
  count: number;
  href?: string;
  /** The folded tail: drawn in a paler fill and not linked. */
  other?: boolean;
}

/** Keeps at most `n` rows: the top `n - 1` plus one "Other (k)" row that sums the rest. */
export function foldRows(rows: ShareRow[], n = 5): ShareRow[] {
  if (rows.length <= n) return rows;
  const tail = rows.slice(n - 1);
  return [
    ...rows.slice(0, n - 1),
    { label: `Other (${tail.length})`, count: tail.reduce((sum, row) => sum + row.count, 0), other: true },
  ];
}
