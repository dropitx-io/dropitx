---
phase: 01-build-hygiene
plan: 01
subsystem: infra
tags: [typescript, eslint, strict-mode, catch-narrowing, ts-nocheck]

requires: []
provides:
  - "lib/errors.ts getErrorMessage(e: unknown): string — DRFY catch-narrowing helper for the whole phase"
  - "lib/team-rpc.ts fully typed under strict mode (no @ts-nocheck, no Promise<any>)"
  - "lib/token-security.ts zero no-explicit-any violations"
  - "package.json typecheck and check:hygiene scripts"
affects: [01-02, 01-03, 01-04]

actuals:
  tokens: 781
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Catch-narrowing via getErrorMessage(e: unknown): string — single helper for every catch block under useUnknownInCatchVariables"
    - "RPC-boundary `as InterfaceName` cast for untyped supabase.rpc() returns — the one legitimate cast site per research Pitfall 3"

key-files:
  created:
    - "lib/errors.ts"
  modified:
    - "lib/team-rpc.ts"
    - "lib/token-security.ts"
    - "package.json"

key-decisions:
  - "Did not apply getErrorMessage to Supabase PostgrestError sites — PostgrestError is not instanceof Error, so the String() fallback would yield [object Object] and corrupt user-facing RPC error messages"
  - "Typed the 3 Promise<any> RPC returns in team-rpc.ts and token-security.ts with assumed interfaces + `as` cast at the RPC boundary; shapes are tagged [ASSUMED] and verifiable when Plan 03 generates types from the DB"
  - "Reused AcceptInviteResult from team-rpc.ts for token-security.ts acceptInvite data type instead of duplicating the interface (DRY)"

patterns-established:
  - "getErrorMessage(e: unknown): string is the canonical catch-narrowing helper — every catch block across the phase imports it from @/lib/errors"
  - "supabase.rpc() returns without a generic type parameter are typed via an assumed-result interface cast at the boundary (data as InterfaceName), not left as any"

requirements-completed: []

coverage:
  - id: D1
    description: "lib/errors.ts exports getErrorMessage(e: unknown): string"
    requirement: HYG-03
    verification:
      - kind: other
        ref: "npx tsc --noEmit (0 errors in errors.ts) + npx eslint lib/errors.ts (exit 0)"
        status: pass
    human_judgment: false
  - id: D2
    description: "lib/team-rpc.ts compiles under strict mode with zero @ts-nocheck and zero Promise<any>"
    requirement: HYG-03
    verification:
      - kind: other
        ref: "npx tsc --noEmit | grep team-rpc (0 errors); npx eslint lib/team-rpc.ts (exit 0); grep -c @ts-nocheck (0); grep -c Promise<any> (0)"
        status: pass
    human_judgment: false
  - id: D3
    description: "lib/token-security.ts has zero catch (error: any) and zero no-explicit-any violations"
    requirement: HYG-02
    verification:
      - kind: other
        ref: "npx eslint lib/token-security.ts (exit 0); grep -c 'catch (error: any)' (0); npx tsc --noEmit | grep token-security (0 errors)"
        status: pass
    human_judgment: false
  - id: D4
    description: "package.json has typecheck and check:hygiene scripts"
    requirement: HYG-01
    verification:
      - kind: other
        ref: "grep typecheck/check:hygiene in package.json (present); npm run typecheck (runnable, exit 1 only from pre-existing next.config.ts error)"
        status: pass
    human_judgment: false

duration: 11 min
completed: 2026-08-11
status: complete
---

# Phase 01 Plan 01: Build Hygiene Foundation Summary

**Catch-narrowing helper + @ts-nocheck removed from team-rpc.ts and token-security.ts under strict mode, with typecheck/check:hygiene scripts added**

## Performance

- **Duration:** 11 min
- **Started:** 2026-08-11T01:15:53Z
- **Completed:** 2026-08-11T01:27:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created `lib/errors.ts` with `getErrorMessage(e: unknown): string` — the DRY helper every subsequent catch-narrow in the phase reuses
- Removed `@ts-nocheck` from `lib/team-rpc.ts` (544 lines); the file now compiles under `strict` + `useUnknownInCatchVariables` with zero TS errors and zero ESLint violations
- Typed 3 `Promise<any>` RPC return signatures in team-rpc.ts (`GlobalRateLimitResult`, `RateLimitingStats`, `CleanupResult`) using boundary `as` casts
- Narrowed all 7 `catch (error)` blocks in `TeamService` via `getErrorMessage`
- Narrowed the 2 `catch (error: any)` blocks in `lib/token-security.ts` and typed 4 additional `any` sites (3 RPC stats returns + acceptInvite data field)
- Added `typecheck` and `check:hygiene` npm scripts for fast TS/lint feedback

## Task Commits

Each task was committed atomically:

1. **Task 1: Create errors helper + remove @ts-nocheck from team-rpc.ts (TRACER)** - `038f1f6` (feat)
2. **Task 2: Narrow catch blocks in token-security.ts** - `e5fc286` (fix)

_Note: Task 1 was a tracer; it was verified end-to-end (all automated checks green) and approved before Task 2 started._

## Files Created/Modified
- `lib/errors.ts` - New shared helper: `getErrorMessage(e: unknown): string` (instanceof Error check + String fallback)
- `lib/team-rpc.ts` - `@ts-nocheck` removed; 7 catch blocks narrowed; 3 Promise<any> returns typed via interfaces
- `lib/token-security.ts` - 2 catch (error: any) blocks narrowed; 3 Promise<any> RPC returns typed; acceptInvite data field typed as AcceptInviteResult
- `package.json` - Added `typecheck` and `check:hygiene` scripts

## Decisions Made
- **Supabase PostgrestError sites left untouched.** The plan's action text instructed replacing `error.message` with `getErrorMessage(error)` in both catch blocks AND the `if (error) { throw ... error.message }` Supabase-RPC sites. I did not apply getErrorMessage to the Supabase-error sites because `PostgrestError` is not `instanceof Error` — the helper's `String(e)` fallback would return `"[object Object]"`, silently corrupting every RPC error message surfaced to users. The Supabase `error` is typed (`PostgrestError | null`) and `.message` is valid after the `if (error)` narrow. Verified empirically: tsc reports zero errors at those sites after `@ts-nocheck` removal.
- **Assumed RPC return interfaces.** The exact field names of `check_global_invite_rate_limit`, `get_rate_limiting_stats`, `cleanup_rate_limiting_data`, `get_token_security_stats`, `cleanup_expired_tokens`, and `reset_locked_tokens` RPC returns could not be verified from the frontend repo (definitions live in dropitx-api/ or Supabase migrations). Interfaces are reasonable shapes tagged `[ASSUMED]` per the plan, with `as` casts at the boundary. Plan 03 (generated types) will verify and can adjust.
- **Reused AcceptInviteResult from team-rpc.ts** for token-security.ts `acceptInvite` data type rather than duplicating — same `accept_team_invite` RPC shape.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Did not apply getErrorMessage to Supabase PostgrestError sites**
- **Found during:** Task 1 (team-rpc.ts @ts-nocheck removal)
- **Issue:** Plan action 3a instructed replacing `error.message` with `getErrorMessage(error)` in all sites including Supabase-RPC `if (error) { throw new Error(... error.message ...) }` blocks. PostgrestError is a plain object (not instanceof Error), so getErrorMessage falls back to `String(e)` = `"[object Object]"`, corrupting user-facing error messages.
- **Fix:** Applied getErrorMessage ONLY to actual `catch (error)` blocks in TeamService. Left Supabase-error `.message` accesses unchanged (they are typed and compile fine).
- **Files modified:** lib/team-rpc.ts
- **Verification:** `npx tsc --noEmit` reports zero errors at the Supabase-error sites; only catch blocks produced TS18046.
- **Committed in:** 038f1f6 (Task 1 commit)

**2. [Rule 3 - Blocking] Typed 4 additional `any` sites in token-security.ts to satisfy zero-no-explicit-any done criterion**
- **Found during:** Task 2 (token-security.ts catch narrowing)
- **Issue:** Plan action said "Do NOT change any other logic in the file," but the done criterion requires "npx eslint lib/token-security.ts reports zero no-explicit-any violations." After narrowing the 2 catch blocks, 4 other `any` usages remained: 3 `Promise<any>` RPC stats returns (getTokenSecurityStats, cleanupExpiredTokens, resetLockedTokens) and 1 `data?: any` field in acceptInvite return type. These blocked the lint gate.
- **Fix:** Defined `TokenSecurityStats`, `TokenCleanupResult`, `LockedTokenResetResult` interfaces with boundary `as` casts (same pattern as Task 1); imported `AcceptInviteResult` from team-rpc.ts for the acceptInvite data field. These are type annotations only — no runtime logic changed.
- **Files modified:** lib/token-security.ts
- **Verification:** `npx eslint lib/token-security.ts` exits 0 (was 4 errors).
- **Committed in:** e5fc286 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both necessary for correctness and to satisfy the plan's own done criteria. No scope creep — all changes are type-level, no runtime behavior altered.

## Issues Encountered
- The plan estimate listed `tasks: 3` in frontmatter but the plan body defines 2 tasks. Executed the 2 tasks as written; actuals reflect 2.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- **Ready for Plan 02** (remove @ts-nocheck from the 4 component files): `getErrorMessage` and the catch-narrowing pattern are established; team-rpc.ts is now a typed dependency those components import.
- **Ready for Plan 03** (generated Supabase types): the assumed RPC return interfaces (`GlobalRateLimitResult`, `RateLimitingStats`, `CleanupResult`, `TokenSecurityStats`, `TokenCleanupResult`, `LockedTokenResetResult`) should be verified against actual RPC definitions when generated types are available, and adjusted if shapes differ.
- **Not yet complete:** HYG-01/02/03 are NOT marked complete — the build pipeline (`next.config.ts` ignoreBuildErrors/ignoreDuringBuilds) is still disabled (Plan 04) and 4 component files still carry @ts-nocheck (Plan 02). This plan is the foundation only.
- Pre-existing `next.config.ts` TS error (`'eslint' does not exist in type 'NextConfig'`) remains — explicitly Plan 04 scope.

---
*Phase: 01-build-hygiene*
*Completed: 2026-08-11*

## Self-Check: PASSED

All created/modified files exist on disk. Both task commits (038f1f6, e5fc286) present in git log. Re-ran all acceptance criteria after completion:

- `grep -c "@ts-nocheck" lib/team-rpc.ts` = 0 (PASS)
- `grep -c "Promise<any>" lib/team-rpc.ts` = 0 (PASS)
- `grep -c "catch (error: any)" lib/token-security.ts` = 0 (PASS)
- `npx eslint lib/team-rpc.ts lib/errors.ts lib/token-security.ts` exit 0 (PASS)
- `npx tsc --noEmit` zero errors in team-rpc/errors.ts/token-security.ts (PASS)
