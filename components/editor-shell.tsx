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
} from "@/lib/use-scroll-sync";
import { VersionHistory } from "@/components/version-history";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import type { components } from "@/lib/api-types";
import { Ban, History, Lock, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { EditorBlocked, EditorSkeleton, Pane } from "@/components/app-shell/editor-panes";
import { Button } from "@/components/ui/button";

const EditorPane = dynamic(
  () =>
    import("@/components/editor-pane").then((mod) => mod.EditorPane),
  { ssr: false }
);

type TabMode = "write" | "preview" | "history";

const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
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
  const [title, setTitle] = useState("");
  const [initialTitle, setInitialTitle] = useState("");
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const handleCursorChange = useCallback((line: number, column: number) => setCursor({ line, column }), []);
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
            TriangleAlert,
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
        setTitle(meta.title ?? "");
        setInitialTitle(meta.title ?? "");
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

  // The site is light only: the editor always uses its light theme.
  const effectiveTheme = "light" as const;

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

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const status = [
    isDirty ? "Unsaved changes" : null,
    autoSave.savedAt ? `draft saved ${timeFormat.format(autoSave.savedAt)}` : null,
  ].filter(Boolean);
  const statusLine = status.length
    ? `${status.join(", ")}.`.replace(/^./, (c) => c.toUpperCase())
    : editSlug
      ? "No changes since it was opened."
      : "A draft saves in this browser as you type.";

  if (!mounted || gate.status === "loading") {
    return <EditorSkeleton label={mounted ? "Loading document" : "Loading editor"} />;
  }

  if (gate.status === "blocked") {
    return <EditorBlocked icon={gate.icon} title={gate.title} message={gate.message} />;
  }

  const tabs: { id: TabMode; label: string }[] = [
    { id: "write", label: "Write" },
    { id: "preview", label: "Preview" },
    ...(editSlug ? [{ id: "history" as const, label: "History" }] : []),
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-[-0.01em] text-card-foreground max-sm:text-[22px]">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              placeholder={editTitle ?? "Untitled document"}
              aria-label="Document title"
              spellCheck={false}
              className="-mx-1.5 w-[calc(100%+12px)] truncate rounded-md bg-transparent px-1.5 outline-none transition-colors duration-150 placeholder:text-muted-foreground hover:bg-raised focus-visible:bg-sheet focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            />
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{statusLine}</p>
        </div>
        {editSlug && (
          <Button
            variant="outline"
            size="sm"
            aria-pressed={showVersionHistory}
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="shrink-0 max-md:hidden"
          >
            <History className="size-3.5" strokeWidth={1.5} aria-hidden />
            Version history
          </Button>
        )}
      </div>

      <div role="group" aria-label="Show" className="mb-3 inline-flex w-max shrink-0 rounded-lg border border-border bg-raised p-0.5 md:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`h-9 rounded-md px-3 text-sm transition-colors duration-150 ${
              tab === t.id ? "bg-sheet font-medium text-foreground ring-1 ring-border" : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        className={`grid min-h-0 flex-1 gap-4 ${
          showVersionHistory && editSlug
            ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px]"
            : "md:grid-cols-2"
        }`}
      >
        <Pane
          title="Markdown"
          meta={<span className="max-lg:hidden">Line {cursor.line}, column {cursor.column}</span>}
          actions={<EditorToolbar editorRef={editorViewRef} />}
          className={tab !== "write" ? "max-md:hidden" : undefined}
        >
          <EditorPane
            ref={editorPaneRef}
            content={content}
            onChange={setContent}
            theme={effectiveTheme}
            onImageFile={handleImageFile}
            onCursorChange={handleCursorChange}
          />
        </Pane>

        <Pane
          title="Preview"
          meta={`${words.toLocaleString("en")} ${words === 1 ? "word" : "words"}, ${content.length.toLocaleString("en")} characters${words ? `, ${Math.ceil(words / 200)} min read` : ""}`}
          className={tab !== "preview" ? "max-md:hidden" : undefined}
        >
          <EditorPreview ref={previewContainerRef} content={content} headings={headings} />
        </Pane>

        {editSlug && (showVersionHistory || tab === "history") && (
          <Pane
            title="Version history"
            className={`${showVersionHistory ? "" : "md:hidden"} ${tab !== "history" ? "max-md:hidden" : ""}`}
            bodyClassName="overflow-y-auto p-4"
            actions={
              <button
                type="button"
                onClick={() => setShowVersionHistory(false)}
                aria-label="Close version history"
                className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-active hover:text-foreground max-md:hidden"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            }
          >
            <VersionHistory slug={editSlug} />
          </Pane>
        )}
      </div>

      <EditorPublishBar
        content={content}
        title={title}
        initialTitle={initialTitle}
        mode={editSlug ? "edit" : "create"}
        editSlug={editSlug || undefined}
        initialIsPrivate={loadedIsPrivate}
        onPublished={(_slug, _url, saved) => setPublishedContent(saved)}
        onClearDraft={() => {
          clearDraft();
          autoSave.clearDraft();
        }}
      />
    </div>
  );
}
