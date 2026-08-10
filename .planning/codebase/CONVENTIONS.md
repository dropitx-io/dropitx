# Coding Conventions

**Analysis Date:** 2026-08-10

## Naming Patterns

**Files:**
- Feature components: kebab-case (`dashboard-share-card.tsx`, `upload-dropzone.tsx`, `share-access-cookie.ts`)
- UI primitives (shadcn): single-word lowercase (`button.tsx`, `card.tsx`, `badge.tsx`)
- Type definition files: kebab-case (`team-event.ts`, `share.ts`, `analytics.ts`)
- Utility modules: kebab-case (`api-client.ts`, `rate-limit.ts`, `file-utils.ts`)
- Hooks: `use-` prefix (`use-email-validation.ts`, `use-team.ts`, `use-toast.ts`)
- Editor extensions subdirectory: kebab-case files inside `lib/editor-extensions/`
- Some hooks live in `lib/` instead of `hooks/` (e.g., `lib/use-auto-save.ts`, `lib/use-auth-user.ts`, `lib/use-scroll-sync.ts`) -- this is an inconsistency

**Functions:**
- camelCase (`formatFileSize`, `getAuthHeaders`, `saveDraft`, `buildShareUrl`)
- Constants: UPPER_SNAKE_CASE (`ALGORITHM`, `KEY_LENGTH`, `DRAFT_PREFIX`, `SALT_ROUNDS`)
- React components: PascalCase (`DashboardShareCard`, `EmptyStateCard`, `PasswordGate`)
- Factory functions: camelCase (`createClient`, `createAdminClient`, `getSupabase`)

**Variables:**
- camelCase (`supabaseResponse`, `cookieStore`, `teamShareMap`)
- Module-level singletons prefixed with underscore (`_supabase` in `lib/api-client.ts`)
- Booleans prefixed with `is`/`has` (`isOwner`, `hasPassword`, `hasDraft`, `isMarkdown`)

**Types/Interfaces:**
- PascalCase for all types/interfaces (`Share`, `TeamInvite`, `DraftMeta`, `TokenSecurityStatus`)
- Type aliases for unions: PascalCase (`TeamRole`, `TeamPlan`, `TeamEventType`, `TeamInviteStatus`)
- `type` for union/alias types, `interface` for object shapes
- Omit/extends pattern for derived types: `Omit<Share, "password_hash"> & { has_password: boolean }`
- Props interfaces: `{ComponentName}Props` (`CopyButtonProps`, `EmptyStateCardProps`, `GlobalErrorProps`)

## Code Style

**Formatting:**
- No Prettier or Biome configured; formatting relies on editor defaults and ESLint
- Tailwind CSS 4 (PostCSS-based, no `tailwind.config.ts` file)
- Semicolons are used in most files but some files omit them (inconsistent -- `lib/utils.ts` and `components/empty-state-card.tsx` have no semicolons)
- Single quotes in older files (e.g., `components/copy-button.tsx`, `hooks/use-email-validation.ts`), double quotes in newer files (most of `lib/`, `app/`)
- Trailing commas present in function calls and multi-line objects

**Linting:**
- ESLint 9 with flat config (`eslint.config.mjs`)
- `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- No custom rules beyond the Next.js defaults
- `@typescript-eslint/no-explicit-any` used with eslint-disable comments in 2 locations (`app/(dashboard)/dashboard/page.tsx` lines 44, 63)
- Type checking is bypassed in production builds: `next.config.ts` sets `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`

**TypeScript:**
- `strict: true` in `tsconfig.json`
- `noEmit: true`, `target: ES2017`, `module: esnext`, `moduleResolution: bundler`
- Path alias: `@/*` maps to repo root
- Some files use `any` (notably `lib/token-security.ts` and `app/(dashboard)/dashboard/page.tsx`)
- Type assertions used where Supabase queries return untyped data: `.single<Share>()`, `as any[]`

## Import Organization

**Order (observed in source files):**
1. External packages (`react`, `next`, `next/server`, `next/navigation`)
2. Supabase packages (`@supabase/ssr`, `@supabase/supabase-js`)
3. Third-party libraries (`lucide-react`, `sonner`, `@vercel/analytics`, `@codemirror/*`)
4. Internal `@/` aliased imports -- grouped by:
   - `@/components/ui/*` (shadcn primitives)
   - `@/components/*` (feature components)
   - `@/lib/*` (utilities)
   - `@/utils/supabase/*` (auth/session)
   - `@/types/*` (type imports)
5. Relative imports (`./editor-extensions/image-preview`, `./globals.css`)
6. Type-only imports: `import type { X } from ...` or inline `import { type X } from ...`

**Path Aliases:**
- `@/*` maps to repository root (configured in `tsconfig.json` and `components.json`)
- No other custom aliases
- All internal imports use `@/` -- never relative paths that cross directory boundaries

**Named exports only:** All components and utilities are exported as named exports. No default exports except page components and layout components (Next.js convention).

## Error Handling

**Patterns:**
- `try/catch` with silent catch blocks for non-critical operations (localStorage in `lib/draft-storage.ts`, analytics in `lib/analytics.ts`)
- `try/catch` with user-facing `alert()` for destructive operations (delete in `components/dashboard-share-card.tsx`)
- `try/catch` with `toast.error()` for API failures (rate limiting in `lib/rate-limit.ts`)
- `try/catch` with thrown `Error` for server-side utilities (missing env vars in `utils/supabase/server.ts`, `lib/share-access-cookie.ts`)
- `notFound()` from `next/navigation` for missing data in server components (`app/(public)/s/[slug]/page.tsx`)
- `redirect()` from `next/navigation` for auth-required pages
- Custom error classes: `RateLimitError` in `lib/rate-limit.ts`
- Error boundary component: `components/error-boundary.tsx` wrapping app in root layout
- Global error page: `app/error.tsx` with "Try again" button calling `reset()`
- 404 page: `app/not-found.tsx`

**Server-side errors:**
- Supabase query errors checked via `{ data, error }` destructuring
- `if (fetchError || !share) notFound()` pattern common in server pages
- Analytics failures wrapped in try/catch with fallback to old increment method (`app/(public)/s/[slug]/page.tsx` lines 192-198)

**Client-side errors:**
- State-based error tracking: `const [copyError, setCopyError] = useState(false)` in `components/copy-button.tsx`
- Optimistic UI with rollback on failure: delete flow in dashboard

## Logging

**Framework:** `console` (no structured logging library)

**Patterns:**
- No explicit logging in application code
- Analytics events tracked via `@vercel/analytics` `track()` function (not console logs)
- No debug logging found
- Errors silently caught in non-critical paths (localStorage, analytics)

## Comments

**When comments appear:**
- Security-critical explanations: "Must return the response carrying refreshed cookies" in `middleware.ts`
- Workaround explanations: "Analytics must never break user flows" in `lib/analytics.ts`
- Non-obvious architecture: Supabase cookie domain sharing explained in `utils/supabase/client.ts`, `utils/supabase/server.ts`, `utils/supabase/middleware.ts`
- Module-level doc comments for crypto utilities: `lib/crypto.ts` describes E2E flow
- TODO/FIXME/HACK: Not found in source code (clean)

**JSDoc/TSDoc:**
- Used sparingly for exported functions with non-obvious behavior
- Interface props documented with `/** */` comments when purpose isn't self-evident from name
- `@param` / `@returns` tags not used; return types are expressed in TypeScript signatures
- Module-level docstrings present on `lib/crypto.ts`, `lib/draft-storage.ts`, `lib/share-access-cookie.ts`, `lib/token-security.ts`

**Section markers:**
- `// --- Base64url helpers ---` in `lib/crypto.ts` (rare)
- `// --- ACCESS GATE ---` / `// --- END ACCESS GATE ---` in `app/(public)/s/[slug]/page.tsx`
- `{/* Metadata header */}` JSX comments in page components

## Function Design

**Size:**
- Most functions under 30 lines
- Utility modules are self-contained and short (`lib/password.ts` is 11 lines, `lib/validation.ts` is 9 lines, `lib/utils.ts` is 6 lines)
- Larger page components (300-400+ lines) contain server-side data fetching + JSX rendering -- could benefit from extracting presentational components
- `components/team/team-invite-form.tsx` at 554 lines exceeds the stated 200-line guideline

**Parameters:**
- Objects with destructured props for React components: `({ share }: { share: ShareWithPasswordFlag })`
- Options objects for hooks: `options: AutoSaveOptions = {}` in `lib/use-auto-save.ts`
- Single primitive params for utility functions: `(plain: string)`, `(namespace: string)`

**Return Values:**
- Explicit return types on exported functions (e.g., `Promise<string>`, `boolean`, `DraftMeta | null`)
- Hook return objects: `{ team, selectTeam }`, `{ toasts, toast, dismiss }`
- `undefined` returns not used; `null` preferred for "not found" cases

## Module Design

**Exports:**
- Named exports exclusively (no barrel `index.ts` files -- each consumer imports from the specific module)
- Class-based modules export both the class and convenience functions: `lib/token-security.ts` exports `TokenSecurity`, `InviteValidationService`, and standalone functions like `generateSecureToken`
- Supabase client factories: `createClient` (anon), `createAdminClient` (service role) -- both named exports from `utils/supabase/server.ts`

**Barrel Files:**
- Not used. Every import points to the exact file: `import { authFetch } from "@/lib/api-client"`, `import { cn } from "@/lib/utils"`

**Client vs Server boundary:**
- `"use client"` directive at top of file for components using hooks, browser APIs, or event handlers
- Server components are default (no directive)
- Some hooks live in `lib/` (with `"use client"` at top) instead of `hooks/` -- these are hooks that are tightly coupled to a specific utility (e.g., `useAutoSave` + `draft-storage`)

**Singletons:**
- Lazy singleton pattern for Supabase browser client in `lib/api-client.ts`: `let _supabase = null; function getSupabase() { if (!_supabase) ... }`
- Supabase server clients are factory functions (no singleton) -- recreated per request via `cookies()`

---

*Convention analysis: 2026-08-10*
