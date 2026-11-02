# Design Guidelines

## Overview

DropItX uses **Olive on bone**: one ground, one ink, one accent, with flat surfaces separated by a
tone step or a 1px line, never by a shadow. The direction was dealt with the taste-skill
(`design-taste-frontend`) on 2026-11-02 and refined in OpenDesign. Tokens live in
`app/globals.css`; read them from there rather than copying values into components.

Two registers share the palette:

- **Pages** (landing, developers, sign-in, the public share view) follow the direction "The
  sentence is the layout": a short sentence at poster scale with a piece of the product sitting
  inside it where a word would be. Newsreader is the only face.
- **App screens** (dashboard, analytics, teams, settings, profile, editor) follow the "Framed
  sheet" app style: a tinted L-frame holds the sidebar and a 48px top bar; the work sits on a
  sheet inset 8px from the right and bottom edges with a 1px edge and 16px corners. Roboto is the
  UI face.

## Colour

| Token | Light | Role |
| --- | --- | --- |
| `--background` | #ecebe7 | Page ground (bone) |
| `--foreground` | #38450f | Page ink (olive), running text in full ink |
| `--surface` | #e1dfd9 | One tone step for panels on pages |
| `--field` / `--field-foreground` | #38450f / #ecebe7 | Inverted olive field (footer, a chosen band) |
| `--frame` | #ecebe7 | App L-frame (sidebar and top bar) |
| `--sheet` | #fbfaf7 | App page sheet |
| `--raised` / `--active` | #f3f2ee / #e4e2dc | Hover and selected states, the active nav pill |
| `--card-foreground` | #1f2508 | Primary ink on the sheet |
| `--muted-foreground` | #4f5733 | Secondary text, holds 4.5:1 on the sheet |
| `--border` / `--rule` / `--input` | #dedcd5 / #ebe9e3 / #c9c6bd | Card edge, row rule, control border |
| `--primary` | #38450f | The one filled action per screen |
| `--chart-1` | #38450f | The one data hue, on the main series |

Status uses pale pill pairs: `--pill-positive-*`, `--pill-negative-*`, `--pill-warning-*`.
A `.dark` companion inverts the proportions (olive ground, bone ink, pale olive accent) and is
selected by the system setting through `next-themes`.

Rules: colour goes on data, status and the one primary action; app chrome stays grey. No
gradients, glows, glass or violet/terracotta accents. Never hard-code hex values in components.

## Type

- **Pages:** Newsreader Variable (self-hosted via `@fontsource-variable/newsreader`, optical
  sizes on). Put `.type-page` on the page root; `.display` sets the poster lines (weight 300,
  -0.05em, leading 0.9). Five sizes at most; body 18px and up; nothing under 13px.
- **App screens:** Roboto Variable for all UI, `tabular-nums` on every figure. Sizes
  12/14/16/24; the h1 is a 24px noun ("Links", "Analytics").
- **Monospace** (Roboto Mono) only for code, slugs and API keys.

## Components

- Buttons: flat, one fill. App controls are `rounded-md` (6px); page buttons are square
  (`rounded-none`) and at least 44px tall.
- Cards and panels: `rounded-lg` (8px), a 1px `border-border` or a tone step, never both a border
  and a shadow. Shadows only on things that float (menus, dialogs, toasts).
- Labels: sentence case, 12–14px grey. No eyebrow labels, pill badges above headings, tracked
  uppercase captions or 01/02/03 numbering.
- Tables: grey 12–13px sentence-case headers with no fill band, numbers right-aligned, one status
  pill per row, no zebra striping. Below 640px rows become two-line items.
- Icons: lucide-react at 16px, 1.5 stroke, grey; never inside tinted squares.
- Charts: one series in `--chart-1`, straight 2px segments, 3–5 faint horizontal gridlines, no
  legend for a single series, annotate a spike only with its real cause.

## States

A real zero prints as `0`; a missing value is a grey `—`. Empty blocks keep their frame and header
with one sentence. Loading shows the final layout with flat grey bars (no shimmer). Errors sit
inside the block that failed, with a Retry action.

## Motion

Transform and opacity only, with a `prefers-reduced-motion` fallback (`app/globals.css`).

- Pages: the hero slot opens once with `.shutter`; section parts enter staggered through
  `[data-reveal]` driven by `components/reveal-on-scroll.tsx`; content stays visible without script.
- App screens: motion is feedback only (press, hover, focus, menus opening). Nothing performs an
  entrance.

## Checking a change

```bash
node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs <files>          # pages
node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs --app <files>    # app screens
node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs <url>         # production build
```

Inspector output lands in `.taste-skill/` (gitignored).
