"use client";

import { forwardRef } from "react";
import { MarkdownViewer } from "@/components/markdown-viewer";
import type { HeadingInfo } from "@/lib/use-scroll-sync";

interface EditorPreviewProps {
  content: string;
  headings?: HeadingInfo[];
}

export const EditorPreview = forwardRef<HTMLDivElement, EditorPreviewProps>(
  function EditorPreview({ content, headings }, ref) {
    if (!content.trim()) {
      return (
        <div ref={ref} className="absolute inset-0 overflow-auto px-8 py-7 text-sm text-muted-foreground max-sm:px-4">
          <p>Nothing to preview yet. What you write in Markdown appears here as readers will see it.</p>
        </div>
      );
    }

    return (
      <div ref={ref} className="absolute inset-0 overflow-auto px-8 pb-12 pt-7 max-sm:px-4">
        <div className="max-w-[65ch]">
          <MarkdownViewer content={content} headings={headings} />
        </div>
      </div>
    );
  }
);
