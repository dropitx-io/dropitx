"use client";

import { type RefObject } from "react";
import { EditorView } from "@codemirror/view";
import {
  Bold,
  Italic,
  Heading,
  Link,
  Code,
  List,
  ListOrdered,
  Minus,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";

interface EditorToolbarProps {
  editorRef: RefObject<EditorView | null>;
}

/** Insert text at cursor position, wrapping selection if any */
function insertAtCursor(
  view: EditorView,
  before: string,
  after: string
): void {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const replacement = before + selected + after;
  view.dispatch({
    changes: { from, to, insert: replacement },
    selection: {
      anchor: from + before.length,
      head: from + before.length + selected.length,
    },
  });
  view.focus();
}

/** Insert text at the start of the line containing the cursor */
function insertLinePrefix(view: EditorView, prefix: string): void {
  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  const lineText = view.state.sliceDoc(line.from, line.to);
  const replacement = prefix + lineText;
  view.dispatch({
    changes: { from: line.from, to: line.to, insert: replacement },
    selection: { anchor: line.from + prefix.length },
  });
  view.focus();
}

type Action = { label: string; icon: LucideIcon; run: (view: EditorView) => void };

const GROUPS: Action[][] = [
  [
    { label: "Bold (Ctrl+B)", icon: Bold, run: (v) => insertAtCursor(v, "**", "**") },
    { label: "Italic (Ctrl+I)", icon: Italic, run: (v) => insertAtCursor(v, "*", "*") },
    { label: "Heading", icon: Heading, run: (v) => insertLinePrefix(v, "## ") },
  ],
  [
    { label: "Link (Ctrl+K)", icon: Link, run: (v) => insertAtCursor(v, "[", "](url)") },
    { label: "Image", icon: ImageIcon, run: (v) => insertAtCursor(v, "![alt](", ")") },
    { label: "Code block", icon: Code, run: (v) => insertAtCursor(v, "\n```\n", "\n```\n") },
  ],
  [
    { label: "Bullet list", icon: List, run: (v) => insertLinePrefix(v, "- ") },
    { label: "Ordered list", icon: ListOrdered, run: (v) => insertLinePrefix(v, "1. ") },
    { label: "Horizontal rule", icon: Minus, run: (v) => insertAtCursor(v, "\n---\n", "") },
  ],
];

const buttonClass =
  "grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-active hover:text-foreground";

/** Formatting buttons for the Markdown pane head. (The site is light only, so there is no theme switch.) */
export function EditorToolbar({ editorRef }: EditorToolbarProps) {
  return (
    <div role="toolbar" aria-label="Formatting" className="flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]">
      {GROUPS.map((group, i) => (
        <div key={i} className="flex items-center gap-0.5">
          {i > 0 && <span aria-hidden className="mx-1 h-4 w-px bg-rule" />}
          {group.map(({ label, icon: Icon, run }) => (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              className={buttonClass}
              onClick={() => {
                const view = editorRef.current;
                if (view) run(view);
              }}
            >
              <Icon className="size-4" strokeWidth={1.5} />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
