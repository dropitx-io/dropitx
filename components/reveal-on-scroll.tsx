"use client";

import { useEffect } from "react";

/**
 * Staggered section entrances for marketing pages. Content renders visible;
 * this arms the hidden state only once script runs, then reveals each
 * [data-reveal] element as it enters. Stagger order comes from --reveal-i.
 */
export function RevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (els.length === 0 || !("IntersectionObserver" in window)) return;

    root.classList.add("reveal-armed");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      root.classList.remove("reveal-armed");
    };
  }, []);

  return null;
}
