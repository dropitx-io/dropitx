import { formatDay, formatInt } from "@/components/analytics/analytics-format";
import { formatBytes } from "@/components/team/team-format";
import { LINE2, TD, TR, WIDE } from "@/components/team/table-classes";
import type { TeamShareRow as TeamShareRowData } from "@/types/team";

interface TeamShareRowProps {
  share: NonNullable<TeamShareRowData["shares"]>;
  /** Who added it to the team; null when that person is no longer a member. */
  sharedByName: string | null;
}

const DASH = <span className="text-muted-foreground">—</span>;

/** One team link as a table row: name and slug, who shared it, views, size and when. */
export function TeamShareRow({ share, sharedByName }: TeamShareRowProps) {
  const views = share.view_count ?? 0;
  return (
    <tr className={TR}>
      <td className={TD}>
        <a href={`/s/${share.slug}`} target="_blank" rel="noopener" className="group block min-w-0">
          <span className="block truncate font-medium text-card-foreground group-hover:underline group-hover:underline-offset-[3px]">
            {share.title || share.filename || share.slug}
          </span>
          <span className="block truncate font-mono text-xs text-muted-foreground">{share.slug}</span>
        </a>
      </td>
      <td className={`${TD} ${WIDE} truncate`}>{sharedByName ?? DASH}</td>
      <td className={`${TD} text-right`}>{formatInt(views)}</td>
      <td className={`${TD} ${WIDE} text-right whitespace-nowrap`}>{share.file_size != null ? formatBytes(share.file_size) : DASH}</td>
      <td className={`${TD} ${WIDE} text-right whitespace-nowrap`}>{share.created_at ? formatDay(share.created_at) : DASH}</td>
      <td className={`${TD} ${LINE2}`}>
        {[sharedByName, share.file_size != null ? formatBytes(share.file_size) : null, share.created_at ? formatDay(share.created_at) : null]
          .filter(Boolean)
          .join(", ") || "—"}
      </td>
    </tr>
  );
}
