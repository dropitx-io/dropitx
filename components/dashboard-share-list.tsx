"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Lock, Copy, Trash2, MoreHorizontal, FileCode, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import type { ShareListItem } from "@/types/share";
import type { TeamShareRow } from "@/types/team";

interface TeamOption {
  slug: string;
  name: string;
}

interface DashboardShareListProps {
  personalShares: ShareListItem[];
  teams: TeamOption[];
  teamShareMap: Record<string, TeamShareRow[]>;
}

function isMarkdown(mime: string, filename: string): boolean {
  return mime.includes("markdown") || filename.endsWith(".md") || filename.endsWith(".markdown");
}

function isHtml(mime: string, filename: string): boolean {
  return mime.includes("html") || filename.endsWith(".html");
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

type Row = {
  id: string;
  slug: string;
  filename: string;
  title: string | null;
  mime_type: string;
  view_count: number;
  file_size: number | null;
  created_at: string | null;
  has_password: boolean;
  shared_by?: string;
};

export function DashboardShareList({
  personalShares,
  teams,
  teamShareMap,
}: DashboardShareListProps) {
  const [filter, setFilter] = useState<string>("personal");
  const [typeFilter, setTypeFilter] = useState<"all" | "md" | "html">("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const sourceTabs = [
    { id: "personal", label: "Personal", count: personalShares.length },
    ...teams.map((t) => ({
      id: t.slug,
      label: t.name,
      count: (teamShareMap[t.slug] ?? []).filter((r) => r.shares !== null).length,
    })),
  ];

  const allRows: Row[] =
    filter === "personal"
      ? personalShares.map((s) => ({
          id: s.id,
          slug: s.slug,
          filename: s.filename ?? "",
          title: s.title ?? null,
          mime_type: s.mime_type ?? "",
          view_count: s.view_count,
          file_size: s.file_size ?? null,
          created_at: s.created_at,
          has_password: s.has_password,
        }))
      : (teamShareMap[filter] ?? [])
          .filter((r) => r.shares !== null)
          .map((r) => ({
            id: r.shares!.id,
            slug: r.shares!.slug,
            filename: r.shares!.filename ?? "",
            title: r.shares!.title,
            mime_type: r.shares!.mime_type ?? "",
            view_count: r.shares!.view_count ?? 0,
            file_size: r.shares!.file_size,
            created_at: r.shares!.created_at,
            has_password: r.shares!.has_password ?? false,
            shared_by: r.shared_by,
          }));

  // Apply type filter
  const rows = allRows.filter((r) => {
    if (typeFilter === "md") return isMarkdown(r.mime_type, r.filename);
    if (typeFilter === "html") return isHtml(r.mime_type, r.filename);
    return true;
  });

  const mdCount = allRows.filter((r) => isMarkdown(r.mime_type, r.filename)).length;
  const htmlCount = allRows.filter((r) => isHtml(r.mime_type, r.filename)).length;

  const handleDelete = async (row: Row) => {
    if (!window.confirm(`Delete "${row.title || row.filename}"? This cannot be undone.`)) return;
    setDeleting(row.id);
    try {
      const res = await authFetch(`/api/shares/${row.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Failed to delete"));
      toast.success("Share deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const handleCopy = async (slug: string) => {
    try {
      const url = `${window.location.origin}/s/${slug}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const typePills = [
    { id: "all" as const, label: "All", count: allRows.length },
    { id: "md" as const, label: "Markdown", count: mdCount },
    { id: "html" as const, label: "HTML", count: htmlCount },
  ];

  return (
    <div className="space-y-4">
      {/* Source tabs (personal / team) */}
      {teams.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {sourceTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition-all duration-200",
                filter === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground clay-raised hover:-translate-y-px hover:text-foreground"
              )}
            >
              {t.label}
              <span className={cn("font-mono text-[11px]", filter === t.id ? "opacity-80" : "opacity-75")}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Type filter pills + result count */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex gap-2">
          {typePills.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setTypeFilter(p.id)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-semibold transition-all duration-200",
                typeFilter === p.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground clay-raised hover:-translate-y-px hover:text-foreground"
              )}
            >
              {p.label}
              <span className={cn("font-mono text-[11px]", typeFilter === p.id ? "opacity-80" : "opacity-75")}>
                {p.count}
              </span>
            </button>
          ))}
        </div>
        <span className="ml-auto font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
          {rows.length} of {allRows.length}
        </span>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-[34px] bg-card clay-raised">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-5.5 pb-3 pt-4 text-left font-mono text-[10px] font-normal uppercase tracking-[0.07em] text-muted-foreground">File</th>
                  <th className="hidden px-5.5 pb-3 pt-4 text-left font-mono text-[10px] font-normal uppercase tracking-[0.07em] text-muted-foreground max-[900px]:table-cell">Status</th>
                  <th className="px-5.5 pb-3 pt-4 text-right font-mono text-[10px] font-normal uppercase tracking-[0.07em] text-muted-foreground">Views</th>
                  <th className="hidden px-5.5 pb-3 pt-4 text-right font-mono text-[10px] font-normal uppercase tracking-[0.07em] text-muted-foreground max-[640px]:hidden lg:table-cell">Size</th>
                  <th className="hidden px-5.5 pb-3 pt-4 text-left font-mono text-[10px] font-normal uppercase tracking-[0.07em] text-muted-foreground max-[900px]:hidden">Created</th>
                  <th className="px-5.5 pb-3 pt-4 text-right font-mono text-[10px] font-normal uppercase tracking-[0.07em] text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const isMd = isMarkdown(r.mime_type, r.filename);
                  const isActive = true; // Could derive from expiry in future
                  return (
                    <tr
                      key={r.id}
                      className="group border-t border-border-soft transition-colors hover:bg-background"
                    >
                      {/* File cell */}
                      <td className="px-5.5 py-3.5">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className={cn(
                            "grid size-10 shrink-0 place-items-center rounded-[14px]",
                            isMd ? "bg-primary/9 text-primary" : "bg-background text-muted-foreground"
                          )}>
                            {isMd ? <FileText className="size-[18px]" /> : <FileCode className="size-[18px]" />}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/s/${r.slug}`}
                                className="truncate text-[14.5px] font-semibold hover:text-primary"
                              >
                                {r.title || r.filename}
                              </Link>
                              <span className={cn(
                                "inline-flex h-[21px] items-center rounded-full px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.05em]",
                                isMd ? "bg-primary/16 text-primary" : "bg-surface-warm text-fg-soft"
                              )}>
                                {isMd ? "MD" : "HTML"}
                              </span>
                              {r.has_password && (
                                <Lock className="size-3 text-muted-foreground" />
                              )}
                            </div>
                            <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                              dropitx.io/s/{r.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="hidden px-5.5 py-3.5 max-[900px]:table-cell">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 text-[13px] font-medium",
                          isActive ? "text-fg-soft" : "text-muted-foreground"
                        )}>
                          <span className={cn("size-[7px] rounded-full", isActive ? "bg-success" : "bg-muted-foreground")} />
                          {isActive ? "Active" : "Expired"}
                        </span>
                      </td>

                      {/* Views */}
                      <td className="px-5.5 py-3.5 text-right">
                        <span className="font-mono text-[12.5px] font-semibold text-primary">
                          {r.view_count.toLocaleString()}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="hidden px-5.5 py-3.5 text-right font-mono text-[12.5px] text-muted-foreground max-[640px]:hidden lg:table-cell">
                        {formatSize(r.file_size)}
                      </td>

                      {/* Created */}
                      <td className="hidden px-5.5 py-3.5 font-mono text-[12.5px] text-muted-foreground max-[900px]:hidden">
                        {formatDate(r.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-5.5 py-3.5">
                        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => handleCopy(r.slug)}
                            className="grid size-[38px] place-items-center rounded-[14px] text-muted-foreground transition-colors hover:bg-background hover:text-primary"
                            aria-label="Copy link"
                          >
                            <Copy className="size-4" />
                          </button>
                          <Link
                            href={`/dashboard/analytics/${r.slug}`}
                            className="grid size-[38px] place-items-center rounded-[14px] text-muted-foreground transition-colors hover:bg-background hover:text-primary"
                            aria-label="View analytics"
                          >
                            <MoreHorizontal className="size-4" />
                          </Link>
                          {filter === "personal" && (
                            <button
                              type="button"
                              onClick={() => handleDelete(r)}
                              disabled={deleting === r.id}
                              className="grid size-[38px] place-items-center rounded-[14px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                              aria-label="Delete"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="flex items-center justify-between border-t border-border-soft px-5.5 py-4 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
            <span>Showing {rows.length} share{rows.length !== 1 ? "s" : ""}</span>
            <Link href="/dashboard/analytics" className="hover:text-primary">
              View all analytics →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[34px] border-2 border-dashed border-border bg-card py-16 text-center clay-raised">
      <span className="mb-4 grid size-12 place-items-center rounded-[22px] bg-primary/9 text-primary clay-raised">
        <FileText className="size-5" />
      </span>
      <p className="font-display text-lg font-bold">No shares yet</p>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        Upload a file or create one in the editor to get started.
      </p>
      <Link
        href="/editor"
        className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px"
      >
        Create share
      </Link>
    </div>
  );
}
