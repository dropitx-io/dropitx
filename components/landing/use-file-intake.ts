"use client";

import { useEffect, useRef } from "react";

const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

/**
 * Wires the landing page's two ways in for a local file:
 * - any `[data-upload]` link opens the hidden file picker instead of navigating
 *   (without script the link still goes to sign-up);
 * - a file dropped anywhere on the page is handed to `onFile`, and <html> gets
 *   the `dragging` class while a file is over the page.
 * Returns the ref to put on the hidden <input type="file">.
 */
export function useFileIntake(onFile: (file: File) => void) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const onFileRef = useRef(onFile);

  useEffect(() => {
    onFileRef.current = onFile;
  }, [onFile]);

  useEffect(() => {
    const root = document.documentElement;
    let depth = 0;

    const onClick = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target.closest("[data-upload]") : null;
      if (!target || !pickerRef.current) return;
      e.preventDefault();
      pickerRef.current.click();
    };
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth++;
      root.classList.add("dragging");
    };
    const onLeave = () => {
      depth = Math.max(0, depth - 1);
      if (!depth) root.classList.remove("dragging");
    };
    const onOver = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      depth = 0;
      root.classList.remove("dragging");
      const file = e.dataTransfer?.files[0];
      if (!file) return;
      e.preventDefault();
      onFileRef.current(file);
    };

    // Capture phase: runs before React's delegated handlers, so Next's <Link> sees
    // defaultPrevented and does not navigate to sign-up.
    document.addEventListener("click", onClick, true);
    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("dragover", onOver);
    window.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("drop", onDrop);
      root.classList.remove("dragging");
    };
  }, []);

  return pickerRef;
}
