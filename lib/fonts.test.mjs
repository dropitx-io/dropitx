// Run from dropitx-fe/: node --test lib/fonts.test.mjs
// Checks the font roles and the type scale (FR2.1, FR2.2, FR2.3).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(repo, path), "utf8");
const layout = read("app/layout.tsx");
const globals = read("app/globals.css");

const NEW_PACKAGES = ["@fontsource-variable/inter", "@fontsource-variable/eb-garamond", "@fontsource-variable/jetbrains-mono"];
const OLD_PACKAGES = ["@fontsource-variable/roboto", "@fontsource-variable/roboto-mono", "@fontsource-variable/newsreader"];
// Assembled so this file does not itself contain the names it searches for.
const PROPRIETARY = [["Cursor", "Gothic"], ["jja", "nnon"], ["berkeley", "Mono"]].map((parts) => parts.join(""));
const SELF = fileURLToPath(import.meta.url);
const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".json", ".md"]);

function textFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...textFiles(path));
    else if (TEXT_EXT.has(extname(name)) && path !== SELF) out.push(path);
  }
  return out;
}

/** Files under the given folders that mention a name, case-insensitively. */
function filesMentioning(name, folders) {
  const needle = name.toLowerCase();
  return folders
    .flatMap((f) => textFiles(join(repo, f)))
    .filter((path) => readFileSync(path, "utf8").toLowerCase().includes(needle));
}

test("the root layout imports the three new Fontsource packages", () => {
  for (const pkg of NEW_PACKAGES) assert.match(layout, new RegExp(`import "${pkg}(/[^"]*)?";`), pkg);
});

test("the old font packages are gone from the layout and package.json", () => {
  const pkg = read("package.json");
  for (const old of OLD_PACKAGES) {
    assert.ok(!layout.includes(`"${old}"`) && !layout.includes(`"${old}/`), `${old} still imported`);
    assert.ok(!pkg.includes(`"${old}"`), `${old} still in package.json`);
  }
});

test("each role is exposed as a CSS variable, with sans/serif aliases", () => {
  for (const role of ["--font-display", "--font-body", "--font-mono", "--font-sans", "--font-serif"]) {
    assert.ok(layout.includes(`"${role}"`), `${role} not set in app/layout.tsx`);
  }
  assert.match(layout, /"Inter Variable"/);
  assert.match(layout, /"EB Garamond Variable"/);
  assert.match(layout, /"JetBrains Mono Variable"/);
});

test("no proprietary family name appears anywhere in app/, components/, lib/ (case-insensitive)", () => {
  for (const name of PROPRIETARY) {
    assert.deepEqual(filesMentioning(name, ["app", "components", "lib", "docs"]), [], `${name} found`);
  }
});

test("the case-insensitive scan would catch a lower-case mention", () => {
  assert.ok("font-family: cursorgothic".toLowerCase().includes(PROPRIETARY[0].toLowerCase()));
});

test("the type scale tokens exist in app/globals.css", () => {
  const scale = { "--text-xs": "11px", "--text-sm": "14px", "--text-base": "16px", "--text-lg": "19.2px", "--text-xl": "22px", "--text-2xl": "26px", "--text-3xl": "36px", "--text-4xl": "72px" };
  for (const [name, value] of Object.entries(scale)) {
    assert.match(globals, new RegExp(`${name}:\\s*${value.replace(".", "\\.")};`), `${name}: ${value}`);
  }
  assert.match(globals, /--tracking-display:\s*-0\.03em;/);
  assert.match(globals, /--leading-body:\s*1\.5;/);
});
