# Codebase Structure

**Analysis Date:** 2026-08-10

## Directory Layout

```
dropitx/
├── app/                      # Next.js App Router pages and layouts
│   ├── (public)/            # Unauthenticated route group
│   ├── (dashboard)/          # Authenticated route group
│   ├── api/                 # API routes (OG image, access cookie)
│   ├── layout.tsx           # Root layout (fonts, providers, analytics)
│   ├── error.tsx            # Global error boundary page
│   ├── loading.tsx          # Global loading state
│   ├── not-found.tsx        # 404 page
│   ├── globals.css          # Tailwind + Clay design system tokens
│   └── markdown-viewer.css  # Markdown rendering styles
├── components/               # Feature and UI components
│   ├── ui/                  # shadcn/ui primitives (button, dialog, etc.)
│   ├── analytics/           # Dashboard analytics sub-components
│   ├── auth/                # Auth-related sub-components
│   └── team/                # Team management sub-components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility modules and business logic
│   └── editor-extensions/   # CodeMirror extension modules
├── types/                   # TypeScript domain type definitions
├── utils/                   # Framework-specific client factories
│   └── supabase/            # Supabase client factories (client, server, middleware)
├── public/                  # Static assets (SVGs)
├── middleware.ts            # Edge middleware (session refresh, security headers)
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.mjs        # ESLint flat config
├── postcss.config.mjs       # PostCSS (Tailwind plugin)
└── package.json             # Dependencies and scripts
```

## Directory Purposes

**`app/` — Next.js App Router:**
- Purpose: Page components, layouts, loading/error states, API routes
- Contains: Route groups `(public)` and `(dashboard)`, API route handlers
- Key files: `layout.tsx` (root), `globals.css` (design system)

**`app/(public)/` — Public routes (no auth required):**
- Purpose: Landing page, editor, share viewer, search, auth flows, embed, invite acceptance, developers page
- Contains: `page.tsx` (landing), `editor/page.tsx`, `s/[slug]/page.tsx` (share viewer), `search/page.tsx`, `auth/login/page.tsx`, `auth/callback/route.ts`, `embed/[slug]/page.tsx`, `invite/accept/page.tsx`, `developers/page.tsx`

**`app/(dashboard)/dashboard/` — Protected dashboard routes:**
- Purpose: Authenticated user dashboard pages
- Contains: `page.tsx` (overview), `analytics/page.tsx`, `analytics/[slug]/page.tsx`, `favorites/page.tsx`, `profile/page.tsx`, `teams/page.tsx`, `teams/[slug]/page.tsx`, `teams/[slug]/members/page.tsx`, `teams/[slug]/settings/page.tsx`, `teams/new/page.tsx`

**`app/api/` — API route handlers:**
- Purpose: Server-side endpoints not delegated to the FastAPI backend
- Contains: `og-image/[slug]/route.tsx` (Edge OG image), `shares/[slug]/access-cookie/route.ts` (HMAC cookie)

**`components/` — React components:**
- Purpose: All UI components organized by feature
- Contains: 90+ components; feature sub-components in `analytics/`, `auth/`, `team/`
- Key files: `dashboard-shell.tsx`, `editor-shell.tsx`, `share-page-client.tsx`, `password-gate.tsx`, `home-page.tsx`

**`components/ui/` — shadcn/ui primitives:**
- Purpose: Low-level reusable UI components managed via shadcn CLI
- Contains: `alert.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `popover.tsx`, `select.tsx`, `skeleton.tsx`, `sonner.tsx`, `textarea.tsx`

**`lib/` — Utility and business logic modules:**
- Purpose: Shared logic, API clients, crypto, validation, CodeMirror extensions
- Contains: ~30 modules; editor extensions in `editor-extensions/` subdirectory
- Key files: `api-client.ts`, `crypto.ts`, `password.ts`, `share-access-cookie.ts`, `team-rpc.ts`, `analytics.ts`

**`hooks/` — Custom React hooks:**
- Purpose: Reusable client-side React hooks
- Contains: `use-email-validation.ts`, `use-team.ts`, `use-toast.ts`
- Note: Some hooks live in `lib/` (e.g., `lib/use-auth-user.ts`, `lib/use-auto-save.ts`, `lib/use-scroll-sync.ts`) — inconsistency in placement

**`types/` — TypeScript type definitions:**
- Purpose: Shared domain interfaces and types
- Contains: `share.ts`, `team.ts`, `team-event.ts`, `analytics.ts`

**`utils/supabase/` — Supabase client factories:**
- Purpose: Framework-specific Supabase client creation for different contexts
- Contains: `client.ts` (browser), `server.ts` (server anon + admin), `middleware.ts` (edge refresh), `profile.ts`

**`public/` — Static assets:**
- Purpose: Static files served at root
- Contains: SVG icons (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`)

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout with fonts, ThemeProvider, ErrorBoundary, Toaster, VercelAnalytics
- `middleware.ts`: Edge middleware for session refresh and security headers
- `app/(public)/page.tsx`: Landing page (renders `HomePage` component)
- `app/(dashboard)/dashboard/layout.tsx`: Auth-guarded dashboard layout

**Configuration:**
- `next.config.ts`: Next.js config (type/ESLint checks disabled during build)
- `tsconfig.json`: TypeScript strict mode, `@/*` path alias
- `eslint.config.mjs`: ESLint flat config (next/core-web-vitals + TypeScript)
- `postcss.config.mjs`: Tailwind CSS PostCSS plugin
- `app/globals.css`: Full Clay design system with OKLCH tokens, animations, utility classes

**Core Logic:**
- `lib/api-client.ts`: Authenticated fetch wrapper for FastAPI backend
- `lib/crypto.ts`: AES-256-GCM E2E encryption (Web Crypto API)
- `lib/password.ts`: bcryptjs password hashing/verification
- `lib/share-access-cookie.ts`: HMAC-SHA256 signed access cookie management
- `lib/team-rpc.ts`: Team management RPC wrappers (TeamRPC + TeamService classes)
- `lib/analytics.ts`: Vercel Analytics event tracking with throttle

**Supabase Clients:**
- `utils/supabase/client.ts`: Browser client factory
- `utils/supabase/server.ts`: Server client factory (anon + admin)
- `utils/supabase/middleware.ts`: Edge middleware session refresh

**Domain Types:**
- `types/share.ts`: Share, ShareGroup, GroupShare, SearchResult, Folder, Tag interfaces
- `types/team.ts`: Team, TeamMember, TeamInvite, TeamShare, TeamRole, TeamPlan types
- `types/analytics.ts`: ShareView, ShareAnalytics, ViewTimeSeriesPoint, ReferrerBreakdown, GeoBreakdown, TopShare types

## Naming Conventions

**Files:**
- kebab-case for all files: `api-client.ts`, `upload-dropzone.tsx`, `share-page-client.tsx`
- UI primitives use single-word filenames: `button.tsx`, `card.tsx`, `dialog.tsx`
- Type definition files use single-word filenames: `share.ts`, `team.ts`
- Page components are always `page.tsx`, layouts are `layout.tsx`, API handlers are `route.ts` or `route.tsx`

**Directories:**
- kebab-case for feature directories: `editor-extensions/`, `auth-user-menu.tsx`
- Parenthesized route groups: `(public)/`, `(dashboard)/`
- Dynamic segments in brackets: `[slug]/`

**Components:**
- PascalCase exports: `EditorShell`, `DashboardShell`, `PasswordGate`, `SharePageClient`
- File name matches the primary export: `editor-shell.tsx` → `EditorShell`

**Variables/Functions:**
- camelCase for all variables and functions: `authFetch`, `getApiUrl`, `hasValidAccessCookie`
- CONSTANT_CASE for exported constants: `AnalyticsEvent`, `SITE_URL`

**Types/Interfaces:**
- PascalCase for types and interfaces: `Share`, `TeamRole`, `TeamMember`
- File names are lowercase single words matching the domain: `share.ts`, `team.ts`

## Where to Add New Code

**New public page/route:**
- Implementation: `app/(public)/<route>/page.tsx`
- If route needs auth: `app/(dashboard)/dashboard/<route>/page.tsx`

**New API endpoint:**
- Implementation: `app/api/<endpoint>/route.ts` or `app/api/<endpoint>/[param]/route.ts`
- Note: Most API logic belongs in the FastAPI backend (`dropitx-api/`). Only add Next.js API routes for Vercel-specific features (Edge runtime, cookies).

**New UI component (feature):**
- Implementation: `components/<component-name>.tsx`
- Related sub-components: `components/<feature>/<sub-component>.tsx`

**New UI primitive:**
- Implementation: Add via `npx shadcn add <component>` (places in `components/ui/`)

**New utility/module:**
- Implementation: `lib/<module-name>.ts`
- Supabase-related client logic: `utils/supabase/<module>.ts`

**New domain type:**
- Implementation: `types/<domain>.ts`

**New custom hook:**
- Implementation: `hooks/use-<hook-name>.ts`
- Note: Some hooks are in `lib/` — prefer `hooks/` for new ones

**New CodeMirror extension:**
- Implementation: `lib/editor-extensions/<extension-name>.ts`

## Special Directories

**`app/(public)/auth/`:**
- Purpose: Authentication flow routes (login, callback, confirm, reset-password, update-password)
- Generated: Partially (Supabase Auth scaffolding)
- Committed: Yes

**`components/ui/`:**
- Purpose: shadcn/ui component primitives
- Generated: Yes (via `npx shadcn add <component>`)
- Committed: Yes

**`public/`:**
- Purpose: Static assets
- Generated: No
- Committed: Yes

**`.planning/`:**
- Purpose: GSD planning documents (not part of application code)
- Generated: Yes (by GSD workflow)
- Committed: No (in `.gitignore` based on git status)

**`supabase/` (not present in this repo):**
- Purpose: Database schema and migrations (lives in the workspace root, not this frontend repo)
- Note: Schema is managed in the parent workspace, not committed here

---

*Structure analysis: 2026-08-10*
