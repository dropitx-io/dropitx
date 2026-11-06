// Run from dropitx-fe/: node --test lib/design-tokens.test.mjs
// Checks the light-only design tokens in app/globals.css (FR1.1, FR1.2, FR1.3, NFR1).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

/** Body of the first top-level `:root { ... }` block, comments removed. */
function rootBlock(source) {
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const start = clean.indexOf(":root {");
  assert.notEqual(start, -1, "app/globals.css has no :root block");
  let depth = 0;
  for (let i = clean.indexOf("{", start); i < clean.length; i++) {
    if (clean[i] === "{") depth++;
    if (clean[i] === "}" && --depth === 0) return clean.slice(start, i);
  }
  throw new Error(":root block is not closed");
}

const root = rootBlock(css);

/** The declared value of a custom property in :root; fails with the token's name when it is missing. */
function token(name) {
  const match = root.match(new RegExp(`(?:^|[\\s;{])${name}:\\s*([^;]+);`));
  assert.ok(match, `missing token ${name} in app/globals.css :root`);
  return match[1].trim();
}

/** #rrggbb or rgba(r, g, b, a) to [r, g, b, a]. */
function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)).concat(1);
  const rgba = value.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)$/);
  if (rgba) return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), rgba[4] === undefined ? 1 : Number(rgba[4])];
  throw new Error(`unsupported colour value: ${value}`);
}

/** An alpha colour is composited over the ground before it is measured. */
function over([r, g, b, a], [br, bg, bb]) {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a)];
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const bg = parseColor(token("--bg"));

test("core palette matches the design", () => {
  assert.equal(token("--bg"), "#f2f1ed");
  assert.equal(token("--surface"), "#e6e5e0");
  assert.equal(token("--surface-warm"), "#ebeae5");
  assert.equal(token("--fg"), "#26251e");
  assert.equal(token("--accent"), "#f54e00");
  assert.equal(token("--success"), "#1f8a65");
  assert.equal(token("--warn"), "#eab308");
  assert.equal(token("--danger"), "#cf2d56");
});

test("spacing, radius, motion and container tokens are present", () => {
  const spacing = { "--space-1": "4px", "--space-2": "8px", "--space-3": "12px", "--space-4": "16px", "--space-5": "20px", "--space-6": "24px", "--space-8": "32px", "--space-12": "48px" };
  for (const [name, value] of Object.entries(spacing)) assert.equal(token(name), value, name);
  assert.equal(token("--motion-fast"), "150ms");
  assert.equal(token("--motion-base"), "200ms");
  assert.equal(token("--container-max"), "1200px");
  // Radii live in the @theme block so Tailwind's rounded-* utilities use them.
  for (const [name, value] of [["--radius-sm", "8px"], ["--radius-md", "10px"], ["--radius-lg", "12px"], ["--radius-pill", "9999px"]]) {
    assert.match(css, new RegExp(`${name}:\\s*${value};`), name);
  }
  assert.ok(token("--elev-raised").includes("var(--border)"));
});

test("a missing token fails with its name", () => {
  assert.throws(() => token("--does-not-exist"), /missing token --does-not-exist/);
});

test("light only: no .dark token block and no dark colour-scheme media query", () => {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(clean, /(^|\})\s*\.dark\s*\{/m, "a .dark selector block is still declared");
  assert.doesNotMatch(clean, /prefers-color-scheme:\s*dark/);
  assert.match(token("color-scheme"), /^light$/);
});

test("alpha colours are composited over --bg before measuring", () => {
  const half = over([0, 0, 0, 0.5], [255, 255, 255]);
  assert.deepEqual(half.map(Math.round), [128, 128, 128]);
  // A fully transparent colour measures as the ground itself: 1:1.
  assert.equal(contrast(over([0, 0, 0, 0], bg), bg), 1);
});

test("text tokens reach WCAG AA 4.5:1 on --bg", () => {
  for (const name of ["--fg", "--fg-2", "--muted", "--accent-ink"]) {
    const ratio = contrast(over(parseColor(token(name)), bg), bg);
    assert.ok(ratio >= 4.5, `${name} measures ${ratio.toFixed(2)}:1 on --bg`);
  }
});

test("white labels on an --accent-ink fill reach 4.5:1, while raw --accent does not (fills only)", () => {
  const white = [255, 255, 255];
  const ink = over(parseColor(token("--accent-ink")), bg);
  assert.ok(contrast(ink, white) >= 4.5);
  const accent = over(parseColor(token("--accent")), bg);
  assert.ok(contrast(accent, bg) < 4.5, "the accent is documented as fill-only because it is below AA");
});
