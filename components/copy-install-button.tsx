"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { CLI_INSTALL_COMMAND } from "@/lib/cli-install";

export function CopyInstallButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(CLI_INSTALL_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — the command text stays visible/selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy install command"}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-card px-4.5 text-sm font-semibold clay-raised transition-transform hover:-translate-y-px"
    >
      {copied ? (
        <Check className="size-4 text-success" strokeWidth={2.4} />
      ) : (
        <Copy className="size-4" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
