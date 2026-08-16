"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { saveDraft, loadDraft, removeDraft, hasDraft } from "@/lib/draft-storage";

const DEBOUNCE_MS = 2000;

interface AutoSaveOptions {
  /** Namespace for localStorage key (default: "editor") */
  namespace?: string;
  /** Debounce delay in ms (default: 2000) */
  debounceMs?: number;
  /** Whether autosave is enabled (default: true) */
  enabled?: boolean;
  /** Optional title to save alongside content */
  title?: string;
}

interface AutoSaveResult {
  /** When the draft was last saved, or null */
  savedAt: Date | null;
  /** Whether a draft exists in storage */
  hasDraft: boolean;
  /** Clear the current draft from storage */
  clearDraft: () => void;
  /** Restore the draft content from storage */
  restoreDraft: () => string | null;
}

export function useAutoSave(
  content: string,
  options: AutoSaveOptions = {},
): AutoSaveResult {
  const {
    namespace = "editor",
    debounceMs = DEBOUNCE_MS,
    enabled = true,
    title,
  } = options;

  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [draftExists, setDraftExists] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for existing draft on mount
  useEffect(() => {
    if (!enabled) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time initialization from localStorage; must run post-hydration or SSR markup would mismatch
    setDraftExists(hasDraft(namespace));
  }, [namespace, enabled]);

  // Debounced save
  useEffect(() => {
    if (!enabled) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Don't save empty content
    if (content.length === 0) {
      return;
    }

    timerRef.current = setTimeout(() => {
      saveDraft(namespace, content, title);
      setSavedAt(new Date());
      setDraftExists(true);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [content, namespace, debounceMs, enabled, title]);

  const clearDraft = useCallback(() => {
    removeDraft(namespace);
    setDraftExists(false);
    setSavedAt(null);
  }, [namespace]);

  const restoreDraft = useCallback((): string | null => {
    const draft = loadDraft(namespace);
    return draft?.content ?? null;
  }, [namespace]);

  return {
    savedAt,
    hasDraft: draftExists,
    clearDraft,
    restoreDraft,
  };
}
