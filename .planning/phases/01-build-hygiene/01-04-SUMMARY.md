---
phase: 01-build-hygiene
plan: 04
subsystem: infra
tags: [next-16, typescript, eslint, supabase, type-safety, build-enforcement, firebase]

requires:
  - phase: 01-01
    provides: "Catch narrowing and typed interfaces that removed @ts-nocheck debt"
  - phase: 01-02
    provides: "Typed RPC returns and defensive-check compilation without any"
  - phase: 01-03
    provides: "types/database.generated.ts Database generic threaded through all Supabase client factories, and fail-fast NEXT_PUBLIC_API_URL"
provides:
  - "next.config.ts with typescript/eslint suppression blocks removed — npm run build enforces TypeScript errors (HYG-01)"
  - "npm run lint as the separate HYG-02 enforcement gate on Next 16 — 0 errors (44 pre-existing warnings documented as out of scope)"
  - "All 4 dashboard pages typed against the generated Database generic — zero any-casts, zero eslint-disable no-explicit-any (HYG-04)"
  - "lib/supabase-untyped.ts — untypedRpc/untypedFrom boundary for RPC names drifted from the generated types (team-rpc, token-security)"
  - "Green authoritative gate: npm run build exits 0 (tsc + bundle + prerender, 19/19 pages)"
affects: [01.1-api-integration-migration]

actuals:
  tokens: 11424
  tasks: 3
  commits: 13

tech-stack:
  added: []
  patterns:
    - "Untyped RPC boundary: drifted RPC names route through lib/supabase-untyped.ts (untypedRpc/untypedFrom) instead of as-casts at call sites — drift is contained in one auditable file until cross-repo reconciliation"
    - "On Next 16, build-time ESLint no longer exists (the eslint NextConfig key is gone) — lint enforcement is a separate npm run lint gate, not a next build concern"
    - "null-to-undefined normalization for RPC args when the generated signature expects optional params"

key-files:
  created:
    - "lib/supabase-untyped.ts"
  modified:
    - "next.config.ts"
    - "app/(dashboard)/dashboard/layout.tsx"
    - "app/(dashboard)/dashboard/page.tsx"
    - "app/(dashboard)/dashboard/teams/page.tsx"
    - "app/(dashboard)/dashboard/teams/[slug]/page.tsx"
    - "lib/team-rpc.ts"
    - "lib/token-security.ts"
    - "app/(public)/s/[slug]/page.tsx"
    - "types/team.ts"
    - "components/editor-shell.tsx"
    - "hooks/use-email-validation.ts"

key-decisions:
  - "Removed both suppression blocks from next.config.ts (typescript.ignoreBuildErrors AND eslint.ignoreDuringBuilds) — Next 16 removed build-time ESLint entirely so the eslint key no longer exists; only the TypeScript enforcement surface is restored in-build"
  - "Kept output: \"standalone\" — pre-existing deployment setting, unrelated to enforcement"
  - "Created lib/supabase-untyped.ts boundary for drifted RPC names rather than editing generated types or casting at every call site"
  - "Normalized null to undefined for record_and_increment_share_view args to match the generated RPC signature"
  - "User-approved scope expansion: cleared 25 pre-existing lint ERRORS with 9 justified eslint-disable-next-line exemptions (external-init effects, prop-sync replaced by derived state); 44 pre-existing WARNINGS deliberately left untouched"

patterns-established:
  - "Untyped Supabase access is allowed ONLY through lib/supabase-untyped.ts — any new drifted RPC goes there, never an inline as-cast"
  - "Build gates on Next 16: npm run build (TypeScript + bundle) and npm run lint (ESLint) are separate surfaces; both must be run, neither covers the other"
  - "All NEXT_PUBLIC_* vars consumed at module load must exist in the Vercel Production environment — production prerendering executes that code at build time"

requirements-completed: [HYG-01, HYG-02, HYG-04]

coverage:
  - id: D1
    description: "next.config.ts has no ignoreBuildErrors/ignoreDuringBuilds keys; npm run build runs TypeScript and exits 0"
    requirement: HYG-01
    verification:
      - kind: other
        ref: "grep -n 'ignoreBuildErrors|ignoreDuringBuilds' next.config.ts (empty=PASS); npm run build exit 0, 'Running TypeScript ... Finished TypeScript' in output"
        status: pass
    human_judgment: false
  - id: D2
    description: "ESLint enforced as a separate gate: npm run lint reports 0 errors (44 warnings documented, out of scope)"
    requirement: HYG-02
    verification:
      - kind: other
        ref: "npm run lint → '0 errors, 44 warnings', exit 0"
        status: pass
    human_judgment: false
  - id: D3
    description: "Dashboard queries typed against Database generic — no any-casts with eslint-disable in app/(dashboard)"
    requirement: HYG-04
    verification:
      - kind: other
        ref: "grep -rn 'eslint-disable.*no-explicit-any' 'app/(dashboard)' (empty=PASS); npm run typecheck exit 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "Phase truths hold: zero @ts-nocheck in app/components/lib/hooks/utils/types; zero trycloudflare.com in lib/"
    verification:
      - kind: other
        ref: "grep -rl '@ts-nocheck' app/ components/ lib/ hooks/ utils/ types/ (empty=PASS); grep -rl 'trycloudflare.com' lib/ (empty=PASS)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Vercel Production environment includes all 6 NEXT_PUBLIC_FIREBASE_* vars alongside NEXT_PUBLIC_API_URL (build-time prerender of /dashboard/analytics initializes Firebase at module load)"
    verification: []
    human_judgment: true
    rationale: "Cannot be verified from the repo — it is a deployment-environment fact. The local .env.local has all 6 vars (build passed); the Vercel Production env must be confirmed by a human before the next deploy or the production build will fail on the Firebase module-load init."

# Metrics
duration: 40min
completed: 2026-08-16
status: complete
---

# Phase 1 Plan 4: Build Enforcement Gate Summary

**Dashboard queries typed against the generated Database generic, drifted RPCs contained behind an untyped boundary, and next.config.ts suppression flags removed — npm run build now enforces TypeScript (exit 0), with npm run lint (0 errors) as the separate ESLint gate on Next 16.**

## Performance

- **Duration:** ~40 min wall clock across 3 executor sessions (2026-08-16T05:49Z → 2026-08-16T06:35Z)
- **Started:** 2026-08-16T05:49:04Z (first task commit)
- **Completed:** 2026-08-16T06:35:00Z
- **Tasks:** 3 (2 auto + 1 checkpoint:human-verify)
- **Files modified:** 30
- **Executors:** 3 (continuation chain; final session ran the build gate and close-out after the Firebase env blocker was resolved)

## Accomplishments

- Typed all 4 dashboard files (layout, page, teams, teams/[slug]) against the Plan-03 Database generic — zero `as any[]` casts, zero `eslint-disable no-explicit-any` suppressions (HYG-04)
- Created `lib/supabase-untyped.ts` (`untypedRpc`/`untypedFrom`) and routed the drifted `team-rpc.ts` and `token-security.ts` calls through it, clearing the 30 deferred tsc errors from Plans 02/03 without touching generated types
- Normalized `record_and_increment_share_view` args (null → undefined) to match the generated RPC signature
- Cleared 25 pre-existing lint ERRORS (user-approved scope expansion) — hooks-compliant ref updates/hydration gating, next/link for auth logos, static import of getAuthHeaders, TextareaProps type alias, derived-state render adjustment replacing prop-sync effects, and 9 justified `eslint-disable-next-line` exemptions for legitimate external-init effects
- Removed `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` from next.config.ts; the authoritative gate `npm run build` exits 0 with TypeScript enforcement active (HYG-01), and `npm run lint` reports 0 errors as the separate HYG-02 gate

## Task Commits

All commits from the three executors, in order:

| # | Commit | Type | Task / scope |
|---|--------|------|--------------|
| 1 | `f128151` | fix | Task 1: type dashboard layout and page Supabase queries (+ types/team.ts) |
| 2 | `18605fb` | fix | Task 2: type dashboard teams pages Supabase queries |
| 3 | `f90322c` | fix | Task 3 (pre-gate): route drifted team RPC calls through untyped boundary |
| 4 | `8e68eb0` | fix | Task 3 (pre-gate): route drifted token-security calls through untyped boundary |
| 5 | `80c5dfd` | fix | Task 3 (pre-gate): normalize record_and_increment_share_view args |
| 6 | `5fc3440` | fix | Lint cleanup 1/6: link auth page logos via next/link |
| 7 | `5a21ee9` | fix | Lint cleanup 2/6: import getAuthHeaders statically in multi-file-upload |
| 8 | `7e246a5` | refactor | Lint cleanup 3/6: use type alias for TextareaProps |
| 9 | `2885ecb` | fix | Lint cleanup 4/6: make ref updates and hydration gating react-hooks compliant |
| 10 | `fc61dcf` | fix | Lint cleanup 5/6: replace prop-sync effects with render adjustment and derived state |
| 11 | `e76fbf2` | chore | Lint cleanup 6/6: exempt legitimate external-init effects from set-state-in-effect |
| 12 | `53b711d` | chore | Task 3 gate: enforce TypeScript errors in production build (remove both suppression blocks) |
| 13 | (docs) | docs | Complete plan execution tracking (SUMMARY + STATE/ROADMAP/REQUIREMENTS) |

## Files Created/Modified

Created:
- `lib/supabase-untyped.ts` — untypedRpc/untypedFrom boundary for RPC names drifted from generated types

Modified (key files; 30 total):
- `next.config.ts` — suppression blocks removed; `output: "standalone"` kept
- `app/(dashboard)/dashboard/layout.tsx`, `app/(dashboard)/dashboard/page.tsx` — typed queries (Task 1)
- `app/(dashboard)/dashboard/teams/page.tsx`, `app/(dashboard)/dashboard/teams/[slug]/page.tsx` — typed queries (Task 2)
- `lib/team-rpc.ts`, `lib/token-security.ts` — drifted calls routed through the untyped boundary
- `app/(public)/s/[slug]/page.tsx` — RPC arg normalization; `types/team.ts` — supporting types
- Lint cleanup: 3 auth pages, `components/multi-file-upload.tsx`, `components/ui/textarea.tsx`, `components/editor-shell.tsx`, `lib/use-auto-save.ts`, `lib/use-scroll-sync.ts`, `app/(public)/search/page.tsx`, `components/bookmark-toggle.tsx`, `components/invite-member-dialog.tsx`, `components/search-bar.tsx`, `hooks/use-email-validation.ts`, `components/api-key-manager.tsx`, `components/comments-section.tsx`, `components/encrypted-content-viewer.tsx`, `components/encryption-toggle.tsx`, `components/tag-manager.tsx`, `components/version-history.tsx`, `lib/use-editor-auto-save.ts`

## Decisions Made

- **Both suppression blocks removed, not just typescript** — Next 16 removed build-time ESLint entirely; the `eslint` NextConfig key no longer exists. Only the TypeScript enforcement surface is restored in-build; HYG-02 enforcement moved to the separate `npm run lint` gate (0 errors).
- **Untyped boundary over call-site casts** — `lib/supabase-untyped.ts` contains all drift in one auditable file pending cross-repo reconciliation with dropitx-api/.
- **null → undefined RPC arg normalization** — generated signatures use optional params; nulls are normalized at the call site, not by widening generated types.
- **9 justified eslint-disable-next-line exemptions** — each guards a legitimate external-init effect that cannot be restructured without breaking behavior; documented per-site.
- **44 lint warnings left untouched** — pre-existing, out of scope by locked decision; errors were the gate.
- **`output: "standalone"` kept** — pre-existing deployment setting, unrelated to enforcement.

## Deviations from Plan

### User-Approved Scope Expansion

**1. Cleared 25 pre-existing lint ERRORS (plan only required the 7 dashboard any-casts)**
- **Found during:** Task 3 build gate — Next 16 removed build-time ESLint, so `npm run lint` was run as the separate gate; it surfaced 25 pre-existing errors
- **Fix:** 6 commits (`5fc3440` … `e76fbf2`) — hooks-compliance fixes plus 9 justified `eslint-disable-next-line` exemptions for legitimate external-init effects
- **Verification:** `npm run lint` → 0 errors, 44 warnings (warnings out of scope), exit 0
- **Approval:** user-approved scope expansion (locked decision)

**2. Untyped RPC boundary instead of full reconciliation**
- **Found during:** Task 3 pre-flight — 30 tsc errors in `team-rpc.ts`/`token-security.ts` from RPC-name drift vs live DB (deferred from Plans 02/03)
- **Fix:** `f90322c` + `8e68eb0` created `lib/supabase-untyped.ts`; drifted calls route through it. Cross-repo reconciliation with dropitx-api/ remains future scope (WINDOWS.md entries 1-2 stay open)
- **Approval:** locked decision (do not revisit)

**3. `output: "standalone"` retained** — plan's literal final shape showed an empty config; the standalone output setting is a pre-existing deployment requirement and was kept.

**4. Next-16 ESLint fact changes HYG-02's surface** — plan assumed `next build` runs ESLint; on Next 16 it does not. HYG-02 is satisfied by the `npm run lint` gate (0 errors), not by the build.

**5. Firebase env prerequisite discovered** — production prerendering of `/dashboard/analytics` initializes Firebase at module load; the build crashed until `.env.local` carried all 6 `NEXT_PUBLIC_FIREBASE_*` vars. Surfaced as a CHECKPOINT (human-verify, blocking); user resolved it. Vercel Production env carries the same requirement.

---

**Total deviations:** 5 (1 user-approved scope expansion, 2 locked design decisions, 1 platform-fact adjustment, 1 environment prerequisite surfaced as checkpoint)
**Impact on plan:** All gates green; no unapproved scope. Deviations 2/5 carry follow-ups tracked in WINDOWS.md and D5.

## Issues Encountered

- **Build checkpoint blocker (resolved):** `npm run build` failed at page-data collection — Firebase initialized at module load during prerender of `/dashboard/analytics` with missing `NEXT_PUBLIC_FIREBASE_*` env vars. Returned as CHECKPOINT (human-verify, blocking); user added all 6 vars to `.env.local`. Final build: exit 0, 19/19 pages generated.
- **Next.js workspace-root warning (pre-existing, informational):** multiple lockfiles detected (`~/package-lock.json` vs repo); does not affect the build. Silencable via `turbopack.root` — out of scope.
- **middleware deprecation warning (pre-existing, informational):** Next 16 prefers the `proxy` convention; out of scope for this phase.

## User Setup Required

None generated (plan has no `user_setup` block). Deployment note: **Vercel Production environment must include all 6 `NEXT_PUBLIC_FIREBASE_*` vars alongside `NEXT_PUBLIC_API_URL`** before the next production deploy — see coverage D5.

## Known Stubs

None — no stub patterns introduced; all data flows are wired.

## Next Phase Readiness

- Phase 01 complete (4/4 plans): typecheck 0 errors, lint 0 errors, `npm run build` exit 0, all 4 grep-gates pass
- Phase 01.1 (api-integration-migration) can execute immediately — planning already verified
- WINDOWS.md entries 1-2 (RPC drift / team_invites column drift) intentionally remain OPEN — the untyped boundary contains them; actual reconciliation is cross-repo scope (dropitx-api/)
- 44 pre-existing lint warnings remain (locked out-of-scope decision)
- Vercel Production env: 6 Firebase vars + NEXT_PUBLIC_API_URL required at next deploy (D5)

## Self-Check: PASSED

- Gates: `npm run typecheck` 0 errors (exit 0) · `npm run lint` 0 errors / 44 warnings (exit 0) · `npm run build` exit 0 (TypeScript enforced, 19/19 pages)
- Grep-gates: @ts-nocheck absent · trycloudflare.com absent · no-explicit-any disables absent in app/(dashboard) · ignoreBuildErrors/ignoreDuringBuilds absent in next.config.ts
- Files: lib/supabase-untyped.ts, next.config.ts, 01-04-SUMMARY.md — all FOUND
- Commits: all 12 code commits (f128151…53b711d) FOUND in git log
