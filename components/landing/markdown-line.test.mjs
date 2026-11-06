// Run: node --test components/landing/markdown-line.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLine, slugify, byteCount, blocksToMarkdown, documentTitle, parseDocument, formatBytes } from "./markdown-line.ts";
import { SAMPLES } from "./showcase-samples.ts";

test("slugify drops heading marks, accents and punctuation", () => {
  assert.equal(slugify("## Café menu, **spring**"), "cafe-menu-spring");
  assert.equal(slugify("# Release notes v1.4"), "release-notes-v1-4");
});

test("slugify falls back to untitled under three characters", () => {
  assert.equal(slugify("# a!"), "untitled");
  assert.equal(slugify(""), "untitled");
});

test("slugify caps at 32 characters without a trailing hyphen", () => {
  const slug = slugify("# The quick brown fox jumps over the lazy dog again");
  assert.ok(slug.length <= 32);
  assert.equal(slug, "the-quick-brown-fox-jumps-over-t");
  assert.equal(slugify("# abcdefghij abcdefghij abcdefghij x"), "abcdefghij-abcdefghij-abcdefghij");
});

test("parseLine reads heading levels one to three", () => {
  assert.equal(parseLine("# Title").level, 1);
  assert.equal(parseLine("## Title").level, 2);
  assert.equal(parseLine("### Title").level, 3);
  assert.equal(parseLine("#### Title").level, null);
  assert.equal(parseLine("#Title").level, null);
});

test("parseLine without a heading mark is a paragraph", () => {
  assert.deepEqual(parseLine("Plain words"), { level: null, runs: [{ kind: "text", text: "Plain words" }] });
});

test("parseLine splits inline code, strong and em runs", () => {
  assert.deepEqual(parseLine("## Use `npx` **now** or *later*").runs, [
    { kind: "text", text: "Use " },
    { kind: "code", text: "npx" },
    { kind: "text", text: " " },
    { kind: "strong", text: "now" },
    { kind: "text", text: " or " },
    { kind: "em", text: "later" },
  ]);
});

test("parseLine keeps markup characters as text, never as HTML", () => {
  assert.deepEqual(parseLine("<b>hi</b>").runs, [{ kind: "text", text: "<b>hi</b>" }]);
});

test("blocksToMarkdown writes the body back as Markdown source", () => {
  const md = blocksToMarkdown([
    { type: "p", text: "One." },
    { type: "h3", text: "Two" },
    { type: "ul", items: ["a", "b"] },
  ]);
  assert.equal(md, "One.\n\n### Two\n\n- a\n- b");
});

test("byteCount counts UTF-8 bytes of the line and the body", () => {
  assert.equal(byteCount("# é", "ab"), new TextEncoder().encode("# é\n\nab").length);
  assert.equal(byteCount("# é", "ab"), 8);
});

// --- the redesign's studio: chip samples and whole documents (FR4.2) ---

test("each design chip sample derives a non-empty slug of at most 32 characters", () => {
  const expected = {
    "release-notes.md": "release-notes-v1-4",
    "q3-incident-review.md": "q3-incident-review",
    "reading-list.md": "reading-list-for-friday",
  };
  assert.equal(SAMPLES.length, 3);
  for (const sample of SAMPLES) {
    const slug = slugify(documentTitle(sample.text, sample.file));
    assert.ok(slug.length > 0 && slug.length <= 32, `${sample.file}: ${slug}`);
    assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.equal(slug, expected[sample.file]);
  }
});

test("a 40-character heading still derives a slug of at most 32 characters", () => {
  const heading = "# " + "Quarterly planning notes for the team 26";
  assert.equal(heading.length - 2, 40);
  assert.ok(slugify(documentTitle(heading, "x.md")).length <= 32);
});

test("documentTitle falls back to the first line, then the file name", () => {
  assert.equal(documentTitle("Just a line\n\nmore", "notes.md"), "Just a line");
  assert.equal(documentTitle("", "notes.md"), "notes");
  assert.equal(documentTitle("## Café menu, **spring**", "x.md"), "Café menu, spring");
  assert.equal(slugify(documentTitle("", "a.md")), "untitled");
});

test("parseDocument reads headings, lists, quotes, code and paragraphs", () => {
  const blocks = parseDocument("# Title\n\nOne\ntwo\n\n- a\n- **b**\n\n1. x\n\n> quote\n\n```\n<b>raw</b>\n```");
  assert.deepEqual(blocks.map((b) => b.type), ["heading", "p", "list", "list", "quote", "code"]);
  assert.equal(blocks[0].level, 1);
  assert.deepEqual(blocks[1].runs, [{ kind: "text", text: "One two" }]);
  assert.equal(blocks[2].ordered, false);
  assert.deepEqual(blocks[2].items[1], [{ kind: "strong", text: "b" }]);
  assert.equal(blocks[3].ordered, true);
  // Code is kept as text, never as markup.
  assert.equal(blocks[5].text, "<b>raw</b>");
});

test("parseDocument returns no blocks for empty text and closes an unterminated fence", () => {
  assert.deepEqual(parseDocument(""), []);
  assert.deepEqual(parseDocument("```\nlet a"), [{ type: "code", text: "let a" }]);
});

test("formatBytes switches to KB and MB", () => {
  assert.equal(formatBytes(287), "287 bytes");
  assert.equal(formatBytes(2048), "2.0 KB");
  assert.equal(formatBytes(5 * 1048576), "5.0 MB");
});
