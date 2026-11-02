"use client";

import Link from "next/link";
import { FileCode, FileText, Globe, Lock } from "lucide-react";
import { formatFileSize } from "@/lib/file-utils";
import { cn } from "@/lib/utils";
import { CopyLinkButton, shareLabel } from "@/components/links/copy-link-button";
import { LinkActionsMenu } from "@/components/links/link-actions-menu";
import { formatShortDate, isMarkdown, linkName, type LinkRow } from "@/components/links/link-rows";

const th = "h-9 px-3 text-left text-xs font-normal whitespace-nowrap text-muted-foreground first:pl-0 last:pr-0";
// Below 640px each row becomes two lines: name and views, then status, size and date in grey.
const td = "border-t border-rule px-3 py-3.5 align-middle first:pl-0 last:pr-0 max-sm:block max-sm:border-0 max-sm:p-0";
const num = "text-right tabular-nums";

const Dash = () => (
  <span className="text-muted-foreground" aria-label="none">
    -
  </span>
);

function Size({ bytes }: { bytes: number | null }) {
  if (!bytes) return <Dash />;
  const [value, unit] = formatFileSize(bytes).split(" ");
  return (
    <>
      {value}
      <small className="ml-0.5 text-xs text-muted-foreground">{unit}</small>
    </>
  );
}

function StatusPill({ row }: { row: LinkRow }) {
  return row.has_password ? (
    <span className="inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-full bg-active px-2 text-xs font-medium text-foreground">
      <Lock className="size-3" strokeWidth={1.5} aria-hidden />
      Password
    </span>
  ) : (
    <span className="inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-input">
      <Globe className="size-3" strokeWidth={1.5} aria-hidden />
      Public
    </span>
  );
}

interface LinksTableProps {
  rows: LinkRow[];
  /** Given only for the caller's own links: their menus then add Analytics and Delete. */
  onDelete?: (row: LinkRow) => void;
  deletingId?: string | null;
}

export function LinksTable({ rows, onDelete, deletingId = null }: LinksTableProps) {
  return (
    <table className="w-full border-collapse text-sm sm:table-fixed max-sm:block">
      <colgroup>
        <col />
        <col className="w-[88px]" />
        <col className="w-[104px]" />
        <col className="w-[104px]" />
        <col className="w-[132px]" />
        <col className="w-11" />
      </colgroup>
      <thead className="max-sm:hidden">
        <tr>
          <th scope="col" className={th}>Name</th>
          <th scope="col" className={cn(th, "text-right")}>Views</th>
          <th scope="col" className={cn(th, "text-right")}>Size</th>
          <th scope="col" className={cn(th, "text-right")}>Created</th>
          <th scope="col" className={th}>Status</th>
          <th scope="col" className={th}>
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody className="max-sm:block">
        {rows.map((row) => {
          const name = linkName(row);
          const Icon = isMarkdown(row) ? FileText : FileCode;
          const created = formatShortDate(row.created_at);
          return (
            <tr
              key={row.id}
              className="[&:first-child>td]:border-border max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:gap-x-3 max-sm:border-t max-sm:border-rule max-sm:py-3 max-sm:first:border-border"
            >
              <td className={td}>
                <div className="flex min-w-0 items-start gap-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
                  <div className="min-w-0">
                    <Link href={`/s/${row.slug}`} className="block truncate font-medium hover:underline hover:underline-offset-3">
                      {name}
                    </Link>
                    <span className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
                      <span className="truncate font-mono text-xs">{shareLabel(row.slug)}</span>
                      <CopyLinkButton slug={row.slug} label={`Copy link to ${name}`} />
                    </span>
                  </div>
                </div>
              </td>
              <td className={cn(td, num, "max-sm:col-start-2 max-sm:row-start-1")}>
                {row.view_count.toLocaleString("en")}
                <span className="sr-only"> views</span>
              </td>
              <td className={cn(td, num, "max-sm:hidden")}>
                <Size bytes={row.file_size} />
              </td>
              <td className={cn(td, num, "max-sm:hidden")}>{created ?? <Dash />}</td>
              <td className={cn(td, "max-sm:hidden")}>
                <StatusPill row={row} />
              </td>
              <td className={cn(td, "hidden max-sm:col-start-1 max-sm:row-start-2 max-sm:mt-1.5 max-sm:flex max-sm:flex-wrap max-sm:items-center max-sm:gap-2 max-sm:text-[13px] max-sm:text-muted-foreground")}>
                <StatusPill row={row} />
                {row.file_size ? <span className="tabular-nums">{formatFileSize(row.file_size)}</span> : null}
                {created && <span className="tabular-nums">{created}</span>}
              </td>
              <td className={cn(td, "text-right max-sm:col-start-2 max-sm:row-start-2 max-sm:self-center")}>
                <LinkActionsMenu
                  slug={row.slug}
                  name={name}
                  deleting={deletingId === row.id}
                  onDelete={onDelete && (() => onDelete(row))}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
