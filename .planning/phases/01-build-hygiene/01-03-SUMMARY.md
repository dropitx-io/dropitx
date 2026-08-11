---
phase: 01-build-hygiene
plan: 03
subsystem: infra
tags: [supabase, database-types, fail-fast, env-vars, type-safety]

requires: [01-01]
provides:
  - "types/database.generated.ts — Database interface generated from live Supabase project (833 lines, 14 tables, 18 functions)"
  - "All 3 Supabase client factories (server/client/middleware) typed via <Database> generic — query and RPC responses are now compile-time checked"
  - "createAdminClient (service-role) typed via <Database> generic"
  - "npm run generate-db-types script — regenerates types from the live project"
  - "lib/api-client.ts fails fast at module load when NEXT_PUBLIC_API_URL is unset — no more dead trycloudflare tunnel fallback"
affects: [01-04]

actuals:
  tokens: 6300
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "createServerClient<Database> / createBrowserClient<Database> / createServiceRoleClient<Database> — generic threaded through every Supabase factory so query results carry their row types"
    - "Build-time fail-fast throw for NEXT_PUBLIC_API_URL — Next.js inlines NEXT_PUBLIC_* at build time, so a missing var crashes the build instead of silently routing to a dead endpoint"
    - "Two-step env var narrowing (const envApiUrl = process.env.X; if (!envApiUrl) throw; const API_URL = envApiUrl) to defeat TS's refusal to carry module-scope type-guard narrowing into function bodies"

key-files:
  created:
    - "types/database.generated.ts"
  modified:
    - "utils/supabase/server.ts"
    - "utils/supabase/client.ts"
    - "utils/supabase/middleware.ts"
    - "lib/api-client.ts"
    - "package.json"

key-decisions:
  - "Generated types via `supabase gen types typescript --project-id mywrpluomfpzguvkrvki` from the LIVE project rather than hand-authoring from schema.sql — the CLI was available and the live DB is the source of truth (research Assumption A2 'CLI may fail' did not materialize)"
  - "Threaded the generic into createAdminClient too (createServiceRoleClient<Database>) even though the plan only named the anon client — the service-role client benefits identically and is used for server-side writes"
  - "Did NOT fix the cascade type errors in lib/team-rpc.ts (13) and lib/token-security.ts (17) — they are the same class of consumer-side mismatch the plan defers to Plan 04, and the correct fix requires a cross-repo product decision (see Deferred Findings)"
  - "Used a two-step narrowing (envApiUrl → guard → API_URL) instead of a non-null assertion — keeps the code assertion-free and lets the runtime throw carry the safety guarantee"

patterns-established:
  - "Generated Database types are the single source of truth for row/RPC shapes — consumers that previously used assumed interfaces + `as` casts (Plan 01) must now reconcile against the generated types or widen to `as unknown as` as an interim"
  - "Build-time fail-fast is the pattern for required NEXT_PUBLIC_* env vars: read, guard with throw, then assign to the narrowed const — a missing var crashes `next build` at the SSR pass rather than producing a silently-broken deploy"

requirements-completed: []

coverage:
  - id: D1
    description: "types/database.generated.ts exists and exports a Database interface"
    requirement: HYG-04
    verification:
      - kind: other
        ref: "test -f types/database.generated.ts (PASS); grep '^export type Database' (PASS, 833 lines)"
        status: pass
    human_judgment: false
  - id: D2
    description: "All 3 Supabase client factories pass Database as the generic parameter"
    requirement: HYG-04
    verification:
      - kind: other
        ref: "grep createServerClient<Database> server.ts (1), createBrowserClient<Database> client.ts (1), createServerClient<Database> middleware.ts (1)"
        status: pass
    human_judgment: false
  - id: D3
    description: "npx tsc --noEmit reports zero errors in utils/supabase/*.ts"
    requirement: HYG-04
    verification:
      - kind: other
        ref: "npx tsc --noEmit | grep utils/supabase (0 errors)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Zero trycloudflare references in lib/api-client.ts; throw on missing NEXT_PUBLIC_API_URL"
    requirement: HYG-05
    verification:
      - kind: other
        ref: "grep -c trycloudflare lib/api-client.ts (0); grep -c 'throw new Error.*NEXT_PUBLIC_API_URL' (1); npx eslint lib/api-client.ts (exit 0); npx tsc --noEmit | grep api-client (0 errors)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Deployment prerequisite: NEXT_PUBLIC_API_URL confirmed set in Vercel Production before merge"
    requirement: HYG-05
    verification:
      - kind: manual
        ref: "Manual check in Vercel Project Settings → Environment Variables → Production. Required before merging the fail-fast change or the production build will crash at SSR."
        status: pending
    human_judgment: true

duration: 9 min
completed: 2026-08-11
status: complete
---

# Phase 01 Plan 03: Supabase Database Types + API URL Fail-Fast Summary

**Generated Database types threaded through all 3 Supabase client factories (HYG-04); hardcoded Cloudflare tunnel fallback replaced with a build-time fail-fast throw (HYG-05)**

## Performance

- **Duration:** 9 min
- **Started:** 2026-08-11T01:30Z
- **Completed:** 2026-08-11T01:39Z
- **Tasks:** 2
- **Files modified:** 6 (1 created, 5 modified)
- **Realized diff:** 846 insertions / 5 deletions (25,134 chars → ~6,300 tokens vs 35,000 estimate)

## Accomplishments
- Generated `types/database.generated.ts` (833 lines) from the live Supabase project via `supabase gen types typescript` — covers 14 tables (api_keys, favorites, rate_limits, share_comments, share_groups, share_versions, share_views, shares, team_events, team_invites, team_members, team_shares, teams, user_profiles) and 18 RPC functions
- Threaded `<Database>` into `createServerClient` (server.ts + middleware.ts), `createBrowserClient` (client.ts), AND `createAdminClient` via `createServiceRoleClient<Database>` — every factory now returns typed query/RPC results
- Added the `generate-db-types` npm script for one-command regeneration
- Removed the dead `https://overcome-sterling-senator-clinics.trycloudflare.com` fallback from `lib/api-client.ts`; replaced with a module-load throw so a missing `NEXT_PUBLIC_API_URL` crashes `next build` at the SSR pass instead of silently routing to a dead endpoint
- All modified files pass `tsc --noEmit` and `eslint` clean

## Task Commits

1. **Task 1: Generate Database types + thread generic through 3 client factories** - `d789699` (feat)
2. **Task 2: Replace Cloudflare tunnel fallback with fail-fast throw** - `b2a86a2` (fix)

## Files Created/Modified
- `types/database.generated.ts` (NEW) — 833-line Database interface generated from live project; header documents regeneration command
- `utils/supabase/server.ts` — `import type { Database }`; `createServerClient<Database>` + `createServiceRoleClient<Database>`
- `utils/supabase/client.ts` — `import type { Database }`; `createBrowserClient<Database>`
- `utils/supabase/middleware.ts` — `import type { Database }`; `createServerClient<Database>` (session-refresh invariant preserved — no code between client creation and `getClaims`)
- `lib/api-client.ts` — tunnel fallback removed; `envApiUrl` guard + throw + narrowed `API_URL` const
- `package.json` — added `generate-db-types` script

## Decisions Made
- **Generated from live DB, not hand-authored.** The plan's fallback (manual row interfaces from schema.sql) was not needed — the Supabase CLI was installed (v2.95.4) and the live project was reachable. The live DB is the correct source of truth anyway: `schema.sql` in the repo only documents the `shares` table and would have produced an incomplete Database interface. Generating live captured all 14 tables and 18 RPC functions.
- **Threaded the generic into `createAdminClient` too.** The plan body only named the anon client factories, but `createAdminClient` uses `createServiceRoleClient` from `@supabase/supabase-js` which accepts the same generic. Threading it gives the service-role client (used for server-side inserts/writes) identical type safety at zero cost.
- **Two-step env narrowing over a non-null assertion.** TypeScript does not carry module-scope type-guard narrowing into function bodies that close over the variable (functions may be called from a different control-flow point). The first attempt (`const API_URL = process.env.NEXT_PUBLIC_API_URL; if (!API_URL) throw`) compiled the guard but left `API_URL.trim()` in `getApiUrl` as `TS18048: possibly undefined`. Splitting into `envApiUrl` (guard target) → `API_URL` (narrowed assignment) gives `API_URL` the declared shape `string` everywhere downstream without an `!` assertion.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TypeScript TS18048 on `API_URL` inside `getApiUrl`**
- **Found during:** Task 2 verification
- **Issue:** The plan's literal replacement (`const API_URL = process.env.NEXT_PUBLIC_API_URL; if (!API_URL) throw`) compiles the guard, but TS refuses to carry the module-scope narrowing into the `getApiUrl` function body, so `API_URL.trim()` errored as `possibly undefined`.
- **Fix:** Split into `const envApiUrl = process.env.NEXT_PUBLIC_API_URL; if (!envApiUrl) throw; const API_URL = envApiUrl;` — the narrowed `envApiUrl` assigns a `string` to `API_URL`, and all downstream references see `string`.
- **Files modified:** lib/api-client.ts
- **Verification:** `npx tsc --noEmit` reports 0 errors in api-client.ts; `npx eslint` exit 0.
- **Committed in:** b2a86a2 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (blocking TS error). No scope creep — the fix is a type-level restructure that preserves the exact runtime semantics the plan specified.

## Deferred Findings (Out of Scope — Logged to deferred-items.md)

### RPC drift between frontend and live Supabase DB

Threading the `Database` generic surfaced a significant pre-existing drift that was invisible while the client was untyped. The frontend calls **15 RPC function names** that do not exist in the generated types for the live project `mywrpluomfpzguvkrvki`:

- **Missing entirely (no DB equivalent):** `create_team`, `transfer_team_ownership`, `add_team_member`, `bulk_invite_transaction`, `check_global_invite_rate_limit`, `get_rate_limiting_stats`, `validate_and_lock_invite_token`, `get_token_security_stats`, `cleanup_expired_tokens`, `reset_locked_tokens`
- **Renamed in DB:** `update_member_role` → `change_member_role`, `create_team_invite_with_rate_check` → `create_team_invite`, `check_invite_rate_limit` → `check_rate_limit`
- **Column drift:** `token-security.ts` reads `locked_at`, `locked_reason`, `expires_at`, `accepted_at` off `team_invites`, but the generated type reports `SelectQueryError<"column 'locked_at' does not exist on 'team_invites'.">`

**Impact:** 30 `error TS` lines across `lib/team-rpc.ts` (13) and `lib/token-security.ts` (17). Plus 3 errors in `app/` dashboard consumers (Plan 04 scope). Total repo tsc errors: 34 (was 1 pre-existing next.config.ts error before this plan).

**Why deferred:** This is NOT a build-hygiene regression — it is newly-visible pre-existing drift, which is exactly what HYG-04 was designed to expose. The plan's Task 1 scope only requires `utils/supabase/*.ts` to be clean (they are). The correct fix requires a product/architecture decision: deploy the missing RPCs to the live DB (cross-repo, `dropitx-api/` or `supabase/migrations/`), or rewrite the frontend to call the RPCs the DB actually exposes. Plan 01 explicitly tagged these interfaces `[ASSUMED]` and deferred verification to Plan 03 — this SUMMARY is that verification. The reconciliation itself belongs to the feature-completion phase.

**Build impact:** NONE today. `next.config.ts` still carries `ignoreBuildErrors: true` (Plan 04 scope), so `next build` does not fail on these errors. They surface only under `npx tsc --noEmit`. Plan 04 must address them (or accept an interim `as unknown as` widening) before re-enabling the typecheck gate.

Full drift table recorded in `.planning/phases/01-build-hygiene/deferred-items.md`.

## User Setup Required
- **Deployment prerequisite (blocking for production deploy):** Confirm `NEXT_PUBLIC_API_URL` is set in **Vercel Project Settings → Environment Variables → Production** before merging this change. With the fail-fast throw, a production build without this var will crash at the SSR pass. (The current production value is `https://dropitx-api.onrender.com` per the existing Vercel config — verify it is present and correct.)

## Threat Surface

The changes match the plan's threat model exactly — no new surface introduced beyond what T-03-01/T-02/T-03 anticipated:

| Threat ID | Status | Notes |
|-----------|--------|-------|
| T-03-01 (DoS / build crash on missing env) | mitigated | Fail-fast throw is intentional; gated by the Vercel env-var prerequisite above |
| T-03-02 (Spoofing / tunnel URL) | mitigated | trycloudflare.com reference fully removed; no attacker-controllable ephemeral endpoint remains |
| T-03-03 (Tampering / generated types) | accept | Types are a compile-time aid; runtime RLS policies enforce data access regardless |

## Next Phase Readiness
- **Ready for Plan 04** (re-enable typecheck/lint gate + fix dashboard): the typed Supabase clients are in place. Plan 04 must decide how to handle the 34 deferred tsc errors — the 3 dashboard errors are in-scope for Plan 04; the 30 team-rpc/token-security errors require the RPC-drift decision (see Deferred Findings) OR an interim `as unknown as` widening to unblock the build gate.
- **Not yet complete:** HYG-04 and HYG-05 are functionally implemented but NOT marked complete in REQUIREMENTS.md — the build gate (ignoreBuildErrors) is still disabled (Plan 04), and the Vercel env-var prerequisite (D5) is a manual check still pending.
- **Pre-existing next.config.ts TS error** (`'eslint' does not exist in type 'NextConfig'`) remains — explicitly Plan 04 scope.

*Phase: 01-build-hygiene*
*Completed: 2026-08-11*

## Self-Check: PASSED

All created/modified files exist on disk. Both task commits (d789699, b2a86a2) present in git log. Re-ran all acceptance criteria after completion:

- `types/database.generated.ts` exists and exports `Database` (PASS)
- `createServerClient<Database>` in server.ts = 1 (PASS, >=1)
- `createBrowserClient<Database>` in client.ts = 1 (PASS)
- `createServerClient<Database>` in middleware.ts = 1 (PASS)
- `createServiceRoleClient<Database>` in server.ts = 1 (bonus — admin client also typed)
- `trycloudflare` count in lib/api-client.ts = 0 (PASS)
- `throw new Error.*NEXT_PUBLIC_API_URL` in lib/api-client.ts = 1 (PASS)
- `npx tsc --noEmit` zero errors in utils/supabase/*.ts + lib/api-client.ts + types/database.generated.ts (PASS)
- `npx eslint` exit 0 on all modified files (PASS)
- 34 tsc errors remain repo-wide — all in out-of-scope consumer files (team-rpc.ts, token-security.ts, app/ dashboard, next.config.ts); documented in Deferred Findings + deferred-items.md
