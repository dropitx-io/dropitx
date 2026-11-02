"use client";

import { useCallback, useRef, useState } from "react";
import { Check, ExternalLink, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";
import { useAuth } from "@/components/auth-provider";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import type { components } from "@/lib/api-types";
import { SITE_URL } from "@/lib/site-url";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/app-shell/switch";
import { EXPIRATION_OPTIONS, ExpirationSelect } from "@/components/expiration-select";
import { BurnAfterReadingToggle } from "@/components/burn-after-reading-toggle";
import { CopyLinkButton } from "@/components/links/copy-link-button";

interface EditorPublishBarProps {
  content: string;
  /** The title field; sent when set. */
  title: string;
  /** The share's title as loaded, so an update sends the title only when the user changed it. */
  initialTitle?: string;
  mode: "create" | "edit";
  editSlug?: string;
  /** Privacy of the share being edited, so an update never changes it unless the user does. */
  initialIsPrivate?: boolean;
  /** Called after a successful publish or update, with the exact content that was saved. */
  onPublished?: (slug: string, url: string, publishedContent: string) => void;
  onClearDraft?: () => void;
}

type PublishBody = components["schemas"]["PublishRequest"];
type UpdateBody = components["schemas"]["UpdatePublishRequest"];

const host = SITE_URL.replace(/^https?:\/\//, "");
const Sep = () => <span aria-hidden className="h-7 w-px shrink-0 bg-rule max-md:hidden" />;

export function EditorPublishBar({
  content,
  title,
  initialTitle = "",
  mode,
  editSlug,
  initialIsPrivate = false,
  onPublished,
  onClearDraft,
}: EditorPublishBarProps) {
  const { user, loading: authLoading } = useAuth();
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<{ slug: string; url: string; summary: string } | null>(null);
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [maxDownloads, setMaxDownloads] = useState("");
  // An existing share keeps its expiry unless the user picks a new one, so editing starts with no choice made.
  const [expiresIn, setExpiresIn] = useState(mode === "edit" ? "" : "30d");
  const [burnAfterReading, setBurnAfterReading] = useState(false);
  const [passwordOn, setPasswordOn] = useState(false);
  const [password, setPassword] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);

  const handlePublish = useCallback(async () => {
    if (!content.trim()) {
      toast.error("Content cannot be empty.");
      return;
    }
    if (passwordOn && !password.trim()) {
      toast.error("Set a password, or turn Password off.");
      passwordRef.current?.focus();
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
      if (title.trim()) body.title = title.trim();
      if (passwordOn) body.password = password;
      if (maxDownloads) body.max_downloads = parseInt(maxDownloads, 10);

      const res = await authFetch("/api/publish", { method: "POST", body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Publishing failed"));
      const data = (await res.json()) as { slug: string; url: string };

      const expiry = EXPIRATION_OPTIONS.find((o) => o.value === expiresIn)?.label;
      const summary = [
        passwordOn ? "Password on" : "No password",
        expiry ? `expires in ${expiry}` : null,
        burnAfterReading ? "burns after first read" : null,
      ]
        .filter(Boolean)
        .join(", ");
      setPublished({ slug: data.slug, url: data.url, summary });
      toast.success("Published");
      trackEvent(AnalyticsEvent.CONTENT_PUBLISHED, { is_private: isPrivate, encrypted: false, burn: burnAfterReading });
      onPublished?.(data.slug, data.url, content);
      onClearDraft?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Publishing failed");
    } finally {
      setPublishing(false);
    }
  }, [content, title, isPrivate, expiresIn, maxDownloads, burnAfterReading, passwordOn, password, onPublished, onClearDraft]);

  const handleUpdate = useCallback(async () => {
    if (!editSlug || !content.trim()) return;

    setPublishing(true);
    try {
      // Always false: the editor refuses to open encrypted shares, and the API clears the stored IV and salt on
      // every update. Revisit this together with that refusal.
      const body: UpdateBody = { content, is_private: isPrivate, encrypted: false };
      if (title.trim() && title.trim() !== initialTitle) body.title = title.trim();
      if (expiresIn) body.expires_in = expiresIn;
      if (maxDownloads) body.max_downloads = parseInt(maxDownloads, 10);

      const res = await authFetch(`/api/publish/${encodeURIComponent(editSlug)}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Update failed"));

      const data = await res.json();
      toast.success("Updated");
      // The expiry was applied; a later update keeps it unless the user picks another.
      setExpiresIn("");
      onPublished?.(editSlug, data.url, content);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPublishing(false);
    }
  }, [editSlug, content, title, initialTitle, isPrivate, maxDownloads, expiresIn, onPublished]);

  const create = mode === "create";

  return (
    <div className="-mx-6 mt-4 flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3 border-t border-border px-6 py-3 max-md:-mx-4 max-md:mt-3 max-md:px-4">
      <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-3">
        {create && (
          <>
            <div className="flex flex-wrap items-center gap-2.5">
              <Switch id="opt-password" checked={passwordOn} onChange={setPasswordOn} disabled={publishing || !!published} />
              <label htmlFor="opt-password" className="cursor-pointer text-sm font-medium">
                Password
              </label>
              {passwordOn && (
                <input
                  ref={passwordRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set a password"
                  autoComplete="new-password"
                  aria-label="Password for this page"
                  disabled={publishing || !!published}
                  className="h-8 w-[168px] rounded-md border border-input bg-sheet px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring max-md:h-11 max-md:w-full"
                />
              )}
            </div>
            <Sep />
          </>
        )}
        <div className="flex items-center gap-2.5">
          <label htmlFor="opt-expiry" className="text-sm font-medium">
            Expires
          </label>
          <ExpirationSelect
            id="opt-expiry"
            value={expiresIn}
            onChange={setExpiresIn}
            disabled={publishing || !!published}
            placeholder="Keep current"
          />
        </div>
        {create && (
          <>
            <Sep />
            {/* A new document only; the update API cannot change it. */}
            <BurnAfterReadingToggle enabled={burnAfterReading} onChange={setBurnAfterReading} disabled={publishing || !!published} />
          </>
        )}
        <Sep />
        <Popover>
          <PopoverTrigger
            disabled={publishing || !!published}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-active hover:text-foreground disabled:opacity-50 max-md:h-11"
          >
            <SlidersHorizontal className="size-4" strokeWidth={1.5} aria-hidden />
            More
            {(isPrivate || maxDownloads) && <span className="text-xs text-card-foreground">(set)</span>}
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-64 gap-3 p-3 shadow-none ring-1 ring-border">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="opt-private" className="text-sm font-medium">
                Private
              </label>
              <Switch id="opt-private" checked={isPrivate} onChange={setIsPrivate} />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="opt-max-downloads" className="text-sm font-medium">
                Max downloads
              </label>
              <input
                id="opt-max-downloads"
                type="number"
                min="1"
                placeholder="Unlimited"
                value={maxDownloads}
                onChange={(e) => setMaxDownloads(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-sheet px-3 text-sm tabular-nums outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-4 max-md:ml-0 max-md:w-full max-md:justify-between">
        {published ? (
          <div role="status" className="flex min-w-0 flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-success">
              <Check className="size-4" strokeWidth={1.5} aria-hidden />
              Published
            </span>
            <span className="flex h-8 min-w-0 items-center gap-1 rounded-md border border-border pl-2.5 pr-1">
              <span className="truncate font-mono text-xs">{host}/s/{published.slug}</span>
              <CopyLinkButton slug={published.slug} />
            </span>
            <a
              href={published.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-3 text-sm font-medium hover:bg-active"
            >
              <ExternalLink className="size-3.5" strokeWidth={1.5} aria-hidden />
              Open
            </a>
            <span className="text-xs text-muted-foreground">{published.summary}.</span>
          </div>
        ) : (
          <>
            <p className="min-w-0 text-right text-sm max-md:text-left">
              <span className="block text-xs text-muted-foreground">{create ? "Publishes to" : "Updates"}</span>
              {create ? (
                <span className="whitespace-nowrap">A new short link on {host}</span>
              ) : (
                <span className="whitespace-nowrap font-mono text-xs">
                  {host}/s/{editSlug}
                </span>
              )}
            </p>
            {authLoading ? (
              <Button size="sm" disabled className="max-md:h-11">
                {create ? "Publish" : "Update"}
              </Button>
            ) : !user ? (
              <a
                href={`/auth/login?next=${encodeURIComponent(editSlug ? `/editor?slug=${editSlug}` : "/editor")}`}
                className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/88 max-md:h-11"
              >
                Sign in to publish
              </a>
            ) : (
              <Button
                size="sm"
                className="max-md:h-11"
                disabled={publishing || !content.trim()}
                onClick={create ? handlePublish : handleUpdate}
              >
                {publishing ? (create ? "Publishing" : "Updating") : create ? "Publish" : "Update"}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
