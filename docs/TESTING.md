<!-- generated-by: gsd-doc-writer -->

# Testing

This document describes the current testing situation for the DropItX Next.js frontend honestly, then recommends a starter setup. Every claim below is grounded in a real file in this repository.

Runtime: Next.js 16.2.4 (App Router, React 19.2.4), deployed to Vercel. Supabase provides auth/data/storage; the business API is the separate FastAPI backend at `NEXT_PUBLIC_API_URL`.

## Test Framework and Setup

**No test framework is configured.** This was verified against the repository on 2026-08-09:

- `package.json` has no `test` script. The only scripts are `dev`, `build`, `start`, `lint`, and `generate-types`.
- `dependencies` and `devDependencies` contain no test frameworks — no `jest`, `vitest`, `@testing-library/*`, `playwright`, `cypress`, or `mocha`.
- No test config files exist at the repo root (`jest.config.*`, `vitest.config.*`, `playwright.config.*`, `.mocharc.*`, `cypress.config.*`).
- No test files exist: a search of `app/`, `components/`, `lib/`, `hooks/`, `utils/`, and `types/` for `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx` returned zero matches.
- No test directories exist (`__tests__/`, `e2e/`, `tests/`, `test/`).

This is stated explicitly in the project's own contributor docs: `AGENTS.md` ("No test framework is currently configured. Verify changes by running `npm run lint` and `npm run build` before pushing.") and `CLAUDE.md` ("No tests: Verify changes by linting and building locally.").

## Running Tests

There is no test command to run. Current verification is manual and limited to static checks:

```bash
npm run lint      # ESLint (next/core-web-vitals + TypeScript)
npm run build     # TypeScript strict type-check + production build
```

There is no watch mode, no coverage report, and no way to run a subset of tests — none exist. Interactive verification happens by running `npm run dev` and exercising the feature by hand.

## Writing New Tests

**No file-naming convention or test helpers exist**, because there are no tests. If you add the first test, you will be establishing the convention. See the [Recommended Starter Setup](#recommended-starter-setup) section below for a concrete proposal that fits this codebase.

## Coverage Requirements

No coverage threshold is configured. There is no `coverageThreshold` in any config file (none exists), no `.nycrc`, and no `c8` config in `package.json`.

## CI Integration

**No CI pipeline is detected.** There is no `.github/` directory in this repo, so no GitHub Actions workflows run lint, build, or tests on push or pull request. Vercel runs `npm run build` on deploy, which provides a build-time type-check gate but no automated test gate.

## Recommended Starter Setup

Because the codebase has meaningful security and business logic that is currently untested, introducing automated tests is high-value. The modules in `lib/` are mostly pure functions and the strongest first targets:

| Module | Why it matters | Test priority |
|--------|----------------|---------------|
| `lib/crypto.ts` | AES-256-GCM encryption, PBKDF2 key derivation (600k iterations), IV/salt handling — a regression here leaks plaintext | High |
| `lib/password.ts` | bcryptjs hashing for protected shares | High |
| `lib/api-key.ts` | SHA-256 key hashing — must never persist plaintext | High |
| `lib/share-access-cookie.ts` | HMAC signing of access cookies | High |
| `lib/token-security.ts` | Analytics token signing/verification | Medium |
| `lib/slugify-handle.ts`, `lib/validate-custom-slug.ts`, `lib/custom-slug` validation | URL slug rules | Medium |
| `lib/referrer-parser.ts` | Traffic attribution classification | Medium |
| `lib/validation.ts`, `lib/invite-utils.ts` | Input validation and team-invite helpers | Medium |

### Proposed stack (Next.js App Router, React 19)

**Vitest for unit/integration.** Vitest is native-ESM, requires no Babel transform, plays well with Next.js's `@/*` path alias, and has a watch mode and coverage built in. The `lib/` modules above need no DOM and can be tested as plain TypeScript.

**Playwright for end-to-end.** Playwright has a first-class Next.js integration (`next experimental setup` flow) and is the recommended e2e tool for App Router. Auth flows (Supabase OAuth/JWT), the CodeMirror editor, and the public-share view path are the e2e candidates.

**@testing-library/react for component tests (optional, later).** Only needed once individual client components (`components/`, `hooks/`) need behavior tests; most of the app is server components that are better covered by Playwright.

### Suggested first step: Vitest for the `lib/` modules

1. Install as devDependencies:
   ```bash
   npm install -D vitest @vitest/coverage-v8 jsdom
   ```
2. Add a `vitest.config.ts` at the repo root that resolves the `@/*` alias to match `tsconfig.json` (`"@/*": ["./*"]`).
3. Add scripts to `package.json`:
   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:coverage": "vitest run --coverage"
   ```
4. Co-locate tests with source using a `.test.ts` suffix, e.g. `lib/crypto.test.ts`, `lib/password.test.ts`, `lib/api-key.test.ts`.
5. Start with the High-priority modules in the table above.

### Notes for this codebase

- **`lib/crypto.ts` uses the Web Crypto API** (`crypto.subtle`). Under Node/Vitest this is available globally in Node 20+; no polyfill needed.
- **`lib/editor-extensions/` and the CodeMirror editor require browser APIs** and have SSR disabled — do not unit test these; cover them with Playwright.
- **Supabase clients** (`utils/supabase/{client,server,middleware}.ts`) require env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). Unit tests that touch these modules must stub the Supabase client or load a `.env.test`.
- **No existing tests means no `expect`-style conventions to follow.** A contributor adding the first test should add the framework config in the same PR so the convention is established once, deliberately.

Once a framework is added, update this document's [Test Framework and Setup](#test-framework-and-setup), [Running Tests](#running-tests), [Writing New Tests](#writing-new-tests), [Coverage Requirements](#coverage-requirements), and [CI Integration](#ci-integration) sections with the actual commands and conventions.
