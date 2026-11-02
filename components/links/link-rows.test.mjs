// Run with: node --test components/links/link-rows.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { filterRows, formatShortDate, linksFinding, sortRows, teamLinkRows } from "./link-rows.ts";

const row = (over) => ({
  id: over.slug ?? "x",
  slug: "x",
  filename: "x.md",
  title: null,
  mime_type: "text/markdown",
  view_count: 0,
  file_size: 100,
  created_at: "2026-11-01T10:00:00Z",
  has_password: false,
  ...over,
});

const notes = row({ slug: "aa1", filename: "standup-notes.md", view_count: 3, created_at: "2026-11-01T10:00:00Z" });
const review = row({ slug: "bb2", filename: "design-review.html", mime_type: "text/html", view_count: 41, file_size: 9000, created_at: "2026-10-24T10:00:00Z", has_password: true });
const handbook = row({ slug: "cc3", filename: "handbook.md", title: "Team handbook", view_count: 74, file_size: 500, created_at: "2026-10-10T10:00:00Z" });
const rows = [notes, review, handbook];

test("filters by type: markdown, html and password-protected", () => {
  assert.deepEqual(filterRows(rows, "md", "").map((r) => r.slug), ["aa1", "cc3"]);
  assert.deepEqual(filterRows(rows, "html", "").map((r) => r.slug), ["bb2"]);
  assert.deepEqual(filterRows(rows, "protected", "").map((r) => r.slug), ["bb2"]);
  assert.equal(filterRows(rows, "all", "").length, 3);
});

test("filters by a query over file name, title and slug, ignoring case", () => {
  assert.deepEqual(filterRows(rows, "all", "HANDBOOK").map((r) => r.slug), ["cc3"]);
  assert.deepEqual(filterRows(rows, "all", "team hand").map((r) => r.slug), ["cc3"]);
  assert.deepEqual(filterRows(rows, "all", "bb2").map((r) => r.slug), ["bb2"]);
  assert.deepEqual(filterRows(rows, "md", "review"), []);
});

test("sorts newest first, by views, by name and by size without mutating the input", () => {
  assert.deepEqual(sortRows(rows, "created").map((r) => r.slug), ["aa1", "bb2", "cc3"]);
  assert.deepEqual(sortRows(rows, "views").map((r) => r.slug), ["cc3", "bb2", "aa1"]);
  assert.deepEqual(sortRows(rows, "name").map((r) => r.slug), ["bb2", "aa1", "cc3"]);
  assert.deepEqual(sortRows(rows, "size").map((r) => r.slug), ["bb2", "cc3", "aa1"]);
  assert.deepEqual(rows.map((r) => r.slug), ["aa1", "bb2", "cc3"]);
});

test("the finding names the most-read link and the total views", () => {
  assert.equal(linksFinding(rows), "3 links, 118 views in total. Most read: Team handbook with 74 views.");
});

test("the finding says when nothing has been read yet", () => {
  assert.equal(linksFinding([row({ slug: "z" })]), "1 link, no views yet.");
});

test("the finding is null for an empty list", () => {
  assert.equal(linksFinding([]), null);
});

test("short dates drop the year inside the current year and keep it otherwise", () => {
  const now = new Date("2026-11-02T12:00:00Z");
  assert.equal(formatShortDate("2026-11-01T12:00:00Z", now), "1 Nov");
  assert.equal(formatShortDate("2025-12-24T12:00:00Z", now), "24 Dec 2025");
  assert.equal(formatShortDate(null, now), null);
});

test("team rows keep only shares that still exist and default missing counts", () => {
  const rows = teamLinkRows([
    { created_at: null, shared_by: "u1", shares: null },
    { created_at: null, shared_by: "u1", shares: { id: "1", slug: "s1", filename: null, title: "Plan", mime_type: null, view_count: null, file_size: null, created_at: null } },
  ]);
  assert.deepEqual(rows, [
    { id: "1", slug: "s1", filename: "", title: "Plan", mime_type: "", view_count: 0, file_size: null, created_at: null, has_password: false },
  ]);
});
