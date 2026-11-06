# Repository Guidelines

DropItX is a file-sharing and markdown editing platform. This repo is the Next.js 16 frontend; a separate FastAPI backend (`../dropitx-api/`) serves the REST API. **Auth is Firebase** (client SDK + server session cookies); Supabase is only the Postgres/Storage host (service-role, server-side only — Supabase Auth is removed).

## Project Structure

```
app/                      # Next.js App Router
  (public)/               # Landing, auth, editor, shares, search, invite, embed
  (dashboard)/            # Authenticated dashboard (teams, analytics, profile, favorites)
  api/                    # auth/session-login, auth/session-logout, og-image/[slug], shares/[slug]/access-cookie — nothing else; business logic lives in the FastAPI backend
components/               # Feature components (kebab-case filenames)
components/ui/            # shadcn/ui primitives
hooks/                    # Custom React hooks (use-*.ts)
lib/                      # Utilities (api-client, firebase/, crypto, team-rpc, etc.)
lib/editor-extensions/    # CodeMirror 6 extensions
utils/supabase/server.ts  # Service-role admin client (the only Supabase factory left)
types/                    # Hand-authored types + database.generated.ts (generated)
supabase/migrations/      # Timestamped SQL migrations (YYYYMMDDNNNNNN_description.sql)
scripts/                  # generate-api-types.sh
docs/                     # Architecture, code standards, design guidelines
```

## Build, Test, and Development Commands

```bash
npm install               # Install dependencies
npm run dev               # Dev server at http://localhost:3000
npm run lint              # ESLint 9 flat config (eslint.config.mjs)
npm run typecheck         # tsc --noEmit (faster than a build)
npm run build             # TypeScript check + Next.js production build
npm run check:hygiene     # tsc --noEmit + lint together (pre-push gate)
npm run generate-types    # Fetch backend OpenAPI spec → lib/api-types.ts (API must be running at localhost:8000)
npm run generate-db-types # Regenerate types/database.generated.ts from live Supabase schema
```

No test framework is configured. Verify changes with `npm run lint` and `npm run build` before pushing. Never hand-edit `lib/api-types.ts` or `types/database.generated.ts`.

## Auth and API Calls

- Client signs in via Firebase SDK (`lib/firebase/`); `components/auth-provider.tsx` posts the ID token to `POST /api/auth/session-login`, which mints an httpOnly `session` cookie (14-day).
- `middleware.ts` gates `/dashboard/*` on the session cookie's presence only (no firebase-admin in middleware) and applies security headers.
- Server components verify the cookie via `getSessionUser()` from `lib/firebase/server.ts`, then read data through `createAdminClient()` (`utils/supabase/server.ts`) filtered by Firebase uid. RLS is disabled by design — every query must scope by uid explicitly.
- All backend calls go through `authFetch()` from `lib/api-client.ts`: injects the Firebase ID token as Bearer and retries once on 401 after a force-refresh. `NEXT_PUBLIC_API_URL` is required — the module throws at load if missing.
- Team operations call Supabase RPC (SECURITY DEFINER) via wrappers in `lib/team-rpc.ts`, passing the verified uid.

## Coding Style and Naming Conventions

- **TypeScript strict mode** enforced via `tsconfig.json`. No `any` (use `unknown` and narrow); no `@ts-nocheck`.
- **Filenames**: kebab-case for all files (`upload-dropzone.tsx`). UI primitives are single-word (`button.tsx`).
- **Components**: functional only, under 200 lines. Server components by default; `"use client"` only when hooks or browser APIs are needed.
- **Path alias**: `@/*` maps to repo root. Import via `@/components/...`, `@/lib/...`, `@/hooks/...`.
- **Styling**: Tailwind CSS 4 utilities only, with OKLCH tokens from `app/globals.css`. Use `cn()` from `lib/utils.ts`. Never use Tailwind default palette colors for accents; use tokens like `bg-primary` (`text-violet-500` is the brand accent). Dark mode is the default.
- **Formatting**: 2-space indentation, double quotes, semicolons.
- **Editor**: the CodeMirror editor must be dynamically imported with `ssr: false`.

## Database Migrations

- Add new migrations in `supabase/migrations/` as `YYYYMMDDNNNNNN_description.sql`; make them idempotent (`IF NOT EXISTS`, `DO $$ ... $$`).
- Apply locally with `supabase db push`; re-run `npm run generate-db-types` if tables/columns changed.
- Schema changes may also need mirroring in the backend repo (`dropitx-api/infra/init/` + `migrations/`) — see its AGENTS.md.

## Security

- Never commit `.env.local` or service-role keys; the service-role key is server-only, never in client bundles.
- Password-protected shares use bcryptjs hashing with HMAC-signed HttpOnly cookies (`SHARE_ACCESS_SECRET`).

## Commit and Pull Request Guidelines

- **Conventional commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`; keep commits focused; no AI references in messages.
- Lint and build must pass before pushing.
- Sibling repos: `dropitx-api/` (FastAPI backend), `dropitx-cli/` (Python CLI). `CLAUDE.md` here holds deeper architecture notes — keep it and this file in sync when workflow rules change.
