import Link from "next/link";
import { body, landingButton, reveal, textLink } from "@/components/landing/landing-styles";

/** The product's own output, cropped to sit where the word "file" would be. */
function HeroSlot({ host }: { host: string }) {
  return (
    <span
      data-ui
      role="img"
      aria-label="A Markdown file rendered as a DropItX page"
      className="slot shutter"
    >
      <span className="slot-inner" aria-hidden="true">
        <span className="slot-doc">
          <span className="s-bar">
            <span>{host}/s/release-notes-v1-4</span>
            <span>214 views</span>
          </span>
          <span className="s-body">
            <span className="s-title">Release notes v1.4</span>
            <span className="s-meta">release-notes.md, expires Friday</span>
            <span className="s-p">
              The reader view now follows your system&apos;s dark mode, CSV export is faster on long
              tables, and sign-in no longer loops on Safari 18.
            </span>
            <span className="s-p">Thanks to everyone who sent a report with steps to reproduce.</span>
            <span className="s-p">Next up: comments on shared pages, and a faster editor on long files.</span>
          </span>
        </span>
      </span>
    </span>
  );
}

export function LandingHero({ host }: { host: string }) {
  return (
    <section className="grid min-h-[min(calc(100svh_-_72px),880px)] grid-rows-[1fr_auto_1fr] px-(--m) pb-10 max-[760px]:min-h-0 max-[760px]:grid-rows-[auto_auto] max-[760px]:gap-10 max-[760px]:pt-7 max-[760px]:pb-0">
      <h1 className="display row-start-2 flex flex-nowrap items-baseline gap-x-[0.2em] text-(length:--step-display) max-[760px]:row-start-1 max-[760px]:flex-col max-[760px]:items-stretch max-[760px]:gap-0 max-[760px]:text-[19vw]">
        <span data-reveal style={reveal(0)}>Drop a</span>
        <span className="sr-only"> file,</span>
        <HeroSlot host={host} />
        <span data-reveal style={reveal(1)}>get a link.</span>
      </h1>
      <div className="row-start-3 flex items-end justify-between gap-8 self-end max-[760px]:row-start-2 max-[760px]:flex-col max-[760px]:items-stretch max-[760px]:gap-6">
        <p data-reveal style={reveal(2)} className={`${body} max-w-[27em]`}>
          DropItX turns a Markdown or HTML file into a rendered page behind a short link you control.
        </p>
        <div
          data-reveal
          style={reveal(3)}
          className="flex flex-none items-center gap-7 max-[760px]:flex-col max-[760px]:items-stretch max-[760px]:gap-4"
        >
          <Link
            href="/editor"
            className={`${textLink} py-2.5 text-(length:--step-body) max-[760px]:self-start`}
          >
            Open the editor
          </Link>
          <Link href="/dashboard" className={landingButton()}>
            Upload a file
          </Link>
        </div>
      </div>
    </section>
  );
}
