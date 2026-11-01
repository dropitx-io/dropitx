"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Loader2, Lock, Unlock, FileEdit, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";
import { useAuth } from "@/components/auth-provider";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import type { components } from "@/lib/api-types";
import { Input } from "@/components/ui/input";
import { ExpirationSelect } from "@/components/expiration-select";
import { BurnAfterReadingToggle } from "@/components/burn-after-reading-toggle";

interface EditorPublishBarProps {
  content: string;
  isDirty: boolean;
  mode: "create" | "edit";
  editSlug?: string;
  editTitle?: string;
  /** Privacy of the share being edited, so an update never changes it unless the user does. */
  initialIsPrivate?: boolean;
  /** Called after a successful publish or update, with the exact content that was saved. */
  onPublished?: (slug: string, url: string, publishedContent: string) => void;
  onClearDraft?: () => void;
  draftSavedAt?: Date | null;
}

type PublishBody = components["schemas"]["PublishRequest"];
type UpdateBody = components["schemas"]["UpdatePublishRequest"];

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function EditorPublishBar({
  content,
  isDirty,
  mode,
  editSlug,
  editTitle,
  initialIsPrivate = false,
  onPublished,
  onClearDraft,
  draftSavedAt,
}: EditorPublishBarProps) {
  const { user, loading: authLoading } = useAuth();
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [maxDownloads, setMaxDownloads] = useState("");
  // An existing share keeps its expiry unless the user picks a new one, so editing starts with no choice made.
  const [expiresIn, setExpiresIn] = useState(mode === "edit" ? "" : "30d");
  const [showOptions, setShowOptions] = useState(false);
  const [burnAfterReading, setBurnAfterReading] = useState(false);

  const handlePublish = useCallback(async () => {
    if (!content.trim()) {
      toast.error("Content cannot be empty.");
      return;
    }

    setPublishing(true);
    try {
      const body: PublishBody = {
        content,
        is_private: isPrivate,
        expires_in: expiresIn,
        burn_after_reading: burnAfterReading,
        one_time_download: false,
        // Nothing on the share page decrypts yet, so the editor never publishes an encrypted share.
        encrypted: false,
      };
      if (maxDownloads) body.max_downloads = parseInt(maxDownloads, 10);

      const res = await authFetch("/api/publish", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(await apiErrorDetail(res, "Publishing failed"));
      }

      const data = await res.json();

      const url: string = data.url;

      setPublishedUrl(url);
      toast.success("Published successfully!");
      trackEvent(AnalyticsEvent.CONTENT_PUBLISHED, { is_private: isPrivate, encrypted: false, burn: burnAfterReading });
      onPublished?.(data.slug, url, content);
      onClearDraft?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Publishing failed");
    } finally {
      setPublishing(false);
    }
  }, [content, isPrivate, expiresIn, maxDownloads, burnAfterReading, onPublished, onClearDraft]);

  const handleUpdate = useCallback(async () => {
    if (!editSlug || !content.trim()) return;

    setPublishing(true);
    try {
      // Always false: the editor refuses to open encrypted shares, and the API clears the stored IV and salt on
      // every update. Revisit this together with that refusal.
      const body: UpdateBody = {
        content,
        is_private: isPrivate,
        encrypted: false,
      };
      if (expiresIn) body.expires_in = expiresIn;
      if (maxDownloads) body.max_downloads = parseInt(maxDownloads, 10);

      const res = await authFetch(`/api/publish/${encodeURIComponent(editSlug)}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(await apiErrorDetail(res, "Update failed"));
      }

      const data = await res.json();
      toast.success("Updated successfully!");
      // The expiry was applied; a later update keeps it unless the user picks another.
      setExpiresIn("");
      onPublished?.(editSlug, data.url, content);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPublishing(false);
    }
  }, [editSlug, content, isPrivate, maxDownloads, expiresIn, onPublished]);

  const copyUrl = useCallback(async () => {
    if (!publishedUrl) return;
    await navigator.clipboard.writeText(publishedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [publishedUrl]);

  const charCount = content.length;
  const wordCount = countWords(content);
  const readingTime = wordCount > 0 ? Math.ceil(wordCount / 200) : 0;

  return (
    <div className="sticky bottom-0 z-20 border-t border-border/60 bg-surface/80 backdrop-blur-sm">
      {/* Options panel */}
      {showOptions && (
        <div className="space-y-3 px-4 py-3 border-b border-border/30">
          {/* Row 1: Max downloads + Expiration */}
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-[180px]">
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Max downloads
              </label>
              <Input
                type="number"
                placeholder="Unlimited"
                min="1"
                value={maxDownloads}
                onChange={(e) => setMaxDownloads(e.target.value)}
                disabled={publishing}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex-1 max-w-[180px]">
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Expires in
              </label>
              <ExpirationSelect value={expiresIn} onChange={setExpiresIn} disabled={publishing} compact />
            </div>
          </div>

          {/* Row 2: Burn after reading — a new document only; the update API cannot change it */}
          {mode === "create" && (
            <BurnAfterReadingToggle
              enabled={burnAfterReading}
              onChange={setBurnAfterReading}
              disabled={publishing}
            />
          )}
        </div>
      )}

      {/* Main bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-mono">{charCount.toLocaleString()} chars</span>
          <span className="text-border">&middot;</span>
          <span className="font-mono">{wordCount.toLocaleString()} words</span>
          {readingTime > 0 && (
            <>
              <span className="text-border">&middot;</span>
              <span className="font-mono">{readingTime} min read</span>
            </>
          )}
          {isDirty && !publishedUrl && (
            <>
              <span className="text-border">&middot;</span>
              <span className="flex items-center gap-1 text-amber-500">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved
              </span>
            </>
          )}
          {draftSavedAt && !publishedUrl && (
            <>
              <span className="text-border">&middot;</span>
              <span className="flex items-center gap-1 text-success">
                <span className="size-1.5 rounded-full bg-success" />
                Draft saved
              </span>
            </>
          )}
          {mode === "edit" && editTitle && (
            <Badge variant="outline" className="text-xs gap-1">
              <FileEdit className="size-3" />
              {editTitle}
            </Badge>
          )}
          {/* Status indicators */}
          {burnAfterReading && (
            <Badge variant="outline" className="text-xs gap-1 text-orange-600 border-orange-500/30">
              🔥
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Options toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-lg"
            onClick={() => setShowOptions(!showOptions)}
            title="Publish options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Button>

          {/* Privacy toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-lg"
            onClick={() => setIsPrivate(!isPrivate)}
            title={isPrivate ? "Make public" : "Make private"}
          >
            {isPrivate ? (
              <Lock className="size-4 text-foreground" />
            ) : (
              <Unlock className="size-4 text-muted-foreground" />
            )}
          </Button>

          {publishedUrl ? (
            <div className="flex items-center gap-2">
              <code className="rounded-lg bg-muted px-2.5 py-1 text-xs max-w-[200px] truncate font-mono">
                {publishedUrl}
              </code>
              <Button size="icon-sm" variant="outline" className="rounded-lg" onClick={copyUrl}>
                {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
              </Button>
            </div>
          ) : authLoading ? (
            <Button size="sm" disabled className="gap-1.5">
              <Loader2 className="size-3 animate-spin" />
            </Button>
          ) : !user ? (
            <a href="/auth/login?next=/editor">
              <Button size="sm" className="gap-1.5">
                <Sparkles className="size-3.5" />
                Sign in to publish
              </Button>
            </a>
          ) : (
            <Button
              size="sm"
              className="gap-1.5 shadow-sm shadow-primary/20"
              disabled={publishing || !content.trim()}
              onClick={mode === "edit" ? handleUpdate : handlePublish}
            >
              {publishing && <Loader2 className="size-3 animate-spin" />}
              {mode === "edit" ? "Update" : "Publish"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
