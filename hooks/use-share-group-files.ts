"use client";

import { useCallback, useRef, useState } from "react";
import { authFetch } from "@/lib/api-client";
import { unlockShare } from "@/lib/share-unlock";
import type { GroupShare } from "@/types/share";
import type { ShareFilePayload } from "@/types/share-content";

interface UseShareGroupFilesOptions {
  groupFiles: GroupShare[];
  initialSlug: string;
  initialContent: ShareFilePayload;
  password?: string;
}

/** A file that deletes itself on its first read is revealed by a click, never fetched by a tab switch. */
function isSelfDeleting(files: GroupShare[], slug: string): boolean {
  const file = files.find((item) => item.slug === slug);
  return !!file && (file.burn_after_reading || file.one_time_download);
}

function isProtected(files: GroupShare[], slug: string): boolean {
  return !!files.find((item) => item.slug === slug)?.has_password;
}

const DIFFERENT_PASSWORD = "This file has a different password.";

function protectedNotice(result: Awaited<ReturnType<typeof unlockShare>>): string {
  if (result.status === "wrong") return DIFFERENT_PASSWORD;
  if (result.status === "limited") return result.message;
  if (result.status === "ok" || result.status === "gone") return "This file is no longer available.";
  return "Could not load this file.";
}

export function useShareGroupFiles({
  groupFiles,
  initialSlug,
  initialContent,
  password,
}: UseShareGroupFilesOptions) {
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [fileContents, setFileContents] = useState<Record<string, ShareFilePayload>>({
    [initialSlug]: initialContent,
  });
  const inFlight = useRef(new Set<string>());
  const [notices, setNotices] = useState<Record<string, string>>({});
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());
  // Files the unlock password was refused for: not retried, so a re-click sends nothing.
  const [wrongPassword, setWrongPassword] = useState<Set<string>>(new Set());

  const activeFile = groupFiles.find((file) => file.slug === activeSlug);
  const activeContent = fileContents[activeSlug];
  const activeNotice = notices[activeSlug];
  const isLoadingContent = loadingFiles.has(activeSlug);
  const activeNeedsReveal =
    activeContent === undefined && isSelfDeleting(groupFiles, activeSlug) && !wrongPassword.has(activeSlug);

  const isProtectedFile = useCallback(
    (slug: string) => isProtected(groupFiles, slug),
    [groupFiles]
  );

  const handleWrongPassword = useCallback((slug: string) => {
    setWrongPassword((prev) => new Set(prev).add(slug));
    setNotices((prev) => ({ ...prev, [slug]: DIFFERENT_PASSWORD }));
  }, []);

  const handleRevealed = useCallback((slug: string, content: ShareFilePayload) => {
    setFileContents((prev) => ({ ...prev, [slug]: content }));
  }, []);

  const handleSelect = useCallback(
    async (slug: string) => {
      setActiveSlug(slug);
      if (fileContents[slug] !== undefined) return;
      if (wrongPassword.has(slug)) return;
      if (isSelfDeleting(groupFiles, slug)) return;
      if (inFlight.current.has(slug)) return;
      inFlight.current.add(slug);

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
            setFileContents((prev) => ({
              ...prev,
              [slug]: { content: result.content, encoding: result.encoding },
            }));
          } else {
            if (result.status === "wrong") setWrongPassword((prev) => new Set(prev).add(slug));
            setNotices((prev) => ({ ...prev, [slug]: protectedNotice(result) }));
          }
          return;
        }

        const res = await authFetch(`/api/shares/${encodeURIComponent(slug)}/content`);
        if (res.ok) {
          const data = (await res.json()) as {
            content?: string;
            encoding?: ShareFilePayload["encoding"];
            password_protected?: boolean;
          };
          if (data.password_protected && !data.content) {
            setNotices((prev) => ({ ...prev, [slug]: "This file is password protected." }));
          } else {
            setFileContents((prev) => ({
              ...prev,
              [slug]: { content: data.content ?? "", encoding: data.encoding ?? "utf8" },
            }));
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

  return {
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
  };
}
