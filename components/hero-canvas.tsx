"use client";

import { UploadDropzone, type UploadResult } from "@/components/upload-dropzone";

interface HeroCanvasProps {
  onUploadSuccess: (result: UploadResult) => void;
}

/**
 * Browser chrome mockup wrapping the real UploadDropzone.
 * The dropzone is fully functional — drag-and-drop and file input work.
 */
export function HeroCanvas({ onUploadSuccess }: HeroCanvasProps) {
  return (
    <div className="section-card overflow-hidden w-full">
      {/* Chrome bar — decorative browser header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface/60 max-[920px]:hidden">
        {/* 3 colored dots */}
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive/70" />
          <span className="size-2.5 rounded-full bg-chart-4/70" />
          <span className="size-2.5 rounded-full bg-success/70" />
        </div>

        {/* URL bar */}
        <div className="flex-1 flex items-center justify-center">
          <span className="rounded-full bg-fg-soft px-4 py-1 text-xs font-mono text-muted-foreground">
            dropitx.site
          </span>
        </div>

        {/* Responsive label */}
        <span className="meta">Desktop</span>
      </div>

      {/* Inner content: real dropzone */}
      <div className="p-4 max-[920px]:p-0">
        <UploadDropzone onUploadSuccess={onUploadSuccess} />
      </div>
    </div>
  );
}
