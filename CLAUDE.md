# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` — Start the development server at http://localhost:3000 with hot reload.

### Building & Deployment
- `npm run build` — Perform TypeScript type checking and build Next.js app for production.
- `npm start` — Run the production server (used by Vercel).

### Code Quality
- `npm run lint` — Run ESLint (next/core-web-vitals + TypeScript config). No formatters configured; lint errors must pass before committing.
- `npm run typecheck` — Run `tsc --noEmit` only (faster feedback loop than a full build).
- `npm run check:hygiene` — Runs `tsc --noEmit && next lint` together; the standard pre-push gate.
- TypeScript checking is also enforced during `npm run build` (strict mode in tsconfig.json).

### Type Generation (do not hand-edit generated files)
- `npm run generate-db-types` — Regenerate `types/database.generated.ts` from the live Supabase schema via `supabase gen types`. Re-run after any migration that changes tables/columns/RLS.
- `npm run generate-types` — Run `scripts/generate-api-types.sh` to refresh backend-derived type definitions.

### Testing
No test framework is currently configured. Verify changes manually by running `npm run check:hygiene` and `npm run build`, or test interactively in the dev server.

## Architecture

### Directory Structure

**App Router segments** (`app/`):
- `app/(public)/` — Landing page, auth, editor, search, share viewing, `/invite` (team invite acceptance), `/developers`, `/embed` (oEmbed/share embeds)
- `app/(dashboard)/` — Authenticated dashboard: `teams/`, `analytics/`, `profile/`, `favorites/`
- `app/api/` — Only `/api/og-image` (OG image generation) and `/api/shares` (access-cookie routes) remain; business logic lives in the FastAPI backend

**Components & Styling**:
- `components/` — Feature components (kebab-case filenames, under 200 lines each); `components/team/` holds the team-collaboration UI
- `components/ui/` — shadcn/ui primitive components (button, dialog, select, etc.)
- `lib/` — Utility modules: `api-client.ts` (authenticated fetch), `crypto.ts` (AES-256-GCM), `password.ts` (bcryptjs hashing), `team-rpc.ts` (Supabase RPC wrappers for team ops), `rate-limit.ts`, `token-security.ts`, `analytics.ts` (Vercel Analytics), CodeMirror extensions
- `hooks/` — Custom React hooks (`use-auth-user.ts`, `use-team.ts`, `use-toast.ts`, etc.)
- `types/` — Hand-authored domain types (`team.ts`, `team-event.ts`, `share.ts`, `analytics.ts`) plus `database.generated.ts` (generated — see Type Generation below)
- `public/` — Static assets

### Authentication & Session Management

**Firebase Auth** owns identity (Google, GitHub, email/password). Server-side sessions use a Firebase session cookie verified with `firebase-admin`:

1. The client signs in via the Firebase SDK (`lib/firebase/auth.ts`). `components/auth-provider.tsx` then posts the ID token to `POST /api/auth/session-login`, which mints an httpOnly `session` cookie (14-day, `SameSite=Lax`).
2. `middleware.ts` gates `/dashboard/*` on `session`-cookie presence (a cheap check) and applies security headers — it deliberately does not load `firebase-admin`.
3. Server components verify identity via `getSessionUser(cookieStore)` from `lib/firebase/server.ts` (`verifySessionCookie`), then read user-scoped data through the service-role `createAdminClient()` from `utils/supabase/server.ts`, filtered by `user.uid`. Supabase RLS is disabled (`auth.uid()` returns NULL by design — see backend migration 007), so all access is service-role.
4. Sign-out calls `POST /api/auth/session-logout` (revokes refresh tokens + clears the cookie), then signs out the Firebase client.

**Security headers** applied in middleware: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, and HSTS (production only). The matcher excludes `_next/static`, `_next/image`, `favicon.ico`, and `api/og-image`.

**Required env:** client SDK `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID`; server Admin `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`. Keep `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (the admin client still backs Postgres/Storage reads).

### API Communication

Frontend calls the separate **FastAPI backend** via `authFetch()` from `lib/api-client.ts`:
```typescript
import { authFetch } from "@/lib/api-client";

// authFetch injects the Firebase ID token (auth.currentUser.getIdToken())
// and retries once on 401 after a force-refresh.
const response = await authFetch("/api/v1/documents", {
  method: "POST",
  body: JSON.stringify({ content, title, slug }),
});
```

Environment variable `NEXT_PUBLIC_API_URL` points to the backend (default: `http://localhost:8000` for dev). The client fails fast at module load if this is missing.

**User-scoped writes** (`favorites`, `user_profiles`) go to backend endpoints (`/api/v1/favorites`, `/api/v1/profile`) via `authFetch` — RLS is disabled, so the client cannot write to those tables directly. **Team operations** call Supabase RPC functions (SECURITY DEFINER) via the wrappers in `lib/team-rpc.ts`, using the admin client; the caller passes the Firebase `uid` (sourced from the verified session).

### UI & Styling

- **Tailwind CSS 4** utilities with OKLCH color tokens in `app/globals.css`
- **shadcn/ui** components for consistency (button, dialog, select, etc.)
- **Lucide icons** for iconography
- **Dark mode default** (hardcoded `dark` class in HTML root; `next-themes` available for dynamic toggle)
- No Tailwind default palette colors for accents; use tokens like `bg-primary`, `text-violet-500` (violet is the brand color per v1.3.0 rebranding)

### Data Fetching & State

- **Server components by default**; `"use client"` only when using hooks or browser APIs
- **Direct Supabase queries** in server components (via `utils/supabase/server.ts`)
- **Client-side state** via React hooks and context (no state management library)
- **Draft storage** in localStorage for the editor (auto-save, unload warning)

### Editor & Markdown

**CodeMirror 6** powers the markdown editor with:
- Split-pane preview with scroll sync
- Slash commands (`/image`, `/heading`, `/code`)
- Image drag-and-drop upload (inline preview)
- Shiki syntax highlighting (GitHub-like rendered output)
- Server-side rendering disabled (requires browser APIs)

Located at `app/(public)/editor/page.tsx`; extensions in `lib/editor-extensions/`.

### Database & Migrations

**PostgreSQL via Supabase**:
- Base schema: `supabase/schema.sql`
- Timestamped migrations: `supabase/migrations/YYYYMMDDNNNNNN_description.sql`
- All tables enforce RLS (Row Level Security); public tables readable by unauthenticated users if `is_private = false`
- Auth table managed by Supabase; custom tables: `shares`, `profiles`, `teams`, `team_members`, `api_keys`, etc.

Apply migrations locally with `supabase db push` after editing.

### Naming Conventions

- **Filenames**: kebab-case (`upload-dropzone.tsx`, `api-client.ts`)
- **UI primitives**: single-word filenames (`button.tsx`)
- **Components**: functional, max 200 lines; prefer composition over nesting
- **Variables/functions**: camelCase
- **Types/interfaces**: PascalCase

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `next@16.2.4` | React metaframework with App Router |
| `react@19.2.4` | React core |
| `@supabase/ssr@0.10.2` | Supabase SSR (session management) |
| `@codemirror/*` | Markdown editor with extensions |
| `tailwindcss@4` | Utility-first CSS framework |
| `shadcn` | shadcn/ui component registry (not a direct dependency; managed via CLI) |
| `shiki@4.0.2` | Syntax highlighting for code blocks |
| `bcryptjs@3.0.3` | Password hashing for protected shares |
| `@vercel/analytics` | Web Vitals and event tracking |
| `recharts` | Analytics charts in the dashboard |
| `sonner` | Toast notifications |
| `react-markdown` + `remark-gfm` | Rendered markdown output (share/embed views) |
| `react-dropzone` | File upload drag-and-drop |
| `nanoid` | ID/slug generation |
| `next-themes` | Dynamic light/dark theme toggle (dark is the default) |
| `@base-ui/react`, `@radix-ui/*` | Primitives underlying shadcn/ui components |

### Imports & Path Alias

All imports use the `@/*` alias mapping to the repo root:
```typescript
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/api-client";
import { createClient } from "@/utils/supabase/client";
```

## Notes for Agents

- **No tests**: Verify changes by linting and building locally.
- **TypeScript strict mode**: All code must type-check; no `any`; use `unknown` and narrow. `@ts-nocheck` is not permitted.
- **Server components default**: Only use `"use client"` when necessary (hooks, browser APIs).
- **SSR editor**: CodeMirror editor must have SSR disabled; always use dynamic imports with `ssr: false` in Next.js.
- **API key auth**: API keys are hashed (SHA-256) and never persisted in plaintext. Authentication bootstraps from session cookies.
- **Generated files**: Never hand-edit `types/database.generated.ts` — regenerate with `npm run generate-db-types`.
- **Sibling repos**: The FastAPI backend lives in `dropitx-api/`; the CLI tool in `dropitx-cli/`.
- **Companion file**: `AGENTS.md` (repo root) holds the same conventions for non-Claude agents — keep the two in sync when changing workflow rules.
