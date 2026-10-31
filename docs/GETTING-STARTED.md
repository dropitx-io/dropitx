<!-- generated-by: gsd-doc-writer -->

# Getting Started

This guide takes you from a fresh clone to a running DropItX frontend dev server. DropItX is a Next.js 16 (App Router, React 19, TypeScript strict) application that consumes the `dropitx-api` FastAPI backend for all data and uses Firebase Auth for sign-in.

For the complete list of environment variables, defaults, and required-vs-optional behavior, see [CONFIGURATION.md](CONFIGURATION.md). For system architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Prerequisites

- **Node.js 20+** — stated in `README.md`. There is no `engines` field in `package.json` and no `.nvmrc`/`.node-version` pin; any Node 20 LTS or newer works.
- **npm** — the project uses npm (a committed `package-lock.json` and npm-style scripts). No Yarn or pnpm lockfile is present.
- **A Firebase project** — with Google/GitHub/email sign-in enabled. You need its web app config and a service-account key (for the server-side session cookie).
- **The FastAPI backend** — optional for the very first page load, but required for everything that reads or writes data. Either run [`dropitx-api`](https://github.com/phuongddx/dropitx) locally or point at a deployed instance. <!-- VERIFY: confirm the public backend repository URL — the workspace git remote uses a custom SSH host alias -->

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

Open `.env.local` and set the values the frontend cannot run without:

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend, for example `http://localhost:8000` |
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Console → Project settings → Your apps → web app config |
| `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase Console → Project settings → Service accounts (server-only — never expose to the browser) |

Optionally set `NEXT_PUBLIC_APP_URL=http://localhost:3000` so generated share, embed and QR links point at the local app.

The full variable reference is in [CONFIGURATION.md](CONFIGURATION.md#environment-variables).

## First run

```bash
npm run dev
```

Next.js starts on **http://localhost:3000** (Next.js default port; confirmed by `README.md` and the `next dev` script in `package.json`).

### Verify it works

1. Open http://localhost:3000 in a browser — the landing page (`app/(public)/page.tsx`) should render. The landing page is public and does not require the backend to be reachable.
2. Visit http://localhost:3000/editor — the CodeMirror 6 editor loads (SSR is disabled for this route; it requires browser APIs).
3. (Optional) Start the FastAPI backend locally on port `8000`, then sign in at `/auth/login` to exercise authenticated flows. The database schema is owned by the API repository (`dropitx-api/infra/init`); the frontend has no schema or migrations.

`npm run dev` hot-reloads on save; no manual rebuild is needed during development.

## Pointing at a backend

The frontend calls the FastAPI backend through `lib/api-client.ts` (browser) and `lib/server-api.ts` (server), which read the base URL from `NEXT_PUBLIC_API_URL`. The variable is required.

**Local backend** — run `dropitx-api` on its default port:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Remote backend** — set it to the deployed URL:

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
```

The API's `ALLOWED_ORIGINS` must include `http://localhost:3000`.

Because the variable is `NEXT_PUBLIC_*`, it is inlined at build time — restart `npm run dev` (or rebuild) after changing it.

### Regenerating API types (optional)

When the backend OpenAPI schema changes, regenerate the TypeScript types the client uses:

```bash
npm run generate-types                # uses API_URL (default http://localhost:8000)
npm run generate-types -- http://localhost:8000   # or pass the URL explicitly
```

This runs `scripts/generate-api-types.sh`, which fetches `${API_URL}/openapi.json` and writes `lib/api-types.ts`. The backend must be reachable at the URL you pass.

## Build

The production build also runs TypeScript type checking (strict mode, `tsconfig.json`):

```bash
npm run build     # type-check + production build into .next/
npm start         # serve the production build
```

`npm run check:hygiene` runs `tsc --noEmit && eslint` (`eslint.config.mjs`, extending `next/core-web-vitals` and `next/typescript`). There is no test framework configured — see [DEVELOPMENT.md](DEVELOPMENT.md) for the verification workflow.

## Common setup issues

- **Module-load error saying `NEXT_PUBLIC_API_URL is required`** — it is missing in `.env.local`. `npm run build` does **not** validate env vars, so a green build does not mean they are set.
- **API calls fail but the landing page renders** — the FastAPI backend is not running or `NEXT_PUBLIC_API_URL` points at the wrong host. With the default `http://localhost:8000`, start the local `dropitx-api` server. Restart `npm run dev` after changing `NEXT_PUBLIC_*` values.
- **`npm run generate-types` fails with "Could not fetch OpenAPI spec"** — the script (`scripts/generate-api-types.sh`) needs the backend reachable at the given URL. Start the backend or pass the correct URL as the first argument.
- **Sign-in succeeds but `/dashboard` bounces back to `/auth/login`** — `POST /api/auth/session-login` failed to mint the session cookie. Check the `FIREBASE_ADMIN_*` values (the private key keeps its `\n` escapes on one line).
- **Port 3000 already in use** — `next dev` will pick the next free port and print it; if you need a specific port, set it explicitly (e.g. `npx next dev -p 3001`).

## Next steps

- [ARCHITECTURE.md](ARCHITECTURE.md) — system overview, component diagram, and data flow.
- [CONFIGURATION.md](CONFIGURATION.md) — full environment variable reference, defaults, and per-environment overrides.
- [DEVELOPMENT.md](DEVELOPMENT.md) — local dev workflow, build/lint commands, and code style.
- [TESTING.md](TESTING.md) — testing strategy (note: no test framework is currently configured).
- `README.md` — feature list, CLI quick start, and API reference.
