# Codebase Concerns

**Analysis Date:** 2026-08-10

## Tech Debt

### Build Pipeline Integrity

**Build safety checks disabled:**
- Issue: `next.config.ts` has `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` for both TypeScript and ESLint, permanently disabling type checking and linting during production builds.
- Files: `next.config.ts`
- Impact: Type errors and lint violations silently ship to production. Any regression in type safety or code quality goes undetected by CI.
- Fix approach: Resolve all pre-existing TypeScript errors (commit `4183c6b` attempted this but build was later patched to skip checks). Re-enable `ignoreBuildErrors` and `ignoreDuringBuilds: false`, then address each remaining error.

### Hardcoded Cloudflare Tunnel URL as API Fallback

**Stale tunnel URL in production default:**
- Issue: `lib/api-client.ts` line 3 falls back to a Cloudflare tunnel URL (`https://overcome-sterling-senator-clinics.trycloudflare.com`) when `NEXT_PUBLIC_API_URL` is not set. This tunnel URL is ephemeral and will stop working.
- Files: `lib/api-client.ts`
- Impact: If the Vercel env var is missing or fails to resolve, all API calls route to a dead tunnel endpoint. Production users see silent failures with no error feedback.
- Fix approach: Replace the fallback with a production URL (e.g., `https://api.dropitx.com`) or throw a build-time error when `NEXT_PUBLIC_API_URL` is unset. Never commit ephemeral tunnel URLs.

### @ts-nocheck on Critical Modules

**Five files disable all TypeScript checking:**
- Issue: Five files use `// @ts-nocheck` to suppress all TypeScript errors instead of fixing them.
- Files:
  - `components/team/team-invite-form.tsx` (554 lines)
  - `components/enhanced-invite-dialog.tsx` (378 lines)
  - `components/auth/invite-accept-form.tsx` (321 lines)
  - `components/bulk-invite-dialog.tsx` (365 lines)
  - `lib/team-rpc.ts` (544 lines)
- Impact: These files totaling ~2,162 lines have zero type safety. Refactoring or modifying them risks introducing runtime bugs with no compiler protection.
- Fix approach: Remove `@ts-nocheck` from each file, resolve type errors incrementally. Start with `lib/team-rpc.ts` since it is a shared utility consumed by multiple components.

### Pervasive `any` Type Casts in Dashboard

**Systematic type suppression in team/dashboard pages:**
- Issue: Dashboard pages cast Supabase query results to `any[]` with eslint-disable comments instead of defining proper response types.
- Files:
  - `app/(dashboard)/dashboard/layout.tsx` (lines 41-42)
  - `app/(dashboard)/dashboard/teams/page.tsx` (lines 40-41)
  - `app/(dashboard)/dashboard/teams/[slug]/page.tsx` (lines 57-58, 80-81, 147-148)
  - `app/(dashboard)/dashboard/page.tsx` (lines 44-45, 62-63)
- Impact: The entire dashboard team feature layer operates without type safety. Column renames or schema changes in Supabase will cause silent runtime failures.
- Fix approach: Define TypeScript interfaces for the Supabase query responses (e.g., `TeamMembershipRow`, `TeamShareRow`) in `types/` and use typed `.select<>()` generics.

## Known Bugs

### Empty Catch Blocks Swallowing Errors

**19 empty catch blocks across components:**
- Issue: Numerous `catch {}` blocks silently swallow errors with no logging, error reporting, or user feedback.
- Files: `app/(public)/s/[slug]/page.tsx`, `app/(public)/invite/accept/invite-accept-form.tsx`, `app/(dashboard)/dashboard/teams/[slug]/settings/page.tsx`, `utils/supabase/server.ts`, `components/comments-section.tsx`, `components/invite-member-dialog.tsx`, `components/qr-code-button.tsx`, `components/profile-form.tsx`, `components/version-history.tsx`, `components/password-gate.tsx`, `components/copy-install-button.tsx`, `components/burn-after-reading-tracker.tsx`, `components/share-page-client.tsx`, `components/markdown-viewer.tsx`, `components/dashboard-share-card.tsx`, `components/multi-file-upload.tsx`, `components/share-link.tsx`
- Impact: Failures in share access, invite acceptance, password verification, and comment posting silently fail. Users see no error message and may believe their action succeeded.
- Fix approach: Add error reporting (at minimum `console.error` in development, toast/sonner in production). For critical paths (invite acceptance, password gates), surface the error to the user.

## Security Considerations

### Hardcoded Cookie Domain

**Cookie domain locked to `.dropitx.site`:**
- Issue: All three Supabase client factories hardcode `cookieOptions: { domain: ".dropitx.site" }`.
- Files:
  - `utils/supabase/middleware.ts` (line 23)
  - `utils/supabase/client.ts` (line 15)
  - `utils/supabase/server.ts` (line 14)
- Impact: Development on non-`dropitx.site` domains requires patching these files. Domain changes (e.g., adding a new TLD or staging environment) require editing three files. If the domain ever changes, session cookies will silently stop working.
- Fix approach: Read the domain from an environment variable (e.g., `NEXT_PUBLIC_COOKIE_DOMAIN`) with a sensible default fallback.

### Service Role Key Used Broadly

**`createAdminClient()` (bypasses RLS) used in 9 server files:**
- Issue: The admin/service-role client bypasses Row Level Security and is used in page components that serve public routes.
- Files: `app/(public)/embed/[slug]/page.tsx`, `app/(public)/s/[slug]/page.tsx`, `app/(public)/invite/accept/page.tsx`, `app/api/og-image/[slug]/route.tsx`, `app/(dashboard)/dashboard/analytics/page.tsx`, `app/(dashboard)/dashboard/analytics/[slug]/page.tsx`, `lib/token-security.ts`, `lib/team-rpc.ts`, `utils/supabase/server.ts`
- Impact: A compromised server-side render or SSR bypass could use the service role key to access any row in any table. The embed and share view pages are publicly accessible and use the admin client to fetch share data, which is appropriate for unauthenticated reads but should be audited to ensure no writes occur through these paths.
- Fix approach: Audit each `createAdminClient()` usage. For read-only public routes, consider whether the anon client with appropriate RLS policies could serve the same purpose. Ensure no user-controlled input flows into admin-client write operations.

### Share Access Cookie Secret Reuses Service Role Key

**Fallback to SUPABASE_SERVICE_ROLE_KEY for HMAC signing:**
- Issue: `lib/share-access-cookie.ts` line 9 uses `SUPABASE_SERVICE_ROLE_KEY` as a fallback for the `SHARE_ACCESS_SECRET` env var. The service role key is a Supabase credential with full database access.
- Files: `lib/share-access-cookie.ts`
- Impact: If `SHARE_ACCESS_SECRET` is unset, the service role key becomes the HMAC secret for password-protected share access cookies. This is a least-privilege violation and couples cookie security to a database credential.
- Fix approach: Make `SHARE_ACCESS_SECRET` required (throw if missing). Remove the `SUPABASE_SERVICE_ROLE_KEY` fallback entirely.

### iframe with `srcDoc` for User-Uploaded HTML

**User HTML rendered in iframe with limited sandbox:**
- Issue: `components/html-viewer.tsx` and `app/(public)/embed/[slug]/page.tsx` render user-uploaded HTML inside an iframe via `srcDoc`. The sandbox is `allow-scripts` which permits JavaScript execution. The CSP meta injection (`script-src 'unsafe-inline' 'unsafe-eval'`) further weakens the sandbox.
- Files: `components/html-viewer.tsx` (line 9, 57), `app/(public)/embed/[slug]/page.tsx` (line 97)
- Impact: Uploaded HTML files can execute arbitrary JavaScript within the iframe sandbox. While `sandbox="allow-scripts"` restricts same-origin access, the combination of `unsafe-inline` + `unsafe-eval` + `allow-scripts` means uploaded content can run complex scripts, make network requests, and attempt phishing from the DropItX origin.
- Fix approach: Tighten the CSP to remove `unsafe-eval`. Consider `sandbox="allow-scripts allow-same-origin"` removal (keep `allow-scripts` only). Evaluate whether HTML upload should require explicit user consent about script execution.

### Missing CSP Header in Middleware

**No Content-Security-Policy header set in middleware:**
- Issue: `middleware.ts` sets HSTS, X-Frame-Options, X-XSS-Protection, Referrer-Policy, and Permissions-Policy but does NOT set a Content-Security-Policy header.
- Files: `middleware.ts`
- Impact: Without a CSP, injected scripts (via XSS or third-party dependency compromise) have no browser-level restrictions. The iframe CSP meta in `html-viewer.tsx` only applies to that specific viewer, not the whole application.
- Fix approach: Add a `Content-Security-Policy` header in `middleware.ts` restricting script sources, style sources, and connect sources to the DropItX domain and trusted CDNs.

## Performance Bottlenecks

### Supabase Client Singleton in `api-client.ts`

**Module-level singleton pattern caches the Supabase client:**
- Issue: `lib/api-client.ts` creates a module-level `_supabase` singleton via `getSupabase()`. Since this is a `"use client"` module, the singleton persists for the lifetime of the browser tab but may hold stale session data.
- Files: `lib/api-client.ts` (lines 5-9)
- Impact: If the session changes (logout, token refresh in another tab), the cached client may serve stale auth tokens. The 401 retry logic mitigates this partially but adds latency to every expired-token request.
- Fix approach: Remove the singleton pattern. `createClient()` from `@supabase/ssr` is designed to be called per-request. Or invalidate the cache on auth state changes.

### Client-Side Base64 Encoding Loop

**Character-by-character Base64 conversion in crypto module:**
- Issue: `lib/crypto.ts` uses `String.fromCharCode` in a loop (`arrayBufferToBase64url`, `uint8ArrayToBase64url`) for Base64 encoding. For large files, this creates intermediate string concatenation that is slow.
- Files: `lib/crypto.ts` (lines 211-226)
- Impact: Encryption/decryption of large content is slower than necessary. The `for` loop string building is O(n^2) due to string concatenation in some JS engines.
- Fix approach: Use `Buffer.from(bytes).toString('base64')` in Node.js contexts or `btoa(String.fromCharCode(...new Uint8Array(buffer)))` for large buffers in browser contexts. Alternatively, use `TextEncoder` + chunk-based processing.

### Team-Related Components Are Oversized

**Multiple components exceed the 200-line guideline:**
- Issue: Several team-related components significantly exceed the stated 200-line max.
- Files:
  - `components/team/team-invite-form.tsx` (554 lines — 177% over limit)
  - `lib/team-rpc.ts` (544 lines — 172% over limit)
  - `components/comments-section.tsx` (464 lines — 132% over limit)
  - `components/enhanced-invite-dialog.tsx` (378 lines — 89% over limit)
  - `components/bulk-invite-dialog.tsx` (365 lines — 82% over limit)
  - `lib/token-security.ts` (378 lines — 89% over limit)
- Impact: Large components are harder to test, review, and maintain. `team-invite-form.tsx` at 554 lines combines UI, state management, validation, and API calls in one file.
- Fix approach: Extract validation logic into shared hooks (`use-invite-validation.ts`), API calls can use the existing `teamService` singleton, and UI sub-components can be broken out.

## Fragile Areas

### Team Feature Module

**Entire team subsystem has zero type safety:**
- Issue: All team-related components use `@ts-nocheck` or `any` casts. The `TeamRPC` and `TeamService` classes have `Promise<any>` return types on 4 methods (`checkGlobalRateLimit`, `getRateLimitingStats`, `cleanupRateLimitingData`, `resetLockedTokens`). The `TeamService` class duplicates validation logic that already exists in the `TokenSecurity` and `InviteValidationService` classes.
- Files: `lib/team-rpc.ts`, `lib/token-security.ts`, `components/team/team-invite-form.tsx`, `components/enhanced-invite-dialog.tsx`, `components/bulk-invite-dialog.tsx`, `components/auth/invite-accept-form.tsx`
- Why fragile: Schema changes in Supabase RPC functions will cause silent runtime failures. The three-layer validation stack (client component, `TeamService`, RPC function) is redundant and can produce inconsistent error messages.
- Safe modification: Add types first (remove `@ts-nocheck`), then consolidate validation into a single layer. Test invite creation and acceptance flows end-to-end after each change.
- Test coverage: Zero tests. No test framework configured.

### Editor Module

**CodeMirror editor has multiple complex dependencies:**
- Issue: The editor is a complex component (`app/(public)/editor/page.tsx`) with extensions in `lib/editor-extensions/`, custom auto-save logic in `lib/use-editor-auto-save.ts`, and draft storage in `lib/draft-storage.ts`. All use localStorage for persistence.
- Files: `app/(public)/editor/page.tsx`, `lib/editor-extensions/`, `lib/use-editor-auto-save.ts`, `lib/draft-storage.ts`, `components/editor-shell.tsx`, `components/editor-pane.tsx`, `components/editor-publish-bar.tsx`
- Why fragile: localStorage is synchronous and blocking. Draft auto-save has no error boundary. The editor requires `ssr: false` dynamic import which can cause hydration mismatches if not carefully managed.
- Safe modification: Test changes in incognito mode (clean localStorage). Keep `ssr: false` on all CodeMirror imports.
- Test coverage: Zero tests.

### Authentication Session Management

**Session refresh is tightly coupled to middleware:**
- Issue: The middleware runs `updateSession()` on every non-static request. The doc comment warns that no code should run between `createServerClient` and `getClaims()`. The session refresh also recreates the `NextResponse` via `NextResponse.next({ request })` inside `setAll`, which can drop previously-set headers.
- Files: `middleware.ts`, `utils/supabase/middleware.ts`
- Why fragile: Any middleware added before the session refresh breaks the documented invariant. The `setAll` callback creates a new response object on each cookie set, which means headers set before `setAll` are lost.
- Safe modification: Keep middleware minimal. Any new middleware logic should be added after `updateSession()`, not before. Do not add new cookies in middleware.
- Test coverage: Zero tests.

## Scaling Limits

### No Pagination on Dashboard Queries

**Dashboard queries fetch all records:**
- Issue: Dashboard pages query shares, teams, and memberships without pagination limits visible in the query code.
- Files: `app/(dashboard)/dashboard/page.tsx`, `app/(dashboard)/dashboard/teams/[slug]/page.tsx`
- Current capacity: Works for small datasets (tens of items per user).
- Limit: Users with hundreds of shares or team members will see slow page loads and increased memory usage on the server during SSR.
- Scaling path: Add `.range(start, end)` pagination to Supabase queries and implement infinite scroll or cursor-based pagination in the UI.

### Embed Page Loads Full File into Memory

**Embed page reads entire file for srcDoc:**
- Issue: `app/(public)/embed/[slug]/page.tsx` downloads the full file content into memory via `adminClient.storage.from("html-files").download()` and passes it as `srcDoc` to an iframe.
- Files: `app/(public)/embed/[slug]/page.tsx` (lines 79-85)
- Current capacity: Works for reasonable file sizes.
- Limit: Large HTML files (>5MB) will consume significant server memory during SSR. Concurrent embed views of large files could strain Vercel serverless function memory limits.
- Scaling path: Stream file content or use a redirect to a pre-signed storage URL instead of `srcDoc`. Set a file size limit on HTML uploads.

## Dependencies at Risk

### Next.js 16 (RC/Cutting Edge)

**Using Next.js 16.2.4:**
- Issue: Next.js 16 is very new and may have breaking changes in minor releases. The codebase already had TypeScript build errors requiring `ignoreBuildErrors: true`.
- Files: `package.json`
- Impact: Upgrading Next.js could introduce breaking changes to App Router behavior, middleware, or SSR rendering. The disabled type checking means compatibility issues will surface as runtime errors.
- Migration plan: Pin the exact Next.js version. Before any upgrade, re-enable type checking first and resolve all errors against the current version.

### No Test Framework

**Zero test infrastructure:**
- Issue: No test framework (Jest, Vitest, Playwright) is configured. No test files exist. No test scripts are in `package.json`.
- Files: `package.json` (no test script), no `jest.config.*` or `vitest.config.*`
- Impact: All changes are verified only by manual testing, linting, and building. Regressions are detected only by users in production.
- Fix approach: Add Vitest for unit tests and Playwright for E2E. Priority areas to test first: `lib/crypto.ts`, `lib/share-access-cookie.ts`, `lib/team-rpc.ts`, `lib/api-client.ts`.

## Missing Critical Features

### No Error Boundary at Layout Level

**Missing top-level error boundary:**
- Issue: No error boundary wraps the application layout. Individual components have error handling but a fatal SSR error (e.g., Supabase connection failure) will show the default Next.js error page.
- Files: `app/layout.tsx` (no `error.tsx` sibling)
- Blocks: Graceful degradation when backend services are unavailable. Users see raw error pages instead of branded error states.

### No Rate Limiting on Frontend

**No client-side or API-route rate limiting:**
- Issue: API routes (`app/api/shares/`, `app/api/og-image/`) have no rate limiting. The OG image endpoint generates images on demand with no protection against abuse.
- Files: `app/api/og-image/[slug]/route.tsx`, `app/api/shares/[slug]/access-cookie/route.ts`
- Blocks: Protection against OG image generation abuse (CPU-intensive), share access cookie brute-force attacks.

### No Loading States for Slow Server Components

**Server components without Suspense boundaries:**
- Issue: Several dashboard and public pages make multiple Supabase queries without wrapping them in Suspense boundaries. Slow queries block the entire page render.
- Files: `app/(dashboard)/dashboard/page.tsx`, `app/(dashboard)/dashboard/teams/[slug]/page.tsx`, `app/(public)/s/[slug]/page.tsx`
- Blocks: Perceived performance. Users see blank screens while Supabase queries resolve.

## Test Coverage Gaps

### Zero Test Coverage (Entire Codebase)

**No automated tests exist:**
- Issue: No test framework, no test files, no test scripts. The entire codebase relies on manual verification.
- Files: All files in the project
- Risk: Any change can introduce regressions that go undetected until production. Critical security modules (`crypto.ts`, `share-access-cookie.ts`, `token-security.ts`) are untested.
- Priority: **High** — Test `lib/crypto.ts` (encryption/decryption round-trips), `lib/share-access-cookie.ts` (HMAC signing/verification), and `lib/api-client.ts` (auth header injection, 401 retry) first.

---

*Concerns audit: 2026-08-10*
