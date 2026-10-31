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
   At minimum set `NEXT_PUBLIC_API_URL` (the FastAPI backend, `http://localhost:8000` locally), the `NEXT_PUBLIC_FIREBASE_*` web SDK values and the `FIREBASE_ADMIN_*` credentials. The full variable reference is in [CONFIGURATION.md](./CONFIGURATION.md).
3. **Start the dev server**:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000. The server hot-reloads on save.
4. **Backend dependency** — every data call hits the FastAPI backend in `../dropitx-api`. Start it separately (see that repo's docs); without it nothing but static pages renders.

## Scripts & Build Commands

All scripts come from `package.json`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server at http://localhost:3000 with hot reload. |
| `npm run build` | Production build; type errors fail it (`"strict": true`). Run before pushing. |
| `npm start` | Run the compiled production server (requires a prior `build`). The Docker image runs the standalone output instead. |
| `npm run typecheck` | `tsc --noEmit` only; the fastest type feedback. |
| `npm run check:hygiene` | `tsc --noEmit && eslint`, the pre-push gate. |
| `npm run lint` | ESLint 9 flat config (`eslint.config.mjs`): `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`. |
| `npm run generate-types` | Fetch the OpenAPI spec from the backend and regenerate `lib/api-types.ts`. Pass a custom URL: `npm run generate-types -- http://localhost:8000`. |

No test framework is configured. Verify changes by running `npm run check:hygiene` and `npm run build`, then exercising the feature in the dev server.

To run a standalone type-check without a full build: `npm run typecheck`.

## Project Layout

The app uses the Next.js **App Router**. Directories map 1:1 to URLs unless they are wrapped in parentheses (route groups, which organize without affecting the URL).

```
app/
  (public)/          # Unauthenticated routes — landing, auth, editor, shares, search, developers
    page.tsx         # Landing page (renders <HomePage />)
    auth/            # Sign-in (Firebase), password reset
    editor/          # Markdown editor (CodeMirror)
    s/[slug]/        # Public share view
    search/          # Public search
  (dashboard)/       # Authenticated area — URL prefix is /dashboard (route group does not add a segment here because the folder is dashboard)
    dashboard/       # /dashboard, /dashboard/teams, /dashboard/analytics, /dashboard/profile, /dashboard/favorites
  api/
    og-image/[slug]/ # OG image generation route
    auth/session-login, auth/session-logout  # Mint / clear the httpOnly Firebase session cookie
  layout.tsx         # Root layout: fonts, ThemeProvider, AuthProvider, ErrorBoundary, Toaster
  globals.css        # Tailwind v4 entry + OKLCH design tokens
  error.tsx          # Route error boundary
  loading.tsx        # Route loading UI
  not-found.tsx      # 404 page
components/
  ui/                # shadcn/ui primitives (button, dialog, select, card, input, ...)
  *.tsx              # Feature components (home-page, editor-shell, dashboard-*, team-*, ...)
lib/                 # Utilities & business helpers
  api-client.ts      # authFetch() — browser calls to FastAPI (Firebase ID token)
  server-api.ts      # serverApiFetch() — server-component calls to FastAPI
  firebase/          # Firebase client, auth helpers, session verification (server.ts)
  utils.ts           # cn() class merger (clsx + tailwind-merge)
  crypto.ts          # AES-256-GCM helpers (unused by pages until decrypt-on-view exists)
  password.ts        # bcryptjs hashing
  editor-extensions/ # CodeMirror 6 extensions (slash commands, upload, etc.)
hooks/               # Custom React hooks (use-email-validation, use-team, use-toast)
types/               # TypeScript interfaces for API/domain models (share.ts, team.ts, ...)
scripts/             # generate-api-types.sh
public/              # Static assets
```

Conventions to keep in mind (detailed in [code-standards.md](./code-standards.md)):

- **Route groups** `(public)` and `(dashboard)` split authenticated vs. unauthenticated layouts without changing URLs. Each group can have its own `layout.tsx`.
- **Path alias** `@/*` maps to the repo root (configured in `tsconfig.json`). Always import via `@/components/...`, `@/lib/...`, `@/hooks/...` — never relative paths that climb above the file.
- **Server components by default.** Add `"use client"` only when a component uses hooks, browser APIs, or event handlers.
- **Feature components stay under ~200 lines.** Prefer composition over deep nesting.

## Adding a New Page or Route

1. Create a folder under the appropriate route group and add `page.tsx`:
   ```text
   app/(dashboard)/dashboard/widgets/page.tsx      # → /dashboard/widgets
   app/(public)/widgets/page.tsx                   # → /widgets
   ```
2. A server component reads data from the API through a typed reader and renders it:
   ```tsx
   import { serverApiFetch } from "@/lib/server-api";

   interface Widget { id: string; name: string }

   export default async function WidgetsPage() {
     // /dashboard/* is already gated by middleware; the API rejects an invalid session with 401.
     const widgets = await serverApiFetch<Widget[]>("/api/dashboard/widgets");

     return <ul>{widgets.map((w) => <li key={w.id}>{w.name}</li>)}</ul>;
   }
   ```
   Keep readers for a feature in one module (see `lib/dashboard-data.ts`) so error handling is shared.
3. To guard an entire section, put it under `/dashboard` (middleware gates the session cookie) or verify the session with `getSessionUser()` in a layout.
4. For dynamic segments use `[slug]/page.tsx` and read `params` / `searchParams` from the page props (Next.js 16: `params` is a Promise — `await` it).
5. Add a loading state with `loading.tsx` and an error boundary with `error.tsx` in the same folder if the route does slow or fallible work.

To add a JSON **API route** under `app/api/`, create `route.ts` exporting the HTTP method handlers (`GET`, `POST`, ...). Most business logic intentionally lives in the FastAPI backend — only OG-image generation and the session login/logout routes remain as Next.js routes.

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

Every data call goes to the FastAPI backend. Client components use `authFetch()` in [`lib/api-client.ts`](../lib/api-client.ts); server components use `serverApiFetch()` in [`lib/server-api.ts`](../lib/server-api.ts).

`authFetch` reads the Firebase ID token (`auth.currentUser.getIdToken()`), injects the `Authorization: Bearer <token>` header, sets `Content-Type: application/json` unless the body is `FormData`, and **retries once on 401** after force-refreshing the token.

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

`serverApiFetch<T>(path)` forwards the visitor's `cf-connecting-ip`, sends the `session` cookie as the Bearer token when there is one (and no `Authorization` header otherwise), and throws `ApiError` on a non-2xx response. Pass `{ auth: "none" }` to never authenticate. Server code must not import `lib/api-client.ts`: it loads the Firebase client SDK.

Notes:

- Both helpers take a **path** (e.g. `/api/v1/documents`), not a full URL. The base URL comes from `NEXT_PUBLIC_API_URL`, which is required. Use `getApiUrl(path)` if you need the full URL for `fetch` directly.
- Never render or log an invite `token` or a share `delete_token` the API returns, except where the existing UI already shows it to its owner.
- Metadata paths (`generateMetadata`, the OG route) call only `GET /api/shares/{slug}`, never `/content`: a content read counts a view and burns one-time shares.
- Generated response types live in `lib/api-types.ts`. Regenerate after backend schema changes with `npm run generate-types`.

## Authentication and Sessions

Firebase Auth owns identity. The client signs in through `lib/firebase/auth.ts`; `components/auth-provider.tsx` then posts the ID token to `POST /api/auth/session-login`, which mints the httpOnly `session` cookie (14 days, `SameSite=Lax`). Sign-out calls `POST /api/auth/session-logout`, which revokes refresh tokens and clears the cookie.

- `middleware.ts` redirects `/dashboard/*` to `/auth/login?next=...` when the `session` cookie is absent. It is a presence check; it does not load `firebase-admin`.
- Server components verify identity with `getSessionUser(cookieStore)` from `lib/firebase/server.ts`.
- The same middleware applies security headers (HSTS in production, `X-Frame-Options: DENY`) and skips `_next/static`, `_next/image`, `favicon.ico`, and `api/og-image`.

## Styling

- **Tailwind CSS v4** is the only styling system. The entry point is [`app/globals.css`](../app/globals.css), which imports `tailwindcss`, `tw-animate-css`, and `shadcn/tailwind.css`. Design tokens (OKLCH colors, radii, fonts) are defined as CSS variables in the `@theme` block.
- **Use token classes, not Tailwind's default palette**, for accents: `bg-primary`, `text-foreground`, `border-border`, etc. The brand accent is violet (`text-violet-500`). Do not reach for `bg-purple-500`-style defaults.
- **Merge classes with `cn()`** from [`lib/utils.ts`](../lib/utils.ts) (clsx + tailwind-merge). Never string-concatenate conditional class names.
- **Dark mode is the default.** The `dark` class strategy is configured via `@custom-variant dark` in `globals.css`; `next-themes` (`ThemeProvider` in the root layout) is available for dynamic theme switching.
- Fonts (Inter as `--font-sans`, Geist Mono as `--font-mono`) are loaded via `next/font/google` in `app/layout.tsx`.

## The Markdown Editor (CodeMirror)

The editor lives at `app/(public)/editor/page.tsx` and renders `components/editor-shell.tsx`. CodeMirror 6 requires browser APIs, so the editor pane is loaded with `next/dynamic` and `{ ssr: false }`. Extensions (slash commands, image drag-and-drop, scroll sync) live in `lib/editor-extensions/`. Drafts auto-save to localStorage. When adding editor features, keep the dynamic import and put new CodeMirror extensions in `lib/editor-extensions/`.

## Debugging Tips

- **Type errors** surface during `npm run build`. To iterate faster on types alone, run `npm run typecheck`.
- **Dev server errors** show in the Next.js overlay and the terminal running `npm run dev`. Hot reload should preserve most state; do a full refresh if a layout or middleware file changes.
- **Redirect loops to `/auth/login`** — the `session` cookie is missing or rejected. Check that `FIREBASE_ADMIN_*` are set and that `POST /api/auth/session-login` returns 200 after sign-in.
- **401s on backend calls** from a client component — check that `NEXT_PUBLIC_API_URL` points at a running backend and that a Firebase user is signed in. `authFetch` retries once after a token refresh; repeated 401s mean the token cannot refresh.
- **Server-side API errors** — `serverApiFetch` throws `ApiError` with the status; confirm the API is reachable from the Next.js server (not just the browser) and that its `ALLOWED_ORIGINS` includes `http://localhost:3000`.
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
   npm run check:hygiene
   npm run build
   ```
2. **Use [Conventional Commits](https://www.conventionalcommits.org/)** (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`). Keep commits focused on one concern and do not include AI-attribution lines.
3. **Open the PR** against `main` (or the relevant integration branch) with a clear description of what changed and why. Call out anything that affects auth or the session flow — these are the highest-risk areas.
4. **Manual verification** — since there is no test suite, exercise the affected flow in the dev server and note what you tested in the PR description.
5. **Never commit secrets.** `.env.local`, the `FIREBASE_ADMIN_*` credentials and any other secret must stay out of git.

For coding-style detail (naming, TypeScript rules, formatting) see [code-standards.md](./code-standards.md). For environment variables and per-environment configuration see [CONFIGURATION.md](./CONFIGURATION.md); for the broader system context see [ARCHITECTURE.md](./ARCHITECTURE.md).
