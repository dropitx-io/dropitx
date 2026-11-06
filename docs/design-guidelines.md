# Design Guidelines

## Overview

DropItX uses one light design system: a warm off-white ground, a warm near-black ink, a single
orange accent, three self-hosted open-source faces, 8px radii and soft elevation. It is the
public-pages redesign (Open Design project `dropitx-redesign-public`) translated into the app.

- **Tokens** live in `app/globals.css` (`:root`, the `@theme` type scale and radii, and the
  `@theme inline` colour mapping). Read values from there; never copy hex values into components.
- **The public-page kit** (nav, footer, buttons, pills, badges, cards, fields, switches, the
  rendered-page `paper`/`doc`, code blocks, and the developers, sign-in and share layouts) is in
  `components/site/site.css`. The landing sections are in `components/landing/landing.css`. Both
  are imported by `globals.css` inside `@layer components`, so Tailwind utilities can still adjust
  an element.
- **App screens** (dashboard, analytics, teams, profile, editor) keep their layouts and take the
  palette, faces, radii and focus style through the tokens and the `components/ui/*` primitives.

The site is **light only**. There is no `.dark` token set, no theme toggle and no
`prefers-color-scheme: dark` rule. The `dark` Tailwind variant stays class-based
(`@custom-variant dark (&:is(.dark *))`) and nothing sets `.dark`, so any leftover `dark:` class
is inert. Do not add dark styles.

## Colour

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | #f2f1ed | Page ground |
| `--surface` | #e6e5e0 | Cards, lifted panels, pills |
| `--surface-warm` | #ebeae5 | Default button, alternate section tone (`.tone-warm`) |
| `--fg` | #26251e | Ink; the dark solid button |
| `--fg-2` | rgba(38, 37, 30, 0.9) | Secondary headings and lead text |
| `--muted` | rgba(38, 37, 30, 0.68) | Secondary text (`text-muted-foreground`), placeholders |
| `--meta` | rgba(38, 37, 30, 0.4) | Decoration only: link underlines. Never for text |
| `--border` / `--border-soft` | 10% / 6% ink | Card edge / row separators, ghost button fill |
| `--accent` | #f54e00 | Fills, large text, icons, the caret, the chart peak |
| `--accent-ink` | #b83a00 | Small accent text; the fill behind white labels |
| `--success` / `--warn` / `--danger` | #1f8a65 / #eab308 / #cf2d56 | Dots, bars, status fills |

The shadcn/app names map onto these, so existing classes keep working: `bg-background`
(`--bg`), `bg-frame`, `bg-sheet`, `bg-raised`, `bg-active`, `bg-card` (`--surface`),
`bg-primary` (`--fg`, the dark action), `text-muted-foreground` and `text-meta` (`--muted`),
`bg-accent` (a quiet hover surface), `bg-brand` / `text-brand-ink` (the orange), the
`pill-*` status pairs, `chart-1..5` and `sidebar-*`. Text-safe shades of the semantic colours
(`--success-ink`, `--warning`, `--destructive`) are used for words.

### Contrast rule for the accent

`#f54e00` measures about 3.1:1 on `--bg` and 3.5:1 under white, below WCAG AA for normal text.
Use it only for fills, large text (24px+, or 19px+ bold) and icons. For small accent text, and
for any white label on an accent button (`.btn-accent`, the `accent` Button variant), use
`--accent-ink` (5.1:1 on `--bg`, 5.8:1 under white).

`--muted` is 0.68 alpha rather than the design file's 0.55: 0.55 measures 3.5:1 on `--bg`, and
0.68 is the lightest step that reaches 4.5:1 (5.1:1 on `--bg`, 4.8:1 on `--surface`).
`lib/design-tokens.test.mjs` checks these ratios.

## Typography

Three open-source faces, self-hosted with Fontsource (imported in `app/layout.tsx`, so no page
or build fetches a font host):

| Role | Face | CSS variable | Use |
| --- | --- | --- | --- |
| Display | Inter | `--font-display` (alias `--font-sans`, class `font-sans`) | Headings, UI labels, buttons, nav, the dashboard |
| Body | EB Garamond (with italic) | `--font-body` (alias `--font-serif`, class `font-body`) | Reading text, page bodies, rendered Markdown |
| Mono | JetBrains Mono | `--font-mono` (class `font-mono`) | Code, slugs, keys, the editor |

Do not reference the design file's proprietary families; `lib/fonts.test.mjs` fails if any of
them appears in the source.

Type scale (the Tailwind `text-*` steps): 11, 14, 16, 19.2, 22, 26, 36 and 72px
(`text-xs` to `text-4xl`). Display tracking is `-0.03em` (`--tracking-display`), body line
height 1.5. Kit classes: `.h-hero`, `.h-section`, `.h-sub`, `.h-title`, `.lead`, `.ui-text`.

## Space, shape and elevation

- Spacing: `--space-1..12` = 4, 8, 12, 16, 20, 24, 32, 48px. Sections pad 80px (48px under 900px,
  40px under 600px) through `.sec`.
- Container: `.wrap`, 1200px plus a 24px gutter (16px under 900px). The design's `.container` is
  named `.wrap` here because Tailwind owns `container`.
- Radius: `rounded-sm` 8px (buttons, fields, cards), `rounded-md` 10px (featured cards, dialogs),
  `rounded-lg` 12px, `rounded-full` pills.
- Elevation: flat by default; `--elev-ring` (a 1px ring) and `--elev-raised` (the featured card,
  dialogs).
- Focus: a 2px ink outline, 2px offset, with `--focus-ring` shadow, on every interactive element.

## Components

- **Buttons** (`.btn` + `.btn-dark` / `.btn-primary` / `.btn-secondary` / `.btn-accent`, sizes
  `.btn-lg`, `.btn-block`). One dark solid action per screen. In React use the `squareButton()`
  recipe from `app/(content)/_ui/public-styles.ts` on public pages, or `components/ui/button.tsx`
  (`default` = dark, `outline` = warm ringed, `secondary`, `ghost`, `accent`) in the app.
- **Fields**: `.field` wrapper with a label, the input, `.field-help` and `.field-error`
  (shown only when it has text); `aria-invalid="true"` turns the edge red.
- **Switches**: `role="switch"` buttons with `aria-checked`, styled by `.switch`.
- **Navigation and footer**: `PublicNav` (`app/(content)/_ui/public-nav.tsx`) and
  `LandingFooter` (`components/landing-footer.tsx`), both reading `components/site/site-links.ts`.
  Every link must point at an existing route; `components/site/site-links.test.mjs` checks this.

## Motion

`[data-reveal]` elements rise in as they scroll into view once `RevealOnScroll` arms
`html.reveal-armed`; without script they are simply visible. `.rise` is a load entrance with a
`--i` stagger. Both run only under `prefers-reduced-motion: no-preference`, and reduced motion
cuts every transition and animation to 1ms.

## Pricing switch

The landing page's Pricing section and the nav/footer Pricing links are built but hidden unless
`NEXT_PUBLIC_SHOW_PRICING` is exactly `true` at build time (`lib/feature-flags.ts`,
`showPricing()`). The default, and any other value, keeps them out of the page.

## Link previews

`lib/og-palette.ts` holds the preview colours (checked against the tokens by
`lib/og-palette.test.mjs`). The OG route `app/api/og-image/[slug]` draws with it, and
`public/og-card-default.png` (used by protected shares) is regenerated with
`node scripts/generate-og-card.mjs`.
