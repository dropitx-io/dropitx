import type { ReactNode } from "react";
import { EmbedSnippet } from "@/components/embed-snippet";
import type { ShareMeta } from "@/lib/share-data";
import { cn } from "@/lib/utils";

interface ShareRailProps {
  share: ShareMeta;
  viewCount: number;
  expiresIn: string | null;
  className?: string;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-surface px-3.5 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

/** The side panel of a share: its numbers and rules, and the embed code for a public share. */
export function ShareRail({ share, viewCount, expiresIn, className }: ShareRailProps) {
  const isPublic = !share.is_private && !share.has_password;

  return (
    <aside className={cn("grid content-start gap-8", className)}>
      <section data-ui aria-label="About this link" className="bg-card text-[15px] leading-[1.5]">
        <div className="flex items-center justify-between gap-3 bg-surface px-4 py-3 text-[13px]">
          <span>This link</span>
          <span>{isPublic ? "Public" : "Protected"}</span>
        </div>
        <div className="grid gap-2 px-6 py-5">
          <p className="mb-2">
            <span className="text-[34px] font-light leading-none tracking-[-0.03em] tabular-nums">
              {viewCount.toLocaleString("en-US")}
            </span>{" "}
            <span className="text-muted-foreground">{viewCount === 1 ? "view" : "views"}</span>
          </p>
          <Row label="Expires">{expiresIn ? `in ${expiresIn}` : "Never"}</Row>
          <Row label="Password">{share.has_password ? "On" : "Off"}</Row>
          <Row label="Burn after reading">{share.burn_after_reading ? "On" : "Off"}</Row>
        </div>
      </section>
      {isPublic && <EmbedSnippet slug={share.slug} />}
    </aside>
  );
}
