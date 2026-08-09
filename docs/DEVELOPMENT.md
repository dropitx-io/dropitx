<!-- generated-by: gsd-doc-writer -->

# Development

> Day-to-day development workflow for the **DropItX frontend** (Next.js 16, App Router, React 19, TypeScript strict). Covers setup, scripts, project layout, common tasks, and debugging. For coding style and naming conventions, see [code-standards.md](./code-standards.md); for environment variables, see [CONFIGURATION.md](./CONFIGURATION.md).

## Local Setup

A short setup path for contributors. For full prerequisites and first-run instructions, see [GETTING-STARTED.md](./GETTING-STARTED.md).

1. **Clone & install** (Node.js 18+ required for Next.js 16):
   ```bash
   git clone <repo-url> dropitx && cd dropitx
   npm install
   ```
2. **Configure environment** — copy the example env file and fill in values:
   ```bash
   cp .env.example .env.local
   ```
   At minimum set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`, the FastAPI backend). The full variable reference is in [CONFIGURATION.md](./CONFIGURATION.md).
3. **Start the dev server**:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000. The server hot-reloads on save.
4. **Backend dependency** — most data calls hit the FastAPI backend in `../dropitx-api`. Start it separately (see that repo's docs) or expect 401/404s on authenticated routes.

## Scripts & Build Commands

All scripts come from `package.json`. There is no dedicated `typecheck` script — TypeScript strict mode is enforced as part of `next build`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server at http://localhost:3000 with hot reload. |
| `npm run build` | Production build. **This is the type-check gate** — `tsconfig.json` has `"strict": true, "noEmit": true`, so any type error fails the build. Run before pushing. |
| `npm start` | Run the compiled production server (used by Vercel; requires a prior `build`). |
| `npm run lint` | ESLint 9 flat config (`eslint.config.mjs`): `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`. |
| `npm run generate-types` | Fetch the OpenAPI spec from the backend and regenerate `lib/api-types.ts`. Pass a custom URL: `npm run generate-types -- http://localhost:8000`. |

No test framework is configured. Verify changes by running `npm run lint` and `npm run build`, then exercising the feature in the dev server.

To run a standalone type-check without a full build:

```bash
npx tsc --noEmit
```

## Project Layout

The app uses the Next.js **App Router**. Directories map 1:1 to URLs unless they are wrapped in parentheses (route groups, which organize without affecting the URL).

```
app/
  (public)/          # Unauthenticated routes — landing, auth, editor, shares, search, developers
    page.tsx         # Landing page (renders <HomePage />)
    auth/            # Login / signup (Supabase OAuth)
    editor/          # Markdown editor (CodeMirror)
    s/[slug]/        # Public share view
    search/          # Public search
  (dashboard)/       # Authenticated area — URL prefix is /dashboard (route group does not add a segment here because the folder is dashboard)
    dashboard/       # /dashboard, /dashboard/teams, /dashboard/analytics, /dashboard/profile, /dashboard/favorites
  api/
    og-image/[slug]/ # OG image generation route
    shares/[slug]/access-cookie/  # Sets HMAC-signed share-access cookie
  layout.tsx         # Root layout: fonts, ThemeProvider, ErrorBoundary, Toaster, Analytics
  globals.css        # Tailwind v4 entry + OKLCH design tokens
  error.tsx          # Route error boundary
  loading.tsx        # Route loading UI
  not-found.tsx      # 404 page
components/
  ui/                # shadcn/ui primitives (button, dialog, select, card, input, ...)
  *.tsx              # Feature components (home-page, editor-shell, dashboard-*, team-*, ...)
lib/                 # Utilities & business helpers
  api-client.ts      # authFetch() — authenticated calls to FastAPI
  utils.ts           # cn() class merger (clsx + tailwind-merge)
  crypto.ts          # AES-256-GCM helpers
  password.ts        # bcryptjs hashing
  editor-extensions/ # CodeMirror 6 extensions (slash commands, upload, etc.)
hooks/               # Custom React hooks (use-email-validation, use-team, use-toast)
utils/supabase/      # Supabase client factories (server.ts, client.ts, middleware.ts, profile.ts)
types/               # TypeScript interfaces for API/domain models (share.ts, team.ts, ...)
supabase/            # schema.sql + migrations/ (YYYYMMDDNNNNNN_description.sql)
scripts/             # generate-api-types.sh
public/              # Static assets
```

Conventions to keep in mind (detailed in [code-standards.md](./code-standards.md)):

- **Route groups** `(public)` and `(dashboard)` split authenticated vs. unauthenticated layouts without changing URLs. Each group can have its own `layout.tsx`.
- **Path alias** `@/*` maps to the repo root (configured in `tsconfig.json`). Always import via `@/components/...`, `@/lib/...`, `@/hooks/...`, `@/utils/...` — never relative paths that climb above the file.
- **Server components by default.** Add `"use client"` only when a component uses hooks, browser APIs, or event handlers.
- **Feature components stay under ~200 lines.** Prefer composition over deep nesting.

## Adding a New Page or Route

1. Create a folder under the appropriate route group and add `page.tsx`:
   ```text
   app/(dashboard)/dashboard/widgets/page.tsx      # → /dashboard/widgets
   app/(public)/widgets/page.tsx                   # → /widgets
   ```
2. A server component can fetch directly from Supabase and render:
   ```tsx
   import { cookies } from "next/headers";
   import { redirect } from "next/navigation";
   import { createClient } from "@/utils/supabase/server";

   export default async function WidgetsPage() {
     const cookieStore = await cookies();
     const supabase = createClient(cookieStore);
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) redirect("/auth/login");

     const { data: widgets } = await supabase
       .from("widgets")
       .select("*")
       .eq("user_id", user.id);

     return <ul>{widgets?.map((w) => <li key={w.id}>{w.name}</li>)}</ul>;
   }
   ```
3. To guard an entire section, add a `layout.tsx` in the route group that redirects unauthenticated users.
4. For dynamic segments use `[slug]/page.tsx` and read `params` / `searchParams` from the page props (Next.js 16: `params` is a Promise — `await` it).
5. Add a loading state with `loading.tsx` and an error boundary with `error.tsx` in the same folder if the route does slow or fallible work.

To add a JSON **API route** under `app/api/`, create `route.ts` exporting the HTTP method handlers (`GET`, `POST`, ...). Most business logic intentionally lives in the FastAPI backend — only OG-image generation and the share-access cookie remain as Next.js routes.

## Adding a New Component

### shadcn/ui primitives

The project uses [shadcn/ui](https://ui.shadcn.com) configured in [`components.json`](../components.json) (`style: "base-nova"`, `iconLibrary: "lucide"`, `cssVariables: true`, CSS at `app/globals.css`). Aliases resolve as: `ui → @/components/ui`, `utils → @/lib/utils`, `lib → @/lib`, `hooks → @/hooks`.

Add a primitive with the CLI — it writes into `components/ui/` and wires the tokens automatically:

```bash
npx shadcn@latest add tooltip
```

Then import and use:

```tsx
import { Tooltip } from "@/components/ui/tooltip";
```

### Feature components

Create feature components in `components/` (kebab-case filenames, e.g. `widget-card.tsx`). Mark with `"use client"` only when needed. Compose UI primitives and `cn()` for conditional classes:

```tsx
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function WidgetCard({ title, active }: { title: string; active?: boolean }) {
  return (
    <Card className={cn("p-4", active && "ring-2 ring-primary")}>
      <h3 className="text-lg font-semibold">{title}</h3>
    </Card>
  );
}
```

## Fetching Data from the Backend

All calls to the FastAPI backend go through `authFetch()` in [`lib/api-client.ts`](../lib/api-client.ts). It reads the Supabase session, injects the `Authorization: Bearer <access_token>` header, sets `Content-Type: application/json` unless the body is `FormData`, and **retries once on 401** after refreshing the session.

```tsx
import { authFetch } from "@/lib/api-client";

export async function createDocument(content: string, title: string, slug: string) {
  const res = await authFetch("/api/v1/documents", {
    method: "POST",
    body: JSON.stringify({ content, title, slug }),
  });
  if (!res.ok) throw new Error(`createDocument failed: ${res.status}`);
  return res.json();
}
```

Notes:

- `authFetch` takes a **path** (e.g. `/api/v1/documents`), not a full URL. The base URL comes from `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`). Use the exported `getApiUrl(path)` helper if you need the full URL for `fetch` directly.
- Because `authFetch` touches the browser Supabase client (`getSession`/`refreshSession`), it is for **client components**. Server components should read data via the Supabase server client (next section) or call the backend with a server-side token.
- Generated response types live in `lib/api-types.ts`. Regenerate after backend schema changes with `npm run generate-types`.

## Supabase Client Usage

Three factories live in [`utils/supabase/`](../utils/supabase/). Pick by context — using the wrong one is the most common cause of auth/RLS bugs.

| Factory | Where to use | Behavior |
| --- | --- | --- |
| `createClient(cookieStore)` from `server.ts` | Server components, route handlers | Anon-key client. **Respects RLS.** Pass `await cookies()` from `next/headers`. |
| `createAdminClient()` from `server.ts` | Server-only privileged writes (Storage uploads, inserts that must bypass RLS) | Service-role client. **Bypasses RLS.** Requires `SUPABASE_SERVICE_ROLE_KEY`. Never import in a client component. |
| `createClient()` from `client.ts` | Client components, `authFetch` | Browser client backed by `@supabase/ssr`. Session stored in shared cookies. |

```tsx
// Server component
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const cookieStore = await cookies();
const supabase = createClient(cookieStore);
const { data } = await supabase.from("shares").select("*");
```

```tsx
// Client component
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();
await supabase.auth.signInWithOAuth({ provider: "github" });
```

**Middleware is the single place sessions are refreshed.** `middleware.ts` calls `updateSession()` from [`utils/supabase/middleware.ts`](../utils/supabase/middleware.ts), which validates the JWT via `getClaims()` (JWKS), rotates the access token when expired, and writes the refreshed cookies onto both the request and the response. If you edit middleware, **always return the response from `updateSession`** — dropping it causes refresh-token reuse and random logouts. The same middleware also applies security headers (HSTS in production, `X-Frame-Options: DENY`, CSP-relevant headers) and skips `_next/static`, `_next/image`, `favicon.ico`, and `api/og-image`.

All three clients share cookie options with `domain: ".dropitx.site"` so the session survives apex ↔ `www` redirects.

## Styling

- **Tailwind CSS v4** is the only styling system. The entry point is [`app/globals.css`](../app/globals.css), which imports `tailwindcss`, `tw-animate-css`, and `shadcn/tailwind.css`. Design tokens (OKLCH colors, radii, fonts) are defined as CSS variables in the `@theme` block.
- **Use token classes, not Tailwind's default palette**, for accents: `bg-primary`, `text-foreground`, `border-border`, etc. The brand accent is violet (`text-violet-500`). Do not reach for `bg-purple-500`-style defaults.
- **Merge classes with `cn()`** from [`lib/utils.ts`](../lib/utils.ts) (clsx + tailwind-merge). Never string-concatenate conditional class names.
- **Dark mode is the default.** The `dark` class strategy is configured via `@custom-variant dark` in `globals.css`; `next-themes` (`ThemeProvider` in the root layout) is available for dynamic theme switching.
- Fonts (Inter as `--font-sans`, Geist Mono as `--font-mono`) are loaded via `next/font/google` in `app/layout.tsx`.

## The Markdown Editor (CodeMirror)

The editor lives at `app/(public)/editor/page.tsx` and renders `components/editor-shell.tsx`. CodeMirror 6 requires browser APIs, so the editor pane is loaded with `next/dynamic` and `{ ssr: false }`. Extensions (slash commands, image drag-and-drop, scroll sync) live in `lib/editor-extensions/`. Drafts auto-save to localStorage. When adding editor features, keep the dynamic import and put new CodeMirror extensions in `lib/editor-extensions/`.

## Debugging Tips

- **Type errors** surface during `npm run build`. To iterate faster on types alone, run `npx tsc --noEmit`.
- **Dev server errors** show in the Next.js overlay and the terminal running `npm run dev`. Hot reload should preserve most state; do a full refresh if a layout or middleware file changes.
- **Auth/session loops or random logouts** usually trace to `utils/supabase/middleware.ts`: confirm `updateSession`'s return value is what `middleware` returns, and that `getClaims()` is the first `supabase.auth` call (no code between `createServerClient` and it).
- **401s on backend calls** from a client component — check that `NEXT_PUBLIC_API_URL` points at a running backend and that the Supabase session exists (the devtools `auth.getSession`). `authFetch` retries once after refresh; repeated 401s mean the session can't refresh.
- **RLS surprises** (empty query results, inserts rejected) — confirm you used the anon server client (`createClient(cookieStore)`) for user-scoped reads and the admin client (`createAdminClient()`) only for privileged server writes. Check the table's RLS policies in `supabase/migrations/`.
- **Cookies not persisting across hosts** — the cookie domain is pinned to `.dropitx.site`; local development on `localhost` may behave differently. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`.
- **Stale generated types** after a backend change — re-run `npm run generate-types` to refresh `lib/api-types.ts`.

## Branch Conventions

The default branch is `main`; `dev` is used for integration. Feature branches follow `<type>/<scope>`:

- `feat/<scope>` — new feature (e.g. `feat/redesign-editor`)
- `fix/<scope>` — bug fix (e.g. `fix/landing-footer-icon`)
- `refactor/<scope>` — refactors (e.g. `refactor/migrate-apis-to-fastapi`)

Branch off `main` (or `dev` for in-flight integration work) and keep branches focused on a single concern.

## Pull Request Process

There is no `.github/` directory with templates or CI workflows in this repo, so the process is lightweight:

1. **Before opening a PR**, run both gates locally and ensure they pass:
   ```bash
   npm run lint
   npm run build
   ```
2. **Use [Conventional Commits](https://www.conventionalcommits.org/)** (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`). Keep commits focused on one concern and do not include AI-attribution lines.
3. **Open the PR** against `main` (or the relevant integration branch) with a clear description of what changed and why. Call out anything that affects auth, the Supabase session flow, or RLS — these are the highest-risk areas.
4. **Manual verification** — since there is no test suite, exercise the affected flow in the dev server and note what you tested in the PR description.
5. **Never commit secrets.** `.env.local`, `SUPABASE_SERVICE_ROLE_KEY`, OAuth client secrets, and `SHARE_ACCESS_SECRET` must stay out of git.

For coding-style detail (naming, TypeScript rules, formatting) see [code-standards.md](./code-standards.md). For environment variables and per-environment configuration see [CONFIGURATION.md](./CONFIGURATION.md); for the broader system context see [ARCHITECTURE.md](./ARCHITECTURE.md).
