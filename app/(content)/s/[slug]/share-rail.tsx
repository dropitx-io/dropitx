import Link from "next/link";
import { EmbedSnippet } from "@/components/embed-snippet";
import type { ShareMeta } from "@/lib/share-data";

interface ShareRailProps {
  share: ShareMeta;
  viewCount: number;
  expiresIn: string | null;
}

/** The side rail of a share (the design's `rail`): its numbers and rules, an invitation, and the embed code for a public share. */
export function ShareRail({ share, viewCount, expiresIn }: ShareRailProps) {
  const isPublic = !share.is_private && !share.has_password;

  return (
    <aside className="rail" aria-label="About this link" data-testid="share-rail">
      <div className="card card-pad">
        <p className="ui-text fg-2">Views</p>
        <p className="stat tabular-nums">{viewCount.toLocaleString("en-US")}</p>
        <dl className="kv">
          <div><dt>Expires</dt><dd>{expiresIn ? (expiresIn === "Expired" ? "Expired" : `in ${expiresIn}`) : "Never"}</dd></div>
          <div><dt>Password</dt><dd>{share.has_password ? "On" : "Off"}</dd></div>
          <div><dt>Burn after reading</dt><dd>{share.burn_after_reading ? "On" : "Off"}</dd></div>
          <div><dt>Link</dt><dd>{isPublic ? "Public" : "Protected"}</dd></div>
        </dl>
      </div>
      <div className="card card-pad">
        <p className="h-title">Share your own</p>
        <p className="body-sm fg-2">Turn a Markdown or HTML file into a page like this one.</p>
        <Link className="btn btn-primary btn-block" href="/" data-testid="share-rail-cta">Try DropItX free</Link>
      </div>
      {isPublic && <EmbedSnippet slug={share.slug} />}
    </aside>
  );
}
