"use client";

import { useState, useEffect, useRef, useCallback, useMemo, useSyncExternalStore, type RefObject } from "react";
import { useSearchParams } from "next/navigation";
import type { EditorView } from "@codemirror/view";
import dynamic from "next/dynamic";
import { EditorToolbar } from "@/components/editor-toolbar";
import { EditorPreview } from "@/components/editor-preview";
import { EditorPublishBar } from "@/components/editor-publish-bar";
import { useAutoSave } from "@/lib/use-auto-save";
import { useEditorAutoSave } from "@/lib/use-editor-auto-save";
import type { EditorPaneRef } from "@/components/editor-pane";
import {
  useScrollSync,
  parseHeadings,
  type HeadingInfo,
} from "@/lib/use-scroll-sync";
import { VersionHistory } from "@/components/version-history";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import type { components } from "@/lib/api-types";
import { Ban, Flame, History, Lock, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const EditorPane = dynamic(
  () =>
    import("@/components/editor-pane").then((mod) => mod.EditorPane),
  { ssr: false }
);

type TabMode = "write" | "preview";
type ShareMeta = components["schemas"]["ShareMeta"];

/** Opening a share that deletes itself on its first read would destroy it, so the editor never reads its content. */
function consumedOnRead(meta: ShareMeta): boolean {
  return meta.burn_after_reading || meta.one_time_download;
}

/** Where loading an existing share stands. Anything but "ready" keeps the editor, and its Update button, out of reach. */
type EditorGate =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "blocked"; icon: LucideIcon; title: string; message: string };

const LOAD_FAILED = "Could not load this document.";

function blocked(icon: LucideIcon, title: string, message: string): EditorGate {
  return { status: "blocked", icon, title, message };
}

/** No-op subscription for useSyncExternalStore hydration detection. */
const emptySubscribe = () => () => {};

export function EditorShell() {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug");

  const [content, setContent] = useState("");
  const [tab, setTab] = useState<TabMode>("write");
  // False during SSR/hydration, true on the client after mount — gates the
  // loading skeleton and client-only initialization below.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [editTitle, setEditTitle] = useState<string | undefined>();
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const editorPaneRef = useRef<EditorPaneRef>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const { loading: authLoading } = useAuth();
  const [gate, setGate] = useState<EditorGate>(editSlug ? { status: "loading" } : { status: "ready" });
  const [loadedIsPrivate, setLoadedIsPrivate] = useState(false);
  // Reading content counts a view, so a re-run of the load effect must not read it twice. Set only once the
  // session has been restored: before that the requests carry no credentials and would be refused or misread.
  const loadStartedFor = useRef<string | null>(null);
  // The content last saved by a successful publish or update; edits since then are what the unload warning protects.
  const [publishedContent, setPublishedContent] = useState<string | null>(null);
  const isDirty = content.length > 0 && content !== (publishedContent ?? initialContent ?? "");

  const { hasDraft, restoreDraft, clearDraft } = useEditorAutoSave(content);
  const autoSave = useAutoSave(content, {
    namespace: editSlug ? `edit-${editSlug}` : "editor",
    debounceMs: 2000,
    enabled: mounted,
  });

  useEffect(() => {
    if (!mounted) return;
    if (initialContent !== null) return;

    if (editSlug) {
      if (authLoading) return;
      if (loadStartedFor.current === editSlug) return;
      loadStartedFor.current = editSlug;
      const path = `/api/shares/${encodeURIComponent(editSlug)}`;
      (async (): Promise<EditorGate> => {
        const metaRes = await authFetch(path);
        if (!metaRes.ok) return blocked(TriangleAlert, "This document could not be opened.", await apiErrorDetail(metaRes, LOAD_FAILED));
        const meta = (await metaRes.json()) as ShareMeta;
        const name = meta.title || meta.filename || undefined;
        setEditTitle(name);
        if (!meta.is_owner) {
          return blocked(Ban, "You can only edit your own shares.", "Sign in with the account that published this document to edit it.");
        }
        if (consumedOnRead(meta)) {
          return blocked(
            Flame,
            "This document cannot be edited.",
            `${name ? `"${name}" is` : "It is"} set to delete itself the first time its content is read, so opening it in the editor would destroy it.`,
          );
        }
        if (meta.encrypted) {
          return blocked(Lock, "Encrypted shares can't be edited here.", "Its content is encrypted, and the editor cannot decrypt it. Publish a new document instead.");
        }
        const contentRes = await authFetch(`${path}/content`);
        if (!contentRes.ok) return blocked(TriangleAlert, "This document could not be opened.", await apiErrorDetail(contentRes, LOAD_FAILED));
        const data = (await contentRes.json()) as { content?: string; password_protected?: boolean };
        if (!data.content) {
          return blocked(
            data.password_protected ? Lock : TriangleAlert,
            "This document could not be opened.",
            data.password_protected ? "Its content is protected by a password and was not returned." : "The document has no content to edit.",
          );
        }
        setLoadedIsPrivate(meta.is_private);
        setContent(data.content);
        setInitialContent(data.content);
        return { status: "ready" };
      })()
        .catch(() => blocked(TriangleAlert, "This document could not be opened.", LOAD_FAILED))
        .then(setGate);
      return;
    }

    if (hasDraft) {
      const draft = restoreDraft();
      if (draft && draft.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time initialization from localStorage; must run post-hydration (gated on mounted/hasDraft), lazy init would SSR/hydration-mismatch
        setInitialContent(draft);
        setContent(draft);
      }
    } else {
      setInitialContent("");
    }
  }, [mounted, authLoading, initialContent, hasDraft, restoreDraft, editSlug]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const editorViewRef = {
    get current() {
      return editorPaneRef.current?.editorView ?? null;
    },
  } as RefObject<EditorView | null>;

  const toggleTheme = useCallback(() => {
    document.documentElement.classList.toggle("dark");
  }, []);

  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    if (!mounted) return;
    const update = () => {
      setEffectiveTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [mounted]);

  // Heading parsing + scroll sync
  const headings = useMemo(() => parseHeadings(content), [content]);
  const scrollSyncEnabled = tab !== "preview";

  useScrollSync({
    editorViewRef,
    previewContainerRef,
    headings,
    enabled: scrollSyncEnabled,
  });

  // Image upload handler
  const handleImageFile = useCallback(async (file: File, view: EditorView) => {
    const id = nanoid(8);
    const { from } = view.state.selection.main;
    const placeholder = `![Uploading...](uploading-${id})`;
    const placeholderLen = placeholder.length;

    view.dispatch({ changes: { from, insert: placeholder } });
    const insertPos = from;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await authFetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(await apiErrorDetail(res, "Upload failed"));
      }
      const { url, filename } = await res.json();

      // Verify placeholder still exists at expected position
      const textAtPos = view.state.doc.sliceString(insertPos, insertPos + placeholderLen);
      if (textAtPos === placeholder) {
        view.dispatch({
          changes: {
            from: insertPos,
            to: insertPos + placeholderLen,
            insert: `![${filename}](${url})`,
          },
        });
      }
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      const textAtPos = view.state.doc.sliceString(insertPos, insertPos + placeholderLen);
      if (textAtPos === placeholder) {
        view.dispatch({
          changes: { from: insertPos, to: insertPos + placeholderLen, insert: "" },
        });
      }
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
            <div className="size-3 rounded-sm bg-primary" />
          </div>
          <p className="text-muted-foreground font-mono text-sm">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (gate.status === "loading") {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center bg-background">
        <p className="text-muted-foreground font-mono text-sm">Loading document...</p>
      </div>
    );
  }

  if (gate.status === "blocked") {
    const Icon = gate.icon;
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center bg-background px-4">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <Icon className="size-6 text-orange-500" />
          <p className="font-medium">{gate.title}</p>
          <p className="text-sm text-muted-foreground">{gate.message}</p>
          <a href="/editor">
            <Button variant="outline" size="sm">
              Start a new document
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col bg-background">
      <div className="flex items-center border-b border-border/60 bg-surface/50">
        <div className="flex-1">
          <EditorToolbar
            editorRef={editorViewRef}
            theme={effectiveTheme}
            onToggleTheme={toggleTheme}
          />
        </div>
        {/* Version history toggle — only in edit mode */}
        {editSlug && (
          <div className="pr-3 flex items-center">
            <Button
              variant={showVersionHistory ? "default" : "ghost"}
              size="icon-sm"
              className="rounded-lg"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              title="Version history"
            >
              <History className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Mobile tab bar */}
      <div className="flex border-b border-border/60 md:hidden bg-surface/30">
        <button
          onClick={() => setTab("write")}
          className={`flex-1 py-2.5 text-center text-sm font-medium transition-all duration-200 ${
            tab === "write"
              ? "border-b-2 border-primary text-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Write
        </button>
        <button
          onClick={() => setTab("preview")}
          className={`flex-1 py-2.5 text-center text-sm font-medium transition-all duration-200 ${
            tab === "preview"
              ? "border-b-2 border-primary text-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Preview
        </button>
        {editSlug && (
          <button
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className={`flex-1 py-2.5 text-center text-sm font-medium transition-all duration-200 ${
              showVersionHistory
                ? "border-b-2 border-primary text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            History
          </button>
        )}
      </div>

      {/* Editor + Preview + Version History layout */}
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 overflow-hidden bg-background ${
            tab !== "write" ? "hidden md:block" : ""
          }`}
        >
          <EditorPane
            ref={editorPaneRef}
            content={content}
            onChange={setContent}
            theme={effectiveTheme}
            onImageFile={handleImageFile}
          />
        </div>

        <div
          className={`flex-1 overflow-hidden border-l border-border/60 bg-background ${
            tab !== "preview" ? "hidden md:block" : ""
          }`}
        >
          <EditorPreview
            ref={previewContainerRef}
            content={content}
            headings={headings}
          />
        </div>

        {/* Version History sidebar */}
        {showVersionHistory && editSlug && (
          <div className="w-[320px] shrink-0 border-l border-border/60 overflow-y-auto bg-background hidden md:block">
            <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
              <span className="text-sm font-medium">Version History</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-lg"
                onClick={() => setShowVersionHistory(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="p-3">
              <VersionHistory slug={editSlug} />
            </div>
          </div>
        )}

        {/* Mobile version history panel */}
        {showVersionHistory && editSlug && (
          <div className="flex-1 overflow-y-auto bg-background md:hidden">
            <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
              <span className="text-sm font-medium">Version History</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-lg"
                onClick={() => setShowVersionHistory(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="p-3">
              <VersionHistory slug={editSlug} />
            </div>
          </div>
        )}
      </div>

      <EditorPublishBar
        content={content}
        isDirty={isDirty}
        mode={editSlug ? "edit" : "create"}
        editSlug={editSlug || undefined}
        editTitle={editTitle}
        initialIsPrivate={loadedIsPrivate}
        onPublished={(_slug, _url, saved) => setPublishedContent(saved)}
        draftSavedAt={autoSave.savedAt}
        onClearDraft={() => {
          clearDraft();
          autoSave.clearDraft();
        }}
      />
    </div>
  );
}
