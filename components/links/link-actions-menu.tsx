"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ChartLine, Copy, Ellipsis, ExternalLink, Trash2 } from "lucide-react";
import { useDismiss } from "@/components/app-shell/use-dismiss";
import { copyShareLink, shareUrl } from "@/components/links/copy-link-button";
import { cn } from "@/lib/utils";

const itemClass =
  "flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-left text-sm text-card-foreground transition-colors duration-150 hover:bg-raised disabled:opacity-50 max-sm:h-11";

interface LinkActionsMenuProps {
  slug: string;
  name: string;
  deleting: boolean;
  /** Present only for the caller's own shares, which alone have Analytics and Delete. */
  onDelete?: () => void;
}

/** The row's kebab: copy, open, analytics and delete. */
export function LinkActionsMenu({ slug, name, deleting, onDelete }: LinkActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, rootRef, close);

  const icon = "size-4 text-muted-foreground";

  return (
    <div className="relative inline-block" ref={rootRef}>
      <button
        type="button"
        aria-label={`Actions for ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-active hover:text-foreground aria-expanded:bg-active max-sm:size-11"
      >
        <Ellipsis className="size-4" strokeWidth={1.5} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-1 w-48 rounded-lg border border-border bg-popover p-1">
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              close();
              void copyShareLink(slug);
            }}
          >
            <Copy className={icon} strokeWidth={1.5} aria-hidden />
            Copy link
          </button>
          <a href={shareUrl(slug)} target="_blank" rel="noopener noreferrer" role="menuitem" className={itemClass} onClick={close}>
            <ExternalLink className={icon} strokeWidth={1.5} aria-hidden />
            Open page
          </a>
          {onDelete && (
            <>
              <Link href={`/dashboard/analytics/${slug}`} role="menuitem" className={itemClass} onClick={close}>
                <ChartLine className={icon} strokeWidth={1.5} aria-hidden />
                Analytics
              </Link>
              <div className="my-1 border-t border-rule" />
              <button
                type="button"
                role="menuitem"
                disabled={deleting}
                className={cn(itemClass, "text-destructive")}
                onClick={() => {
                  close();
                  onDelete();
                }}
              >
                <Trash2 className="size-4" strokeWidth={1.5} aria-hidden />
                {deleting ? "Deleting" : "Delete link"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
