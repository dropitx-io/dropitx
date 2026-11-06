"use client";

import { useRef, useState } from "react";
import { body, squareButton } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";
import { ShareFileContent } from "@/components/share-file-content";
import { authFetch } from "@/lib/api-client";
import { unlockShare } from "@/lib/share-unlock";
import type { ShareFilePayload } from "@/types/share-content";

interface RevealShareContentProps {
  slug: string;
  filename?: string | null;
  mimeType?: string | null;
  /** Called once with the content after a successful reveal. */
  onRevealed?: (content: ShareFilePayload) => void;
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
      <p className="max-w-[34em]">
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
  | { status: "revealed"; content: ShareFilePayload };

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
        encoding?: ShareFilePayload["encoding"];
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
    <div className={cn(body, "card card-pad grid max-w-[34em] justify-items-start gap-4")} data-testid="share-reveal">
      {state.status === "unavailable" ? (
        <p>This content is no longer available.</p>
      ) : state.status === "protected" ? (
        <p>This file is password protected.</p>
      ) : state.status === "wrong-password" ? (
        <p>This file has a different password.</p>
      ) : (
        <>
          <OnceOnlyNotice />
          <button
            type="button"
            onClick={reveal}
            disabled={state.status === "loading"}
            aria-busy={state.status === "loading"}
            className={cn(squareButton(), "mt-2")}
          >
            {state.status === "loading" ? "Revealing the content" : "Reveal the content"}
          </button>
          {state.status === "failed" && (
            <p role="alert" className="field-error">
              Could not load the content. Try again.
            </p>
          )}
        </>
      )}
    </div>
  );
}
