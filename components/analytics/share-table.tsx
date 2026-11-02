import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionHead } from "./section-head";
import { formatInt, formatPct } from "./analytics-format";
import type { ShareRow } from "./share-rows";

interface ShareTableProps {
  title: string;
  description?: string;
  /** Header of the label column, e.g. "Referrer". */
  head: string;
  rows: ShareRow[];
  /** Denominator of the Share column; null when it is not known, which drops the column. */
  total: number | null;
  /** One sentence shown in the dashed box when there are no rows. */
  empty: string;
  aside?: ReactNode;
  note?: ReactNode;
  className?: string;
}

/** A ranked list whose row background is a bar: its width is the row's share of the largest row. */
export function ShareTable({ title, description, head, rows, total, empty, aside, note, className }: ShareTableProps) {
  const max = Math.max(1, ...rows.filter((r) => !r.other).map((r) => r.count));
  const cols = total === null ? "grid-cols-[minmax(0,1fr)_56px]" : "grid-cols-[minmax(0,1fr)_64px_56px]";

  return (
    <section className={cn("min-w-0", className)} aria-label={title}>
      <SectionHead title={title} description={description} aside={aside} />
      <div role="table" aria-label={title} className="grid gap-0.5">
        <div role="row" className={cn("grid h-7 items-center gap-x-3 pr-3 text-xs text-muted-foreground", cols)}>
          <span role="columnheader">{head}</span>
          {total !== null && <span role="columnheader" className="text-right">Share</span>}
          <span role="columnheader" className="text-right">Views</span>
        </div>
        {rows.length === 0 ? (
          <p className="flex min-h-[38px] items-center rounded-lg border border-dashed border-input px-3 text-sm text-muted-foreground">{empty}</p>
        ) : (
          rows.map((row, i) => {
            const linked = Boolean(row.href && !row.other);
            const key = row.href ?? `${i}-${row.label}`;
            const cells = (
              <>
                <span
                  aria-hidden="true"
                  className={cn("absolute inset-y-0 left-0 -z-10 rounded-lg", row.other ? "bg-raised" : "bg-rule")}
                  style={{ width: `${((row.count / max) * 100).toFixed(1)}%` }}
                />
                <span role="cell" className={cn("truncate px-3 text-card-foreground", linked && "group-hover:underline group-hover:underline-offset-[3px]")}>{row.label}</span>
                {total !== null && (
                  <span role="cell" className="text-right text-xs text-muted-foreground tabular-nums">{total > 0 ? formatPct(row.count / total) : "0%"}</span>
                )}
                <span role="cell" className="text-right text-sm text-card-foreground tabular-nums">{formatInt(row.count)}</span>
              </>
            );
            const rowClass = cn("relative isolate grid min-h-11 items-center gap-x-3 pr-3", linked && "group", cols);
            return linked && row.href ? (
              <Link key={key} role="row" href={row.href} className={rowClass}>{cells}</Link>
            ) : (
              <div key={key} role="row" className={rowClass}>{cells}</div>
            );
          })
        )}
      </div>
      {note && <p className="mt-2.5 text-xs text-muted-foreground">{note}</p>}
    </section>
  );
}
