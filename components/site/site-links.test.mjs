// Run from dropitx-fe/: node --test components/site/site-links.test.mjs
// Every nav and footer link points at a route that exists (FR3.1).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { NAV_LINKS, FOOTER_GROUPS, CLI_REPO_URL, SIGN_IN_HREF, SIGN_UP_HREF, visibleLinks } from "./site-links.ts";

const appDir = fileURLToPath(new URL("../../app", import.meta.url));
const ALL_LINKS = [...NAV_LINKS, ...FOOTER_GROUPS.flatMap((g) => g.links)];
const INTERNAL = ALL_LINKS.filter((l) => !l.external);

/** Route folders under app/, with route groups like "(public)" removed from the URL. */
function routePaths(dir, prefix = "") {
  const paths = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory() || name.startsWith("_") || name === "api") continue;
    const segment = name.startsWith("(") ? "" : `/${name}`;
    const path = `${prefix}${segment}`;
    if (existsSync(join(full, "page.tsx"))) paths.push(path || "/");
    paths.push(...routePaths(full, path));
  }
  return paths;
}

const ROUTES = new Set(["/", ...routePaths(appDir)]);

/** The path part of an internal href, without query or hash. */
const pathOf = (href) => new URL(href, "https://example.test").pathname;

test("the route scan finds the routes the links rely on", () => {
  for (const route of ["/", "/developers", "/auth/login", "/search", "/editor", "/dashboard", "/dashboard/profile"]) {
    assert.ok(ROUTES.has(route), `route ${route} not found under app/`);
  }
});

test("every internal nav and footer href resolves to a page route or an anchor on /", () => {
  for (const link of INTERNAL) {
    assert.ok(link.href.startsWith("/"), `${link.label}: ${link.href} is not a root-relative path`);
    assert.ok(ROUTES.has(pathOf(link.href)), `${link.label}: ${link.href} has no page under app/`);
  }
});

test("no href is empty, and only the marked GitHub link leaves the site", () => {
  for (const link of ALL_LINKS) assert.ok(link.href.trim().length > 0, `${link.label} has an empty href`);
  const external = ALL_LINKS.filter((l) => /^[a-z]+:/i.test(l.href));
  assert.deepEqual([...new Set(external.map((l) => l.href))], [CLI_REPO_URL]);
  assert.ok(external.every((l) => l.external), "an absolute URL is not marked external");
});

test("the nav and the footer both offer Developers, and the footer offers sign-in and sign-up", () => {
  assert.ok(NAV_LINKS.some((l) => l.href === "/developers"));
  const footer = FOOTER_GROUPS.flatMap((g) => g.links);
  assert.ok(footer.some((l) => l.href.startsWith("/developers")));
  assert.ok(footer.some((l) => l.href === SIGN_IN_HREF));
  assert.ok(footer.some((l) => l.href === SIGN_UP_HREF));
  assert.deepEqual(FOOTER_GROUPS.map((g) => g.title), ["Product", "Developers", "Account"]);
});

test("pricing links are hidden unless the pricing switch is on", () => {
  assert.ok(!visibleLinks(NAV_LINKS, false).some((l) => l.href === "/#pricing"));
  assert.ok(visibleLinks(NAV_LINKS, true).some((l) => l.href === "/#pricing"));
});
