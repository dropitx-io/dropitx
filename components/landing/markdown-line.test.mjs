// Run: node --test components/landing/markdown-line.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLine, slugify, byteCount, blocksToMarkdown } from "./markdown-line.ts";

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
