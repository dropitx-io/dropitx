import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/server";
import { getSessionUser } from "@/lib/firebase/server";
import { cookies } from "next/headers";
import { EmbedViewedTracker } from "@/components/embed-viewed-tracker";
import { MarkdownViewerWrapper } from "@/components/markdown-viewer-wrapper";

interface EmbedPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const { slug } = await params;
  const adminClient = createAdminClient();
  const cookieStore = await cookies();

  const { data: share, error } = await adminClient
    .from("shares")
    .select("id, slug, filename, storage_path, mime_type, is_private, password_hash, expires_at, user_id")
    .eq("slug", slug)
    .single();

  if (error || !share) notFound();
  if (share.expires_at && new Date(share.expires_at) < new Date()) notFound();

  // Private and password-protected shares return "view only" message
  const isRestricted = share.is_private || !!share.password_hash;

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
  const isOwnedShare = !!share.user_id;

  if (isOwnedShare) {
    const sessionUser = await getSessionUser(cookieStore);

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

  const { data: fileData, error: storageError } = await adminClient.storage
    .from("html-files")
    .download(share.storage_path);

  if (storageError || !fileData) notFound();

  const fileContent = await fileData.text();
  const isMarkdown = share.mime_type === "text/markdown";

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
          title={share.filename}
        />
      )}
    </div>
  );
}
