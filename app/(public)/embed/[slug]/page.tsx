import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/server";
import { cookies } from "next/headers";
import { EmbedViewedTracker } from "@/components/embed-viewed-tracker";
import { MarkdownViewerWrapper } from "@/components/markdown-viewer-wrapper";
import { RevealShareContent } from "@/components/reveal-share-content";
import { getShareContent, getShareMeta, isOneTimeDownload } from "@/app/(public)/s/[slug]/share-data";

interface EmbedPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const { slug } = await params;
  const share = await getShareMeta(slug);

  if (!share) notFound();

  // Private and password-protected shares return "view only" message
  const isRestricted = share.is_private || share.has_password;

  if (isRestricted) {
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
        <p>This content is protected. <a href={`/s/${slug}`} style={{ color: "var(--color-primary, #9a5b3c)" }}>View on DropItX</a></p>
      </div>
    );
  }

  // Red Team Fix: 2 — Owned shares require auth for embed viewer
  if (share.has_owner) {
    const sessionUser = await getSessionUser(await cookies());

    if (!sessionUser) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "sans-serif",
          background: "var(--color-background, #f7eee6)",
          color: "var(--color-foreground, #2b211c)",
          gap: "1rem",
        }}>
          <p>Sign in to view this embedded content</p>
          <a href={`/auth/login?next=/s/${slug}`} style={{
            color: "var(--color-primary, #9a5b3c)",
            border: "1px solid var(--color-primary, #9a5b3c)",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            textDecoration: "none",
          }}>
            Sign in to DropItX
          </a>
        </div>
      );
    }
  }

  const isMarkdown = share.mime_type === "text/markdown";

  // A share that deletes itself on its first content read is revealed by a click, never read here.
  if (share.burn_after_reading || (await isOneTimeDownload(slug))) {
    return (
      <div style={{ background: "#fff8f1" }}>
        <EmbedViewedTracker slug={slug} />
        <RevealShareContent slug={slug} isMarkdown={isMarkdown} variant="embed" />
      </div>
    );
  }

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
