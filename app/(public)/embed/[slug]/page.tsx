import { notFound } from "next/navigation";
import { EmbedViewedTracker } from "@/components/embed-viewed-tracker";
import { MarkdownViewerWrapper } from "@/components/markdown-viewer-wrapper";
import { getShareContent, getShareMeta } from "@/lib/share-data";

interface EmbedPageProps {
  params: Promise<{ slug: string }>;
}

function OpenOnDropItX({ slug, message }: { slug: string; message: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "sans-serif",
      background: "var(--color-background, #f7eee6)",
      color: "var(--color-foreground, #2b211c)",
    }}>
      <p>
        {message}{" "}
        <a href={`/s/${slug}`} target="_top" style={{ color: "var(--color-primary, #9a5b3c)" }}>
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
    <div style={{ background: "#fff8f1" }}>
      <EmbedViewedTracker slug={slug} />
      {isMarkdown ? (
        <div style={{ padding: "1rem" }}>
          <MarkdownViewerWrapper content={fileContent} />
        </div>
      ) : (
        <iframe
          srcDoc={fileContent}
          style={{ width: "100%", height: "100vh", border: "none" }}
          sandbox="allow-scripts"
          title={share.filename ?? share.title ?? slug}
        />
      )}
    </div>
  );
}
