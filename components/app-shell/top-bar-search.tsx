"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

/**
 * Search over the caller's own links. Submitting opens the Links screen with `?q=`, which the
 * list reads as its filter; Cmd/Ctrl+K focuses it from anywhere in the app.
 */
export function TopBarSearch({ shortcut = false }: { shortcut?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const q = useSearchParams().get("q") ?? "";

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shortcut]);

  return (
    <form action="/dashboard" role="search" className="relative flex h-8 w-full items-center max-md:h-11">
      <label htmlFor={shortcut ? "app-search" : "app-search-phone"} className="sr-only">
        Search links
      </label>
      <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden />
      <input
        ref={inputRef}
        id={shortcut ? "app-search" : "app-search-phone"}
        key={q}
        type="search"
        name="q"
        defaultValue={q}
        autoComplete="off"
        placeholder="Search links by name or slug"
        className="size-full rounded-md border border-border bg-sheet pl-9 pr-14 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus-visible:border-input focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
      />
      {shortcut && (
        <kbd className="pointer-events-none absolute right-2 rounded-sm border border-border px-1.5 text-[11px] leading-[18px] text-muted-foreground">
          ⌘K
        </kbd>
      )}
    </form>
  );
}
