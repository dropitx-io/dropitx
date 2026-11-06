"use client";

import { useEffect, useRef, useState } from "react";
import { CLI_INSTALL_COMMAND } from "@/lib/cli-install";
import { cn } from "@/lib/utils";

type CopyState = "idle" | "copied" | "failed";

const LABEL: Record<CopyState, string> = { idle: "Copy", copied: "Copied", failed: "Copy failed" };

/**
 * The Copy button in a code block's header: writes `text` to the clipboard and
 * confirms for 1.6s. If the Clipboard API is unavailable it says so; the
 * command stays visible and selectable in the block.
 */
export function CopyCodeButton({ text, label = "Copy", className, testId }: { text: string; label?: string; className?: string; testId?: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch (err: unknown) {
      console.error("Copying to the clipboard failed", err);
      setState("failed");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1600);
  }

  return (
    <button type="button" onClick={copy} className={cn("cb-copy", className)} data-testid={testId} aria-live="polite">
      {state === "idle" ? label : LABEL[state]}
    </button>
  );
}

/** Copies the CLI install command (lib/cli-install.ts). */
export function CopyInstallButton({ className }: { className?: string }) {
  return <CopyCodeButton text={CLI_INSTALL_COMMAND} className={className} testId="copy-install-button" />;
}
