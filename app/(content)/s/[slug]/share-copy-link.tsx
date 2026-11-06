"use client";

import { useEffect, useRef, useState } from "react";

/** The share bar's "Copy link": copies the share's full URL and confirms beside the button. */
export function ShareCopyLink({ url }: { url: string }) {
  const [status, setStatus] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Copied");
    } catch (err: unknown) {
      console.error("Copying the share link failed", err);
      setStatus("Copy failed");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus(""), 2400);
  }

  return (
    <>
      <span className="copied" aria-live="polite">{status}</span>
      <button className="btn btn-dark" type="button" onClick={copy} data-testid="share-copy-link">
        Copy link
      </button>
    </>
  );
}
