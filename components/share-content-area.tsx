"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CommentsSection } from "@/components/comments-section";
import { HtmlViewer } from "@/components/html-viewer";
import { MarkdownViewerWrapper } from "@/components/markdown-viewer-wrapper";
import { RevealShareContent } from "@/components/reveal-share-content";
import { SharePageClient } from "@/components/share-page-client";
import { ShareAnalyticsTracker } from "@/components/share-analytics-tracker";
import { ShareViewedTracker } from "@/components/share-viewed-tracker";
import type { GroupShare } from "@/types/share";

interface ShareContentAreaProps {
  slug: string;
  isMarkdown: boolean;
  /** The share's content, or null when the visitor reveals it with a click (self-deleting share). */
  content: string | null;
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
  isMarkdown,
  content,
  groupFiles,
  isAuthenticated,
  password,
}: ShareContentAreaProps) {
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
          <Card>
            <CardContent className={isMarkdown ? "p-4 md:p-6" : "p-2"}>
              {content === null ? (
                <RevealShareContent slug={slug} isMarkdown={isMarkdown} />
              ) : isMarkdown ? (
                <MarkdownViewerWrapper content={content} />
              ) : (
                <HtmlViewer htmlContent={content} />
              )}
            </CardContent>
          </Card>
          <CommentsSection slug={slug} isAuthenticated={isAuthenticated} />
        </>
      )}
    </>
  );
}
