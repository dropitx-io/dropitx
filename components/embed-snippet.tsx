"use client";

import { useState } from "react";
import { SITE_URL } from "@/lib/site-url";

interface EmbedSnippetProps {
  slug: string;
}

type CopyState = "idle" | "copied" | "failed";

/** The iframe snippet for a public share, in a rail card with a Copy button. */
export function EmbedSnippet({ slug }: EmbedSnippetProps) {
  const [state, setState] = useState<CopyState>("idle");
  const embedCode = `<iframe src="${SITE_URL}/embed/${slug}" width="600" height="400" frameborder="0" loading="lazy" title="DropItX Embed"></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setState("copied");
    } catch (err: unknown) {
      console.error("Copying the embed code failed", err);
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  };

  return (
    <div className="card card-pad">
      <div className="row-between">
        <p className="ui-text font-medium">Embed</p>
        <button type="button" className="btn btn-secondary copy-btn" onClick={handleCopy} aria-live="polite" data-testid="share-embed-copy">
          {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy code"}
        </button>
      </div>
      <code className="block overflow-x-auto rounded-sm bg-white p-3 font-mono text-xs break-all text-foreground shadow-[var(--elev-ring)]">
        {embedCode}
      </code>
    </div>
  );
}
