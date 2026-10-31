# Code Standards

## Overview

Standards for the DropItX codebase. Next.js 16 + TypeScript strict + Tailwind CSS 4. This repository is the frontend only; the CLI is the separate Python `dropitx-cli` repository.

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase | `UploadDropzone.tsx`, `EditorShell.tsx`, `ShareCard.tsx` |
| Utilities / Hooks | kebab-case | `api-client.ts`, `crypto.ts`, `use-auth-user.ts` |
| UI Primitives (shadcn) | kebab-case | `button.tsx`, `card.tsx`, `dialog.tsx` |
| Firebase Utils | kebab-case | `lib/firebase/client.ts`, `lib/firebase/server.ts` |
| Pages (Next.js App Router) | `page.tsx`, `layout.tsx`, `route.ts` | No rename |
| Type Files | kebab-case | `share.ts`, `team.ts`, `analytics.ts` |
| Config Files | natural | `eslint.config.mjs`, `tsconfig.json`, `next.config.ts` |

## Project Structure

```
app/                      # Next.js App Router (pages, layouts, API routes)
app/(public)/             # Public route group (landing, auth, editor, shares, search)
app/(dashboard)/          # Dashboard route group (sidebar layout, teams, analytics)
app/api/                  # og-image, auth/session-login, auth/session-logout (everything else is in the API)
components/ui/            # Reusable UI primitives (shadcn/ui)
components/               # Feature components (landing, editor, dashboard, team, analytics)
lib/                      # Utility functions
lib/editor-extensions/    # CodeMirror extensions
lib/firebase/             # Firebase client, auth helpers, server session verification
types/                    # TypeScript interfaces
public/                   # Static assets
docs/                     # Documentation
```

## TypeScript

- Strict mode enabled (`tsconfig.json`)
- Interfaces over types for object shapes
- API field names use snake_case in types (matches the API's JSON): `storage_path`, `content_text`, `is_private`
- Prefer `async/await` over `.then()`
- Explicit return types on exported functions
- No `any` — use `unknown` and narrow

## React Patterns

- Functional components only (no classes)
- `"use client"` directive when using hooks, state, or browser APIs
- Server components by default for data-fetching pages
- Props via TypeScript interfaces, not PropTypes
- Keep components under 200 lines — split if larger
- CodeMirror: always load via `next/dynamic({ ssr: false })` — never import directly in server context

## Editor Integration (CodeMirror)

- Editor page at `app/editor/page.tsx` uses `next/dynamic({ ssr: false })` to load `EditorShell`
- `EditorPane` creates a single CodeMirror `EditorView`; do not re-create on re-render
- Theme switching via `Compartment` hot-swap (`compartment.reconfigure(...)`)
- Slash commands and image drop registered as CodeMirror extensions in `lib/editor-extensions/`
- Auto-save hook (`useEditorAutoSave`) debounces writes to `localStorage`

## API Routes

**Note**: All data logic runs on the FastAPI backend (`dropitx-api`, at `NEXT_PUBLIC_API_URL`). The Next.js app is a pure frontend; its own routes are `/api/og-image/[slug]` and the session cookie routes `/api/auth/session-login` and `/api/auth/session-logout`.

### Client-Side API Calls
- Use `authFetch()` from `lib/api-client.ts` for all authenticated requests
- `authFetch()` injects the Firebase ID token as Bearer
- 401 responses trigger one forced token refresh + retry
- `getApiUrl()` returns `NEXT_PUBLIC_API_URL` for constructing API endpoints

### Server-Side API Calls
- Use `serverApiFetch()` from `lib/server-api.ts` in server components; never import `lib/api-client.ts` on the server
- It forwards `cf-connecting-ip` and sends the session cookie as Bearer only when one exists
- Metadata paths (`generateMetadata`, OG image) call only `GET /api/shares/{slug}`, never `/content`

### FastAPI Backend API Conventions
- All routes under `/api/v1/` use API key auth (Bearer token)
- Browser routes use the Firebase ID token as Bearer; server components forward the session cookie
- Team workspace routes: `/api/dashboard/teams/` (authorization is enforced by the API)
- Analytics tracking: `/api/analytics/track` for event metrics

### Team Workspace API Pattern
```typescript
// POST /api/dashboard/teams/[slug]/members
// The API enforces that only owners can change members
// The team is resolved from the route slug, the user from the Bearer token

// Team Invite System Pattern
// Invite form with role selection and email validation; bulk invite with multiple emails
// Invite links are /invite/[token]; never render or log an invite token
```

### Analytics Tracking Pattern
```typescript
// POST /api/analytics/track
// Event types: 'page_view', 'search', 'upload', 'api_call'
// metadata varies by event type (slug, query, file_size, etc.)
// both anonymous and authenticated user tracking
```

## Database

The frontend has no database access and no migrations. The schema lives in `dropitx-api/infra/init`; change it there and regenerate API types with `npm run generate-types`.

## Authentication Helpers

| Helper | Export | Use Case |
|--------|--------|----------|
| Firebase client | `lib/firebase/client.ts → auth` | Client components, `authFetch` |
| Session verification | `lib/firebase/server.ts → getSessionUser()` | Server components; verifies the `session` cookie with `firebase-admin` |

Never import `lib/firebase/server.ts` in a client component — server-only.

## Error Handling

- API routes: try/catch → `{ error: message }` with appropriate HTTP status
- Components: Sonner toast for user-facing errors
- Rate limit: a 429 from the API surfaces as a toast via `lib/rate-limit.ts`
- API key auth failures: return `401` with `{ error: "Unauthorized" }`

## Styling

- Tailwind CSS 4 utility classes only — no custom CSS-in-JS
- OKLCH color tokens via CSS custom properties in `app/globals.css`
- Token layers: `@theme inline` → Tailwind namespace bindings, `:root` and `.dark` → same dark-only system
- Token naming: `--{namespace}-{property}-{variant}` (e.g., `--primary`, `--accent-soft`, `--sidebar-ring`)
- `cn()` from `lib/utils.ts` for conditional class merging (clsx + tailwind-merge)
- Component variants via `class-variance-authority`
- **Light-first default**: Clay system uses warm cream (#f7eee6) canvas with optional `.dark` companion for accessibility
- **Font usage**: `font-sans` (Inter) for all text/headings, `font-mono` (Geist Mono) for labels/code/metadata
- **Chart colors**: Use `--chart-1` through `--chart-5` tokens for data visualization — terracotta, matcha, blueberry, lemon, ube
- **Token colors**: All CSS variables in `app/globals.css` use hex for light mode (primary), `.dark` selector for dark companion
- **Primary accent**: `--primary` is terracotta (#9a5b3c), `--background` is warm cream (#f7eee6)
- **Radius tokens**: Clay uses generous, organic radii (14px, 22px, 34px, pill 9999px) — hardcoded, no calc
- **Shadows**: `--shadow` uses layered elevation (dark drop + light inset highlight) for three-dimensionality
- 8pt spacing grid: use even Tailwind spacing values

## Security

- **File upload**: validate extension, MIME type, size (≤ 50 MB) at FastAPI layer
- **Image upload**: validate MIME type (png/jpg/gif/webp), size (≤ 5 MB), require session auth
- **HtmlViewer**: sandboxed iframe (`sandbox="allow-scripts"`) + CSP meta tag injection
- **Delete token**: random 32-char string, required for file-upload share deletion
- **Slug validation**: regex pattern check on API routes
- **Firebase Admin credentials**: server-only — never expose to client bundle
- **API key**: only SHA-256 hash + prefix stored; full key shown once at creation
- **`is_private`**: enforced by the API (a private share answers 404 to everyone but its owner)
- **Password protection**: verified by the API's `/unlock` endpoint; the page renders the returned content in place and keeps no access cookie
- **Team workspaces**: role-based access is enforced by the API; the frontend only reflects the caller's role
- **Auth**: Firebase ID token (browser) or session cookie (server) sent as Bearer to FastAPI; verified by the API
- **Invite tokens and delete tokens**: never rendered or logged except where the UI already shows a delete token to its owner

## Lint & Build

```bash
npm run check:hygiene   # tsc --noEmit && eslint
npm run build           # TypeScript check + Next.js build
```

Fix lint errors before commit. Build must pass before push.

## Git Conventions

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- No AI references in commit messages
- Keep commits focused on actual changes
- Never commit `.env.local`, `~/.dropitx/config.json`, or any secrets
