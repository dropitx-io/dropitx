import { notFound } from "next/navigation";
import { PasswordGate } from "@/components/password-gate";
import { ShareContentArea } from "@/components/share-content-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getShareContent, type ShareMeta } from "@/lib/share-data";
import type { ShareFilePayload } from "@/types/share-content";

interface ShareBodyProps {
  slug: string;
  filename?: string | null;
  mimeType?: string | null;
  groupFiles: ShareMeta["group_files"];
  /** Password-protected for a non-owner: the gate fetches content itself after an unlock. */
  gated: boolean;
  /** Burn-after-reading / one-time shares are revealed by an explicit click, never read here. */
  needsReveal: boolean;
  isAuthenticated: boolean;
}

export function ShareBodySkeleton() {
  return (
    <div role="status" aria-label="Loading the shared page" className="grid max-w-[720px] gap-4">
      <Skeleton className="h-6 w-3/4 rounded-none" />
      <Skeleton className="h-6 w-full rounded-none" />
      <Skeleton className="h-6 w-5/6 rounded-none" />
      <Skeleton className="h-[40vh] w-full rounded-none" />
    </div>
  );
}

/** The share's content area. Reads the content (counting a view) only when the share may be shown outright. */
export async function ShareBody({
  slug,
  filename,
  mimeType,
  groupFiles,
  gated,
  needsReveal,
  isAuthenticated,
}: ShareBodyProps) {
  if (gated) {
    return (
      <PasswordGate
        key={slug}
        slug={slug}
        filename={filename}
        mimeType={mimeType}
        groupFiles={groupFiles}
        isAuthenticated={isAuthenticated}
        selfDeleting={needsReveal}
      />
    );
  }

  let content: ShareFilePayload | null = null;
  if (!needsReveal) {
    const body = await getShareContent(slug);
    if (!body) notFound();
    content = body;
  }

  return (
    <ShareContentArea
      slug={slug}
      filename={filename}
      mimeType={mimeType}
      content={content}
      groupFiles={groupFiles}
      isAuthenticated={isAuthenticated}
    />
  );
}
