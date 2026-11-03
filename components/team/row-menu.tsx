"use client";

import { useState } from "react";
import { Check, Loader2, MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface RowMenuItem {
  label: string;
  onSelect: () => void;
  checked?: boolean;
  danger?: boolean;
  /** Draws a rule above this item. */
  separated?: boolean;
}

/** A row's actions behind a "more" button, in a small floating menu edged by a 1px ring. */
export function RowMenu({ label, items, busy }: { label: string; items: RowMenuItem[]; busy?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={label}
        disabled={busy}
        className="inline-grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-active hover:text-card-foreground disabled:cursor-default max-sm:size-11"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" strokeWidth={1.5} />}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 gap-0 bg-sheet p-1 shadow-none ring-1 ring-border">
        <div role="menu" aria-label={label} className="grid">
          {items.map((item) => (
            <div key={item.label}>
              {item.separated && <hr className="my-1 border-rule" />}
              <button
                type="button"
                role={item.checked === undefined ? "menuitem" : "menuitemradio"}
                aria-checked={item.checked}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={cn(
                  "flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-left text-sm hover:bg-raised max-sm:h-11",
                  item.danger ? "text-destructive" : "text-card-foreground",
                )}
              >
                <span className="flex-1">{item.label}</span>
                {item.checked && <Check className="size-4" strokeWidth={1.5} />}
              </button>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
