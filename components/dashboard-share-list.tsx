"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import { LinksTable } from "@/components/links/links-table";
import {
  countRows,
  filterRows,
  linkName,
  personalLinkRows,
  sortRows,
  teamLinkRows,
  type LinkFilter,
  type LinkRow,
  type LinkSort,
} from "@/components/links/link-rows";
import type { ShareListItem } from "@/types/share";
import type { TeamShareRow } from "@/types/team";

interface DashboardShareListProps {
  personalShares: ShareListItem[];
  teams: { slug: string; name: string }[];
  teamShareMap: Record<string, TeamShareRow[]>;
}

const TABS: { id: LinkFilter; label: string; empty: string }[] = [
  { id: "all", label: "All", empty: "" },
  { id: "md", label: "Markdown", empty: "No Markdown links here." },
  { id: "html", label: "HTML", empty: "No HTML links here." },
  { id: "protected", label: "Password", empty: "No link here has a password." },
];

const SORTS: { id: LinkSort; label: string }[] = [
  { id: "created", label: "Newest first" },
  { id: "views", label: "Most views" },
  { id: "name", label: "Name" },
  { id: "size", label: "Largest first" },
];

export function DashboardShareList({ personalShares, teams, teamShareMap }: DashboardShareListProps) {
  const router = useRouter();
  const q = useSearchParams().get("q") ?? "";
  const [source, setSource] = useState("personal");
  const [tab, setTab] = useState<LinkFilter>("all");
  const [sort, setSort] = useState<LinkSort>("created");
  const [query, setQuery] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // The top-bar search lands here as ?q=; mirror a new value into the filter field.
  if (q !== prevQ) {
    setPrevQ(q);
    setQuery(q);
  }

  const sources = [
    { id: "personal", label: "Personal", rows: personalLinkRows(personalShares) },
    ...teams.map((t) => ({ id: t.slug, label: t.name, rows: teamLinkRows(teamShareMap[t.slug] ?? []) })),
  ];
  const current = sources.find((s) => s.id === source) ?? sources[0];
  const owned = current.id === "personal";
  const shown = sortRows(filterRows(current.rows, tab, query), sort);

  const handleDelete = async (row: LinkRow) => {
    if (!window.confirm(`Delete "${linkName(row)}"? This cannot be undone.`)) return;
    setDeletingId(row.id);
    try {
      const res = await authFetch(`/api/shares/${row.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Failed to delete"));
      toast.success("Share deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];
  const emptyMessage = query.trim()
    ? null
    : current.rows.length === 0
      ? owned
        ? "You have not published a personal link yet."
        : `Nobody has shared a link with ${current.label} yet.`
      : activeTab.empty;

  return (
    <div>
      <div role="tablist" aria-label="Filter links" className="mb-6 flex gap-6 overflow-x-auto border-b border-border [scrollbar-width:none]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-1.5 py-2.5 text-sm transition-colors duration-150",
              tab === t.id
                ? "font-medium text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            <span className="text-xs font-normal tabular-nums text-muted-foreground">{countRows(current.rows, t.id)}</span>
          </button>
        ))}
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-3">
        {teams.length > 0 && (
          <div role="group" aria-label="Whose links" className="inline-flex max-w-full overflow-x-auto rounded-lg border border-border bg-raised p-0.5">
            {sources.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={s.id === current.id}
                onClick={() => setSource(s.id)}
                className={cn(
                  "h-[26px] shrink-0 whitespace-nowrap rounded-md px-2.5 text-sm transition-colors duration-150",
                  s.id === current.id ? "bg-sheet font-medium text-foreground ring-1 ring-border" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label} <span className="text-xs font-normal tabular-nums text-muted-foreground">{s.rows.length}</span>
              </button>
            ))}
          </div>
        )}
        <label className="relative w-[300px] max-sm:w-full">
          <span className="sr-only">Filter links</span>
          <Search className="pointer-events-none absolute left-3 top-2 size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by file name or slug"
            className="h-8 w-full rounded-md border border-input bg-sheet pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring max-sm:h-11"
          />
        </label>
        <span className="flex-1" />
        <span className="text-sm tabular-nums text-muted-foreground" aria-live="polite">
          {shown.length.toLocaleString("en")} {shown.length === 1 ? "link" : "links"}
        </span>
        <label className="relative">
          <span className="sr-only">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as LinkSort)}
            className="h-8 cursor-pointer appearance-none rounded-md border border-input bg-sheet pl-2.5 pr-8 text-sm max-sm:h-11"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} aria-hidden />
        </label>
      </div>

      {shown.length > 0 ? (
        <LinksTable rows={shown} deletingId={deletingId} onDelete={owned ? handleDelete : undefined} />
      ) : (
        <p className="mt-2 rounded-lg border border-dashed border-input px-3 py-2 text-sm text-muted-foreground">
          {emptyMessage ?? (
            <>
              No links match &ldquo;{query.trim()}&rdquo;.{" "}
              <button type="button" onClick={() => setQuery("")} className="font-medium text-foreground underline-offset-3 hover:underline">
                Clear the filter
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
}
