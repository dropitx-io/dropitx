# Phase 1: Build Hygiene - Research

**Researched:** 2026-08-10
**Domain:** Next.js build configuration, TypeScript strict-mode migration, Supabase typed queries, environment-variable validation
**Confidence:** HIGH

## Summary

Phase 1 is a code/config remediation phase, not a feature phase. The production build currently has both safety rails (`typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds`) permanently disabled in `next.config.ts` [VERIFIED: next.config.ts:4-11]. Re-enabling them is a one-line config change each, but doing so surfaces a known and quantifiable body of type/lint debt that must be cleared first. That debt falls into four buckets: (1) five files using `@ts-nocheck` to suppress all type checking (~2,162 lines, ~37 `error.message` accesses that fail under strict-mode `useUnknownInCatchVariables`, plus 3 `Promise<any>` returns), (2) seven `eslint-disable @typescript-eslint/no-explicit-any` suppressions on dashboard Supabase queries caused by the complete absence of generated Supabase database types, (3) a hardcoded ephemeral Cloudflare tunnel URL as the production API fallback, and (4) six `catch (err: any)` blocks that satisfy the compiler but trip the linter.

The work is sequential and dependency-ordered, not parallelizable en masse: the five `@ts-nocheck` files cannot be fixed independently of each other because `lib/team-rpc.ts` is the shared dependency consumed by the four component files, and the dashboard query typing (HYG-04) depends on a decision about how to type Supabase responses. The recommended approach is bottom-up: fix `lib/team-rpc.ts` first (it has the most downstream consumers), then the four team components, then the dashboard query types, then the API URL fail-fast, then flip the two build-config flags last as the closing gate.

**Primary recommendation:** Remove `ignoreBuildErrors`/`ignoreDuringBuilds` from `next.config.ts` as the FINAL step, after clearing all surfaced errors. Type Supabase queries by generating a `Database` type via the already-installed Supabase CLI (2.95.4) and threading it through `createClient<Database>()`. Replace the tunnel URL fallback with a build-time `throw`. Narrow catch-block errors with a shared `getErrorMessage(e: unknown)` helper instead of `catch (err: any)`.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HYG-01 | TypeScript type checking enforced in production builds (`ignoreBuildErrors` disabled, all errors resolved) | Next.js 16 docs confirm `ignoreBuildErrors` defaults to false; removing the key re-enables checking. Debt to clear: 5 `@ts-nocheck` files + 37 strict-mode catch errors. See Architecture Patterns. |
| HYG-02 | ESLint enforced in production builds (`ignoreDuringBuilds` disabled) | Next.js 16 docs confirm `ignoreDuringBuilds` defaults to false. Debt to clear: 7 `no-explicit-any` disables + 6 `catch (err: any)` + 2 other disables. See Common Pitfalls. |
| HYG-03 | Zero `@ts-nocheck` directives (5 files: team-invite-form, enhanced-invite-dialog, invite-accept-form, bulk-invite-dialog, team-rpc) | Quantified: 37 `.message` accesses on `unknown` errors, 3 `Promise<any>` returns, untyped RPC results. Fix order: team-rpc.ts first (shared dependency). See Code Examples. |
| HYG-04 | Dashboard queries use typed Supabase responses (no `any` casts with `eslint-disable`) | Root cause: no generated `Database` type — `createClient()` called without generic. Two fix paths documented; Supabase CLI is installed. See Architecture Patterns. |
| HYG-05 | No ephemeral/hardcoded URLs in production code defaults (Cloudflare tunnel fallback removed) | Replace fallback with fail-fast throw. Vercel NEXT_PUBLIC inlining caveat documented. See Code Examples + Common Pitfalls. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| TypeScript build enforcement | Build pipeline (`next.config.ts`) | CI gate | Next.js owns the `tsc` invocation during `next build`; CI should mirror it |
| ESLint build enforcement | Build pipeline (`next.config.ts`) | CI gate / pre-commit | Same as above; ESLint runs via Next's build integration |
| Supabase query typing | Data layer (`utils/supabase/`, `types/`) | Component layer | The `Database` generic must be threaded at client-creation time in `utils/supabase/`; row types live in `types/` |
| Environment variable validation | Module init (`lib/api-client.ts`) | Build runtime | `NEXT_PUBLIC_*` vars are inlined at build time; a missing one must throw before the app serves a request |
| Error narrowing in catch blocks | Shared utility (`lib/`) | All catch sites | A single `getErrorMessage` helper keeps narrowing consistent and DRY |

## Standard Stack

This phase installs **no new packages**. It configures and corrects usage of tooling already present. The legitimacy gate is therefore satisfied trivially — there is nothing to audit.

### Core (existing, already in devDependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `typescript` | ^5 | Type checking via `next build` | Already configured; `strict: true` in tsconfig.json [VERIFIED: tsconfig.json:7] |
| `eslint` | ^9 | Linting via `next build` and `npm run lint` | Already configured with flat config [VERIFIED: eslint.config.mjs:1-18] |
| `eslint-config-next` | 16.2.4 | Next.js + TypeScript ESLint presets | Extends `next/core-web-vitals` + `next/typescript` [VERIFIED: eslint.config.mjs:2-7] |
| `@supabase/supabase-js` | ^2.104.0 | Supabase client (supports `Database` generic) | Already a dependency; needs a generated `Database` type to enable typed queries |
| Supabase CLI (system) | 2.95.4 | Generate `Database` types from live/remote schema | Already installed on this machine [VERIFIED: `supabase --version` → 2.95.4] |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `supabase gen types typescript` | Emit `types/database.generated.ts` from the project schema | Once at setup, then re-run when the backend schema changes (the schema lives in the sibling `dropitx-api` repo / workspace root) |

**Installation:** None required. All tooling is present.

**Package Legitimacy Audit:** No new packages introduced this phase. Gate not triggered.

## Architecture Patterns

### System Architecture Diagram

```
                      BUILD PIPELINE (the thing this phase fixes)
                      ========================================
 next.config.ts
   ├─ typescript.ignoreBuildErrors: true  ──REMOVE──►  (absent = default false)
   └─ eslint.ignoreDuringBuilds: true    ──REMOVE──►  (absent = default false)
                          │
                          ▼
              ┌─────── next build ───────┐
              │  1. tsc --noEmit         │◄── HYG-01: must pass (all .ts/.tsx)
              │  2. eslint (flat config) │◄── HYG-02: must pass
              │  3. webpack/turbopack    │
              └──────────────────────────┘
                          │
            ERRORS SURFACED (must clear BEFORE flipping flags)
            ┌──────────────┴───────────────┐
   ┌────────▼─────────┐          ┌──────────▼───────────┐
   │ 5 × @ts-nocheck   │          │ 7 × eslint-disable    │
   │ files (HYG-03)    │          │ no-explicit-any (04)  │
   │  37 catch.message │          │  + 6 catch(:any)      │
   │   on unknown      │          └──────────┬────────────┘
   │  3 × Promise<any> │                     │
   └────────┬──────────┘                     │
            │ FIX ORDER                      │ ROOT CAUSE
            ▼                                ▼
   lib/team-rpc.ts (shared)          No Database type →
     └─ then 4 components            createClient() untyped
                                     └─ gen types via CLI
                                        or manual row interfaces

  RUNTIME FIX (HYG-05)
  lib/api-client.ts line 3:
   NEXT_PUBLIC_API_URL missing?
     NOW: silently → dead tunnel URL
     AFTER: throw at module load (build-time for NEXT_PUBLIC_*)
```

### Recommended Project Structure (additions only)

```
types/
├── database.generated.ts   # NEW: output of `supabase gen types typescript` (do not hand-edit)
└── team.ts                 # EXISTS: add TeamMembershipRow, TeamShareRow if not using generated types
lib/
├── api-client.ts           # EDIT: remove tunnel URL, add fail-fast
├── errors.ts               # NEW (optional): getErrorMessage(e: unknown) helper
└── team-rpc.ts             # EDIT: remove @ts-nocheck, type RPC returns, narrow catches
utils/supabase/
├── server.ts               # EDIT: thread Database generic into createServerClient
├── client.ts               # EDIT: thread Database generic into createClient
└── middleware.ts           # EDIT: thread Database generic into createServerClient
```

### Pattern 1: Thread the Supabase `Database` generic (HYG-04 root fix)

**What:** Generate a `Database` interface from the live schema and pass it as the first generic argument to every Supabase client factory. This makes `.select("teams(slug, name)")` return a fully-typed nested shape, eliminating the need for `as any[]`.

**When to use:** This is the standard Supabase pattern. Use it for all clients so joins and RPC results are typed.

**Example:**
```typescript
// types/database.generated.ts  — generated, do not hand-edit
// Generate with: supabase gen types typescript --project-id <ref> > types/database.generated.ts

// utils/supabase/server.ts  — thread the generic
import type { Database } from "@/types/database.generated";

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookieOptions: { domain: ".dropitx.site" }, cookies: { /* ... */ } },
  );
};
```
```typescript
// Dashboard query — the `as any[]` and eslint-disable both disappear
const { data: memberships } = await supabase
  .from("team_members")
  .select("team_id, teams(slug, name)")
  .eq("user_id", user.id);
// memberships is now typed: { team_id: string; teams: { slug: string; name: string } | null }[] | null
```
Source: postgrest-js typed-query docs [CITED: github.com/supabase/postgrest-js — GenericTable/Relationship types drive select() inference; overrideTypes available as per-query escape hatch]

### Pattern 2: Fail-fast environment variable validation (HYG-05)

**What:** A missing required public env var should crash the build (for `NEXT_PUBLIC_*`) or the first request, never silently fall back to a stale URL.

**Example:**
```typescript
// lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set. Set it in your environment (Vercel Project Settings → Environment Variables) and redeploy."
  );
}
```
Source: Next.js docs — `NEXT_PUBLIC_*` vars are inlined at build time [CITED: next.js docs 01-app/03-api-reference/05-config/01-next-config-js/typescript.mdx]. See Common Pitfalls for the Vercel inlining caveat.

### Pattern 3: Narrow catch-block errors without `any` (HYG-03 enabler)

**What:** Under `strict: true` (which implies `useUnknownInCatchVariables`), `catch (error)` types `error` as `unknown`. The existing code accesses `.message` on it 37 times across the five `@ts-nocheck` files — every one becomes a compile error once `@ts-nocheck` is removed.

**Example — shared helper (recommended):**
```typescript
// lib/errors.ts
export function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
```
```typescript
// Usage in team-rpc.ts (replaces `error.message.includes(...)`)
import { getErrorMessage } from "@/lib/errors";
// ...
} catch (error) {
  const msg = getErrorMessage(error);
  if (msg.includes("Rate limit exceeded")) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }
  throw error;
}
```
Source: TypeScript docs [CITED: github.com/microsoft/typescript — useUnknownInCatchVariables01; catch variables are `unknown` under strict mode; `instanceof Error` is the documented narrowing pattern; `catch (e: any)` is the documented escape hatch but trips `@typescript-eslint/no-explicit-any`]

### Pattern 4: Remove `@ts-nocheck` incrementally (HYG-03)

**What:** Remove the directive and fix errors file-by-file, bottom-up by dependency order. Do not remove all five at once.

**Order (mandatory):**
1. `lib/team-rpc.ts` — shared by all four components. Fix: narrow 10 catch blocks, replace 3 `Promise<any>` with typed interfaces, type RPC return casts.
2. `components/auth/invite-accept-form.tsx` — depends on team-rpc.
3. `components/team/team-invite-form.tsx` — depends on team-rpc + token-security.
4. `components/enhanced-invite-dialog.tsx` — depends on team-rpc.
5. `components/bulk-invite-dialog.tsx` — depends on team-rpc.

**Anti-pattern:** Removing `@ts-nocheck` from all five files in a single commit. The error count is too high (~37 strict-mode errors plus structural issues) and the files share types — fixing them in isolation produces merge conflicts and duplicated interface definitions.

### Anti-Patterns to Avoid

- **Re-enabling the flags before clearing the debt:** `npm run build` will fail immediately with hundreds of errors. The flags are the LAST commit, not the first.
- **Using `catch (err: any)` to silence `useUnknownInCatchVariables`:** It avoids the TS error but introduces an ESLint `no-explicit-any` error (HYYG-02). Use `catch (err)` + `getErrorMessage(err)` instead.
- **Suppressing the dashboard `any[]` casts with more `eslint-disable` comments:** That moves the lint error but does not satisfy HYG-04, which requires typed responses, not disabled rules.
- **Adding `// eslint-disable-next-line` to mask the tunnel-URL fix:** HYG-05 requires the URL removed, not suppressed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Supabase row types | Hand-write interfaces for every table + join | `supabase gen types typescript` → `Database` generic | Hand-written types drift from schema the moment a column is added; the CLI regenerates from source-of-truth |
| Catch-variable error extraction | Per-site `if (typeof e === "string")` chains or `(e as Error).message` casts | One `getErrorMessage(e: unknown)` helper in `lib/errors.ts` | DRY; consistent message shape; one place to upgrade (e.g., add Sentry breadcrumbs later in Phase 5) |
| Env-var validation framework | A schema/validator library (zod, envalid) for a single var | A direct `if (!VAR) throw` at module top | YAGNI — one variable does not justify a dependency; KISS per CLAUDE.md |
| TypeScript strict-mode bypass | `tsconfig.json` `"useUnknownInCatchVariables": false` | Fix the catch blocks | Disabling the flag globally weakens the whole codebase to avoid fixing ~43 sites |

**Key insight:** Every "don't hand-roll" here is also a YAGNI/KISS call. The phase fixes debt; it must not introduce new abstractions or dependencies beyond the one generated file (`types/database.generated.ts`) and the one tiny helper (`lib/errors.ts`).

## Common Pitfalls

### Pitfall 1: `useUnknownInCatchVariables` breaks 37+ catch sites at once
**What goes wrong:** Removing `@ts-nocheck` from `lib/team-rpc.ts` surfaces 10 `error.message.includes(...)` calls. Each is a TS18046 error ("'error' is of type 'unknown'"). The four component files add ~27 more.
**Why it happens:** `strict: true` in tsconfig.json implies `useUnknownInCatchVariables` [VERIFIED: tsconfig.json:7]. The `@ts-nocheck` directive was hiding this.
**How to avoid:** Add the `getErrorMessage(e: unknown)` helper first. Fix `lib/team-rpc.ts` (the shared dependency) in isolation, confirm `npx tsc --noEmit` on that file passes, then proceed to the components.
**Warning signs:** A single `tsc` run returning 100+ errors after removing one `@ts-nocheck`.

### Pitfall 2: Vercel does not inline a missing `NEXT_PUBLIC_API_URL`
**What goes wrong:** Replacing the tunnel fallback with `throw` causes the Vercel build itself to crash — because the env var is absent or misnamed in the Vercel project settings.
**Why it happens:** `NEXT_PUBLIC_*` variables are statically inlined at build time. The git log entry "hardcode tunnel API URL as fallback (Vercel env not inlining)" [VERIFIED: git log commit 7e0309f] shows this project already hit this failure mode. If the var is missing from Vercel's build environment, the throw fires during the build, which is the *correct* behavior (fail loud) — but it means the deploy will fail until the var is added in Vercel.
**How to avoid:** Before merging HYG-05, confirm `NEXT_PUBLIC_API_URL` is set in Vercel Project Settings → Environment Variables → Production. This is a deployment-environment task, not just a code task.
**Warning signs:** Vercel deploy fails with the custom error message after the code change.

### Pitfall 3: Removing `@ts-nocheck` reveals untyped Supabase RPC return shapes
**What goes wrong:** `supabase.rpc('create_team', {...})` returns `data` typed as `unknown` (without generated types) or a generated row shape that may not match the hand-written `InviteResult`/`AcceptInviteResult` interfaces in `team-rpc.ts`. The existing `data as InviteResult` casts may fail if the generated shape differs.
**Why it happens:** RPC functions (SECURITY DEFINER stored procedures) return arbitrary shapes that the type generator infers from PostgREST, which may not match the assumed interface.
**How to avoid:** After generating `Database` types, check whether the RPC return shapes match the existing `InviteResult`/`RateLimitInfo` interfaces. If they diverge, keep the hand-written interfaces and use them as the explicit return type, casting via `as` at the RPC boundary (which is the one legitimate cast site for RPC results).

### Pitfall 4: The dashboard `teams(slug, name)` join shape needs `Array.isArray` unwrapping
**What goes wrong:** Supabase returns FK-joined rows as either an object or an array depending on cardinality. The existing dashboard code handles this with `Array.isArray(m.teams) ? m.teams[0] : m.teams` [VERIFIED: app/(dashboard)/dashboard/layout.tsx:43]. If generated types declare the join as always-array or always-object, the unwrapping logic may produce a type error.
**Why it happens:** PostgREST/Postgrest-js typing of `select("teams(slug, name)")` infers `teams` as `null | {slug,name}` (one-to-one via FK) but the runtime can return an array if the relationship is ambiguous.
**How to avoid:** After threading the `Database` generic, if the join shape is typed as non-array, simplify the unwrap to `m.teams` directly. If typed as array, keep `m.teams[0]`. Do not fight the generated type — adjust the unwrap code to match.

### Pitfall 5: `@ts-nocheck` does NOT suppress ESLint
**What goes wrong:** A developer assumes removing `@ts-nocheck` is the only prerequisite for HYG-03. But ESLint has been linting those files all along (it just wasn't failing the build because `ignoreDuringBuilds: true`). The files contain `catch (err: any)` blocks that will fail `@typescript-eslint/no-explicit-any` the moment HYG-02 is enforced.
**Why it happens:** `@ts-nocheck` is a TypeScript compiler directive, not an ESLint directive. ESLint respects `// eslint-disable-*` comments, not `@ts-*` comments.
**How to avoid:** When fixing each `@ts-nocheck` file, also convert `catch (err: any)` to `catch (err)` + narrowing in the same pass.

## Code Examples

### HYG-01 + HYG-02: The final `next.config.ts`

```typescript
// Source: Next.js 16 docs — both flags default to false; omitting them re-enforces checking.
// https://github.com/vercel/next.js/blob/v16.2.2/docs/01-app/03-api-reference/05-config/02-typescript.mdx
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typescript.ignoreBuildErrors and eslint.ignoreDuringBuilds are intentionally ABSENT.
  // Next.js defaults to failing the build on any TS error or ESLint violation.
  // Do NOT re-add these flags. If the build fails, fix the error — do not suppress it.
};

export default nextConfig;
```
This is the last change in the phase. Commit it only after `npm run build` passes clean.

### HYG-05: `lib/api-client.ts` fail-fast

```typescript
// lib/api-client.ts
import { createClient } from "@/utils/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is required. Set it in Vercel Project Settings → Environment Variables and redeploy."
  );
}

export function getApiUrl(path: string): string {
  return `${API_URL.trim()}${path}`;
}
// ... rest of authFetch / getAuthHeaders unchanged
```

### HYG-03: Fixing a `team-rpc.ts` catch block

Before (currently under `@ts-nocheck`, lines 362-370):
```typescript
} catch (error) {
  if (error.message.includes('Maximum number of teams')) {
    throw new Error('You have reached the maximum number of teams (10)');
  }
  throw error;
}
```
After:
```typescript
import { getErrorMessage } from "@/lib/errors";
// ...
} catch (error) {
  const msg = getErrorMessage(error);
  if (msg.includes('Maximum number of teams')) {
    throw new Error('You have reached the maximum number of teams (10)');
  }
  throw error;
}
```

### HYG-03: Typing the three `Promise<any>` RPC methods

```typescript
// Before (lib/team-rpc.ts:287, 306, 321)
async checkGlobalRateLimit(): Promise<any> { ... }

// After — define an interface for the RPC return shape
interface GlobalRateLimitResult {
  is_limited: boolean;
  teams_this_hour: number;
  invites_this_hour: number;
  total_invites_today: number;
}
async checkGlobalRateLimit(): Promise<GlobalRateLimitResult> {
  const supabase = await this.getRPCClient();
  const { data, error } = await supabase.rpc('check_global_invite_rate_limit', { /* ... */ });
  if (error) throw new Error(`Failed to check global rate limit: ${error.message}`);
  return data as GlobalRateLimitResult;
}
```
Note: The exact field names of `GlobalRateLimitResult` are `[ASSUMED]` — they must be verified against the actual RPC return shape in the sibling `dropitx-api` repo or by inspecting the generated types. See Open Questions.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `ignoreBuildErrors: true` as a "temporary" patch | Omit the flag entirely; enforce in build + CI | Next.js docs have always recommended this | Build fails fast on type errors |
| Hand-written Supabase row interfaces | `supabase gen types typescript` → `Database` generic | supabase-js v2 standard since 2022 | Joins and RPC results fully typed |
| `catch (error) { error.message }` | `catch (error) { getErrorMessage(error) }` | TS 4.4 `useUnknownInCatchVariables` (implied by `strict` since TS 4.4) | No more `unknown`-type errors in catch blocks |
| `catch (err: any)` | `catch (err)` + `instanceof Error` narrowing | Same TS 4.4 change + `@typescript-eslint/recommended` | Satisfies both TS strict and ESLint no-explicit-any |

**Deprecated/outdated for this codebase:**
- `@ts-nocheck` as a type-debt management tool: There is no scenario where it is the right answer for checked-in production code. It existed here only because the build was already broken.
- Cloudflare tunnel (`trycloudflare.com`) URLs in source defaults: Ephemeral by design; they expire. They are acceptable only for local dev, never as a production fallback.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The RPC return shapes for `check_global_invite_rate_limit`, `get_rate_limiting_stats`, `cleanup_rate_limiting_data` match `GlobalRateLimitResult` / similar interfaces | Code Examples (HYG-03) | The `as GlobalRateLimitResult` cast hides shape mismatch → runtime fields undefined. Must verify against the RPC definitions in `dropitx-api` or generated types before finalizing. |
| A2 | The Supabase project ref / connection needed for `supabase gen types typescript` is accessible from this machine | Architecture Patterns (Pattern 1) | If not accessible, fall back to manual row interfaces (Path B) for HYG-04. The CLI is installed but DB access/auth is unverified. |
| A3 | `NEXT_PUBLIC_API_URL` is already set in Vercel Production environment | Common Pitfalls #2 | The Vercel deploy will fail on the first build after HYG-05 if it is not set. This is a deployment-environment prerequisite, not a code task. |
| A4 | The remaining `eslint-disable` comments (`react-hooks/exhaustive-deps` in editor-pane.tsx:67, `@next/next/no-img-element` in team-member-row.tsx:94) are the only non-`any` lint suppressions | Phase Requirements (HYG-02) | If there are more, they surface when `ignoreDuringBuilds` is removed. Low risk — grep was thorough. |

## Open Questions

1. **RPC return shapes for the 3 `Promise<any>` methods**
   - What we know: They call `check_global_invite_rate_limit`, `get_rate_limiting_stats`, `cleanup_rate_limiting_data`. The field names are not documented in this repo.
   - What's unclear: Exact return shape (field names/types).
   - Recommendation: The planner should add a task to inspect the RPC function definitions in the sibling `dropitx-api` repo (or query the DB once types are generated) and define the interfaces accordingly. Tag as `[ASSUMED]` until verified.

2. **Is the Supabase project accessible for type generation?**
   - What we know: Supabase CLI 2.95.4 is installed. `NEXT_PUBLIC_SUPABASE_URL` is used in code. `.env.local` is present but permission-denied to this researcher.
   - What's unclear: Whether `supabase gen types` can authenticate against the remote project from this machine.
   - Recommendation: Plan a Wave 0 task to run the generation command and verify output. If it fails, fall back to manual row interfaces for the 4 dashboard files (sufficient to satisfy HYG-04 without full coverage).

3. **Scope of "silent catch blocks" for this phase**
   - What we know: There are ~49 `catch {}` blocks across the codebase, all with comments inside (pass ESLint `no-empty`). Only 6 use `catch (err: any)` (trip `no-explicit-any`). The deeper "surface errors to users on critical paths" requirement is SEC-05, which is Phase 3.
   - Recommendation: Phase 1 fixes the 6 `catch (err: any)` blocks (lint compliance) and the 37 unknown-type catch errors (TS compliance). The UX-facing error-surfacing work (toasts on invite/password/comment failure) is explicitly Phase 3 (SEC-05) and should NOT be expanded into Phase 1.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build, lint, type-check | ✓ | 26.0.0 | — |
| npm | dependency management | ✓ | 11.12.1 | — |
| Supabase CLI | HYG-04 (type generation) | ✓ | 2.95.4 | Manual row interfaces if DB access fails |
| `NEXT_PUBLIC_API_URL` (Vercel env) | HYG-05 (runtime API calls) | [ASSUMED] | — | None — must be set before merge; deploy fails otherwise |
| Remote Supabase project | HYG-04 type generation | [ASSUMED] | — | Manual row interfaces (Path B) |

**Missing dependencies with no fallback:**
- None that block the code work. The only hard blocker is A3 (`NEXT_PUBLIC_API_URL` in Vercel) which is a deployment-environment task, not a local-environment dependency.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None configured (Phase 2 scope). Phase 1 validation is via build + lint gates. |
| Config file | none — `tsconfig.json` (strict) and `eslint.config.mjs` are the de facto contracts |
| Quick run command | `npm run lint` |
| Full suite command | `npm run build` |

### Phase Requirements → Validation Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HYG-01 | `next build` fails on any TS error | build-gate | `npm run build` (exit 0) | ✅ next.config.ts (after edit) |
| HYG-02 | `next build` fails on any ESLint violation | build-gate | `npm run build` (exit 0) | ✅ next.config.ts (after edit) |
| HYG-02 | `npm run lint` passes standalone | lint-gate | `npm run lint` (exit 0) | ✅ eslint.config.mjs |
| HYG-03 | No `@ts-nocheck` in repo | grep-gate | `! grep -rl "@ts-nocheck" app components lib hooks types utils` | ❌ Wave 0 (add to CI / package.json script) |
| HYG-04 | No `eslint-disable.*no-explicit-any` in dashboard | grep-gate | `! grep -rn "eslint-disable.*no-explicit-any" app/(dashboard)` | ❌ Wave 0 |
| HYG-05 | No `trycloudflare.com` in source | grep-gate | `! grep -rl "trycloudflare.com" lib` | ❌ Wave 0 |
| HYG-05 | Missing `NEXT_PUBLIC_API_URL` throws | manual / Phase 2 | (unit test in Phase 2: TEST-03 covers api-client.ts) | ❌ Phase 2 |

### Sampling Rate
- **Per task commit:** `npm run lint` (fast — catches lint regressions immediately)
- **Per wave merge:** `npm run build` (full type-check + lint + bundle — the authoritative gate)
- **Phase gate:** `npm run build` green AND all three grep-gates clean before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] Add a `typecheck` script to `package.json`: `"typecheck": "tsc --noEmit"` — enables fast TS-only feedback without a full build
- [ ] Add a `check:hygiene` script combining the three grep-gates (no @ts-nocheck, no tunnel URL, no dashboard any-disables) — so the gate is runnable locally and in CI, not just asserted here
- [ ] No test framework install in this phase — Vitest/Playwright are Phase 2 (TEST-01/02)

## Sources

### Primary (HIGH confidence)
- Next.js 16.2.2 docs (`/vercel/next.js/v16.2.2`) — `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` behavior, default-false semantics. [CITED: github.com/vercel/next.js/blob/v16.2.2/docs/01-app/03-config/01-next-config-js/typescript.mdx]
- postgrest-js docs (`/supabase/postgrest-js`) — `Database` generic typing, `.overrideTypes<>()`, `GenericTable`/`GenericRelationship` inference for nested joins. [CITED: github.com/supabase/postgrest-js]
- TypeScript repo (`/microsoft/typescript`) — `useUnknownInCatchVariables01` baseline, `catchClauseWithTypeAnnotation` errors (TS1196, TS18046). [CITED: github.com/microsoft/typescript]

### Secondary (verified in-repo)
- `next.config.ts:4-11` — both safety flags currently `true` [VERIFIED]
- `tsconfig.json:7` — `strict: true` (implies `useUnknownInCatchVariables`) [VERIFIED]
- `lib/api-client.ts:3` — hardcoded tunnel URL fallback [VERIFIED]
- `lib/team-rpc.ts:1` — `@ts-nocheck`; lines 287/306/321 — `Promise<any>`; 10 catch blocks with `error.message` access [VERIFIED]
- Dashboard files — 7 `eslint-disable @typescript-eslint/no-explicit-any` suppressions across `dashboard/page.tsx`, `dashboard/layout.tsx`, `teams/page.tsx`, `teams/[slug]/page.tsx` [VERIFIED]

### Tertiary (codebase map)
- `.planning/codebase/CONCERNS.md` — debt inventory (5 @ts-nocheck files, tunnel URL, empty catches, dashboard any-casts)
- `.planning/codebase/STACK.md` — dependency versions and env-var list

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all tooling verified installed and version-checked
- Architecture (build-config changes): HIGH — Next.js 16 docs directly confirm the flag semantics; code read in-repo
- Supabase typing approach: HIGH for the pattern (official docs); MEDIUM for project-specific applicability (DB access for generation is ASSUMED, not confirmed)
- Pitfalls: HIGH — quantified via grep against the actual source files this session
- RPC return shapes: LOW (ASSUMED) — field names not yet verified against the sibling API repo

**Research date:** 2026-08-10
**Valid until:** 2026-09-09 (stable domain; Next.js 16 config semantics unlikely to change in 30 days)
