import { notFound } from "next/navigation";
import { EmbedViewedTracker } from "@/components/embed-viewed-tracker";
import { MarkdownViewerWrapper } from "@/components/markdown-viewer-wrapper";
import { getShareContent, getShareMeta } from "@/lib/share-data";
import { textLink } from "@/app/(content)/_ui/public-styles";

interface EmbedPageProps {
  params: Promise<{ slug: string }>;
}

function OpenOnDropItX({ slug, message }: { slug: string; message: string }) {
  return (
    <div className="type-page flex min-h-svh items-center justify-center bg-background p-6 text-center text-[18px] leading-[1.6] text-foreground">
      <p className="max-w-[34em]">
        {message}{" "}
        <a href={`/s/${slug}`} target="_top" className={textLink}>
          Open it on DropItX
        </a>
      </p>
    </div>
  );
}

// An embed is shown on third-party sites to visitors who are not signed in, so a
// public share renders here for anyone. Shares that need a password, or that delete
// themselves on their first content read, never have their content read by an embed.
export default async function EmbedPage({ params }: EmbedPageProps) {
  const { slug } = await params;
  const share = await getShareMeta(slug);

  if (!share) notFound();

  if (share.has_password) {
    return <OpenOnDropItX slug={slug} message="This share is password protected." />;
  }

  // The API answers 404 for a private share to everyone but its owner.
  if (share.is_private) {
    return <OpenOnDropItX slug={slug} message="This content is private." />;
  }

  if (share.burn_after_reading || share.one_time_download) {
    return (
      <>
        <EmbedViewedTracker slug={slug} />
        <OpenOnDropItX slug={slug} message="This content can be opened only once, so it is not shown in an embed." />
      </>
    );
  }

  const isMarkdown = share.mime_type === "text/markdown";
  const body = await getShareContent(slug);
  if (!body) notFound();
  const fileContent = body.content;

  return (
    <div className="min-h-svh bg-background text-foreground">
      <EmbedViewedTracker slug={slug} />
      {isMarkdown ? (
        <div className="p-4">
          <MarkdownViewerWrapper content={fileContent} />
        </div>
      ) : (
        <iframe
          srcDoc={fileContent}
          className="block h-svh w-full border-0"
          sandbox="allow-scripts"
          title={share.filename ?? share.title ?? slug}
        />
      )}
    </div>
  );
}
