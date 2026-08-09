<!-- generated-by: gsd-doc-writer -->

# Configuration

This document covers all configuration surfaces for the DropItX Next.js frontend: environment variables, config files, required vs. optional settings, defaults, and per-environment overrides. Every value below is grounded in a real file in this repository.

Runtime: Next.js 16.2.4 (App Router, React 19) deployed to Vercel. Auth, data, and storage are provided by Supabase; the business API is the separate FastAPI backend (`dropitx-api`) configured via `NEXT_PUBLIC_API_URL`.

## Environment Variables

The canonical list lives in `.env.example`. The table below cross-references each variable with where it is read in the code, whether it is required, and its default.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | — | Supabase project URL. Read by `utils/supabase/{client,server,middleware}.ts` with non-null assertion; missing or empty throws at runtime when the Supabase client is constructed. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Yes** | — | Supabase anon/public key. Same usage and failure mode as above. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** (server-only) | — | Supabase service role key. Required by `utils/supabase/server.ts#createAdminClient`, which throws `"SUPABASE_SERVICE_ROLE_KEY is not configured"` when absent. Also used as a fallback HMAC secret by `lib/share-access-cookie.ts`. Never expose to the browser (no `NEXT_PUBLIC_` prefix). |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:8000` | Base URL of the FastAPI backend (`lib/api-client.ts`). Point this at the Render URL in production. |
| `SHARE_ACCESS_SECRET` | Conditional | Falls back to `SUPABASE_SERVICE_ROLE_KEY` | 32+ character random secret used to HMAC-sign password-protected share access cookies (`lib/share-access-cookie.ts`). `getSecret()` throws if neither value is set or under 32 characters. Set explicitly in production so rotating the Supabase key does not invalidate access cookies. |
| `NEXT_PUBLIC_APP_URL` | No | `https://dropitx.com` | Canonical site origin used to build absolute share URLs, QR-code URLs, and team-invite links (`app/(public)/s/[slug]/page.tsx`, `components/qr-code-button.tsx`, `components/team/team-invite-form.tsx`, `app/(dashboard)/dashboard/analytics/[slug]/page.tsx`). |
| `NEXT_PUBLIC_APP_HOST` | No | — | Host (no scheme) used by `lib/referrer-parser.ts` to classify self-referrals as `"direct"` traffic. Set to the production host (e.g. `dropitx.com`) for accurate analytics attribution. |
| `ANALYTICS_TOKEN_SECRET` | No | `dev-secret-change-in-prod` | Server-side HMAC secret for signing/verifying view-tracking tokens (`lib/analytics-track.ts`). Must match the secret used by the Supabase `record_and_increment_share_view` RPC. **Set in production** — the default is a non-secret placeholder. |
| `NODE_ENV` | No | Set by Next.js | Standard Next.js env var. Drives HSTS header (`middleware.ts`, production only) and the `secure` flag on share-access cookies (`lib/share-access-cookie.ts`). |

The following entries appear in `.env.example` but are **not read by the frontend code** (verified by grep of `process.env.*` across `app/`, `lib/`, `utils/`, `components/`, `middleware.ts`). They are consumed by sibling systems and are listed here only to explain the shared example file:

| Variable | Consumed by |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | FastAPI backend (rate limiting), not this frontend |
| `UPSTASH_REDIS_REST_TOKEN` | FastAPI backend (rate limiting), not this frontend |
| `SUPABASE_AUTH_GOOGLE_CLIENT_ID` | Supabase Dashboard OAuth provider config, not read by Next.js |
| `SUPABASE_AUTH_GOOGLE_SECRET` | Supabase Dashboard OAuth provider config, not read by Next.js |
| `SUPABASE_AUTH_GITHUB_CLIENT_ID` | Supabase Dashboard OAuth provider config, not read by Next.js |
| `SUPABASE_AUTH_GITHUB_SECRET` | Supabase Dashboard OAuth provider config, not read by Next.js |

## Config File Format

DropItX uses code-based configuration (no JSON/YAML config files). Each tool is configured through its own small file at the repo root.

### `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

Currently empty — no custom Next.js options are set. All framework behavior uses Next.js 16 defaults. The App Router, React 19, and `@supabase/ssr` cookie handling run without additional config.

### `tsconfig.json`

- `strict: true` — strict TypeScript is enforced; `npm run build` type-checks.
- Path alias: `@/*` maps to the repo root (e.g. `import { authFetch } from "@/lib/api-client"`).
- `target: ES2017`, `module: "esnext"`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`.
- `incremental: true` with output in `tsconfig.tsbuildinfo` (gitignored).
- Next.js plugin enabled.

### Tailwind CSS 4

Tailwind is configured through PostCSS and CSS, not a `tailwind.config.*` file (Tailwind v4 convention):

- `postcss.config.mjs` — registers the `@tailwindcss/postcss` plugin.
- `app/globals.css` — `@import "tailwindcss"` plus theme tokens via `@theme inline`. Defines the design-system color tokens (`--color-primary`, `--color-surface`, OKLCH-based), Clay radii (`--radius-sm: 14px` through `--radius-pill: 9999px`), and a `.dark` custom variant. Edit tokens here, not in a JS config.

### `components.json` (shadcn/ui)

Configures the shadcn CLI: `style: "base-nova"`, `baseColor: "neutral"`, `cssVariables: true`, `iconLibrary: "lucide"`, CSS file `app/globals.css`, and path aliases matching `tsconfig.json` (`@/components`, `@/lib`, `@/hooks`).

### `eslint.config.mjs`

Flat-config ESLint extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. Global ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`.

### `middleware.ts`

Next.js middleware runs `updateSession()` (Supabase SSR session refresh) and applies security headers on every response except static assets and `/api/og-image`. HSTS is added only when `NODE_ENV === "production"`. Matchers: `/((?!_next/static|_next/image|favicon.ico|api/og-image).*)`.

### `.vercelignore`

Excludes `packages/`, `.omx/`, `plans/`, `*.xml`, and `smartletter-data-binding-analysis.html` from Vercel deployments.

## Required vs. Optional Settings

Settings that cause runtime failure when missing or invalid:

| Setting | Failure mode | Location |
|---------|--------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Throws when Supabase browser/server/middleware client is constructed (non-null assertion on `process.env`) | `utils/supabase/{client,server,middleware}.ts` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Same as above | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | `createAdminClient()` throws `"SUPABASE_SERVICE_ROLE_KEY is not configured"` | `utils/supabase/server.ts` |
| `SHARE_ACCESS_SECRET` or `SUPABASE_SERVICE_ROLE_KEY` (≥32 chars) | `getSecret()` throws `"... must be set and at least 32 characters"` when setting a password-protected share access cookie | `lib/share-access-cookie.ts` |

There is no centralized startup validation. Failures surface lazily the first time the relevant code path runs (e.g. the first Supabase query, the first password-protected share view). `npm run build` does not validate env vars — builds will succeed with missing env vars.

Optional settings with safe defaults (no failure if absent):

- `NEXT_PUBLIC_API_URL` → `http://localhost:8000`
- `NEXT_PUBLIC_APP_URL` → `https://dropitx.com`
- `ANALYTICS_TOKEN_SECRET` → `dev-secret-change-in-prod` (acceptable for dev; set a real secret in production)

## Defaults

| Variable | Default | Set in |
|----------|---------|--------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | `lib/api-client.ts:3` |
| `NEXT_PUBLIC_APP_URL` | `https://dropitx.com` | `app/(public)/s/[slug]/page.tsx:28`, `components/qr-code-button.tsx:32`, `components/team/team-invite-form.tsx:158,247`, `app/(dashboard)/dashboard/analytics/[slug]/page.tsx:58` |
| `ANALYTICS_TOKEN_SECRET` | `dev-secret-change-in-prod` | `lib/analytics-track.ts:3` |
| `SHARE_ACCESS_SECRET` | Falls back to `SUPABASE_SERVICE_ROLE_KEY` | `lib/share-access-cookie.ts:8` |
| `NODE_ENV` | `development` (Next.js default) | framework |

Hardcoded cookie domain: the Supabase session cookie is scoped to `.dropitx.site` in `utils/supabase/{client,server,middleware}.ts` (`cookieOptions: { domain: ".dropitx.site" }`). This is intentionally hardcoded, not env-driven, so the apex and `www` host share the auth cookie. <!-- VERIFY: production cookie domain is hardcoded to .dropitx.site while NEXT_PUBLIC_APP_URL defaults to https://dropitx.com — confirm which domain is actually serving production before changing either -->

Share-access cookie lifetime is hardcoded at 24 hours (`COOKIE_MAX_AGE = 24 * 60 * 60`, `lib/share-access-cookie.ts`). Tracking-token validity is hardcoded at 60 seconds (`lib/analytics-track.ts`).

## Per-Environment Overrides

DropItX uses a single `.env.local` for local development and the Vercel project environment variables for preview/production. There are no `.env.development`, `.env.production`, or `.env.test` files committed.

### Local development

```bash
cp .env.example .env.local   # then fill in real values
npm run dev                  # http://localhost:3000
```

Next.js automatically loads `.env.local` for `npm run dev`. The `.env*` glob is gitignored except `.env.example` (see `.gitignore`), so `.env.local` never leaves the developer machine.

Typical local values:

- `NEXT_PUBLIC_API_URL=http://localhost:8000` (point at a local FastAPI dev server)
- `NEXT_PUBLIC_APP_URL=http://localhost:3000` (so generated share/QR/invite URLs point at the local app)
- `NEXT_PUBLIC_APP_HOST=localhost:3000`
- Supabase keys from a local or hosted Supabase project

### Production (Vercel)

All variables are configured in the Vercel project settings (Settings → Environment Variables), not via committed files. Next.js picks up `NEXT_PUBLIC_*` at build time and server-only vars at runtime. <!-- VERIFY: exact set of env vars and values configured in the Vercel project is not visible from the repository — confirm in the Vercel dashboard -->

Production-specific behavior driven by config:

- `NODE_ENV=production` (set automatically by Vercel) enables HSTS (`middleware.ts`) and the `secure` flag on the share-access cookie (`lib/share-access-cookie.ts`).
- `NEXT_PUBLIC_API_URL` must point at the deployed FastAPI backend on Render (e.g. `https://dropitx-api.onrender.com`). <!-- VERIFY: confirm the production Render URL in the Vercel env settings -->
- `NEXT_PUBLIC_APP_URL` should match the canonical production domain. The code default is `https://dropitx.com`; set it explicitly in Vercel if the canonical domain differs.
- `SHARE_ACCESS_SECRET` must be a fresh 32+ character random string, independent of `SUPABASE_SERVICE_ROLE_KEY`.
- `ANALYTICS_TOKEN_SECRET` must match the secret baked into the Supabase `record_and_increment_share_view` RPC.

There is no staging-specific config file. To run a staging environment, create a second Vercel project (or a Preview environment scope) with its own env-var values pointing at a separate Supabase project and FastAPI instance.

## Notes and Caveats

- The Supabase OAuth provider credentials (`SUPABASE_AUTH_GOOGLE_*`, `SUPABASE_AUTH_GITHUB_*`) in `.env.example` are not read by this frontend; OAuth is configured entirely in the Supabase Dashboard under Authentication → Providers. They are kept in `.env.example` as a shared reference for the workspace.
- Rate limiting is enforced by the FastAPI backend (Upstash Redis). The frontend's `lib/rate-limit.ts` is only a client-side 429-toast helper; it does not read `UPSTASH_*` env vars.
- API keys (for the REST API and CLI) are hashed with SHA-256 server-side and never persisted in plaintext; no frontend env var governs this.
- `npm run generate-types` runs `scripts/generate-api-types.sh` to regenerate TypeScript types from the backend OpenAPI schema; it does not require additional configuration beyond `NEXT_PUBLIC_API_URL`.
