# Testing Patterns

**Analysis Date:** 2026-08-10

## Test Framework

**Runner:**
- None configured. No test runner is installed or configured in this project.

**Config:**
- No `jest.config.*`, `vitest.config.*`, `playwright.config.*`, or `cypress.config.*` files exist.
- No test-related dependencies in `package.json` (no `jest`, `vitest`, `@testing-library/*`, `playwright`, `cypress`).
- The only test-related entry in `.gitignore` is `/coverage` (suggesting a test framework was considered at some point).

**Run Commands:**
```bash
# No test commands exist. Verification is manual:
npm run lint          # ESLint (eslint-config-next/core-web-vitals + TypeScript)
npm run build         # TypeScript type checking (strict) + Next.js production build
npm run dev           # Interactive dev server at localhost:3000
```

## Test File Organization

**Location:**
- Not applicable. No test files exist in the project (outside of `node_modules`).
- The `__tests__/` or `*.test.*` / `*.spec.*` convention is not established.

**Naming:**
- Not applicable.

**Structure:**
```
(none -- no test directories exist)
```

## Test Structure

**Suite Organization:**
- Not applicable.

**Patterns:**
- Not applicable.

## Mocking

**Framework:** None.

**Patterns:**
- No test mocking infrastructure exists.
- Some runtime patterns that would require mocking if tests were added:
  - Supabase client factories in `utils/supabase/client.ts` and `utils/supabase/server.ts`
  - `authFetch()` in `lib/api-client.ts` wrapping the global `fetch` with auth headers
  - `window.crypto` usage in `lib/crypto.ts` (Web Crypto API)
  - `localStorage` usage in `lib/draft-storage.ts` and `hooks/use-team.ts`

**What to Mock (when tests are added):**
- Supabase client: mock `createClient` / `createAdminClient` factories
- Browser APIs: `crypto.getRandomValues`, `localStorage`, `navigator.clipboard`
- Network: `authFetch` / global `fetch` for API call tests
- Environment: `process.env.NEXT_PUBLIC_*` variables

**What NOT to Mock:**
- Pure utility functions: `lib/validation.ts`, `lib/password.ts`, `lib/nanoid.ts`, `lib/utils.ts`
- Pure data transformation: `lib/referrer-parser.ts`, `lib/file-utils.ts`

## Fixtures and Factories

**Test Data:**
- Not applicable. No test fixtures exist.

**Location:**
- Not applicable.

## Coverage

**Requirements:** None enforced.

**View Coverage:**
- Not applicable. No coverage tool configured.

## Test Types

**Unit Tests:**
- Not configured. Good candidates for unit testing if a framework is added:
  - `lib/validation.ts` (email validation, normalization)
  - `lib/password.ts` (hash/verify)
  - `lib/nanoid.ts` (slug/token generation)
  - `lib/referrer-parser.ts` (referrer classification)
  - `lib/file-utils.ts` (file type detection, size formatting)
  - `lib/share-access-cookie.ts` (HMAC signing/verification -- crypto operations)
  - `lib/crypto.ts` (encrypt/decrypt round-trip)
  - `lib/api-utils.ts` (IP extraction, URL building)

**Integration Tests:**
- Not configured. Candidates:
  - Supabase server client session handling (middleware refresh flow)
  - `authFetch()` retry-on-401 behavior
  - Draft storage persistence and cross-tab sync

**E2E Tests:**
- Not used. No Playwright or Cypress configuration.

## Manual Verification Approach

Since no test framework exists, verification is done through:

1. **`npm run lint`** -- ESLint with `next/core-web-vitals` + TypeScript rules. Note: both type checking and lint are skipped during production builds (`next.config.ts` has `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`).

2. **`npm run build`** -- Next.js production build. Performs TypeScript compilation (when not skipped) and catches import errors, missing modules, and type mismatches.

3. **`npm run dev`** -- Manual interactive testing at `http://localhost:3000`. Server-side errors appear in the terminal console; client-side errors appear in the browser console.

4. **Vercel deployment** -- Acts as an additional verification gate (deployment succeeds only if the build passes).

## Testing-Adjacent Tooling

**ESLint:** Configured with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. Catches React best practice violations, accessibility issues (via core-web-vitals rules), and TypeScript errors. Config at `eslint.config.mjs`.

**TypeScript strict mode:** Enabled in `tsconfig.json`. Catches null/undefined access, missing return types, and type narrowing issues at compile time. However, `any` types are used in some files (e.g., `lib/token-security.ts`, `app/(dashboard)/dashboard/page.tsx`), and the build bypasses type checking entirely via `next.config.ts`.

**Type generation script:** `npm run generate-types` runs `scripts/generate-api-types.sh` -- likely generates TypeScript types from an OpenAPI spec or backend schema. This is a build-time type safety mechanism, not a test.

## Recommendations for Adding Tests

**If adding a test framework to this project:**

1. **Framework choice:** Vitest is the strongest fit -- zero-config for Vite/Next.js projects, fast, and compatible with TypeScript out of the box. Jest would also work but requires more configuration for ESM and Next.js path aliases.

2. **Start with unit tests** for the pure utility modules in `lib/` -- they have no framework dependencies and are the easiest to test:
   - `lib/validation.ts`
   - `lib/password.ts`
   - `lib/referrer-parser.ts`
   - `lib/crypto.ts` (Web Crypto can be mocked or tested in Node with `node:crypto`)
   - `lib/share-access-cookie.ts` (Node `crypto` module -- testable as-is)

3. **Use `@testing-library/react`** for component tests. Next.js server components will need special handling (e.g., `renderAsync` from `@testing-library/react` or switching to a client-side test boundary).

4. **Mock boundary:** Mock at the Supabase client factory level (`utils/supabase/server.ts`, `utils/supabase/client.ts`) rather than individual Supabase method calls. This aligns with the existing factory pattern.

5. **Test file location:** Co-locate tests with source files using `*.test.ts` / `*.test.tsx` naming (e.g., `lib/validation.test.ts`, `components/copy-button.test.tsx`). This is the most common Next.js convention and works well with Vitest.

6. **Enable type checking in builds** before adding tests. The current `ignoreBuildErrors: true` in `next.config.ts` undermines type safety. Fix existing type errors first, then remove the bypass.

---

*Testing analysis: 2026-08-10*
