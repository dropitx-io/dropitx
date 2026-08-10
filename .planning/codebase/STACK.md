# Technology Stack

**Analysis Date:** 2026-08-10

## Languages

**Primary:**
- TypeScript 5.x — All application code (`.ts`, `.tsx`). Strict mode enforced in `tsconfig.json`.

**Secondary:**
- CSS — Tailwind CSS 4 utility classes + custom OKLCH design tokens in `app/globals.css`

## Runtime

**Environment:**
- Node.js (version not pinned; `@types/node@^20`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.2.4 — React metaframework with App Router
- React 19.2.4 — UI rendering library
- React DOM 19.2.4 — DOM rendering

**UI/Styling:**
- Tailwind CSS 4 — Utility-first CSS (via `@tailwindcss/postcss`)
- shadcn 4.4.0 — Component registry (CLI-managed, not a runtime dependency)
- tw-animate-css 1.4.0 — Animation utilities
- class-variance-authority 0.7.1 — Component variant styling
- tailwind-merge 3.5.0 — Tailwind class deduplication
- clsx 2.1.1 — Conditional classnames

**Editor:**
- CodeMirror 6 (`@codemirror/autocomplete`, `@codemirror/commands`, `@codemirror/lang-markdown`, `@codemirror/language`, `@codemirror/language-data`, `@codemirror/state`, `@codemirror/theme-one-dark`, `@codemirror/view`) — Markdown editor
- Shiki 4.0.2 — Syntax highlighting for rendered output
- react-markdown 10.1.0 — Markdown rendering
- remark-gfm 4.0.1 — GitHub-Flavored Markdown support

**Charts:**
- Recharts 3.8.1 — Dashboard analytics charts

**Build/Dev:**
- TypeScript 5.x — Type checking (`next build` runs `tsc`)
- ESLint 9.x — Linting (eslint-config-next 16.2.4, core-web-vitals + TypeScript presets)
- PostCSS — CSS processing (via `@tailwindcss/postcss`)

## Key Dependencies

**Critical:**
- @supabase/ssr 0.10.2 — Server-side session management and cookie-based auth
- @supabase/supabase-js 2.104.0 — Supabase client for database and storage access
- bcryptjs 3.0.3 — Password hashing for protected shares (client-side hash comparison)
- nanoid 5.1.9 — Unique ID generation

**Infrastructure:**
- @vercel/analytics 2.0.1 — Web Vitals and event tracking
- @vercel/og 0.11.1 — OG image generation (Edge runtime)
- @base-ui/react 1.4.1 — Base UI primitives
- @radix-ui/react-dialog 1.1.15 — Accessible dialog component
- @radix-ui/react-select 2.2.6 — Accessible select component
- sonner 2.0.7 — Toast notifications
- next-themes 0.4.6 — Theme management (dark mode toggle)
- lucide-react 1.8.0 — Icon library
- react-dropzone 15.0.0 — File upload dropzone

## Configuration

**Environment:**
- `.env.local` present (not committed — contains secrets)
- `.env.example` exists (template for required variables)
- Key env vars (inferred from code):
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key
  - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (admin operations)
  - `NEXT_PUBLIC_API_URL` — FastAPI backend URL (default: cloudflare tunnel URL)
  - `NEXT_PUBLIC_APP_URL` — App public URL (default: `https://dropitx.com`)
  - `SHARE_ACCESS_SECRET` — HMAC secret for access cookies (fallback: SUPABASE_SERVICE_ROLE_KEY)

**Build:**
- `next.config.ts` — TypeScript/ESLint checks skipped during build (`ignoreBuildErrors: true`, `ignoreDuringBuilds: true`)
- `tsconfig.json` — Strict mode, ES2017 target, `@/*` path alias
- `eslint.config.mjs` — Flat config with next/core-web-vitals + TypeScript presets
- `postcss.config.mjs` — Tailwind CSS PostCSS plugin

## Platform Requirements

**Development:**
- Node.js (20+ recommended based on `@types/node@^20`)
- npm
- Supabase CLI (for local migrations: `supabase db push`)

**Production:**
- Deployment target: Vercel
- Edge runtime used for OG image generation (`app/api/og-image/[slug]/route.tsx`)

---

*Stack analysis: 2026-08-10*
