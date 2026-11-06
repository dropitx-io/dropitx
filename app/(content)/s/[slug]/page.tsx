import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import Link from "next/link";
import { getSessionUser } from "@/lib/firebase/server";
import { Wordmark } from "@/components/brand-mark";
import { BookmarkToggle } from "@/components/bookmark-toggle";
import { QrCodeButton } from "@/components/qr-code-button";
import { getShortFileTypeLabel } from "@/lib/file-utils";
import { getShareMeta } from "@/lib/share-data";
import { SITE_URL } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import { ShareBody, ShareBodySkeleton } from "./share-body";
import { ShareCopyLink } from "./share-copy-link";
import { ShareRail } from "./share-rail";

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
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
}

function formatUploadDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
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
  // A session only decides which affordances the page offers (guest comment form,
  // sign-in prompts); it never gates viewing.
  const sessionUser = await getSessionUser(await cookies());
  // Private shares never reach here: the API answers 404 for everyone but the owner.
  // A password-protected share shows its header and a password gate, for anonymous and
  // signed-in non-owners alike; its content is fetched by the gate after an unlock.
  // Every other share is public and renders for any visitor, signed in or not.
  const gated = !share.is_owner && share.has_password;
  // --- END ACCESS GATE ---

  // A share that deletes itself on its first content read is never read here:
  // the visitor reveals it with an explicit click.
  const needsReveal = share.burn_after_reading || share.one_time_download;

  // The content read below is what counts this visit; the metadata predates it.
  const viewCount = !gated && !needsReveal ? share.view_count + 1 : share.view_count;
  const displayName = share.filename ?? share.title ?? slug;
  const expiresIn = share.expires_at ? formatExpiresIn(share.expires_at) : null;
  const typeLabel = getShortFileTypeLabel(share.filename, share.mime_type);
  const badges = [
    share.file_size ? `${typeLabel}, ${formatFileSize(share.file_size)}` : typeLabel,
    `${viewCount.toLocaleString("en-US")} ${viewCount === 1 ? "view" : "views"}`,
    `Shared ${formatUploadDate(share.created_at)}`,
    ...(expiresIn ? [expiresIn === "Expired" ? "Expired" : `Expires in ${expiresIn}`] : []),
  ];

  return (
    <div className="site">
      <header className="site-nav share-bar" data-testid="share-bar">
        <a className="skip" href="#doc">Skip to the document</a>
        <div className="wrap">
          <Wordmark />
          <div className="share-file"><span className="badge">{displayName}</span></div>
          <div className="share-actions">
            <BookmarkToggle shareId={share.id} slug={share.slug} />
            <QrCodeButton slug={share.slug} />
            <ShareCopyLink url={`${SITE_URL}/s/${share.slug}`} />
          </div>
        </div>
      </header>

      <main className={cn("wrap reader", gated && "reader-wide")} id="doc">
        <div className="reader-head">
          <h1 className="rise">{displayName}</h1>
          {gated ? (
            <div className="reader-meta rise" style={{ "--i": 1 } as React.CSSProperties}>
              <span className="badge">Password protected</span>
            </div>
          ) : (
            <div className="reader-meta rise" style={{ "--i": 1 } as React.CSSProperties}>
              {badges.map((b) => <span key={b} className="badge">{b}</span>)}
            </div>
          )}
        </div>

        {/* Everything above is resolved before the first byte, so a missing share answers 404.
            The content read streams in behind the skeleton. */}
        <div className="reader-body grid gap-[clamp(48px,6vw,80px)]">
          <Suspense fallback={<ShareBodySkeleton />}>
            <ShareBody
              slug={slug}
              filename={share.filename}
              mimeType={share.mime_type}
              groupFiles={share.group_files}
              gated={gated}
              needsReveal={needsReveal}
              isAuthenticated={!!sessionUser}
            />
          </Suspense>
        </div>
        {!gated && <ShareRail share={share} viewCount={viewCount} expiresIn={expiresIn} />}
      </main>

      <footer className="share-foot">
        <div className="wrap">
          <Wordmark />
          <p className="ui-text fg-2">
            Shared with DropItX. <Link href="/search">Search other shared pages</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
