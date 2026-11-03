import Link from "next/link";
import { body, landingButton, reveal } from "@/components/landing/landing-styles";
import { cn } from "@/lib/utils";

const edge = "display text-(length:--step-display) max-[760px]:text-[19vw]";

/** The closing question, split to the top and bottom edges with both answers between. */
export function LandingAsk() {
  return (
    <section
      id="start"
      aria-labelledby="ask-title"
      className="mt-(--section-gap) grid min-h-svh grid-rows-[auto_1fr_auto] bg-(--tone-2) px-(--m) pt-8 pb-6 text-center max-[760px]:min-h-[88svh]"
    >
      <h2 id="ask-title" className="contents">
        <span data-reveal className={cn(edge, "row-start-1")}>
          Upload or
        </span>
        <span data-reveal style={reveal(2)} className={cn(edge, "row-start-3")}>
          write?
        </span>
      </h2>
      <div className="row-start-2 grid justify-items-center gap-4 self-center">
        <div
          data-reveal
          style={reveal(1)}
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-10 max-[760px]:w-[80vw] max-[760px]:grid-cols-1 max-[760px]:gap-3"
        >
          <Link
            href="/dashboard"
            className={cn(landingButton(), "min-h-14 min-w-[220px] justify-self-end max-[760px]:w-full max-[760px]:justify-self-stretch")}
          >
            Upload a file
          </Link>
          <span className="text-(length:--step-body) text-muted-foreground">or</span>
          <Link
            href="/editor"
            className={cn(landingButton("quiet"), "min-h-14 min-w-[220px] justify-self-start max-[760px]:w-full max-[760px]:justify-self-stretch")}
          >
            Open the editor
          </Link>
        </div>
        <p data-reveal style={reveal(2)} className={cn(body, "max-w-[30em]")}>
          Either way you get a page and a short link. Change its options or delete it whenever you like.
        </p>
      </div>
    </section>
  );
}
