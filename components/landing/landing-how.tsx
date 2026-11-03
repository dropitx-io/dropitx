"use client";

import { useState, type ReactNode } from "react";
import { body, displayS, reveal } from "@/components/landing/landing-styles";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    name: "Drop",
    clause: "First, drop the file.",
    text: "Markdown and HTML become a rendered page. Anything up to 50 MB can be shared as a file.",
  },
  {
    name: "Protect",
    clause: "Then, choose who reads.",
    text: "A password, a date it expires, burn after the first read, and encryption before upload. Each is one switch.",
  },
  {
    name: "Share",
    clause: "Now, send the link.",
    text: "Paste it in a chat, an issue or an email. With encryption on, the key rides along after the #.",
  },
  {
    name: "Read the numbers",
    clause: "Later, read the numbers.",
    text: "Views over time and the sites they came from. Pro shows referrers; Free shows the count.",
  },
];
const LAST = STAGES.length - 1;
const STOP_ALIGN = ["text-left", "pr-[16%] text-center", "pl-[16%] text-center", "text-right"];

/** One slider drives the clause, the explanation and the product screen beside them. */
export function LandingHow({ fragments }: { fragments: ReactNode[] }) {
  const [stage, setStage] = useState(0);
  const go = (i: number) => setStage(Math.max(0, Math.min(LAST, i)));
  const current = STAGES[stage];

  return (
    <section
      id="how"
      aria-labelledby="how-clause"
      className="mt-(--section-gap) grid min-h-[88svh] grid-cols-2 grid-rows-[1fr_auto] max-[760px]:min-h-0 max-[760px]:grid-cols-1 max-[760px]:grid-rows-[auto_auto_auto]"
    >
      <div className="col-start-1 row-start-1 flex flex-col gap-5 bg-surface pr-(--m-edge) pl-(--m) pt-[clamp(40px,5vw,72px)] pb-10 max-[760px]:row-start-3 max-[760px]:pt-7">
        <h2 id="how-clause" data-reveal aria-live="polite" className={cn(displayS, "min-h-[1.95em] max-w-[7.5em]")}>
          {current.clause}
        </h2>
        <p data-reveal style={reveal(1)} className={cn(body, "min-h-[4.8em] max-w-[26em]")}>
          {current.text}
        </p>
      </div>

      <div className="col-start-2 row-start-1 grid place-items-center bg-field pr-(--m) pl-(--m-edge) py-12 max-[760px]:col-start-1 max-[760px]:min-h-[46svh] max-[760px]:py-8">
        <div data-reveal style={reveal(2)} className="grid w-full max-w-[440px]">
          {fragments.map((f, i) => (
            <div
              key={STAGES[i].name}
              data-ui
              aria-hidden={i !== stage}
              className={cn(
                "ui col-start-1 row-start-1 self-start transition-opacity duration-200",
                i === stage ? "visible opacity-100" : "invisible opacity-0",
              )}
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-full row-start-2 bg-background px-(--m) pt-5 pb-6 max-[760px]:col-start-1">
        <div className="relative h-10 has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-[6px] has-[input:focus-visible]:outline-foreground">
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-4 h-2 bg-(--tone-3)" />
          <span aria-hidden="true" className="pointer-events-none absolute left-0 top-4 h-2 w-4 bg-foreground" />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 top-4 h-2 origin-left bg-foreground transition-transform duration-200 ease-(--ease-standard)"
            style={{ transform: `scaleX(${stage / LAST})` }}
          />
          <input
            type="range"
            min={0}
            max={LAST}
            step={1}
            value={stage}
            onChange={(e) => go(Number(e.target.value))}
            aria-label="Stage"
            aria-valuetext={current.name}
            className="stage-range absolute inset-0 m-0 h-10 w-full"
          />
        </div>
        <ol className="mt-1 grid grid-cols-4 max-[760px]:grid-cols-2 max-[760px]:gap-x-3">
          {STAGES.map((s, i) => (
            <li key={s.name} className={cn(STOP_ALIGN[i], "max-[760px]:p-0 max-[760px]:text-left")}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === stage ? "step" : undefined}
                className={cn(
                  body,
                  "min-h-11 py-2 text-muted-foreground underline-offset-[0.22em] hover:underline aria-[current=step]:font-medium aria-[current=step]:text-foreground",
                )}
              >
                {s.name}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
