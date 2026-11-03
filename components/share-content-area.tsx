"use client";

import { CommentsSection } from "@/components/comments-section";
import { RevealShareContent } from "@/components/reveal-share-content";
import { ShareFileContent } from "@/components/share-file-content";
import { SharePageClient } from "@/components/share-page-client";
import { ShareAnalyticsTracker } from "@/components/share-analytics-tracker";
import { ShareViewedTracker } from "@/components/share-viewed-tracker";
import type { GroupShare } from "@/types/share";
import type { ShareFilePayload } from "@/types/share-content";

interface ShareContentAreaProps {
  slug: string;
  /** The share's content, or null when the visitor reveals it with a click (self-deleting share). */
  content: ShareFilePayload | null;
  filename?: string | null;
  mimeType?: string | null;
  groupFiles: GroupShare[];
  isAuthenticated: boolean;
  /** Password the visitor unlocked the share with, held in memory only; opens protected group siblings. */
  password?: string;
}

/**
 * Everything below a share's metadata header: the content (with file tabs for a
 * group), the comments, and the view trackers. The share page renders it for a
 * readable share and the password gate renders it after a successful unlock, so
 * a protected share is counted as viewed only once it is opened.
 */
export function ShareContentArea({
  slug,
  content,
  filename,
  mimeType,
  groupFiles,
  isAuthenticated,
  password,
}: ShareContentAreaProps) {
  const isMarkdown = mimeType === "text/markdown";

  return (
    <>
      <ShareViewedTracker />
      <ShareAnalyticsTracker slug={slug} />
      {content !== null && groupFiles.length > 1 ? (
        <SharePageClient
          groupFiles={groupFiles}
          initialSlug={slug}
          initialContent={content}
          isAuthenticated={isAuthenticated}
          password={password}
        />
      ) : (
        <>
          <div className={isMarkdown && content?.encoding !== "base64" ? "max-w-[720px]" : undefined}>
            {content === null ? (
              <RevealShareContent slug={slug} filename={filename} mimeType={mimeType} />
            ) : (
              <ShareFileContent content={content} filename={filename} mimeType={mimeType} />
            )}
          </div>
          <CommentsSection slug={slug} isAuthenticated={isAuthenticated} />
        </>
      )}
    </>
  );
}
