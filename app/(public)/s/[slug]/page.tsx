import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/firebase/server";
import { PasswordGate } from "@/components/password-gate";
import { HtmlViewer } from "@/components/html-viewer";
import { MarkdownViewerWrapper } from "@/components/markdown-viewer-wrapper";
import { EmbedSnippet } from "@/components/embed-snippet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkToggle } from "@/components/bookmark-toggle";
import { ShareViewedTracker } from "@/components/share-viewed-tracker";
import { ShareAnalyticsTracker } from "@/components/share-analytics-tracker";
import { QrCodeButton } from "@/components/qr-code-button";
import { SharePageClient } from "@/components/share-page-client";
import { CommentsSection } from "@/components/comments-section";
import { FileCode, FileText, Eye, Clock, Calendar } from "lucide-react";
import { RevealShareContent } from "@/components/reveal-share-content";
import { getShareContent, getShareMeta, isOneTimeDownload } from "./share-data";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dropitx.com";

interface SharePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { slug } = await params;
  const share = await getShareMeta(slug);

  if (!share) return { title: "Not Found" };

  // Red Team Fix: 5 — Don't leak OG tags for private/password-protected shares
  if (share.is_private || share.has_password) {
    return {
      title: "Protected DropItX Document",
      description: "This content requires authentication to view",
      openGraph: {
        title: "Protected DropItX Document",
        description: "This content requires authentication to view",
        siteName: "DropItX",
        images: [{ url: `${SITE_URL}/og-card-default.png`, width: 1200, height: 630 }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: "Protected DropItX Document",
        description: "This content requires authentication to view",
        images: [`${SITE_URL}/og-card-default.png`],
      },
    };
  }

  const title = share.title ?? share.filename ?? share.slug;
  const description = `Shared via DropItX — ${share.view_count} views`;
  const ogImageUrl = `${SITE_URL}/api/og-image/${share.slug}`;
  const shareUrl = `${SITE_URL}/s/${share.slug}`;

  return {
    title: `${title} — DropItX`,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl,
      siteName: "DropItX",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

function formatExpiresIn(expiresAt: string): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) return "Expired";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
}

function formatUploadDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params;

  const share = await getShareMeta(slug);
  if (!share) notFound();

  // --- ACCESS GATE ---
  const sessionUser = await getSessionUser(await cookies());
  const isOwner = share.is_owner;

  if (!isOwner) {
    // Private shares never reach here: the API answers 404 for everyone but the owner.
    // Password-protected: gate both anonymous and non-owner authenticated users
    if (share.has_password) {
      return <PasswordGate slug={slug} title={share.title ?? share.filename ?? slug} />;
    }

    // No password, no session: redirect to login
    if (!sessionUser) {
      redirect(`/auth/login?next=/s/${slug}`);
    }
    // Non-owner authenticated user on unprotected share: allow
  }
  // --- END ACCESS GATE ---

  // A share that deletes itself on its first content read is never read here:
  // the visitor reveals it with an explicit click.
  const needsReveal = share.burn_after_reading || (await isOneTimeDownload(slug));

  let fileContent: string | null = null;
  if (!needsReveal) {
    const body = await getShareContent(slug);
    if (!body) notFound();
    fileContent = body.content;
  }

  const isMarkdown = share.mime_type === "text/markdown";
  const groupFiles = share.group_files;
  // The content read above is what counts this visit; the metadata predates it.
  const viewCount = fileContent === null ? share.view_count : share.view_count + 1;
  const displayName = share.filename ?? share.title ?? slug;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 max-w-[1200px] mx-auto w-full animate-fade-in">
      <ShareViewedTracker />
      <ShareAnalyticsTracker slug={slug} />
      {/* Metadata header */}
      <Card>
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0">
                {isMarkdown ? (
                  <FileText className="size-5 text-primary" />
                ) : (
                  <FileCode className="size-5 text-primary" />
                )}
              </div>
              <CardTitle className="truncate text-lg">{displayName}</CardTitle>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline">
                {isMarkdown ? "Markdown" : "HTML"}
              </Badge>
              <BookmarkToggle shareId={share.id} slug={share.slug} />
              <QrCodeButton slug={share.slug} />
            </div>
          </div>
          <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formatUploadDate(share.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {viewCount} views
            </span>
            {share.file_size ? (
              <span>{formatFileSize(share.file_size)}</span>
            ) : null}
            {share.expires_at && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                Expires in {formatExpiresIn(share.expires_at)}
              </span>
            )}
          </CardDescription>
          {/* Embed snippet — only for non-restricted public shares */}
          {!share.is_private && !share.has_password && (
            <div className="mt-3">
              <EmbedSnippet slug={share.slug} />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* File viewer with tabs for multi-file groups */}
      {fileContent !== null && groupFiles.length > 1 ? (
        <SharePageClient
          groupFiles={groupFiles}
          initialSlug={slug}
          initialContent={fileContent}
          isAuthenticated={!!sessionUser}
          shareId={share.id}
        />
      ) : (
        <>
          <Card>
            <CardContent className={isMarkdown ? "p-4 md:p-6" : "p-2"}>
              {fileContent === null ? (
                <RevealShareContent slug={slug} isMarkdown={isMarkdown} />
              ) : isMarkdown ? (
                <MarkdownViewerWrapper content={fileContent} />
              ) : (
                <HtmlViewer htmlContent={fileContent} />
              )}
            </CardContent>
          </Card>

          {/* Comments section */}
          <CommentsSectionWrapper shareId={share.id} slug={slug} isAuthenticated={!!sessionUser} />
        </>
      )}
    </div>
  );
}

/** Client wrapper to import CommentsSection for the server component boundary */
function CommentsSectionWrapper({
  shareId,
  slug,
  isAuthenticated,
}: {
  shareId: string;
  slug: string;
  isAuthenticated: boolean;
}) {
  return <CommentsSection shareId={shareId} slug={slug} isAuthenticated={isAuthenticated} />;
}
