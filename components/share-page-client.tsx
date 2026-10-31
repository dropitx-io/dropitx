"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileTabs } from "@/components/file-tabs";
import { FileListSidebar } from "@/components/file-list-sidebar";
import { CommentsSection } from "@/components/comments-section";
import { HtmlViewer } from "@/components/html-viewer";
import { MarkdownViewerWrapper } from "@/components/markdown-viewer-wrapper";
import { RevealShareContent } from "@/components/reveal-share-content";
import { Loader2 } from "lucide-react";
import { authFetch } from "@/lib/api-client";
import { unlockShare } from "@/lib/share-unlock";
import type { GroupShare } from "@/types/share";

interface SharePageClientProps {
  groupFiles: GroupShare[];
  initialSlug: string;
  /** Content of the initial file, already read by the server. */
  initialContent: string;
  isAuthenticated: boolean;
  /** Password the visitor unlocked this group with, held in memory only; used to open protected siblings. */
  password?: string;
}

/** A file that deletes itself on its first read is revealed by a click, never fetched by a tab switch. */
function isSelfDeleting(files: GroupShare[], slug: string): boolean {
  const file = files.find((f) => f.slug === slug);
  return !!file && (file.burn_after_reading || file.one_time_download);
}

function isProtected(files: GroupShare[], slug: string): boolean {
  return !!files.find((f) => f.slug === slug)?.has_password;
}

const DIFFERENT_PASSWORD = "This file has a different password.";

function protectedNotice(result: Awaited<ReturnType<typeof unlockShare>>): string {
  if (result.status === "wrong") return DIFFERENT_PASSWORD;
  if (result.status === "limited") return result.message;
  if (result.status === "ok" || result.status === "gone") return "This file is no longer available.";
  return "Could not load this file.";
}

export function SharePageClient({
  groupFiles,
  initialSlug,
  initialContent,
  isAuthenticated,
  password,
}: SharePageClientProps) {
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [fileContents, setFileContents] = useState<Record<string, string>>({
    [initialSlug]: initialContent,
  });
  const inFlight = useRef(new Set<string>());
  const [notices, setNotices] = useState<Record<string, string>>({});
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());
  // Files the unlock password was refused for: not retried, so a re-click sends nothing.
  const [wrongPassword, setWrongPassword] = useState<Set<string>>(new Set());

  const activeFile = groupFiles.find((f) => f.slug === activeSlug);
  const isMarkdown = activeFile?.mime_type === "text/markdown";
  const activeNotice = notices[activeSlug];

  const handleSelect = useCallback(
    async (slug: string) => {
      setActiveSlug(slug);

      // Already have content cached
      if (fileContents[slug] !== undefined) return;
      if (wrongPassword.has(slug)) return;
      if (isSelfDeleting(groupFiles, slug)) return;
      if (inFlight.current.has(slug)) return;
      inFlight.current.add(slug);

      // Fetch file content
      setLoadingFiles((prev) => new Set(prev).add(slug));
      setNotices((prev) => {
        const next = { ...prev };
        delete next[slug];
        return next;
      });
      try {
        // With the password the visitor unlocked the group with, a protected file goes through
        // unlock. Without one (the share's owner, whom the API serves directly) it is read from
        // /content like any other file; a non-owner gets an empty body there and a notice below.
        if (password !== undefined && isProtected(groupFiles, slug)) {
          const result = await unlockShare(slug, password);
          if (result.status === "ok" && result.content) {
            setFileContents((prev) => ({ ...prev, [slug]: result.content }));
          } else {
            if (result.status === "wrong") setWrongPassword((prev) => new Set(prev).add(slug));
            setNotices((prev) => ({ ...prev, [slug]: protectedNotice(result) }));
          }
          return;
        }
        const res = await authFetch(`/api/shares/${encodeURIComponent(slug)}/content`);
        if (res.ok) {
          const data = (await res.json()) as { content?: string; password_protected?: boolean };
          if (data.password_protected && !data.content) {
            setNotices((prev) => ({ ...prev, [slug]: "This file is password protected." }));
          } else {
            setFileContents((prev) => ({ ...prev, [slug]: data.content ?? "" }));
          }
        } else {
          const gone = res.status === 404 || res.status === 410;
          setNotices((prev) => ({
            ...prev,
            [slug]: gone ? "This file is no longer available." : "Could not load this file.",
          }));
        }
      } catch {
        setNotices((prev) => ({ ...prev, [slug]: "Could not load this file." }));
      } finally {
        inFlight.current.delete(slug);
        setLoadingFiles((prev) => {
          const next = new Set(prev);
          next.delete(slug);
          return next;
        });
      }
    },
    [fileContents, groupFiles, password, wrongPassword]
  );

  const activeContent = fileContents[activeSlug];
  const activeNeedsReveal =
    activeContent === undefined && isSelfDeleting(groupFiles, activeSlug) && !wrongPassword.has(activeSlug);
  const isLoadingContent = loadingFiles.has(activeSlug);

  // Build file tabs data
  const tabs = groupFiles.map((f) => ({
    slug: f.slug,
    filename: f.filename ?? f.slug,
    mime_type: f.mime_type ?? "text/html",
    file_size: f.file_size ?? null,
    active: f.slug === activeSlug,
  }));

  const sidebarFiles = groupFiles.map((f) => ({
    slug: f.slug,
    filename: f.filename ?? f.slug,
    mime_type: f.mime_type ?? "text/html",
    file_size: f.file_size ?? null,
    download_count: f.download_count,
    max_downloads: f.max_downloads ?? null,
  }));

  return (
    <>
      {/* File tabs for navigation */}
      <FileTabs
        files={tabs}
        activeSlug={activeSlug}
        onSelect={handleSelect}
      />

      {/* Content area with sidebar */}
      <div className="flex gap-0 rounded-lg overflow-hidden border border-border/60">
        {/* File list sidebar (hidden on mobile) */}
        <FileListSidebar
          files={sidebarFiles}
          activeSlug={activeSlug}
          onSelect={handleSelect}
          className="hidden md:block"
        />

        {/* File content */}
        <div className="flex-1 min-w-0">
          {isLoadingContent ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : activeNeedsReveal ? (
            <RevealShareContent
              key={activeSlug}
              slug={activeSlug}
              isMarkdown={isMarkdown}
              password={isProtected(groupFiles, activeSlug) ? password : undefined}
              onWrongPassword={() => {
                const slug = activeSlug;
                setWrongPassword((prev) => new Set(prev).add(slug));
                setNotices((prev) => ({ ...prev, [slug]: DIFFERENT_PASSWORD }));
              }}
              onRevealed={(content) => {
                const slug = activeSlug;
                setFileContents((prev) => ({ ...prev, [slug]: content }));
              }}
            />
          ) : (
            <div className={isMarkdown ? "p-4 md:p-6" : "p-2"}>
              {activeContent !== undefined ? (
                isMarkdown ? (
                  <MarkdownViewerWrapper content={activeContent} />
                ) : (
                  <HtmlViewer htmlContent={activeContent} />
                )
              ) : (
                <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                  {activeNotice ?? "Select a file to view"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comments section */}
      <CommentsSection
        slug={activeSlug}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
}
