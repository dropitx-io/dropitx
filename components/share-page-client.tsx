"use client";

import { FileTabs } from "@/components/file-tabs";
import { FileListSidebar } from "@/components/file-list-sidebar";
import { CommentsSection } from "@/components/comments-section";
import { RevealShareContent } from "@/components/reveal-share-content";
import { ShareFileContent } from "@/components/share-file-content";
import { Loader2 } from "lucide-react";
import { useShareGroupFiles } from "@/hooks/use-share-group-files";
import type { GroupShare } from "@/types/share";
import type { ShareFilePayload } from "@/types/share-content";

interface SharePageClientProps {
  groupFiles: GroupShare[];
  initialSlug: string;
  /** Content of the initial file, already read by the server. */
  initialContent: ShareFilePayload;
  isAuthenticated: boolean;
  /** Password the visitor unlocked this group with, held in memory only; used to open protected siblings. */
  password?: string;
}

export function SharePageClient({
  groupFiles,
  initialSlug,
  initialContent,
  isAuthenticated,
  password,
}: SharePageClientProps) {
  const {
    activeSlug,
    activeFile,
    activeContent,
    activeNotice,
    activeNeedsReveal,
    isLoadingContent,
    handleSelect,
    handleRevealed,
    handleWrongPassword,
    isProtectedFile,
  } = useShareGroupFiles({ groupFiles, initialSlug, initialContent, password });

  const isMarkdown = activeFile?.mime_type === "text/markdown";

  const tabs = groupFiles.map((file) => ({
    slug: file.slug,
    filename: file.filename ?? file.slug,
    mime_type: file.mime_type ?? "text/html",
    file_size: file.file_size ?? null,
    active: file.slug === activeSlug,
  }));

  const sidebarFiles = groupFiles.map((file) => ({
    slug: file.slug,
    filename: file.filename ?? file.slug,
    mime_type: file.mime_type ?? "text/html",
    file_size: file.file_size ?? null,
    download_count: file.download_count,
    max_downloads: file.max_downloads ?? null,
  }));

  return (
    <>
      <FileTabs files={tabs} activeSlug={activeSlug} onSelect={handleSelect} />

      <div className="flex gap-0 rounded-lg overflow-hidden border border-border/60">
        <FileListSidebar
          files={sidebarFiles}
          activeSlug={activeSlug}
          onSelect={handleSelect}
          className="hidden md:block"
        />

        <div className="flex-1 min-w-0">
          {isLoadingContent ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : activeNeedsReveal ? (
            <RevealShareContent
              key={activeSlug}
              slug={activeSlug}
              filename={activeFile?.filename}
              mimeType={activeFile?.mime_type}
              password={isProtectedFile(activeSlug) ? password : undefined}
              onWrongPassword={() => handleWrongPassword(activeSlug)}
              onRevealed={(content) => handleRevealed(activeSlug, content)}
            />
          ) : (
            <div className={isMarkdown && activeContent?.encoding !== "base64" ? "p-4 md:p-6" : "p-2"}>
              {activeContent !== undefined ? (
                <ShareFileContent
                  content={activeContent}
                  filename={activeFile?.filename}
                  mimeType={activeFile?.mime_type}
                />
              ) : (
                <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                  {activeNotice ?? "Select a file to view"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CommentsSection slug={activeSlug} isAuthenticated={isAuthenticated} />
    </>
  );
}
