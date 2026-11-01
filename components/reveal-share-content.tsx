"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareFileContent } from "@/components/share-file-content";
import { authFetch } from "@/lib/api-client";
import { unlockShare } from "@/lib/share-unlock";
import type { ShareFileContent as ShareFileContentValue } from "@/types/share-content";

interface RevealShareContentProps {
  slug: string;
  filename?: string | null;
  mimeType?: string | null;
  /** Called once with the content after a successful reveal. */
  onRevealed?: (content: ShareFileContentValue) => void;
  /** Password of a protected file the visitor already unlocked: the reveal goes through the unlock endpoint with it. */
  password?: string;
  /** Called when the unlock refuses `password`, so the caller can remember it and show its own notice. */
  onWrongPassword?: () => void;
}

/** The warning shown before anything that deletes itself on its first read is opened. */
export function OnceOnlyNotice() {
  return (
    <>
      <p className="font-medium">This content can be opened only once.</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Once you reveal it, it is deleted and cannot be viewed again. Copy anything you need to keep.
      </p>
    </>
  );
}

type RevealState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "wrong-password" }
  | { status: "protected" }
  | { status: "failed" }
  | { status: "revealed"; content: ShareFileContentValue };

/**
 * Reveal gate for a share that deletes itself on its first content read
 * (burn after reading, one-time download). The content is fetched only when the
 * visitor asks for it, so a link preview or prefetch never consumes the share.
 */
export function RevealShareContent({
  slug,
  filename,
  mimeType,
  onRevealed,
  password,
  onWrongPassword,
}: RevealShareContentProps) {
  const [state, setState] = useState<RevealState>({ status: "idle" });
  // A ref, not state: two clicks in one frame both see the same stale state.
  const inFlight = useRef(false);

  const reveal = async () => {
    if (inFlight.current || state.status === "revealed") return;
    inFlight.current = true;
    setState({ status: "loading" });
    try {
      if (password !== undefined) {
        const result = await unlockShare(slug, password);
        if (result.status === "ok" && result.content) {
          const revealed = { content: result.content, encoding: result.encoding };
          setState({ status: "revealed", content: revealed });
          onRevealed?.(revealed);
        } else if (result.status === "wrong") {
          setState({ status: "wrong-password" });
          onWrongPassword?.();
        } else {
          setState({ status: result.status === "ok" || result.status === "gone" ? "unavailable" : "failed" });
        }
        return;
      }
      const res = await authFetch(`/api/shares/${encodeURIComponent(slug)}/content`);
      if (res.ok) {
      const data = (await res.json()) as {
        content?: string;
        encoding?: ShareFileContentValue["encoding"];
        password_protected?: boolean;
      };
        if (data.password_protected && !data.content) {
          setState({ status: "protected" });
          return;
        }
        const content = { content: data.content ?? "", encoding: data.encoding ?? "utf8" };
        setState({ status: "revealed", content });
        onRevealed?.(content);
      } else if (res.status === 404 || res.status === 410) {
        setState({ status: "unavailable" });
      } else {
        setState({ status: "failed" });
      }
    } catch {
      setState({ status: "failed" });
    } finally {
      inFlight.current = false;
    }
  };

  if (state.status === "revealed") {
    return <ShareFileContent content={state.content} filename={filename} mimeType={mimeType} />;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      {state.status === "unavailable" ? (
        <p className="text-sm text-muted-foreground">This content is no longer available.</p>
      ) : state.status === "protected" ? (
        <p className="text-sm text-muted-foreground">This file is password protected.</p>
      ) : state.status === "wrong-password" ? (
        <p className="text-sm text-muted-foreground">This file has a different password.</p>
      ) : (
        <>
          <OnceOnlyNotice />
          <Button onClick={reveal} disabled={state.status === "loading"}>
            {state.status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Revealing…
              </>
            ) : (
              "Reveal content"
            )}
          </Button>
          {state.status === "failed" && (
            <p className="text-sm text-destructive">Could not load the content. Try again.</p>
          )}
        </>
      )}
    </div>
  );
}
