"use client";

import { BinaryShareContent } from "@/components/binary-share-content";
import { HtmlViewer } from "@/components/html-viewer";
import { MarkdownViewerWrapper } from "@/components/markdown-viewer-wrapper";
import type { ShareFileContent } from "@/types/share-content";

interface ShareFileContentProps {
  content: ShareFileContent;
  filename?: string | null;
  mimeType?: string | null;
}

/** Dispatches encoded share content to the binary or text viewer. */
export function ShareFileContent({ content, filename, mimeType }: ShareFileContentProps) {
  if (content.encoding === "base64") {
    return <BinaryShareContent content={content.content} filename={filename} mimeType={mimeType} />;
  }

  if (mimeType === "text/markdown") {
    return <MarkdownViewerWrapper content={content.content} />;
  }

  return <HtmlViewer htmlContent={content.content} />;
}
