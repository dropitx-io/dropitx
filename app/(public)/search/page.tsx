"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";
import type { SearchResult } from "@/types/share";
import { apiErrorDetail, getApiUrl } from "@/lib/api-client";
import { PublicNav } from "@/app/(content)/_ui/public-nav";
import { body, displayS, gutter, notice, page } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const trimmedParam = queryParam.trim();

  const [query, setQuery] = useState(trimmedParam);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync query from URL search params (adjust state during render — React's
  // recommended pattern for mirroring a prop/param into state).
  const [prevParam, setPrevParam] = useState(trimmedParam);
  if (trimmedParam !== prevParam) {
    setPrevParam(trimmedParam);
    setQuery(trimmedParam);
  }

  const performSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        getApiUrl(`/api/search?q=${encodeURIComponent(term)}`),
        { signal: controller.signal },
      );
      if (!res.ok) {
        setError(await apiErrorDetail(res, "Search failed"));
        setResults([]);
        return;
      }
      const data = await res.json();
      setResults(data.results ?? []);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Network error. Please try again.");
      setResults([]);
    } finally {
      if (abortRef.current === controller) setIsLoading(false);
    }
  }, []);

  // Re-search when query changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- search-on-query-change; setStates run after await inside performSearch (or clear stale results for short queries)
    performSearch(query);
  }, [query, performSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return (
    <div className={page}>
      <PublicNav current="/search" />
      <main id="main" className={cn(gutter, "flex-1 pb-[clamp(56px,7vw,112px)] pt-[clamp(32px,5vw,72px)]")}>
        <h1 className={cn(displayS, "max-w-[8em]")}>Search shared pages</h1>

        <div className="mt-[clamp(32px,4vw,56px)]">
          <SearchBar initialValue={query} />
        </div>

        {error && (
          <p role="alert" className={cn(body, notice.error, "mt-6 max-w-[40em]")}>
            {error}
          </p>
        )}

        <div className="mt-[clamp(40px,5vw,72px)]">
          <SearchResults results={results} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
