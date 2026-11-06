import type { DocBlock, Run } from "@/components/landing/markdown-line";

/** Inline runs as React elements; text is always a text node, never HTML. */
export function Runs({ runs }: { runs: Run[] }) {
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

/** Heading levels shift down one step inside the preview, as on the design: # is the page title. */
const HEADING_TAG = { 1: "h2", 2: "h3", 3: "h4" } as const;
const HEADING_CLASS = { 1: "doc-h1", 2: "doc-h2", 3: "doc-h3" } as const;

/** A parsed document rendered the way a share page would show it. */
export function DocBlocks({ blocks }: { blocks: DocBlock[] }) {
  if (blocks.length === 0) return <p className="doc-meta">Start typing Markdown on the left.</p>;
  return blocks.map((b, i) => {
    switch (b.type) {
      case "heading": {
        const Tag = HEADING_TAG[b.level];
        return (
          <Tag key={i} className={HEADING_CLASS[b.level]}>
            <Runs runs={b.runs} />
          </Tag>
        );
      }
      case "list": {
        const items = b.items.map((runs, j) => (
          <li key={j}>
            <Runs runs={runs} />
          </li>
        ));
        return b.ordered ? <ol key={i}>{items}</ol> : <ul key={i}>{items}</ul>;
      }
      case "quote":
        return (
          <blockquote key={i}>
            <Runs runs={b.runs} />
          </blockquote>
        );
      case "code":
        return (
          <pre key={i}>
            <code>{b.text}</code>
          </pre>
        );
      default:
        return (
          <p key={i}>
            <Runs runs={b.runs} />
          </p>
        );
    }
  });
}
