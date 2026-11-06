// Run from dropitx-fe/: node --test lib/route-structure.test.mjs
// Guards the structure the redesign must not break (NFR3, FR7.3, FR1.3).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("..", import.meta.url));
const at = (...parts) => join(repo, ...parts);
const SELF = fileURLToPath(import.meta.url);
const SOURCE_EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".css"]);

function sourceFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path));
    else if (SOURCE_EXT.has(extname(name)) && path !== SELF) out.push(path);
  }
  return out;
}

const FILES = ["app", "components", "lib", "hooks"].filter((d) => existsSync(at(d))).flatMap((d) => sourceFiles(at(d)));
const matching = (pattern) => FILES.filter((f) => pattern.test(readFileSync(f, "utf8"))).map((f) => relative(repo, f));

test("the (content) route group has no loading.tsx, so a missing share can still answer 404", () => {
  assert.equal(existsSync(at("app", "(content)", "loading.tsx")), false);
  assert.equal(existsSync(at("app", "(content)", "s", "[slug]", "loading.tsx")), false);
  // The share page still calls notFound() for a missing share.
  assert.match(readFileSync(at("app", "(content)", "s", "[slug]", "page.tsx"), "utf8"), /if \(!share\) notFound\(\);/);
});

test("the existing route folders keep their URLs", () => {
  const routes = [
    ["app", "(content)", "s", "[slug]", "page.tsx"],
    ["app", "(content)", "embed", "[slug]", "page.tsx"],
    ["app", "(content)", "u", "[username]", "page.tsx"],
    ["app", "(public)", "developers", "page.tsx"],
    ["app", "(public)", "auth", "login", "page.tsx"],
    ["app", "(public)", "search", "page.tsx"],
    ["app", "(public)", "editor", "page.tsx"],
    ["app", "(dashboard)", "dashboard", "page.tsx"],
  ];
  for (const parts of routes) assert.ok(existsSync(at(...parts)), `${parts.join("/")} is missing`);
});

test("embeds still refuse password-protected shares", () => {
  const embed = readFileSync(at("app", "(content)", "embed", "[slug]", "page.tsx"), "utf8");
  assert.match(embed, /if \(share\.has_password\)/);
});

test("the dark variant stays class-based and nothing follows the system colour scheme", () => {
  const globals = readFileSync(at("app", "globals.css"), "utf8");
  assert.match(globals, /@custom-variant dark \(&:is\(\.dark \*\)\);/);
  assert.deepEqual(matching(/prefers-color-scheme:\s*dark/), []);
});

test("nothing imports next-themes, and no code adds the .dark class", () => {
  assert.deepEqual(matching(/from\s+["']next-themes["']/), []);
  assert.deepEqual(matching(/classList\.(add|toggle)\(\s*["']dark["']/), []);
  const pkg = JSON.parse(readFileSync(at("package.json"), "utf8"));
  assert.equal(pkg.dependencies["next-themes"], undefined);
});

test("the scan itself covers the source tree", () => {
  assert.ok(FILES.some((f) => f.endsWith(join("app", "layout.tsx"))));
  assert.ok(FILES.length > 100, `only ${FILES.length} files scanned`);
});
