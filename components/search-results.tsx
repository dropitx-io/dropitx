"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchResult } from "@/types/share";
import { body, head, small } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  /** True once the query is long enough to have been searched; before that there is nothing to report. */
  searched: boolean;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function fileKind(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() === "md" ? "Markdown" : "HTML";
}

function SkeletonRow() {
  return (
    <div className="grid gap-3">
      <Skeleton className="h-8 w-1/2 rounded-sm" />
      <Skeleton className="h-5 w-full rounded-sm" />
      <Skeleton className="h-4 w-1/3 rounded-sm" />
    </div>
  );
}

function Prompt() {
  return (
    <p className={cn(body, "max-w-[34em] text-muted-foreground")}>
      Type two or more letters to search the titles and text of public pages.
    </p>
  );
}

function EmptyState() {
  return (
    <div className="grid max-w-[34em] gap-2 animate-fade-in">
      <p className={head}>No shared pages match that search.</p>
      <p className={cn(body, "text-muted-foreground")}>Try other words, or check the spelling.</p>
    </div>
  );
}

export function SearchResults({ results, isLoading, searched }: SearchResultsProps) {
  if (!searched) return <Prompt />;

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading results" className="grid max-w-[46em] gap-10">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  if (results.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="grid max-w-[46em] gap-[clamp(32px,4vw,48px)]">
      {results.map((r) => (
        <li key={r.slug}>
          <Link href={`/s/${r.slug}`} className="group block no-underline hover:text-inherit">
            <span className={cn(head, "break-words decoration-[var(--meta)] underline-offset-[0.2em] group-hover:underline group-hover:decoration-current")}>{r.filename}</span>
            {r.snippet && (
              <span className={cn(body, "mt-2 block text-muted-foreground")}>{truncate(r.snippet, 200)}</span>
            )}
            <span className={cn(small, "mt-2 flex flex-wrap gap-x-4 text-muted-foreground")}>
              <span>{fileKind(r.filename)}</span>
              <span>{relativeTime(r.created_at)}</span>
              <span>
                {r.view_count} view{r.view_count !== 1 ? "s" : ""}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
