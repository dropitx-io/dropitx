<!-- refreshed: 2026-08-10 -->
# Architecture

**Analysis Date:** 2026-08-10

## System Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Browser (Client Layer)                         │
│  `components/*.tsx`  |  `hooks/*.ts`  |  `utils/supabase/client.ts`│
│  React 19 + CodeMirror 6 + shadcn/ui + Tailwind CSS 4            │
├────────────────────────┬────────────────────────────────────────┤
│   Client Components     │   Client Hooks & Utils                   │
│   `editor-shell.tsx`   │   `use-auth-user.ts`                    │
│   `share-page-client.tsx`│   `use-auto-save.ts`                   │
│   `password-gate.tsx`    │   `lib/crypto.ts` (E2E encryption)     │
└────────────┬───────────┴────────────┬────────────────────────────┘
             │                        │
             ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              Next.js App Router (Server Layer)                    │
│  `app/(public)/`  |  `app/(dashboard)/`  |  `app/api/`          │
│  Server Components (default)  |  Middleware session refresh        │
│  `middleware.ts` → `utils/supabase/middleware.ts`                 │
└────────────┬──────────────────────────┬──────────────────────────┘
             │                          │
             ▼                          ▼
┌──────────────────────┐  ┌─────────────────────────────────────┐
│  Supabase            │  │  FastAPI Backend (separate repo)       │
│  `utils/supabase/     │  │  `lib/api-client.ts` → authFetch()    │
│    server.ts`         │  │  NEXT_PUBLIC_API_URL                  │
│  - Auth (JWT/cookies) │  │  - Document CRUD                      │
│  - Postgres (RLS)     │  │  - File uploads                       │
│  - Storage (files)    │  │  - Search                             │
│  - RPC functions      │  │  - Team management                   │
└──────────────────────┘  └─────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root Layout | Fonts (Inter, Geist Mono), ThemeProvider, ErrorBoundary, Toaster, VercelAnalytics | `app/layout.tsx` |
| Middleware | Session refresh via Supabase SSR, security headers (HSTS, CSP, X-Frame-Options) | `middleware.ts` |
| Public Layout | Minimal wrapper for unauthenticated routes | `app/(public)/layout.tsx` |
| Dashboard Layout | Auth guard (redirect if no user), fetches user profile + teams, renders DashboardShell | `app/(dashboard)/dashboard/layout.tsx` |
| API Client | Authenticated fetch to FastAPI backend with JWT injection and 401 retry | `lib/api-client.ts` |
| Session Middleware | Creates Supabase server client, refreshes JWT via `getClaims()`, writes rotated cookies | `utils/supabase/middleware.ts` |
| Share Page | Access control (private/password/owner checks), view recording, file rendering (Markdown/HTML) | `app/(public)/s/[slug]/page.tsx` |
| OG Image Generator | Dynamic social card image via `@vercel/og` (Edge runtime) | `app/api/og-image/[slug]/route.tsx` |
| Access Cookie | HMAC-SHA256 signed cookie for password-protected share access | `app/api/shares/[slug]/access-cookie/route.ts` |
| Crypto Utils | AES-256-GCM E2E encryption/decryption with Web Crypto API | `lib/crypto.ts` |
| Password Utils | bcryptjs hashing for share password protection | `lib/password.ts` |
| Team RPC | Supabase RPC calls for team CRUD, invites, role management, rate limiting | `lib/team-rpc.ts` |
| Analytics Tracking | Vercel Analytics event tracking with throttle | `lib/analytics.ts` |

## Pattern Overview

**Overall:** Next.js App Router with route groups, server components by default, and a separate FastAPI backend for business logic.

**Key Characteristics:**
- Server components are the default; `"use client"` only when hooks or browser APIs are required
- Authentication bootstraps from Supabase session cookies refreshed in middleware on every request
- The frontend is a thin rendering layer; all mutation business logic lives in the FastAPI backend
- Direct Supabase queries are used for reads (server components with RLS, admin client for unrestricted reads)
- Client-side state uses React hooks and context only (no external state management library)

## Layers

**Middleware Layer:**
- Purpose: Session refresh and security headers on every request
- Location: `middleware.ts`, `utils/supabase/middleware.ts`
- Contains: Auth session refresh (JWT validation + cookie rotation), HSTS, CSP, X-Frame-Options, Referrer-Policy
- Depends on: `@supabase/ssr` server client
- Used by: Every page and API route (except static assets and OG image route)

**Route Group — Public (`app/(public)/`):**
- Purpose: Unauthenticated pages
- Location: `app/(public)/`
- Contains: Landing page, editor, share viewer (`s/[slug]`), search, auth flows, embed, invite/accept, developers page
- Depends on: Supabase admin client (for unrestricted reads), Supabase anon client (for user auth check)
- Used by: Anonymous and authenticated users

**Route Group — Dashboard (`app/(dashboard)/dashboard/`):**
- Purpose: Authenticated user dashboard
- Location: `app/(dashboard)/dashboard/`
- Contains: Overview, analytics, favorites, profile, teams (CRUD + members + settings)
- Depends on: Supabase anon client (user session), FastAPI backend (via `authFetch`)
- Used by: Authenticated users only (redirect to `/auth/login` if unauthenticated)

**API Routes (`app/api/`):**
- Purpose: Minimal server-side endpoints
- Location: `app/api/`
- Contains: OG image generation (`og-image/[slug]`), access cookie setting (`shares/[slug]/access-cookie`)
- Depends on: `@vercel/og`, Supabase admin client, `lib/share-access-cookie.ts`
- Used by: Social media crawlers (OG images), password gate flow (access cookie)

**Components Layer:**
- Purpose: Reusable UI components and feature-specific views
- Location: `components/`
- Contains: 90+ components organized by feature (editor, dashboard, share viewing, teams, analytics, landing)
- Depends on: shadcn/ui primitives (`components/ui/`), Supabase clients, lib utilities
- Used by: Page components in `app/`

**Library/Utility Layer:**
- Purpose: Shared business logic, utilities, and helpers
- Location: `lib/`
- Contains: API client, crypto, password hashing, analytics, CodeMirror extensions, team RPC, validation, file utils
- Depends on: Supabase clients, bcryptjs, Web Crypto API, nanoid
- Used by: Components, pages, and API routes

**Types Layer:**
- Purpose: TypeScript interfaces for domain models
- Location: `types/`
- Contains: `share.ts`, `team.ts`, `team-event.ts`, `analytics.ts`
- Depends on: Nothing
- Used by: Components, lib modules, pages

## Data Flow

### Primary Request Path (Authenticated Page)

1. Browser sends request → `middleware.ts` (`middleware.ts:12`) refreshes Supabase session via `updateSession()` and applies security headers
2. Route group layout checks auth — Dashboard layout (`app/(dashboard)/dashboard/layout.tsx:6`) calls `supabase.auth.getUser()`, redirects to login if no user
3. Server component queries data — Direct Supabase query via `createClient(cookieStore)` from `utils/supabase/server.ts:6`
4. Component renders — Server component returns JSX with fetched data

### Share Viewing Path (Public)

1. Browser sends request → `middleware.ts` refreshes session
2. Share page (`app/(public)/s/[slug]/page.tsx:122`) fetches share via admin client (bypasses RLS for `password_hash` + `is_private` checks)
3. Access gate evaluation: private → 404; password-protected + no valid cookie → `PasswordGate` component; unauthenticated + no password → redirect to login
4. View recording: `adminClient.rpc("record_and_increment_share_view", ...)` with visitor hash, referrer, country
5. File download: `adminClient.storage.from("html-files").download(storage_path)`
6. Render: `MarkdownViewerWrapper` for markdown, `HtmlViewer` for HTML

### File Upload/Editor Path

1. User writes content in CodeMirror editor (`app/(public)/editor/page.tsx` → `components/editor-shell.tsx`)
2. Client-side auto-save via `use-editor-auto-save.ts` to localStorage
3. On publish: `authFetch("/api/v1/documents", { method: "POST" })` to FastAPI backend with JWT auth
4. If E2E encryption enabled: content encrypted client-side via `lib/crypto.ts` before upload; key stored in URL fragment

### Auth Flow

1. User clicks OAuth login → redirected to Supabase Auth provider
2. Callback → `app/(public)/auth/callback/route.ts` handles token exchange
3. Subsequent requests → middleware refreshes session from cookies
4. Server components read session via `cookies()` → `createClient(cookieStore)` → `supabase.auth.getUser()`

**State Management:**
- Server state: Fetched per-request in server components (no server-side caching)
- Client state: React hooks + localStorage (draft auto-save in editor)
- Auth state: Supabase cookies (refreshed in middleware, shared across tabs)

## Key Abstractions

**Supabase Client Factories:**
- Purpose: Create appropriately-scoped Supabase clients for different contexts
- Examples: `utils/supabase/client.ts` (browser), `utils/supabase/server.ts` (server anon + admin), `utils/supabase/middleware.ts` (edge)
- Pattern: Each factory handles its own cookie reading/writing semantics

**authFetch:**
- Purpose: Authenticated HTTP client for the FastAPI backend
- Examples: `lib/api-client.ts`
- Pattern: Singleton Supabase browser client, JWT injection from session, automatic 401 retry with session refresh

**TeamRPC / TeamService:**
- Purpose: Typed wrappers around Supabase RPC functions for team operations
- Examples: `lib/team-rpc.ts`
- Pattern: Class-based RPC client (`TeamRPC`) + higher-level validation service (`TeamService`), both exported as singletons

**Access Cookie (HMAC):**
- Purpose: Grant time-limited access to password-protected shares without re-prompting
- Examples: `lib/share-access-cookie.ts`
- Pattern: HMAC-SHA256 signed token in HttpOnly cookie, scoped to `/s/{slug}`, 24h expiry, timing-safe comparison

## Entry Points

**Application Root:**
- Location: `app/layout.tsx`
- Triggers: Every page load
- Responsibilities: Font loading (Inter, Geist Mono), ThemeProvider, ErrorBoundary, Toaster, VercelAnalytics wrapper

**Middleware:**
- Location: `middleware.ts`
- Triggers: Every non-static request (matcher excludes `_next/static`, `_next/image`, `favicon.ico`, `api/og-image`)
- Responsibilities: Supabase session refresh, security headers (HSTS in production, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy)

**Landing Page:**
- Location: `app/(public)/page.tsx`
- Triggers: `/` route
- Responsibilities: Renders `HomePage` component

**Editor:**
- Location: `app/(public)/editor/page.tsx`
- Triggers: `/editor` route
- Responsibilities: Renders `EditorShell` (CodeMirror 6 markdown editor with preview)

**Share Viewer:**
- Location: `app/(public)/s/[slug]/page.tsx`
- Triggers: `/s/{slug}` route
- Responsibilities: Access control, view recording, file rendering, OG metadata

**Dashboard:**
- Location: `app/(dashboard)/dashboard/page.tsx`
- Triggers: `/dashboard` route (auth required)
- Responsibilities: User's share management dashboard

**OG Image Endpoint:**
- Location: `app/api/og-image/[slug]/route.tsx`
- Triggers: `GET /api/og-image/{slug}` (Edge runtime)
- Responsibilities: Generates 1200x630 social card image

**Access Cookie Endpoint:**
- Location: `app/api/shares/[slug]/access-cookie/route.ts`
- Triggers: `POST /api/shares/{slug}/access-cookie`
- Responsibilities: Sets HMAC-signed access cookie after password unlock

## Architectural Constraints

- **Threading:** Single-threaded Node.js event loop (Next.js standard). Edge runtime used for OG image generation.
- **Global state:** Singleton Supabase browser client in `lib/api-client.ts` (`let _supabase`). No other module-level mutable state detected.
- **Circular imports:** None detected. Clean dependency flow: `types/` → `lib/` → `components/` → `app/`.
- **Build-time type checking disabled:** `next.config.ts` sets `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`. Type errors are only caught by local `npm run lint` (which runs ESLint, not `tsc`).
- **Cookie domain hardcoding:** All three Supabase client factories hardcode `domain: ".dropitx.site"` for cross-subdomain session sharing.

## Anti-Patterns

### Build-time type/ESLint checks disabled

**What happens:** `next.config.ts` sets `ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`, meaning TypeScript errors and lint violations do not block production builds.
**Why it's wrong:** Type errors and lint violations can ship to production undetected. The `@ts-nocheck` directive in `lib/team-rpc.ts` masks type issues in a critical module.
**Do this instead:** Fix pre-existing type errors incrementally and re-enable `ignoreBuildErrors: false`. Remove `@ts-nocheck` from `lib/team-rpc.ts` and add proper types.

### Hardcoded cookie domain

**What happens:** All three Supabase client factories (`utils/supabase/client.ts`, `utils/supabase/server.ts`, `utils/supabase/middleware.ts`) hardcode `domain: ".dropitx.site"`.
**Why it's wrong:** Prevents running on other domains (localhost, preview deployments, custom domains) without code changes.
**Do this instead:** Read the domain from an environment variable (e.g., `NEXT_PUBLIC_COOKIE_DOMAIN`) with a sensible default.

## Error Handling

**Strategy:** Try/catch with fallbacks. Analytics and view tracking never block user-facing flows.

**Patterns:**
- Analytics failures silently caught (`lib/analytics.ts:31` — `catch { }`)
- View recording fallback: if `record_and_increment_share_view` RPC fails, falls back to `increment_view_count` (`app/(public)/s/[slug]/page.tsx:193`)
- Access cookie verification returns `false` on any error (`lib/share-access-cookie.ts`)
- Decryption failures throw descriptive errors (`lib/crypto.ts`)

## Cross-Cutting Concerns

**Logging:** No structured logging. Application uses `console.log`/`console.error` as needed. Platform-level logs via Vercel.

**Validation:**
- Client-side: Email regex validation in `lib/team-rpc.ts`, custom slug validation in `lib/validate-custom-slug.ts`, general validation in `lib/validation.ts`
- Server-side: Supabase RLS policies enforce access control; RPC functions handle authorization
- Password verification: `bcryptjs` compare in `lib/password.ts`

**Authentication:**
- Middleware-driven session refresh on every request
- Server components check `supabase.auth.getUser()` for route protection
- Client components use `authFetch()` for API calls with JWT injection
- Password-protected shares use separate HMAC cookie flow

---

*Architecture analysis: 2026-08-10*
