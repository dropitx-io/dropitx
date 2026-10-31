<!-- generated-by: gsd-doc-writer -->

# Configuration

This document covers all configuration surfaces for the DropItX Next.js frontend: environment variables, config files, required vs. optional settings, defaults, and per-environment overrides. Every value below is grounded in a real file in this repository.

Runtime: Next.js 16.2.4 (App Router, React 19). Identity is Firebase Auth. Every data read and write goes through the separate FastAPI backend (`dropitx-api`), configured via `NEXT_PUBLIC_API_URL`; the frontend holds no database or storage credentials.

## Environment Variables

The canonical list lives in `.env.example`. The table below cross-references each variable with where it is read in the code, whether it is required, and its default.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | **Yes** | — | Base URL of the FastAPI backend. `lib/api-client.ts` throws at module load when it is missing; `lib/server-api.ts` and the OG image route read it on the server. Inlined at image-build time, so it is a Docker build arg. |
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` | **Yes** | — | Firebase web SDK config (`lib/firebase/client.ts`). Build args. |
| `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` | **Yes** (server-only) | — | Firebase Admin credentials (`lib/firebase/server.ts`) used to mint and verify the httpOnly `session` cookie. Runtime variables, never `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_APP_URL` | No | `https://dropitx.com` | Canonical site origin used to compose absolute share URLs, embed snippets and QR-code URLs (`app/(public)/s/[slug]/page.tsx`, `components/qr-code-button.tsx`, `components/embed-snippet.tsx`, `app/(dashboard)/dashboard/analytics/[slug]/page.tsx`). |
| `NEXT_PUBLIC_APP_HOST` | No | — | Host of this app without scheme (for example `dropitx.site`). Kept as a documented Docker build arg; no code in this repository reads it today. |
| `NODE_ENV` | No | Set by Next.js | Standard Next.js variable. Drives the HSTS header (`middleware.ts`, production only). |

There is no database, storage or secret-signing variable on the frontend. Password-protected shares are unlocked by the API (`POST /api/shares/{slug}/unlock`) and rendered in the page, so there is no frontend access cookie or signing secret. Page views are recorded by the API itself; no third-party analytics is configured.

## Config File Format

DropItX uses code-based configuration (no JSON/YAML config files). Each tool is configured through its own small file at the repo root.

### `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

`next.config.ts` sets `output: "standalone"` (used by the Docker image); everything else uses Next.js 16 defaults.

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

Next.js middleware redirects `/dashboard/*` to `/auth/login?next=...` when the `session` cookie is absent (a presence check only; server components verify the cookie with `firebase-admin`), forwards the dashboard path to server components in an `x-dashboard-path` header, and applies security headers on every response except static assets and `/api/og-image`. HSTS is added only when `NODE_ENV === "production"`. Matchers: `/((?!_next/static|_next/image|favicon.ico|api/og-image).*)`.

### `.vercelignore`

Excludes `packages/`, `.omx/`, `plans/`, `*.xml`, and `smartletter-data-binding-analysis.html` from Vercel deployments.

## Required vs. Optional Settings

Settings that cause runtime failure when missing or invalid:

| Setting | Failure mode | Location |
|---------|--------------|----------|
| `NEXT_PUBLIC_API_URL` | Throws at module load (browser) or on the first server-side API call | `lib/api-client.ts`, `lib/server-api.ts` |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client SDK fails to initialise; sign-in does not work | `lib/firebase/client.ts` |
| `FIREBASE_ADMIN_*` | Session login and every server-side session check fail | `lib/firebase/server.ts` |

There is no centralized startup validation. Failures surface lazily the first time the relevant code path runs. The production compile does not validate env vars; `NEXT_PUBLIC_*` values are inlined into the client bundle at image-build time, so changing them requires a rebuild.

Optional settings with safe defaults:

- `NEXT_PUBLIC_APP_URL` → `https://dropitx.com`

## Defaults

| Variable | Default | Set in |
|----------|---------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://dropitx.com` | `app/(public)/s/[slug]/page.tsx`, `components/qr-code-button.tsx`, `components/embed-snippet.tsx`, `app/(dashboard)/dashboard/analytics/[slug]/page.tsx` |
| `NODE_ENV` | `development` (Next.js default) | framework |

The session cookie is minted by `app/api/auth/session-login/route.ts`: httpOnly, `SameSite=Lax`, 14 days.

## Per-Environment Overrides

DropItX uses a single `.env.local` for local development; production values are Docker build args and container environment variables. There are no `.env.development`, `.env.production`, or `.env.test` files committed.

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
- Firebase web and Admin credentials for a development Firebase project

### Production

The frontend ships as a Docker image (`Dockerfile`, Next.js standalone output). The `NEXT_PUBLIC_*` variables are build args, because Next.js inlines them into the client bundle; the `FIREBASE_ADMIN_*` variables are supplied to the running container.

```bash
docker image build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=... \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=... \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=... \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=... \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=... \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=... \
  --build-arg NEXT_PUBLIC_APP_URL=https://dropitx.com \
  --build-arg NEXT_PUBLIC_APP_HOST=dropitx.com \
  -t dropitx-fe .
```

Production-specific behavior driven by config:

- `NODE_ENV=production` (set by the image) enables HSTS (`middleware.ts`).
- `NEXT_PUBLIC_API_URL` must be reachable from both the browser and the FE server (server components call the API directly), and the API's `ALLOWED_ORIGINS` must include the site origin.
- `NEXT_PUBLIC_APP_URL` should match the canonical production domain. The code default is `https://dropitx.com`; set it explicitly if the canonical domain differs.

There is no staging-specific config file. A staging environment is a second image or container with its own build args and runtime variables, pointing at a separate API instance.

## Notes and Caveats

- Firebase Auth owns identity. Providers (Google, GitHub, email/password) are configured in the Firebase console, not through frontend variables.
- Rate limiting is enforced by the FastAPI backend. The frontend's `lib/rate-limit.ts` is only a client-side 429-toast helper.
- API keys (for the REST API and CLI) are hashed with SHA-256 server-side and never persisted in plaintext; no frontend env var governs this.
- `npm run generate-types` runs `scripts/generate-api-types.sh` to regenerate TypeScript types from the backend OpenAPI schema; it needs the API running at `API_URL` (default `http://localhost:8000`).
