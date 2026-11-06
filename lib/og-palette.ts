/**
 * Colours for link-preview images (the OG route and the default card), taken
 * from the design tokens in app/globals.css. Satori draws plain hex colours,
 * so alpha tokens are given here already composited over --bg.
 * lib/og-palette.test.mjs checks these against the tokens.
 */
export const OG_PALETTE = {
  /** --bg */
  background: "#f2f1ed",
  /** --surface */
  surface: "#e6e5e0",
  /** --fg */
  ink: "#26251e",
  /** --muted (rgba(38, 37, 30, 0.68)) composited over --bg */
  muted: "#676660",
  /** --accent: fills and large text only */
  accent: "#f54e00",
} as const;

export const OG_SIZE = { width: 1200, height: 630 } as const;
