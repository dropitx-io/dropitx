"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HtmlViewer } from "@/components/html-viewer";
import { MarkdownViewerWrapper } from "@/components/markdown-viewer-wrapper";
import { authFetch } from "@/lib/api-client";

interface RevealShareContentProps {
  slug: string;
  isMarkdown: boolean;
  /** "embed" fills the frame and renders HTML without the page chrome. */
  variant?: "page" | "embed";
}

type RevealState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "failed" }
  | { status: "revealed"; content: string };

/**
 * Reveal gate for a share that deletes itself on its first content read
 * (burn after reading, one-time download). The content is fetched only when the
 * visitor asks for it, so a link preview or prefetch never consumes the share.
 */
export function RevealShareContent({ slug, isMarkdown, variant = "page" }: RevealShareContentProps) {
  const [state, setState] = useState<RevealState>({ status: "idle" });

  const reveal = async () => {
    if (state.status === "loading" || state.status === "revealed") return;
    setState({ status: "loading" });
    try {
      const res = await authFetch(`/api/shares/${encodeURIComponent(slug)}/content`);
      if (res.ok) {
        const data = (await res.json()) as { content?: string };
        setState({ status: "revealed", content: data.content ?? "" });
      } else if (res.status === 404 || res.status === 410) {
        setState({ status: "unavailable" });
      } else {
        setState({ status: "failed" });
      }
    } catch {
      setState({ status: "failed" });
    }
  };

  if (state.status === "revealed") {
    if (isMarkdown) {
      return (
        <div className={variant === "embed" ? "p-4" : undefined}>
          <MarkdownViewerWrapper content={state.content} />
        </div>
      );
    }
    return variant === "embed" ? (
      <iframe
        srcDoc={state.content}
        style={{ width: "100%", height: "100vh", border: "none" }}
        sandbox="allow-scripts"
        title="Shared content"
      />
    ) : (
      <HtmlViewer htmlContent={state.content} />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      {state.status === "unavailable" ? (
        <p className="text-sm text-muted-foreground">This content is no longer available.</p>
      ) : (
        <>
          <p className="font-medium">This content can be opened only once.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Once you reveal it, it is deleted and cannot be viewed again. Copy anything you need to keep.
          </p>
          <Button onClick={reveal} disabled={state.status === "loading"}>
            {state.status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Revealing…
              </>
            ) : (
              "Reveal content"
            )}
          </Button>
          {state.status === "failed" && (
            <p className="text-sm text-destructive">Could not load the content. Try again.</p>
          )}
        </>
      )}
    </div>
  );
}
