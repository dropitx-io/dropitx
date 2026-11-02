import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

/*
 * The editor's look, built from the app's CSS tokens so it follows light and dark on its own:
 * ink text on the sheet, muted syntax, olive kept off the code. The `dark` flag only tells
 * CodeMirror which base styles to start from.
 */
const chrome = {
  "&": { height: "100%", backgroundColor: "var(--sheet)", color: "var(--card-foreground)", fontSize: "13px" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "21px" },
  ".cm-content": { padding: "14px 0", caretColor: "var(--card-foreground)" },
  ".cm-line": { padding: "0 16px" },
  ".cm-gutters": { backgroundColor: "var(--sheet)", color: "var(--muted-foreground)", borderRight: "1px solid var(--rule)" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 10px 0 12px", fontVariantNumeric: "tabular-nums" },
  ".cm-foldGutter .cm-gutterElement": { color: "var(--muted-foreground)" },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "var(--raised)" },
  ".cm-cursor, .cm-dropCursor": { borderLeft: "2px solid var(--card-foreground)" },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    { backgroundColor: "var(--active)" },
  ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": { backgroundColor: "var(--active)", outline: "none" },
  ".cm-placeholder": { color: "var(--muted-foreground)" },
  ".cm-tooltip": {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
  },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "var(--active)", color: "var(--card-foreground)" },
};

const lightChrome = EditorView.theme(chrome, { dark: false });
const darkChrome = EditorView.theme(chrome, { dark: true });

const syntax = syntaxHighlighting(
  HighlightStyle.define([
    { tag: t.heading, fontWeight: "600", color: "var(--card-foreground)" },
    { tag: [t.processingInstruction, t.contentSeparator, t.meta], color: "var(--muted-foreground)", fontWeight: "400" },
    { tag: t.strong, fontWeight: "600" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: [t.link, t.url], color: "var(--muted-foreground)", textDecoration: "underline", textUnderlineOffset: "2px" },
    { tag: t.monospace, backgroundColor: "var(--raised)", borderRadius: "3px" },
    { tag: t.quote, color: "var(--muted-foreground)", fontStyle: "italic" },
    { tag: [t.comment, t.lineComment, t.blockComment], color: "var(--muted-foreground)", fontStyle: "italic" },
    { tag: [t.string, t.regexp, t.attributeValue], color: "var(--muted-foreground)" },
    { tag: [t.keyword, t.definitionKeyword, t.moduleKeyword, t.controlKeyword], fontWeight: "500" },
    { tag: [t.tagName, t.attributeName, t.typeName, t.className], color: "var(--muted-foreground)" },
    { tag: t.invalid, color: "var(--destructive)" },
  ]),
);

export function editorTheme(dark: boolean): Extension {
  return [dark ? darkChrome : lightChrome, syntax];
}
