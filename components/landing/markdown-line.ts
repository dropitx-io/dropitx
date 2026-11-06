/**
 * The landing page's Markdown preview: parse a line or a short document into
 * safe runs and blocks, derive the slug a share would get, and count the bytes
 * it would upload. Output is data for React to render; nothing here produces HTML.
 */

export type RunKind = "text" | "code" | "strong" | "em";
export type Run = { kind: RunKind; text: string };
export type ParsedLine = { level: 1 | 2 | 3 | null; runs: Run[] };
export type Block =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] };

const INLINE = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

export function parseInline(text: string): Run[] {
  const runs: Run[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) runs.push({ kind: "text", text: text.slice(last, at) });
    if (m[1] !== undefined) runs.push({ kind: "code", text: m[1] });
    else if (m[2] !== undefined) runs.push({ kind: "strong", text: m[2] });
    else runs.push({ kind: "em", text: m[3] });
    last = at + m[0].length;
  }
  if (last < text.length) runs.push({ kind: "text", text: text.slice(last) });
  return runs;
}

export function parseLine(line: string): ParsedLine {
  const m = line.match(/^(#{1,3})\s+(.*)$/);
  if (!m) return { level: null, runs: parseInline(line) };
  return { level: m[1].length as 1 | 2 | 3, runs: parseInline(m[2]) };
}

export function slugify(line: string): string {
  const slug = line
    .replace(/^#+\s*/, "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32)
    .replace(/-+$/, "");
  return slug.length >= 3 ? slug : "untitled";
}

export function blocksToMarkdown(blocks: Block[]): string {
  return blocks
    .map((b) =>
      b.type === "p" ? b.text : b.type === "h3" ? `### ${b.text}` : b.items.map((i) => `- ${i}`).join("\n"),
    )
    .join("\n\n");
}

export function byteCount(line: string, body: string): number {
  return new TextEncoder().encode(`${line}\n\n${body}`).length;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} bytes`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

/* ------------------------------------------------------------------ */
/* A whole document: the landing studio's multi-line preview.          */
/* ------------------------------------------------------------------ */

export type DocBlock =
  | { type: "heading"; level: 1 | 2 | 3; runs: Run[] }
  | { type: "p"; runs: Run[] }
  | { type: "list"; ordered: boolean; items: Run[][] }
  | { type: "quote"; runs: Run[] }
  | { type: "code"; text: string };

/** Lines read for a preview; longer files are cut so typing stays responsive. */
export const MAX_PREVIEW_LINES = 400;

/**
 * Parses a small Markdown subset into blocks: headings 1 to 3, bullet and
 * numbered lists, block quotes, fenced code and paragraphs. Inline runs come
 * from parseInline, so nothing is ever HTML.
 */
export function parseDocument(text: string): DocBlock[] {
  const blocks: DocBlock[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: Run[][] } | null = null;
  let fence: string[] | null = null;

  const flushPara = () => {
    if (para.length) blocks.push({ type: "p", runs: parseInline(para.join(" ")) });
    para = [];
  };
  const closeList = () => {
    if (list) blocks.push({ type: "list", ...list });
    list = null;
  };

  for (const raw of text.split(/\r?\n/).slice(0, MAX_PREVIEW_LINES)) {
    if (/^```/.test(raw)) {
      flushPara();
      closeList();
      if (fence) {
        blocks.push({ type: "code", text: fence.join("\n") });
        fence = null;
      } else fence = [];
      continue;
    }
    if (fence) {
      fence.push(raw);
      continue;
    }
    const heading = raw.match(/^(#{1,3})\s+(.*)$/);
    const bullet = raw.match(/^\s*[-*+]\s+(.*)$/);
    const numbered = raw.match(/^\s*\d+[.)]\s+(.*)$/);
    if (heading) {
      flushPara();
      closeList();
      blocks.push({ type: "heading", level: heading[1].length as 1 | 2 | 3, runs: parseInline(heading[2]) });
    } else if (bullet || numbered) {
      flushPara();
      const ordered = !bullet;
      if (!list || list.ordered !== ordered) {
        closeList();
        list = { ordered, items: [] };
      }
      list.items.push(parseInline(bullet ? bullet[1] : numbered ? numbered[1] : ""));
    } else if (/^>\s?/.test(raw)) {
      flushPara();
      closeList();
      blocks.push({ type: "quote", runs: parseInline(raw.replace(/^>\s?/, "")) });
    } else if (!raw.trim()) {
      flushPara();
      closeList();
    } else {
      closeList();
      para.push(raw.trim());
    }
  }
  flushPara();
  closeList();
  if (fence) blocks.push({ type: "code", text: fence.join("\n") });
  return blocks;
}

/**
 * The title a share of this text would get: the first heading, else the first
 * non-empty line, else the file name without its extension. Inline markers are dropped.
 */
export function documentTitle(text: string, fileName: string): string {
  const heading = text.match(/^#{1,3}\s+(.+)$/m)?.[1];
  const firstLine = text.split(/\r?\n/).find((l) => l.trim());
  const title = heading ?? firstLine ?? fileName.replace(/\.[^.]+$/, "");
  return title.replace(/[*_`]/g, "").trim();
}
