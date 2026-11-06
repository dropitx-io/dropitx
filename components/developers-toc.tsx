"use client";

import { useEffect, useState } from "react";

export type TocEntry = { id: string; label: string };

/**
 * "On this page": anchor links to each section. While script runs, the link
 * for the section in view is marked as the current location. Anchor jumps
 * land below the sticky nav through scroll-padding-top / scroll-margin-top.
 */
export function DevelopersToc({ entries }: { entries: TocEntry[] }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const spy = new IntersectionObserver(
      (records) => {
        for (const r of records) if (r.isIntersecting) setCurrent(r.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    for (const e of entries) {
      const el = document.getElementById(e.id);
      if (el) spy.observe(el);
    }
    return () => spy.disconnect();
  }, [entries]);

  return (
    <nav className="docs-side" aria-labelledby="toc-title" data-testid="developers-toc">
      <h2 id="toc-title">On this page</h2>
      <ul>
        {entries.map((e) => (
          <li key={e.id}>
            <a href={`#${e.id}`} aria-current={current === e.id ? "location" : undefined}>
              {e.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
