"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CopyLinkButtonProps {
  url: string;
  /** Visible label; without one the button is a small icon button. */
  label?: string;
  primary?: boolean;
}

/** Copies a URL and confirms with a toast. */
export function CopyLinkButton({ url, label, primary }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        toast.success("Link copied");
        setTimeout(() => setCopied(false), 1500);
      },
      () => toast.error("Could not copy the link"),
    );
  }

  const Icon = copied ? Check : Copy;
  if (!label) {
    return (
      <Button type="button" variant="ghost" size="icon-xs" onClick={copy} aria-label="Copy link" className="text-muted-foreground">
        <Icon className="size-4" strokeWidth={1.5} />
      </Button>
    );
  }
  return (
    <Button type="button" variant={primary ? "default" : "outline"} size="sm" onClick={copy}>
      <Icon className="size-4" strokeWidth={1.5} />
      {label}
    </Button>
  );
}
