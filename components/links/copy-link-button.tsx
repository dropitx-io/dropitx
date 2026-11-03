"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { SITE_URL } from "@/lib/site-url";

export const shareUrl = (slug: string) => `${SITE_URL}/s/${slug}`;

/** The link as it reads in a row: host and slug, no scheme. */
export const shareLabel = (slug: string) => shareUrl(slug).replace(/^https?:\/\//, "");

export async function copyShareLink(slug: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(shareUrl(slug));
    toast.success("Link copied to clipboard");
    return true;
  } catch {
    toast.error("Failed to copy link");
    return false;
  }
}

/** A small grey icon button that copies a share's public link. */
export function CopyLinkButton({ slug, label = "Copy link" }: { slug: string; label?: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={async () => {
        if (!(await copyShareLink(slug))) return;
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      className="grid size-6 shrink-0 place-items-center rounded-sm text-muted-foreground transition-colors duration-150 hover:bg-active hover:text-foreground max-sm:size-8"
    >
      {done ? <Check className="size-3.5" strokeWidth={1.5} /> : <Copy className="size-3.5" strokeWidth={1.5} />}
    </button>
  );
}
