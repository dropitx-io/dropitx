import { CopyLinkButton } from "@/components/analytics/copy-link-button";
import { SectionHead } from "@/components/analytics/section-head";
import { formatInt } from "@/components/analytics/analytics-format";
import { RetryButton } from "@/components/analytics/retry-button";
import type { ProfileShare, PublicProfile } from "@/types/public-profile";
import { PersonAvatar } from "./person-avatar";

interface ProfilePreviewProps {
  userId: string;
  siteUrl: string;
  siteHost: string;
  username: string | null;
  /** The public profile as visitors get it; null when it is hidden or there is no username. */
  profile: PublicProfile | null;
  shares: ProfileShare[];
  /** The public profile could not be read. */
  failed: boolean;
}

const BOX = "rounded-lg border border-border p-5";
const NOTE = "flex min-h-[38px] items-center rounded-lg border border-dashed border-input px-3 text-sm text-muted-foreground";

/** What /u/username shows right now, read from the same endpoint visitors hit. */
export function ProfilePreview({ userId, siteUrl, siteHost, username, profile, shares, failed }: ProfilePreviewProps) {
  const url = username ? `${siteUrl}/u/${username}` : null;
  const top = [...shares].sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0)).slice(0, 5);

  return (
    <aside aria-labelledby="preview-h" className="lg:sticky lg:top-6">
      <SectionHead
        id="preview-h"
        title="Preview"
        aside={
          url && profile ? (
            <a href={url} target="_blank" rel="noopener" className="text-sm font-medium text-card-foreground hover:underline hover:underline-offset-[3px]">
              Open
            </a>
          ) : undefined
        }
      />
      <div className={BOX}>
        {url && (
          <div className="mb-4 flex items-center gap-1.5 text-muted-foreground">
            <span className="truncate font-mono text-xs">{`${siteHost}/u/${username}`}</span>
            <CopyLinkButton url={url} />
          </div>
        )}
        {!url ? (
          <p className={NOTE}>No username yet, so there is no public page.</p>
        ) : failed ? (
          <div className="flex items-center gap-2.5 rounded-lg border border-border px-3.5 py-3 text-sm">
            <span className="flex-1 text-card-foreground">The preview could not be loaded.</span>
            <RetryButton />
          </div>
        ) : !profile ? (
          <p className={NOTE}>Your profile is hidden. Visitors to this address see “Page not found”; your links still work.</p>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <PersonAvatar id={userId} name={profile.display_name || profile.username} imageUrl={profile.avatar_url} />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-card-foreground">{profile.display_name || profile.username}</p>
                <p className="truncate text-sm text-muted-foreground">@{profile.username}</p>
              </div>
            </div>
            {profile.bio && <p className="mt-3 text-sm [overflow-wrap:anywhere] text-card-foreground">{profile.bio}</p>}
            <h3 className="mt-4 mb-1 text-xs font-normal text-muted-foreground">
              {formatInt(profile.share_count ?? shares.length)} public {(profile.share_count ?? shares.length) === 1 ? "link" : "links"}
            </h3>
            {top.length === 0 ? (
              <p className={NOTE}>No public links yet.</p>
            ) : (
              <ul>
                {top.map((s) => (
                  <li key={s.slug} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-t border-rule py-2 first:border-t-0">
                    <span className="truncate text-sm text-card-foreground">{s.title || s.filename}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{formatInt(s.view_count ?? 0)} views</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
