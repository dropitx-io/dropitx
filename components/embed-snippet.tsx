"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { SITE_URL } from "@/lib/site-url";

interface EmbedSnippetProps {
  slug: string;
}

export function EmbedSnippet({ slug }: EmbedSnippetProps) {
  const [copied, setCopied] = useState(false);
  const embedCode = `<iframe src="${SITE_URL}/embed/${slug}" width="600" height="400" frameborder="0" loading="lazy" title="DropItX Embed"></iframe>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-card-foreground">Embed</span>
      <div className="flex items-center gap-2">
        <code className="flex-1 overflow-x-auto rounded-md bg-raised p-3 font-mono text-xs break-all text-card-foreground">{embedCode}</code>
        <Button variant="outline" size="icon" onClick={handleCopy} aria-label={copied ? "Copied" : "Copy embed code"} className="shrink-0">
          {copied ? <Check className="size-4" strokeWidth={1.5} /> : <Copy className="size-4" strokeWidth={1.5} />}
        </Button>
      </div>
    </div>
  );
}
