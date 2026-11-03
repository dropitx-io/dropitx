"use client";

import { useState, useSyncExternalStore } from "react";
import { DocBody, DocLine } from "@/components/landing/showcase-doc";
import { SAMPLES } from "@/components/landing/showcase-samples";
import { blocksToMarkdown, byteCount, formatBytes, slugify } from "@/components/landing/markdown-line";
import { head, reveal, small } from "@/components/landing/landing-styles";

const noop = () => () => {};
const lineType =
  "font-light tracking-[-0.045em] text-(length:--step-display-s) leading-[1.05] pt-[0.06em] pb-[0.12em]";

/**
 * One line of Markdown becomes a rendered page and the link it would get.
 * Runs entirely in the browser and never calls the API; the server render
 * with the first sample is the no-script fallback.
 */
export function LandingShowcase({ host }: { host: string }) {
  const [sample, setSample] = useState(0);
  const [line, setLine] = useState(SAMPLES[0].line);
  const [copied, setCopied] = useState("");
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  const current = SAMPLES[sample];
  const link = `${host}/s/${slugify(line)}`;
  const size = formatBytes(byteCount(line, blocksToMarkdown(current.body)));

  function pick(i: number) {
    setSample(i);
    setLine(SAMPLES[i].line);
    setCopied("");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
      setCopied("Copied. It goes live once you share.");
    } catch {
      setCopied("Copy failed; select the link instead.");
    }
  }

  return (
    <section id="showcase" className="mt-(--section-gap) px-(--m)">
      <h2 data-reveal className={`${head} mb-[clamp(16px,2vw,28px)]`}>
        <label htmlFor="landing-line">Or write it right here.</label>
      </h2>
      <div data-reveal style={reveal(1)} className="group relative focus-within:bg-surface has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-[6px] has-[input:focus-visible]:outline-foreground">
        <input
          id="landing-line"
          type="text"
          value={line}
          onChange={(e) => {
            setLine(e.target.value);
            setCopied("");
          }}
          spellCheck={false}
          autoComplete="off"
          aria-describedby="landing-line-help"
          className={`${lineType} block w-full rounded-none bg-transparent caret-foreground outline-none`}
        />
        <span aria-hidden="true" className={`${lineType} pointer-events-none absolute inset-0 overflow-hidden whitespace-pre group-focus-within:hidden`}>
          <span className="invisible">{line}</span>
          <span className="line-caret" />
        </span>
      </div>
      <p id="landing-line-help" className="sr-only">
        One line of Markdown. The preview and the link below update as you type.
      </p>

      <div className="mt-12 grid grid-cols-12 items-start gap-x-(--gutter) gap-y-7 max-[760px]:mt-7 max-[760px]:grid-cols-4">
        <article
          data-ui
          data-reveal
          style={reveal(2)}
          aria-label="Rendered preview"
          className="ui col-span-6 max-w-[560px] max-[760px]:col-span-full max-[760px]:max-w-none"
        >
          <div className="ui-bar">
            <span className="ui-url">{link}</span>
            <span>Preview</span>
          </div>
          <div className="ui-pad doc min-h-[360px] px-8 pt-7 pb-8 max-[760px]:min-h-0 max-[760px]:p-5">
            <DocLine line={line} />
            <p className="doc-meta">{current.file}</p>
            <DocBody blocks={current.body} />
          </div>
        </article>

        <div className="col-span-5 col-start-8 grid gap-7 max-[760px]:col-span-full max-[760px]:col-start-1">
          <div data-ui data-reveal style={reveal(3)} aria-label="The link that would be created" className="ui">
            <div className="ui-pad">
              <p className="ui-label">Your link would be</p>
              <p className="link-big">{link}</p>
              <div className="mt-4">
                <div className="ui-row"><span className="ui-label">Renders as</span><span className="ui-value">Markdown page</span></div>
                <div className="ui-row"><span className="ui-label">Size</span><span className="ui-value">{size} of 50 MB</span></div>
                <div className="ui-row"><span className="ui-label">Who can open it</span><span className="ui-value">Anyone with the link</span></div>
              </div>
              {hydrated && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={copy} className="ui-btn press">Copy link</button>
                  <span className="ui-label" aria-live="polite">{copied}</span>
                </div>
              )}
            </div>
          </div>
          <p data-reveal style={reveal(4)} className={`${small} text-muted-foreground`}>
            This is a preview. Nothing is uploaded or published until you sign in and press Share.
          </p>
          {hydrated ? (
            <div role="group" aria-labelledby="landing-chips" className="flex flex-wrap gap-x-3 gap-y-2.5">
              <p id="landing-chips" className="mb-1 w-full text-(length:--step-small)">Try another first line</p>
              {SAMPLES.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  aria-pressed={i === sample && line === s.line}
                  onClick={() => pick(i)}
                  className="press min-h-11 rounded-none bg-surface px-4 text-(length:--step-body) hover:bg-(--tone-3) aria-pressed:bg-foreground aria-pressed:text-background"
                >
                  {s.label}
                </button>
              ))}
            </div>
          ) : (
            <noscript>
              <p className="text-(length:--step-small)">With JavaScript off, the preview shows the example above.</p>
            </noscript>
          )}
        </div>
      </div>
    </section>
  );
}
