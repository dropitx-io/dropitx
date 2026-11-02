"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { CLI_INSTALL_COMMAND } from "@/lib/cli-install";
import { squareButton } from "@/app/(content)/_ui/public-styles";

export function CopyInstallButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(CLI_INSTALL_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable: the command text stays visible and selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={squareButton("quiet", "small")}
    >
      {copied ? (
        <Check className="size-4" strokeWidth={2.4} />
      ) : (
        <Copy className="size-4" />
      )}
      {copied ? "Copied" : "Copy the install command"}
    </button>
  );
}
