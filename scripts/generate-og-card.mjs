// Renders the default link-preview card (public/og-card-default.png) that
// protected shares reference in their Open Graph metadata.
//
// Run from dropitx-fe/ after changing the palette or the copy:
//   node scripts/generate-og-card.mjs
//
// Uses ImageResponse from next/og (bundled with next, Node build) and its
// built-in font. Colours come from lib/og-palette.ts, which mirrors the
// design tokens in app/globals.css.
import { createRequire } from "node:module";
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { createElement as h } from "react";
import { OG_PALETTE, OG_SIZE } from "../lib/og-palette.ts";

const require = createRequire(import.meta.url);
const { ImageResponse } = require("next/og");

const OUT = fileURLToPath(new URL("../public/og-card-default.png", import.meta.url));

function card() {
  const mark = h(
    "div",
    { style: { display: "flex", position: "relative", width: 56, height: 56, borderRadius: 13, backgroundColor: OG_PALETTE.ink } },
    h("div", { style: { position: "absolute", left: 15, right: 15, bottom: 15, height: 8, borderRadius: 4, backgroundColor: OG_PALETTE.accent } }),
  );
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        backgroundColor: OG_PALETTE.background,
        color: OG_PALETTE.ink,
      },
    },
    h("div", { style: { display: "flex", alignItems: "center", gap: 20, fontSize: 48, letterSpacing: "-0.04em" } }, mark, "DropItX"),
    h("div", { style: { display: "flex", fontSize: 84, lineHeight: 1.08, letterSpacing: "-0.03em" } }, "Drop a file. Get a link."),
    h(
      "div",
      { style: { display: "flex", justifyContent: "space-between", fontSize: 28, color: OG_PALETTE.muted } },
      h("span", null, "Markdown and HTML files as pages behind short links."),
      h("span", null, "dropitx.site"),
    ),
  );
}

async function main() {
  const response = new ImageResponse(card(), OG_SIZE);
  if (!response.ok) throw new Error(`ImageResponse returned HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0) throw new Error("ImageResponse returned an empty body");
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, bytes);
  console.log(`Wrote ${OUT} (${bytes.length} bytes, ${OG_SIZE.width}x${OG_SIZE.height})`);
}

main().catch((err) => {
  console.error("Generating the default OG card failed:", err);
  process.exitCode = 1;
});
