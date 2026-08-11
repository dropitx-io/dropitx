---
phase: 01-build-hygiene
plan: 02
subsystem: frontend
tags: [typescript, eslint, strict-mode, catch-narrowing, ts-nocheck, components]

requires:
  - "01-01: lib/errors.ts getErrorMessage helper + lib/team-rpc.ts typed under strict mode"
provides:
  - "components/auth/invite-accept-form.tsx fully typed (zero @ts-nocheck, zero catch(err:any), user state typed as User | null)"
  - "components/team/team-invite-form.tsx fully typed (3 catch blocks narrowed via getErrorMessage)"
  - "components/enhanced-invite-dialog.tsx and components/bulk-invite-dialog.tsx fully typed"
  - "lib/team-rpc.ts BulkInviteResult interface + bulkInvite(): Promise<BulkInviteResult> typed return"
affects: [01-04]

actuals:
  tokens: 1541
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Typed untyped JSON fetch consumers via inline object types ({ email: string }) instead of any"
    - "Widened service-method return union to declare both success and failure shapes so component defensive checks type-check"

key-files:
  created: []
  modified:
    - "components/auth/invite-accept-form.tsx"
    - "components/team/team-invite-form.tsx"
    - "components/enhanced-invite-dialog.tsx"
    - "components/bulk-invite-dialog.tsx"
    - "lib/team-rpc.ts"

key-decisions:
  - "Typed bulkInvite RPC return as BulkInviteResult and widened bulkInviteWithValidation return union (success | failure) so the component's defensive !result.success branch compiles without changing runtime logic"
  - "Left pre-existing 13 team-rpc.ts tsc errors (RPC name drift vs generated Database types) untouched — confirmed present at HEAD before Plan 02, documented in deferred-items.md, Plan 03/04 scope"
  - "Used @supabase/supabase-js User type for the previously-any user state in invite-accept-form.tsx (the package is already a dependency)"

patterns-established:
  - "When a component reads a typed field off parsed JSON (res.json()), type the callback param with the minimal inline shape rather than introducing a full response interface (YAGNI)"

requirements-completed: []

coverage:
  - id: D1
    description: "invite-accept-form.tsx has zero @ts-nocheck and zero catch (err: any)"
    requirement: HYG-03
    verification:
      - kind: other
        ref: "grep -c '@ts-nocheck' (0); grep -c 'catch (err: any)' (0); npx tsc --noEmit (0 errors in file); npx eslint (exit 0)"
        status: pass
    human_judgment: false
  - id: D2
    description: "team-invite-form.tsx has zero @ts-nocheck and all 3 catch blocks narrowed"
    requirement: HYG-03
    verification:
      - kind: other
        ref: "grep -c '@ts-nocheck' (0); grep -c 'catch (err: any)' (0); grep -c 'getErrorMessage' (4); npx tsc --noEmit (0 errors in file); npx eslint (exit 0)"
        status: pass
    human_judgment: false
  - id: D3
    description: "enhanced-invite-dialog.tsx and bulk-invite-dialog.tsx have zero @ts-nocheck"
    requirement: HYG-03
    verification:
      - kind: other
        ref: "grep -rl '@ts-nocheck' components/ (empty); npx tsc --noEmit (0 errors in both files); npx eslint (exit 0)"
        status: pass
    human_judgment: false
  - id: D4
    description: "No no-explicit-any violations in the 4 component files"
    requirement: HYG-02
    verification:
      - kind: other
        ref: "npx eslint on all 4 files (0 errors, exit 0); typed (invite: any) callback in bulk-invite-dialog.tsx replaced with { email: string }"
        status: pass
    human_judgment: false

duration: 8 min
completed: 2026-08-11
status: complete
---

# Phase 01 Plan 02: Remove @ts-nocheck from Team Component Files Summary

**All 4 team component files cleared of @ts-nocheck, catch blocks narrowed via getErrorMessage, and the bulkInvite RPC return typed so the largest component compiles under strict mode**

## Performance

- **Duration:** 8 min
- **Started:** 2026-08-11T01:32:04Z
- **Completed:** 2026-08-11T01:39:46Z
- **Tasks:** 3
- **Files modified:** 5 (4 components + lib/team-rpc.ts)

## Accomplishments
- Removed `@ts-nocheck` from all 4 remaining component files: `invite-accept-form.tsx`, `team-invite-form.tsx`, `enhanced-invite-dialog.tsx`, `bulk-invite-dialog.tsx`
- Narrowed 4 `catch (err: any)` blocks (1 in invite-accept-form, 3 in team-invite-form) via the `getErrorMessage` helper established in Plan 01
- Typed the previously-`any` user state in invite-accept-form.tsx as `User | null` using `@supabase/supabase-js`
- Defined `BulkInviteResult` interface and typed `bulkInvite()` / `bulkInviteWithValidation()` in team-rpc.ts so team-invite-form.tsx compiles without `any`
- Removed the explicit `any` from the invite-email map callback in bulk-invite-dialog.tsx (HYG-02)
- Verified the existing `instanceof Error` catch patterns in both dialog files compile clean under strict mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove @ts-nocheck from invite-accept-form.tsx** - `74928ef` (fix)
2. **Task 2: Remove @ts-nocheck from team-invite-form.tsx** - `f384de8` (fix)
3. **Task 3: Remove @ts-nocheck from enhanced-invite-dialog.tsx and bulk-invite-dialog.tsx** - `0e6ec6f` (fix)

## Files Created/Modified
- `components/auth/invite-accept-form.tsx` - `@ts-nocheck` removed; `catch (err: any)` narrowed via getErrorMessage; `useState<any>` typed as `useState<User | null>`; unescaped apostrophe fixed
- `components/team/team-invite-form.tsx` - `@ts-nocheck` removed; 3 catch blocks narrowed via getErrorMessage
- `components/enhanced-invite-dialog.tsx` - `@ts-nocheck` removed; catch blocks already used `instanceof Error` pattern (no change needed)
- `components/bulk-invite-dialog.tsx` - `@ts-nocheck` removed; `(invite: any)` callback typed as `{ email: string }`
- `lib/team-rpc.ts` - Added `BulkInviteResult` interface; typed `bulkInvite()` return as `Promise<BulkInviteResult>`; widened `bulkInviteWithValidation()` return union

## Decisions Made
- **Typed bulkInvite RPC return + widened service return union.** `team-invite-form.tsx` reads `result.data?.success_count`, `result.data?.error_count`, and checks `result.message` on a defensive `!result.success` branch. The `bulkInvite` RPC in team-rpc.ts returned untyped `data` (supabase inferred it as a shares-row array), and `bulkInviteWithValidation` only declared `{ success: true, data }`. Added `BulkInviteResult` interface and widened the return type to `{ success: true; data: BulkInviteResult } | { success: false; message: string }` so the component's defensive checks compile without altering runtime behavior.
- **Left pre-existing team-rpc.ts tsc errors untouched.** 13 tsc errors exist in team-rpc.ts from RPC-name drift between frontend calls and the generated Supabase `Database` type (e.g. `create_team`, `transfer_team_ownership`, `bulk_invite_transaction` are absent from generated types). Verified these are present at HEAD before Plan 02 (same 13 errors before and after my edits). Already documented in `deferred-items.md` as Plan 03/04 scope. My edits introduced zero new errors.
- **Used @supabase/supabase-js User type** for the invite-accept-form user state rather than a local interface — the package is already a dependency and `auth.getUser()` returns exactly that type.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Typed bulkInvite return in lib/team-rpc.ts**
- **Found during:** Task 2 (team-invite-form.tsx @ts-nocheck removal)
- **Issue:** After removing @ts-nocheck, tsc reported 3 errors in team-invite-form.tsx: `result.message`, `result.data?.success_count`, and `result.data?.error_count` do not exist. The `bulkInvite` RPC returned untyped `data` (supabase inferred a shares-row array), and `bulkInviteWithValidation` only declared a success-only return shape.
- **Fix:** Defined `BulkInviteResult` interface (`success_count?`, `error_count?`, `duplicate_count?`) with boundary `as` cast (same pattern as Plan 01); widened `bulkInviteWithValidation` return union to include `{ success: false; message: string }` so the component's defensive branch type-checks.
- **Files modified:** lib/team-rpc.ts
- **Verification:** `npx tsc --noEmit` reports 0 errors in team-invite-form.tsx (was 3).
- **Committed in:** f384de8 (Task 2 commit)

**2. [Rule 1 - Bug] Escaped unescaped apostrophe in invite-accept-form.tsx JSX**
- **Found during:** Task 1
- **Issue:** `react/no-unescaped-entities` error at "You've been invited to join a team" — blocked the lint-gate done criterion (`npx eslint exits 0`). Pre-existing error that @ts-nocheck did not suppress (it is a React lint rule, not a TS check).
- **Fix:** Changed `You've` to `You&apos;ve`. No logic or visible UI change.
- **Files modified:** components/auth/invite-accept-form.tsx
- **Verification:** `npx eslint` exits 0 on the file (was exit 1).
- **Committed in:** 74928ef (Task 1 commit)

**3. [Rule 2 - Security/Correctness] Removed explicit any from bulk-invite-dialog.tsx map callback**
- **Found during:** Task 3
- **Issue:** `data.invites.map((invite: any) => invite.email)` — `no-explicit-any` violation (HYG-02). Surfaced by @ts-nocheck removal.
- **Fix:** Typed callback param as `{ email: string }` matching the `string[]` success array shape.
- **Files modified:** components/bulk-invite-dialog.tsx
- **Verification:** `npx eslint` reports 0 errors on the file (was 1).
- **Committed in:** 0e6ec6f (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 1 blocking, 1 security/correctness)
**Impact on plan:** All necessary to satisfy the plan's own done criteria (lint gate, HYG-02). No scope creep — changes are type-level or a single JSX entity escape; no runtime behavior altered.

## Issues Encountered
- Pre-existing 13 tsc errors in lib/team-rpc.ts (RPC name drift vs generated Supabase types) were present at HEAD before Plan 02 and are NOT caused by these edits. Already documented in `deferred-items.md` (discovered during Plan 03). Plan 04 (re-enable build gate) must reconcile these before setting `ignoreBuildErrors: false`.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- **Ready for Plan 04** (re-enable typecheck/lint in next.config.ts): all 4 component files pass tsc + eslint clean. The remaining blocker is the 13 pre-existing team-rpc.ts errors (RPC drift) documented in deferred-items.md.
- **HYG-03 status:** zero `@ts-nocheck` directives now remain anywhere in `components/` or `lib/` (all 5 original files cleared across Plans 01 + 02).
- **HYG-02 status:** the 4 component files have zero `no-explicit-any` violations. Remaining `any` sites are in pre-existing dashboard code (separate scope).

---
*Phase: 01-build-hygiene*
*Completed: 2026-08-11*

## Self-Check: PASSED

All modified files exist on disk. All 3 task commits (74928ef, f384de8, 0e6ec6f) present in git log. Re-ran all acceptance criteria after completion:

- `grep -rl "@ts-nocheck" components/` returns empty (PASS)
- `grep -rl "catch (err: any)\|catch (error: any)" components/` returns empty (PASS)
- `npx eslint` on all 4 component files exits 0 (PASS — 0 errors, 13 pre-existing warnings only)
- `npx tsc --noEmit` reports 0 errors in all 4 component files (PASS)
