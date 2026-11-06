// Run from dropitx-fe/: node --test lib/og-palette.test.mjs
// Link previews use the new palette, and the default card exists (FR10.1).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { OG_PALETTE, OG_SIZE } from "./og-palette.ts";

const globals = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const route = readFileSync(new URL("../app/api/og-image/[slug]/route.tsx", import.meta.url), "utf8");
const cardPath = new URL("../public/og-card-default.png", import.meta.url);
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function token(name) {
  const match = globals.match(new RegExp(`\\s${name}:\\s*([^;]+);`));
  assert.ok(match, `missing token ${name} in app/globals.css`);
  return match[1].trim().toLowerCase();
}

/** rgba(r, g, b, a) composited over a #rrggbb ground, as #rrggbb. */
function composite(rgba, groundHex) {
  const [r, g, b, a] = rgba.match(/[\d.]+/g).map(Number);
  const ground = [1, 3, 5].map((i) => parseInt(groundHex.slice(i, i + 2), 16));
  return "#" + [r, g, b].map((c, i) => Math.round(c * a + ground[i] * (1 - a)).toString(16).padStart(2, "0")).join("");
}

test("the palette equals the --bg, --surface, --fg and --accent tokens", () => {
  assert.equal(OG_PALETTE.background, token("--bg"));
  assert.equal(OG_PALETTE.surface, token("--surface"));
  assert.equal(OG_PALETTE.ink, token("--fg"));
  assert.equal(OG_PALETTE.accent, token("--accent"));
});

test("the muted colour is --muted composited over --bg", () => {
  assert.equal(OG_PALETTE.muted, composite(token("--muted"), token("--bg")));
});

test("the OG route draws with the palette and no hardcoded colours", () => {
  assert.match(route, /from "@\/lib\/og-palette"/);
  assert.doesNotMatch(route, /#[0-9a-f]{6}\b/i, "a hex colour is still hardcoded in the route");
  assert.deepEqual(OG_SIZE, { width: 1200, height: 630 });
});

test("the default card exists and is a real PNG of 1200x630", () => {
  assert.ok(existsSync(cardPath), "public/og-card-default.png is missing; run node scripts/generate-og-card.mjs");
  const bytes = readFileSync(cardPath);
  assert.ok(bytes.subarray(0, 8).equals(PNG_SIGNATURE), "the file does not start with the PNG signature");
  // IHDR width and height are big-endian at bytes 16 and 20.
  assert.equal(bytes.readUInt32BE(16), 1200);
  assert.equal(bytes.readUInt32BE(20), 630);
});
