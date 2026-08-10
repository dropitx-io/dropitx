# Constraints (SPECs)

> Synthesized from classified SPECs: system-architecture.md, code-standards.md,
> design-guidelines.md. One entry per constraint. Type is one of:
> api-contract | schema | nfr | protocol. All three SPECs carry precedence SPEC,
> `locked: false`.

## Architecture: Next.js pure frontend + FastAPI backend
- source: docs/system-architecture.md
- type: protocol
- content: DropItX is a Next.js 16 (App Router) pure frontend deployed on Vercel with only one remaining API route (`/api/og-image/[slug]`). All API logic runs on a FastAPI backend at `dropitx-api.onrender.com` (Render). Frontend calls backend via `authFetch()` injecting the Supabase JWT Bearer token; 401 triggers session refresh + retry. Backing services: Supabase (PostgreSQL + Storage, RLS enforced) and Upstash Redis (rate limiting).

## Authentication: dual auth model (JWT Bearer + API key)
- source: docs/system-architecture.md
- type: protocol
- content: Two auth models. (1) Session/JWT auth for browsers: Supabase SSR cookies, PKCE flow; `middleware.ts` runs `updateSession()` on every request, validates JWT via JWKS, refreshes expired access tokens, and rewrites rotated auth cookies to both request AND response to prevent refresh-token reuse / cross-tab logouts. (2) API key auth for programmatic access: `POST /api/v1/keys` generates `shk_` + 48 hex chars; stores SHA-256 hash + `key_prefix`; returns full key once; requests authenticate via `Authorization: Bearer shk_...` → SHA-256 hash lookup. Soft-revoke via `revoked_at`.

## Password-protected share access cookie
- source: docs/system-architecture.md
- type: protocol
- content: `POST /api/shares/{slug}/unlock { password }` → FastAPI `bcryptjs.compare(password, shares.password_hash)` → on match issues HMAC-SHA256 signed cookie using `SHARE_ACCESS_SECRET`. `Set-Cookie: share_access_{slug}=<signed>; HttpOnly; SameSite=Lax; Max-Age=86400` (24h TTL). View gate order: owner bypass → is_private → access cookie → password gate → auth gate.

## Rate limiting
- source: docs/system-architecture.md
- type: nfr
- content: Upstash Redis sliding window. Upload/API: 10 req/min per IP. Password unlock: 5 attempts/10 min per IP. Fail-closed if Redis unavailable (password unlock returns 503 — no silent bypass).

## Upload validation limits
- source: docs/system-architecture.md
- type: nfr
- content: Files: `.html`/`.htm`/`.md`, MIME type check, size ≤ 50 MB. Images: MIME `png`/`jpg`/`gif`/`webp`, size ≤ 5 MB, auth required. Validation at FastAPI layer.

## Storage bucket
- source: docs/system-architecture.md
- type: schema
- content: Bucket `html-files` (public, 50 MB max). Uploaded files: `{uuid}.html` or `{uuid}.md`. Editor images: `images/{uuid}.{ext}`. Public read via Supabase CDN; admin-only write.

## Database schema — shares table
- source: docs/system-architecture.md
- type: schema
- content: Columns: `id` (UUID PK), `slug` (VARCHAR(10) UNIQUE, nanoid), `filename`, `storage_path`, `content_text`, `search_vec` (TSVECTOR GENERATED, weighted A: filename / B: content), `file_size`, `mime_type` (default `text/html`), `delete_token` (VARCHAR(32)), `user_id` (nullable FK), `title`, `custom_slug` (VARCHAR(100) UNIQUE PARTIAL, `handle/slug`), `source` (`'upload'`|`'editor'`), `is_private`, `password_hash` (nullable, bcryptjs), `updated_at`, `created_at`, `expires_at` (default NOW()+30 days), `view_count` (atomic increment via RPC).

## Database schema — supporting tables
- source: docs/system-architecture.md
- type: schema
- content: `user_profiles` (id FK→auth.users, display_name, avatar_url). `favorites` (user_id, share_id, UNIQUE(user_id, share_id)). `api_keys` (user_id, name, key_hash VARCHAR(64), key_prefix VARCHAR(12), last_used_at, revoked_at soft-delete). `team_workspaces` (owner_id FK). `workspace_members` (workspace_id, user_id, role `'owner'`|`'member'`, UNIQUE(workspace_id, user_id)). `workspace_shares` (workspace_id, share_id, user_id, UNIQUE(workspace_id, share_id)). `analytics_events` (event_type `'page_view'`|`'search'`|`'upload'`|`'api_call'`, user_id nullable, session_id, metadata JSONB, user_agent, ip_address INET).

## Database RPCs
- source: docs/system-architecture.md
- type: schema
- content: `search_shares(query, limit, offset)` — full-text search with ranking + highlighted snippets (filters private shares for non-owners). `increment_view_count(slug)` — atomic view counter. `get_user_workspaces(user_id)`. `is_user_in_workspace(user_id, workspace_id)`. `get_workspace_shares(workspace_id)`.

## API surface (FastAPI endpoints)
- source: docs/system-architecture.md
- type: api-contract
- content: `POST /api/upload`, `GET /api/search`, `POST /api/publish`, `POST /api/images/upload`, `GET|PATCH|DELETE /api/shares/{slug}`, `POST /api/shares/{slug}/unlock`, `POST /api/shares/{slug}/set-password`, `POST /api/analytics/track`, `GET /api/oembed`, `GET|POST /api/v1/keys`, `DELETE /api/v1/keys/{key_id}`, `POST /api/v1/documents`, `GET /api/v1/documents`, CRUD `/api/dashboard/teams`, `/api/dashboard/teams/{slug}/*`, `POST /api/invite/accept`, `POST /api/invite/decline`.

## oEmbed endpoint
- source: docs/system-architecture.md
- type: api-contract
- content: `GET /api/oembed?url=https://dropitx.app/s/{slug}` → JSON + HTML embed code. Response: type=rich, provider_name, title, author, iframe embed HTML (800x600). Security: domain validation, rate limiting, CSP headers for embedded content.

## Security layers
- source: docs/system-architecture.md
- type: nfr
- content: File/image validation (limits above); HtmlViewer `sandbox="allow-scripts"` + CSP meta tag; delete protection via random 32-char token; slug regex validation; RLS for reads / service_role for writes; API key SHA-256 + soft-revoke; private shares via RLS + `search_shares` RPC filter; password protection bcryptjs + HMAC-SHA256 HttpOnly cookie (24h); compensating transaction (storage cleanup on DB insert failure); workspace access via RLS on team tables.

## Code standards: TypeScript strict
- source: docs/code-standards.md
- type: nfr
- content: TypeScript strict mode enabled (`tsconfig.json`). Interfaces over types for object shapes. DB column names snake_case in types (match Supabase). Prefer `async/await`. Explicit return types on exported functions. No `any` — use `unknown` and narrow.

## Code standards: React patterns
- source: docs/code-standards.md
- type: nfr
- content: Functional components only. `"use client"` only when using hooks/state/browser APIs; server components default. Props via TypeScript interfaces. Components under 200 lines (split if larger). CodeMirror always via `next/dynamic({ ssr: false })` — never import directly in server context.

## Code standards: naming conventions
- source: docs/code-standards.md
- type: nfr
- content: React components PascalCase (`UploadDropzone.tsx`); utilities/hooks kebab-case (`api-client.ts`, `use-auth-user.ts`); UI primitives kebab-case (`button.tsx`); pages `page.tsx`/`layout.tsx`/`route.ts` (no rename); type files kebab-case; migrations `YYYYMMDDNNNNNN_description.sql`.

## Code standards: migrations
- source: docs/code-standards.md
- type: nfr
- content: All schema changes in `supabase/migrations/` as timestamped SQL. Apply locally `supabase db reset` or `supabase db push`; hosted `supabase db push --linked`. Never modify `schema.sql` for incremental changes — always add a migration. Each migration idempotent where possible (`IF NOT EXISTS`, `DO $$ ... $$`).

## Code standards: Supabase client factories
- source: docs/code-standards.md
- type: protocol
- content: Three factories in `utils/supabase/`: Browser `client.ts → createClient()` (client components); Server anon `server.ts → createClient()` (server components, reads respect RLS); Admin `server.ts → createAdminClient()` (writes, storage ops, bypasses RLS). Never use admin client in client components — server-only.

## Code standards: styling tokens
- source: docs/code-standards.md
- type: nfr
- content: Tailwind CSS 4 utilities only — no CSS-in-JS. OKLCH color tokens via CSS custom properties in `app/globals.css`. Token layers: `@theme inline` → Tailwind namespace bindings; `:root` and `.dark` → same dark-only system. `cn()` from `lib/utils.ts` (clsx + tailwind-merge). Variants via `class-variance-authority`. Light-first default. Chart colors `--chart-1`..`--chart-5` (terracotta, matcha, blueberry, lemon, ube). Primary terracotta `#9a5b3c`; background warm cream `#f7eee6`. Radius 14/22/34px, pill 9999px (hardcoded, no calc). 8pt spacing grid.

## Code standards: lint/build/git
- source: docs/code-standards.md
- type: nfr
- content: `npm run lint` (ESLint next config) — fix before commit. `npm run build` (TS check + Next.js build) — must pass before push. CLI build `cd packages/cli && npm run build`. Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`). No AI references in commit messages. Never commit `.env.local`, `~/.dropitx/config.json`, or secrets.

## Design system: Clay color tokens (light mode, default)
- source: docs/design-guidelines.md
- type: schema
- content: `--background` #f7eee6 (warm cream); `--foreground` #2b211c (near-black brown); `--card` #fff8f1; `--primary` / `--accent` / `--meta` / `--ring` #9a5b3c (terracotta); `--primary-foreground` #ffffff; `--secondary` / `--accent-soft` #ead6c7; `--accent-line` / `--border` #dac8b9; `--muted-foreground` #766860; `--fg-soft` #5a4b43; `--destructive` #b84c4c; `--success` #468352; `--warning` #c88735. Hex for light (primary); `.dark` selector for warm-dark companion. Dark companion exists but light is primary.

## Design system: data visualization palette
- source: docs/design-guidelines.md
- type: schema
- content: `--chart-1` #b46a46 (terracotta primary); `--chart-2` #4d8f5a (matcha green); `--chart-3` #5b9bd5 (blueberry); `--chart-4` #c88735 (lemon gold); `--chart-5` #8b5cf6 (ube purple).

## Design system: typography
- source: docs/design-guidelines.md
- type: nfr
- content: Body font Inter (`--font-sans`) weights 300–700. Mono font Geist Mono (`--font-mono`) weights 400–600 (accents, metadata, code, labels). Type scale: `.eyebrow` 11px uppercase mono 0.0875em tracking; `.meta` 12px mono 0.075em tracking terracotta; body 14–16px; `.heading-fluid-lg` `clamp(40px,6vw,76px)`; `.heading-fluid-md` `clamp(28px,4vw,36px)`. Line height 1.06 headings / 1.5–1.6 body.

## Design system: radius & elevation
- source: docs/design-guidelines.md
- type: schema
- content: `--radius-sm` 14px; `--radius-md` / `--radius-card` 22px; `--radius-lg` / `--radius-section` 34px; `--radius-pill` 9999px. Shadow layered: `--shadow: 8px 10px 24px rgba(128,92,70,0.18), -8px -8px 20px rgba(255,255,255,0.70)`. Focus ring: `--focus-ring: 0 0 0 4px rgba(154,91,60,0.24)`.

## Design system: responsive breakpoints
- source: docs/design-guidelines.md
- type: nfr
- content: Mobile-first Tailwind breakpoints. default <640px stacked single-column; `sm:` 640px; `md:` 768px two-column grids; `lg:` 1024px editor split-pane + share page sidebar. Upload full-width mobile / `max-w-2xl` centered desktop. Editor single pane mobile / split 50/50 `lg:`. Share stacked mobile / sidebar `lg:`.

## Design system: accessibility
- source: docs/design-guidelines.md
- type: nfr
- content: WCAG 2.1 AA contrast, keyboard nav, semantic HTML, focus rings on all interactive elements.

## Design system: UI security contracts
- source: docs/design-guidelines.md
- type: nfr
- content: HtmlViewer sandboxed iframe `sandbox="allow-scripts"` + CSP meta tag injection. File validation extension `.html`/`.htm`/`.md`, size ≤50MB client-side; MIME server-side. Image validation size ≤5MB client hint; full server-side. Rate limiting 10 req/min/IP writes; 5 attempts/10 min password unlock. Password protection bcryptjs + HMAC-SHA256 access cookies. Team workspace isolation via RLS.
