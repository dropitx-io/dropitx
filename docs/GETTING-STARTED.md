<!-- generated-by: gsd-doc-writer -->

# Getting Started

This guide takes you from a fresh clone to a running DropItX frontend dev server. DropItX is a Next.js 16 (App Router, React 19, TypeScript strict) application that deploys to Vercel and consumes the `dropitx-api` FastAPI backend.

For the complete list of environment variables, defaults, and required-vs-optional behavior, see [CONFIGURATION.md](CONFIGURATION.md). For system architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Prerequisites

- **Node.js 20+** — stated in `README.md`. There is no `engines` field in `package.json` and no `.nvmrc`/`.node-version` pin; any Node 20 LTS or newer works.
- **npm** — the project uses npm (a committed `package-lock.json` and npm-style scripts). No Yarn or pnpm lockfile is present.
- **A Supabase project** — hosted or local via the [Supabase CLI](https://supabase.com/docs/guides/local-development). You need its project URL, anon/publishable key, and service role key.
- **The FastAPI backend** — optional for the very first page load, but required for document/auth features. Either run [`dropitx-api`](https://github.com/phuongddx/dropitx) locally or point at a deployed instance. <!-- VERIFY: confirm the public backend repository URL — the workspace git remote uses a custom SSH host alias -->

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/phuongddx/dropitx.git
cd dropitx

# 2. Install dependencies
npm install

# 3. Copy the environment template and fill in real values
cp .env.example .env.local
```

Open `.env.local` and set the three values the frontend cannot run without:

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Project Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → `service_role` key (server-only — never expose to the browser) |

`NEXT_PUBLIC_API_URL` defaults to `http://localhost:8000`; leave it as-is to talk to a local backend, or change it now (see [Pointing at a backend](#pointing-at-a-backend) below).

The full variable reference (including `SHARE_ACCESS_SECRET`, `NEXT_PUBLIC_APP_URL`, `ANALYTICS_TOKEN_SECRET`, and the backend-only `UPSTASH_*` vars) is in [CONFIGURATION.md](CONFIGURATION.md#environment-variables).

### Apply the database schema

The frontend expects the Supabase schema to be in place. From the project root:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Manual alternative: run `supabase/schema.sql`, then every file in `supabase/migrations/` in timestamp order.

## First run

```bash
npm run dev
```

Next.js starts on **http://localhost:3000** (Next.js default port; confirmed by `README.md` and the `next dev` script in `package.json`).

### Verify it works

1. Open http://localhost:3000 in a browser — the landing page (`app/(public)/page.tsx`) should render. The landing page is public and does not require the backend to be reachable.
2. Visit http://localhost:3000/editor — the CodeMirror 6 editor loads (SSR is disabled for this route; it requires browser APIs).
3. (Optional) Start the FastAPI backend locally on port `8000`, then sign in via Google/GitHub OAuth at `/auth` to exercise authenticated flows.

`npm run dev` hot-reloads on save; no manual rebuild is needed during development.

## Pointing at a backend

The frontend calls the FastAPI backend through `lib/api-client.ts`, which reads the base URL from `NEXT_PUBLIC_API_URL`.

**Local backend** — run `dropitx-api` on its default port and leave the default:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Remote backend** — set it to the deployed URL (for example, the Render deployment):

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://dropitx-api.onrender.com
```

Because the variable is `NEXT_PUBLIC_*`, it is inlined at build time — restart `npm run dev` (or rebuild) after changing it.

### Regenerating API types (optional)

When the backend OpenAPI schema changes, regenerate the TypeScript types the client uses:

```bash
npm run generate-types                # uses NEXT_PUBLIC_API_URL (default http://localhost:8000)
npm run generate-types -- http://localhost:8000   # or pass the URL explicitly
```

This runs `scripts/generate-api-types.sh`, which fetches `${API_URL}/openapi.json` and writes `lib/api-types.ts`. The backend must be reachable at the URL you pass.

## Build

The production build also runs TypeScript type checking (strict mode, `tsconfig.json`):

```bash
npm run build     # type-check + production build into .next/
npm start         # serve the production build (used by Vercel)
```

`npm run lint` runs ESLint (`eslint.config.mjs`, extending `next/core-web-vitals` and `next/typescript`). There is no test framework configured — see [DEVELOPMENT.md](DEVELOPMENT.md) for the verification workflow.

## Common setup issues

- **Blank page or console error mentioning Supabase on first request** — one of `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, or `SUPABASE_SERVICE_ROLE_KEY` is missing or empty in `.env.local`. The Supabase clients use non-null assertions and throw lazily on the first query; `npm run build` does **not** validate env vars, so a green build does not mean they are set.
- **API calls fail but the landing page renders** — the FastAPI backend is not running or `NEXT_PUBLIC_API_URL` points at the wrong host. With the default `http://localhost:8000`, start the local `dropitx-api` server. Restart `npm run dev` after changing `NEXT_PUBLIC_*` values.
- **`npm run generate-types` fails with "Could not fetch OpenAPI spec"** — the script (`scripts/generate-api-types.sh`) needs the backend reachable at the given URL. Start the backend or pass the correct URL as the first argument.
- **OAuth login works on production but not locally / session not persisting** — the Supabase session cookie is hardcoded to the `.dropitx.site` domain in `utils/supabase/{client,server,middleware}.ts`. Local OAuth callbacks may not set cookies correctly on `localhost`; see [CONFIGURATION.md](CONFIGURATION.md#defaults) for the cookie-domain caveat.
- **Port 3000 already in use** — `next dev` will pick the next free port and print it; if you need a specific port, set it explicitly (e.g. `npx next dev -p 3001`).

## Next steps

- [ARCHITECTURE.md](ARCHITECTURE.md) — system overview, component diagram, and data flow.
- [CONFIGURATION.md](CONFIGURATION.md) — full environment variable reference, defaults, and per-environment overrides.
- [DEVELOPMENT.md](DEVELOPMENT.md) — local dev workflow, build/lint commands, and code style.
- [TESTING.md](TESTING.md) — testing strategy (note: no test framework is currently configured).
- `README.md` — feature list, CLI quick start, and API reference.
