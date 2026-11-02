import { parseInline, parseLine, type Block, type Run } from "@/components/landing/markdown-line";

/** Inline runs as React elements; text is always a text node, never HTML. */
function Runs({ runs }: { runs: Run[] }) {
  return runs.map((r, i) =>
    r.kind === "code" ? (
      <code key={i}>{r.text}</code>
    ) : r.kind === "strong" ? (
      <strong key={i}>{r.text}</strong>
    ) : r.kind === "em" ? (
      <em key={i}>{r.text}</em>
    ) : (
      r.text
    ),
  );
}

const HEADING_CLASS = { 1: "doc-title", 2: "doc-h2", 3: "doc-h3" } as const;

/** The typed line rendered the way a share page would: a heading level or a paragraph. */
export function DocLine({ line }: { line: string }) {
  const { level, runs } = parseLine(line);
  if (level === null) return runs.length ? <p><Runs runs={runs} /></p> : null;
  return <p className={HEADING_CLASS[level]}>{runs.length ? <Runs runs={runs} /> : " "}</p>;
}

export function DocBody({ blocks }: { blocks: Block[] }) {
  return blocks.map((b, i) =>
    b.type === "ul" ? (
      <ul key={i}>
        {b.items.map((item) => (
          <li key={item}>
            <Runs runs={parseInline(item)} />
          </li>
        ))}
      </ul>
    ) : (
      <p key={i} className={b.type === "h3" ? "doc-h3" : undefined}>
        <Runs runs={parseInline(b.text)} />
      </p>
    ),
  );
}
