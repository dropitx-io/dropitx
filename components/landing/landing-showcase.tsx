"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { DocBlocks } from "@/components/landing/showcase-doc";
import { SAMPLES } from "@/components/landing/showcase-samples";
import { ACCEPT, readFileForPreview } from "@/components/landing/file-preview";
import { useFileIntake } from "@/components/landing/use-file-intake";
import { documentTitle, formatBytes, parseDocument, slugify } from "@/components/landing/markdown-line";

/**
 * The hero's live studio: Markdown on the left, the rendered page and the link
 * it would get on the right. Chips load examples, "Upload a file" opens a file
 * picker, and a file dropped anywhere on the page is previewed here. It runs
 * entirely in the browser and never calls the API; the server render with the
 * first sample is what a reader without script sees.
 */
export function LandingShowcase({ host }: { host: string }) {
  const [text, setText] = useState(SAMPLES[0].text);
  const [file, setFile] = useState(SAMPLES[0].file);
  const [kind, setKind] = useState("Markdown page");
  const [sample, setSample] = useState<number | null>(0);
  const [copyLabel, setCopyLabel] = useState("Copy link");
  const [status, setStatus] = useState("");
  const studioRef = useRef<HTMLDivElement>(null);

  const blocks = useMemo(() => parseDocument(text), [text]);
  const slug = slugify(documentTitle(text, file));
  const size = formatBytes(new TextEncoder().encode(text).length);

  const takeFile = useCallback(async (f: File) => {
    const result = await readFileForPreview(f, formatBytes);
    if (!result.ok) {
      setStatus(result.message);
      return;
    }
    setText(result.text);
    setFile(f.name);
    setKind(result.kind === "html" ? "HTML page" : "Markdown page");
    setSample(null);
    setStatus(`Previewing ${f.name} below. Sign in to publish it.`);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    studioRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, []);

  const pickerRef = useFileIntake(takeFile);

  function loadSample(i: number) {
    setText(SAMPLES[i].text);
    setFile(SAMPLES[i].file);
    setKind("Markdown page");
    setSample(i);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`https://${host}/s/${slug}`);
      setCopyLabel("Copied");
    } catch (err: unknown) {
      console.error("Copying the preview link failed", err);
      setCopyLabel("Copy failed");
    }
    window.setTimeout(() => setCopyLabel("Copy link"), 1800);
  }

  return (
    <>
      <p className="ui-text fg-2 upload-status" role="status" aria-live="polite">{status}</p>
      <input
        ref={pickerRef}
        type="file"
        accept={ACCEPT}
        hidden
        data-testid="landing-file-input"
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (picked) void takeFile(picked);
          e.target.value = "";
        }}
      />
      <div ref={studioRef} id="studio" className="studio rise" style={{ "--i": 3 } as React.CSSProperties}>
        <div className="studio-top">
          <div className="studio-samples" role="group" aria-label="Example documents">
            <span className="ui-text">Try an example</span>
            {SAMPLES.map((s, i) => (
              <button key={s.file} className="pill" type="button" aria-pressed={sample === i} onClick={() => loadSample(i)} data-testid={`landing-sample-${s.file.replace(/\.md$/, "")}`}>
                {s.label}
              </button>
            ))}
          </div>
          <span className="badge">Preview only, nothing is uploaded</span>
        </div>
        <div className="studio-frame card-featured">
          <div className="studio-src editor-dark">
            <div className="tabbar"><span className="tab is-active">{file}</span></div>
            <label className="sr-only" htmlFor="studio-src">Markdown source</label>
            <textarea id="studio-src" value={text} onChange={(e) => { setText(e.target.value); setSample(null); }} spellCheck={false} autoComplete="off" data-testid="landing-studio-source" />
          </div>
          <div className="studio-view paper">
            <div className="urlbar">
              <span className="url">{host}/s/<b>{slug}</b></span>
              <button className="btn btn-secondary copy-btn" type="button" onClick={copy} data-testid="landing-studio-copy">{copyLabel}</button>
            </div>
            <div className="doc" aria-live="polite" aria-label="Rendered preview">
              <DocBlocks blocks={blocks} />
            </div>
          </div>
          <div className="studio-status">
            <span className="live-link">Your link: {host}/s/<b>{slug}</b></span>
            <span>{kind}, {size} of 50 MB</span>
          </div>
        </div>
      </div>
    </>
  );
}
