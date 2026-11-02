"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { field } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  initialValue?: string;
  compact?: boolean;
}

export function SearchBar({ initialValue = "", compact = false }: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Sync value when initialValue changes (adjust state during render —
  // React's recommended pattern for mirroring a prop into state).
  const [prevInitial, setPrevInitial] = useState(initialValue);
  if (initialValue !== prevInitial) {
    setPrevInitial(initialValue);
    setValue(initialValue);
  }

  const navigateToSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (trimmed.length < 2) return;
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [router],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setValue(next);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => navigateToSearch(next), 300);
    },
    [navigateToSearch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (timerRef.current) clearTimeout(timerRef.current);
        navigateToSearch(value);
      }
    },
    [navigateToSearch, value],
  );

  const handleClear = useCallback(() => {
    setValue("");
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={cn("relative w-full", compact ? "max-w-md" : "max-w-[40em]")}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
      />

      <Input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search by title or words in the page"
        aria-label="Search shared pages"
        className={cn(field, "min-h-[56px] pl-12 pr-14")}
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
