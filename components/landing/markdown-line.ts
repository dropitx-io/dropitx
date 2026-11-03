/**
 * The landing page's one-line Markdown preview: parse a line into safe runs,
 * derive the slug a share would get, and count the bytes it would upload.
 * Output is data for React to render; nothing here produces HTML.
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
  return n < 1024 ? `${n} bytes` : `${(n / 1024).toFixed(1)} KB`;
}
