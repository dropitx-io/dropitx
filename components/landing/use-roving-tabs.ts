"use client";

import { useRef, useState } from "react";

const STEP: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

/**
 * State and keyboard handling for a WAI-ARIA tab set: arrow keys move and
 * select, Home and End jump to the ends, and only the selected tab is in the
 * tab order. Returns props to spread on each tab.
 */
export function useRovingTabs(count: number, initial = 0) {
  const [selected, setSelected] = useState(initial);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  function select(i: number, focus: boolean) {
    const next = (i + count) % count;
    setSelected(next);
    if (focus) tabs.current[next]?.focus();
  }

  function tabProps(i: number) {
    return {
      ref: (el: HTMLButtonElement | null) => {
        tabs.current[i] = el;
      },
      role: "tab" as const,
      type: "button" as const,
      "aria-selected": selected === i,
      tabIndex: selected === i ? 0 : -1,
      onClick: () => select(i, false),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key in STEP) {
          e.preventDefault();
          select(i + STEP[e.key], true);
        } else if (e.key === "Home") {
          e.preventDefault();
          select(0, true);
        } else if (e.key === "End") {
          e.preventDefault();
          select(count - 1, true);
        }
      },
    };
  }

  return { selected, tabProps };
}
