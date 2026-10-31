# Design Guidelines

## Overview

DropItX uses the **Clay design system** — a light-first, warm design language with Tailwind CSS 4 + shadcn/ui. Tokens defined in `app/globals.css` via CSS custom properties and hex colors. Clay features a warm cream canvas (#f7eee6), terracotta accent (#9a5b3c), generous organic border radii (14–34px), layered soft shadows, and art-directed typography. The system bridges tactile warmth with modern clarity.

## Design Principles

- **Light-first**: Warm cream (#f7eee6) as default canvas; optional dark companion for assistive needs
- **Warm neutrals**: Near-black brown (#2b211c) for text, warm beige (#dac8b9) for borders
- **Terracotta accent**: Single chromatic color (#9a5b3c) for primary actions, focus rings, and data viz
- **Organic shapes**: Generous border radii (14px, 22px, 34px) create friendly, inviting surfaces
- **Soft elevation**: Layered shadows with both dark (depth) and light (inset highlight) for three-dimensionality
- **Accessibility**: WCAG 2.1 AA contrast, keyboard nav, semantic HTML, focus rings on all interactive elements
- **Typography-forward**: Fluid heading scales (clamp 28–76px), geometric sans (Inter), structured hierarchy with mono (Geist Mono) for accents

## Color System

Clay tokens in `app/globals.css` use hex colors for light mode (default) with warm, tactile harmonies. A dark companion palette exists for accessibility but light is primary.

### Light Mode (Default)

| Token | Value | Purpose |
|-------|-------|---------|
| `--background` | #f7eee6 | Page canvas — warm cream |
| `--foreground` | #2b211c | Primary ink — near-black brown |
| `--card` | #fff8f1 | Card surface — lighter cream |
| `--card-foreground` | #2b211c | Card text |
| `--primary` | #9a5b3c | Buttons, CTAs, focus rings — terracotta |
| `--primary-foreground` | #ffffff | Text on terracotta |
| `--secondary` | #ead6c7 | Secondary surfaces — warm beige |
| `--secondary-foreground` | #2b211c | Secondary text |
| `--muted` | #eaded4 | Muted backgrounds |
| `--muted-foreground` | #766860 | Muted text — medium brown |
| `--accent` | #9a5b3c | Accent (same as primary) |
| `--accent-soft` | #ead6c7 | Hover/disabled states |
| `--accent-line` | #dac8b9 | Subtle dividers |
| `--fg-soft` | #5a4b43 | Secondary text |
| `--border` | #dac8b9 | Standard borders |
| `--border-soft` | #eaded4 | Soft dividers |
| `--input` | #dac8b9 | Input backgrounds |
| `--ring` | #9a5b3c | Focus rings — terracotta |
| `--destructive` | #b84c4c | Error/danger — clay red |
| `--success` | #468352 | Success — matcha green |
| `--warning` | #c88735 | Warning — lemon gold |

### Dark Companion Palette

A muted warm-dark exists (activated via `.dark` class) for users who need dark mode. Primary colors soften, surfaces darken, but the warm terracotta tone persists.

### Data Visualization Palette

Charts use vivid, distinct hues inspired by Clay's warmth:

| Token | Value | Purpose |
|-------|-------|---------|
| `--chart-1` | #b46a46 | Terracotta (primary) |
| `--chart-2` | #4d8f5a | Matcha green |
| `--chart-3` | #5b9bd5 | Blueberry |
| `--chart-4` | #c88735 | Lemon gold |
| `--chart-5` | #8b5cf6 | Ube purple |

### Extended Tokens

- `--surface`: #fff8f1 — Card surface for nested components
- `--surface-warm`: #ead6c7 — Warm surface for layering
- `--meta`: #9a5b3c — Metadata/label color (terracotta)
- `--shadow`: Layered elevation (dark inset + light drop) for three-dimensionality
- `--upload-pulse-dim/bright`: Terracotta-tinted animation for upload states

## Typography

- **Body font**: Inter (`--font-sans`) — weights 300–700 — for all body text and structured hierarchy
- **Mono font**: Geist Mono (`--font-mono`) — weights 400–600 — for accents, metadata, code, labels
- **Type scale**: Fluid clamps from mobile → desktop
  - `.eyebrow`: 11px, uppercase, mono, 0.0875em tracking
  - `.meta`: 12px, mono, 0.075em tracking, terracotta (#9a5b3c)
  - **Body**: 14–16px (default)
  - **Headings**: Fluid scales via `.heading-fluid-lg` (40–76px) and `.heading-fluid-md` (28–36px)
- **Fluid headings**:
  - `.heading-fluid-lg`: `clamp(40px, 6vw, 76px)` — H1, hero text
  - `.heading-fluid-md`: `clamp(28px, 4vw, 36px)` — H2, section headers
  - Negative tracking (letter-spacing) for visual tightness
- Line height: 1.06 (headings, tight), 1.5–1.6 (body, readable)

## Component Library

### UI Components (`components/ui/`)
- **Button**: Variants via `class-variance-authority` (default, outline, secondary, ghost, destructive, link) + sizes (default, xs, sm, lg, icon)
- **Card**: Container with Header, Content, Footer, Title, Description, Action subcomponents
- **Input**: Base UI Input primitive with consistent styling
- **Textarea**: Multi-line input component with consistent styling
- **Dialog**: Modal dialog component for user interactions
- **Select**: Dropdown select component for single/multiple selections
- **Badge**: Status and indicator component with various styles
- **Alert**: Contextual alert component with different severity levels
- **Toaster**: Sonner toast with theme-aware Lucide icons
- **Skeleton**: Loading state component matching final layout

### Upload / Share Components
- **UploadDropzone**: react-dropzone; state machine (idle/dragging/uploading/success/error); full-width mobile, max-w-2xl centered desktop
- **ShareLink**: Share URL display + copy-to-clipboard + delete link
- **HtmlViewer**: Sandboxed iframe + CSP meta tag injection for secure HTML rendering
- **MarkdownViewer**: react-markdown + remark-gfm + shiki; preview/raw toggle; GitHub-like prose styles
- **MarkdownViewerWrapper**: `next/dynamic` wrapper (client-side only)

### Editor Components
- **EditorShell**: Top-level editor layout; split-pane at `lg:` breakpoint
- **EditorPane**: CodeMirror 6; monospace font; theme follows system dark/light via Compartment
- **EditorPreview**: Live Markdown rendering; matches MarkdownViewer prose styles
- **EditorToolbar**: Format action buttons; keyboard shortcut labels
- **EditorPublishBar**: Title input, custom slug input, privacy toggle, publish button; sticky at bottom

### Dashboard / Auth Components
- **DashboardShareCard**: Share card with title, slug, stats (views), edit/delete actions, password lock toggle
- **ApiKeyManager**: Table of API keys (prefix, created_at, last_used_at); create/revoke actions
- **BookmarkToggle**: Icon button; filled/outline state; optimistic update
- **ProfileForm**: Display name + avatar URL inputs with save feedback
- **AuthUserMenu**: Header dropdown; avatar or initials fallback; profile + logout links
- **AnalyticsStatsCards**: Performance metrics cards for dashboard analytics view
- **AnalyticsCharts**: Recharts-based visualization components for user engagement data

### Header Components
- **HeaderBar**: Main header orchestrator; manages mobile/desktop state and mobile drawer
- **HeaderNav**: Desktop navigation links; responsive menu toggle for mobile
- **HeaderMobileDrawer**: Slide-out mobile navigation with backdrop and close functionality

### Search / Navigation
- **SearchBar**: Debounced (300 ms) input → URL params navigation
- **SearchResults**: Result cards with relative time, skeleton loading, empty state
- **ThemeProvider**: next-themes class-based dark/light toggle

### Team Components
- **CreateTeamForm**: Workspace creation interface with name/description inputs
- **TeamMemberRow**: Member display with role indicator and remove action
- **TeamNav**: Workspace navigation sidebar with member list
- **TeamShareCard**: Share card within workspace context with workspace actions
- **InviteMemberDialog**: Email-based invitation system for workspace members
- **TeamInviteForm**: Enhanced invite form with role selection and email validation
- **EnhancedInviteDialog**: Invite dialog with team RPC client and link generation
- **BulkInviteDialog**: Bulk invitation system supporting multiple email addresses
- **InviteAcceptForm**: Accept invitation and join team flow
- **InviteStatusCard**: Invite status tracking and management
- **CopyButton**: Copy-to-clipboard component for share links

## Spacing & Radius

### Spacing

8pt grid convention: Tailwind spacing values 2–16 (`8px` → `64px`). Standard padding: `p-4` (16px) or `p-6` (24px) on cards. Gap for flexbox: `gap-6` (24px) or `gap-8` (32px).

### Border Radius (Clay Organic)

Clay uses generous, friendly radii — no sharp corners:

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 14px | Small buttons, badges, subtle curves |
| `--radius-md` | 22px | Standard radius for cards, inputs, buttons |
| `--radius-lg` | 34px | Large sections, hero sections, prominent cards |
| `--radius-card` | 22px | Card containers |
| `--radius-section` | 34px | Page sections, blocks |
| `--radius-pill` | 9999px | Fully rounded (pills, toggles) |

### Elevation & Shadows

Clay uses **soft, layered shadows** for three-dimensionality:

```css
/* Raised elevation: shadow from below + light inset highlight */
--shadow: 8px 10px 24px rgba(128, 92, 70, 0.18), 
          -8px -8px 20px rgba(255, 255, 255, 0.70);

/* Focus ring: soft terracotta glow */
--focus-ring: 0 0 0 4px rgba(154, 91, 60, 0.24);

/* Flat (no shadow) */
--elev-flat: none;
```

This creates a subtle, warm, inviting appearance without harsh contrast.

## Responsive Design

Tailwind breakpoints (mobile-first):

| Breakpoint | Width | Usage |
|------------|-------|-------|
| default | < 640px | Stacked single-column |
| `sm:` | 640px | |
| `md:` | 768px | Two-column grids |
| `lg:` | 1024px | Editor split-pane, share page sidebar |

- Upload area: full-width on mobile, `max-w-2xl` centered on desktop
- Editor: single pane on mobile, split 50/50 on `lg:`
- Share page: stacked on mobile, sidebar layout on `lg:`

## Interaction Patterns

| Pattern | Implementation |
|---------|---------------|
| File upload | Drag-and-drop + click fallback; visual state feedback |
| Copy to clipboard | `navigator.clipboard.writeText` with fallback |
| Search | Debounced input → URL params → API call → results |
| Theme toggle | Class-based `.dark` on `<html>` |
| OAuth login | Button click → Firebase sign-in popup → session cookie minted |
| Email authentication | Split-screen login with form validation and PKCE flow |
| Team invite | Single invite with role selection, bulk invite, resend functionality |
| Favorites toggle | `BookmarkToggle`; optimistic update; auth-gated |
| Editor publish | `EditorPublishBar`; validates title; submits to `/api/publish` |
| Slash commands | Type `/` in `EditorPane`; command palette overlay |
| Image drop in editor | Drop image → `POST /api/images/upload` → insert `![alt](url)` |
| Error handling | Sonner toast; error boundary for unhandled errors |
| Loading states | Skeleton components matching final layout |
| Invite flow | Form validation → server validation → success feedback |

## Security in UI

- **HtmlViewer**: Sandboxed iframe (`sandbox="allow-scripts"`) + CSP meta tag injection
- **File validation**: Extension (`.html`/`.htm`/`.md`), size (≤ 50 MB) checks client-side; MIME validation server-side
- **Image validation**: Extension + size (≤ 5 MB) client-side hint; full validation server-side
- **Rate limiting**: 10 requests/minute per IP on write endpoints; 5 attempts/10 min for password unlock
- **Password protection**: verified by the API's unlock endpoint; the unlocked content renders in place (no access cookie)
- **Team workspace isolation**: the API ensures members only see their own workspace content
