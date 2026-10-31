"use client";

import Link from "next/link";
import type { TopShare } from "@/types/analytics";

interface AnalyticsTopPerformersProps {
  shares: TopShare[];
}

export function AnalyticsTopPerformers({ shares }: AnalyticsTopPerformersProps) {
  if (shares.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground/80">
              <th className="p-3 text-left font-semibold">#</th>
              <th className="p-3 text-left font-semibold">Title</th>
              <th className="p-3 text-right font-semibold">Views (30d)</th>
              <th className="p-3 text-right font-semibold">Unique (30d)</th>
              <th className="hidden p-3 text-right font-semibold sm:table-cell">VTR</th>
            </tr>
          </thead>
          <tbody>
            {shares.map((share, i) => {
              const vtr =
                share.total_views > 0
                  ? Math.round((share.unique_views / share.total_views) * 100)
                  : 0;
              return (
                <tr
                  key={share.share_id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/dashboard/analytics/${share.slug}`}
                      className="block max-w-[260px] truncate font-medium hover:text-primary"
                    >
                      {share.title ?? share.slug}
                    </Link>
                    <span className="font-mono text-xs text-muted-foreground">
                      /{share.slug}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {share.total_views.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {share.unique_views.toLocaleString()}
                  </td>
                  <td className="hidden p-3 text-right font-mono tabular-nums sm:table-cell">
                    {vtr}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

