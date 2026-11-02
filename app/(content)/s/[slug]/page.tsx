import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { getSessionUser } from "@/lib/firebase/server";
import Link from "next/link";
import { Wordmark } from "@/components/brand-mark";
import { BookmarkToggle } from "@/components/bookmark-toggle";
import { QrCodeButton } from "@/components/qr-code-button";
import { getShortFileTypeLabel } from "@/lib/file-utils";
import { getShareMeta } from "@/lib/share-data";
import { SITE_URL } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import { body, grid, gutter, page, small, squareButton } from "@/app/(content)/_ui/public-styles";
import { ShareBody, ShareBodySkeleton } from "./share-body";
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
  });
}

/** The title runs at the display size when short; long file names step down so it stays within two lines. */
function titleSize(title: string): string {
  if (title.length <= 18) return "max-w-[11em] text-[clamp(44px,8vw,132px)] leading-[0.95] tracking-[-0.045em]";
  if (title.length <= 36) return "max-w-[22em] text-[clamp(36px,5.2vw,84px)] leading-[1] tracking-[-0.035em]";
  return "max-w-[30em] text-[clamp(28px,3.2vw,52px)] leading-[1.05] tracking-[-0.025em]";
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
  const meta: { label: string; value: string }[] = [
    { label: "Type", value: getShortFileTypeLabel(share.filename, share.mime_type) },
    { label: "Views", value: viewCount.toLocaleString("en-US") },
    { label: "Shared", value: formatUploadDate(share.created_at) },
    ...(share.file_size ? [{ label: "Size", value: formatFileSize(share.file_size) }] : []),
    ...(expiresIn ? [{ label: "Expires", value: expiresIn === "Expired" ? "Expired" : `in ${expiresIn}` }] : []),
  ];

  return (
    <div className={page}>
      <header className={cn(gutter, "flex h-[72px] shrink-0 items-center gap-3")}>
        <Wordmark className="mr-auto py-2 text-[22px] tracking-[-0.02em]" />
        <BookmarkToggle shareId={share.id} slug={share.slug} />
        <QrCodeButton slug={share.slug} />
      </header>

      <main id="main" className="flex-1">
        <div className={cn(gutter, "pt-[clamp(40px,6vw,88px)]")}>
          <h1 className={cn("break-words font-serif font-light", titleSize(displayName))}>{displayName}</h1>
          <dl className="mt-9 grid grid-cols-2 gap-x-[clamp(28px,4vw,64px)] gap-y-4 min-[861px]:flex min-[861px]:flex-wrap">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className={cn(small, "text-muted-foreground")}>{m.label}</dt>
                <dd className={body}>{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={cn(gutter, grid, "mt-[clamp(48px,6vw,88px)] items-start")}>
          {/* Everything above is resolved before the first byte, so a missing share answers 404.
              The content read streams in behind the skeleton. */}
          <div className="col-span-full flex min-w-0 flex-col gap-[clamp(56px,7vw,96px)] min-[1100px]:col-span-8">
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
          <ShareRail
            share={share}
            viewCount={viewCount}
            expiresIn={expiresIn}
            className="col-span-full mt-14 max-w-[440px] min-[1100px]:sticky min-[1100px]:top-6 min-[1100px]:col-span-3 min-[1100px]:col-start-10 min-[1100px]:mt-0 min-[1100px]:max-w-none"
          />
        </div>
      </main>

      <footer className={cn(gutter, "mt-[clamp(96px,12vw,176px)] flex flex-wrap items-center justify-between gap-6 bg-field py-12 text-field-foreground")}>
        <p className={body}>Shared with DropItX. Turn your own Markdown or HTML into a page like this.</p>
        <Link href="/" className={squareButton("inverse", "small")}>
          Share a file
        </Link>
      </footer>
    </div>
  );
}
