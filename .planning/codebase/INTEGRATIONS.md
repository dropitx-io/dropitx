# External Integrations

**Analysis Date:** 2026-08-10

## APIs & External Services

**FastAPI Backend (dropitx-api):**
- Purpose: All business logic — document CRUD, file uploads, search, analytics aggregation, team management
- Client: `authFetch()` from `lib/api-client.ts`
- Auth: Supabase JWT injected via `Authorization: Bearer` header; 401 auto-retry with session refresh
- Base URL: `NEXT_PUBLIC_API_URL` env var (default: cloudflare tunnel URL)
- Endpoints consumed: `/api/v1/documents`, and others via `authFetch()`

**Vercel Analytics:**
- Purpose: Web Vitals, page views, custom event tracking
- SDK: `@vercel/analytics` (loaded in `components/vercel-analytics.tsx`)
- Client-side tracking: `trackEvent()` from `lib/analytics.ts` with 5s throttle per event
- Events: `document_uploaded`, `content_published`, `share_viewed`, `embed_viewed`, `analytics_viewed`

**Vercel OG Image:**
- Purpose: Dynamic Open Graph image generation for social sharing
- SDK: `@vercel/og` (`ImageResponse`)
- Endpoint: `app/api/og-image/[slug]/route.tsx`
- Runtime: Edge

## Data Storage

**Databases:**
- PostgreSQL via Supabase
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon) / `SUPABASE_SERVICE_ROLE_KEY` (admin)
  - Clients: `@supabase/supabase-js` (admin), `@supabase/ssr` (server + browser)
  - RLS: All tables enforce Row Level Security; server components use anon client (respects RLS), admin operations use service-role client (bypasses RLS)

**File Storage:**
- Supabase Storage (bucket: `html-files`)
  - Uploaded content stored as HTML/Markdown files
  - Downloaded via `adminClient.storage.from("html-files").download(path)`
  - Path stored in `shares.storage_path`

**Caching:**
- None (no Redis or external cache)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - OAuth: Google, GitHub (login/callback routes in `app/(public)/auth/`)
  - Email/password: Login, reset-password, update-password flows
  - JWT: Managed via `@supabase/ssr` cookie-based sessions
  - Implementation:
    - Middleware (`middleware.ts`) refreshes session on every request via `updateSession()` in `utils/supabase/middleware.ts`
    - Server components: `createClient()` from `utils/supabase/server.ts` (anon, respects RLS)
    - Server admin ops: `createAdminClient()` from `utils/supabase/server.ts` (service-role, bypasses RLS)
    - Client components: `createClient()` from `utils/supabase/client.ts` (browser client)
  - Cookie domain: `.dropitx.site` (shared across apex + www)

**Password-Protected Shares:**
- Server-side: `bcryptjs` hashing via `lib/password.ts`
- Client-side: Password gate component (`components/password-gate.tsx`)
- Access cookie: HMAC-SHA256 signed via `lib/share-access-cookie.ts` (HttpOnly, 24h expiry, scoped to `/s/{slug}`)

**E2E Encryption:**
- Client-side only (Web Crypto API)
- AES-256-GCM via `lib/crypto.ts`
- Keys stored in URL fragment (`#key=...`), never sent to server
- PBKDF2 key derivation from passwords (600,000 iterations)

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry or equivalent configured)

**Logs:**
- Vercel platform logs (deployment logs)
- `console.log` / `console.error` in application code (no structured logging framework)

**Analytics:**
- Vercel Analytics for Web Vitals and custom events (see above)
- Custom share view tracking: RPC calls to `record_and_increment_share_view` and `increment_view_count`

## CI/CD & Deployment

**Hosting:**
- Vercel (frontend)
- Render (API backend — separate repo `dropitx-api/`)
- PyPI (CLI tool — separate repo `dropitx-cli/`)

**CI Pipeline:**
- Not detected (no GitHub Actions workflows in this repo)
- Build: `next build` (typecheck + ESLint skipped during build via `next.config.ts`)

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase admin service role key
- `NEXT_PUBLIC_API_URL` — FastAPI backend URL
- `NEXT_PUBLIC_APP_URL` — Public app URL for OG images and links
- `SHARE_ACCESS_SECRET` — HMAC signing secret for access cookies (falls back to `SUPABASE_SERVICE_ROLE_KEY`)

**Secrets location:**
- `.env.local` (local development, not committed)
- Vercel environment variables (production)

## Webhooks & Callbacks

**Incoming:**
- `/api/auth/callback` — Supabase OAuth callback (`app/(public)/auth/callback/route.ts`)
- `/api/auth/confirm` — Supabase email confirmation (`app/(public)/auth/confirm/route.ts`)

**Outgoing:**
- None detected (no outgoing webhook calls)

---

*Integration audit: 2026-08-10*
