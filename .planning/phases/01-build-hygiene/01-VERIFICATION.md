---
phase: 01-build-hygiene
verified: 2026-08-16T06:56:43Z
status: human_needed
score: 10/10 must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Confirm the production deploy environment (Vercel Project Settings → Environment Variables → Production, and/or the Dokploy target added in commit 12ab719) defines NEXT_PUBLIC_API_URL plus all 6 NEXT_PUBLIC_FIREBASE_* vars, then trigger one production deploy"
    expected: "Production build completes and prerenders /dashboard/analytics; no module-load throw from lib/api-client.ts or lib/firebase/client"
    why_human: "Deployment-environment fact — cannot be read from the repo. The build-time module-load guards (lib/api-client.ts lines 3-7) crash the prerender pass when these vars are absent; the phase hit exactly this class of failure locally (Firebase checkpoint in 01-04)"
  - test: "Decide the HYG-02 enforcement surface on Next 16: accept `npm run lint` (0 errors) + the AGENTS.md push convention as the gate, and fix the broken `check:hygiene` script; or wire ESLint into an automated pre-deploy pipeline (GitHub Actions / Vercel build command)"
    expected: "Either an accepted convention with a repaired `check:hygiene` (`tsc --noEmit && eslint .`), or a CI/deploy step that fails on ESLint errors"
    why_human: "Next 16 removed build-time ESLint entirely (verified: `next lint` exits with 'Invalid project directory ... /lint'; the `eslint` NextConfig key no longer exists). In-build enforcement is a platform impossibility, not an implementation gap — the residual choice (convention vs CI) is a workflow decision"
  - test: "Acknowledge routing of the 10 advisory review warnings (01-REVIEW.md WR-01..WR-10) to later phases — especially WR-04 (dead invite components import the service-role client + Node crypto into \"use client\" files) and WR-09 (fabricated analytics deltas on the dashboard)"
    expected: "Findings triaged into Phase 01.1+/backlog; none block Phase 01's goal"
    why_human: "Advisory severity — pre-existing latent defects outside Phase 01 must-haves; prioritization is a product call"
deferred:
  - truth: "Frontend calls 15 RPC names absent from the live Supabase DB; token-security.ts reads team_invites columns that do not exist live (WINDOWS.md entries 1-2)"
    addressed_in: "Phase 01.1 / cross-repo reconciliation (dropitx-api/)"
    evidence: "01-04-SUMMARY 'affects: [01.1-api-integration-migration]' and 'WINDOWS.md entries 1-2 intentionally remain OPEN — the untyped boundary contains them; actual reconciliation is cross-repo scope (dropitx-api/)'; deferred-items.md recommends reconciliation before/alongside feature work"
  - truth: "44 pre-existing ESLint warnings remain repo-wide"
    addressed_in: "Later cleanup (locked out-of-scope decision in 01-04)"
    evidence: "01-04-SUMMARY key-decisions: '44 pre-existing WARNINGS deliberately left untouched'; verified live: `npm run lint` → 0 errors / 44 warnings, exit 0"
---

# Phase 01: Build Hygiene Verification Report

**Phase Goal:** The production build enforces type safety and linting, so regressions are caught by the compiler instead of shipping to users
**Verified:** 2026-08-16T06:56:43Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

All gates were **re-executed by the verifier** (not trusted from SUMMARYs). Environment: Next.js 16.2.4.

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | SC-1: `npm run build` fails on any TypeScript error | ✓ VERIFIED | **Behavioral negative test**: injected a temp file with a type error (`lib/__ts_gate_probe.ts`, removed after) → `npm run build` exit **1** with `./lib/__ts_gate_probe.ts:1:7 Type error: Type 'string' is not assignable to type 'number'` after the in-build "Running TypeScript ..." phase. Clean build (without probe): exit 0, 19/19 pages. `next.config.ts` contains no `ignoreBuildErrors` (file is 7 lines: `output: "standalone"` only) |
| 2 | SC-2: `npm run build` fails on any ESLint violation | ✓ VERIFIED (intent — platform-adjusted; see Ruling) | Literal mechanism **does not exist on Next 16**: verifier reproduced `npx next lint` → `Invalid project directory provided, no such directory: .../dropitx-fe/lint`, and the `eslint` NextConfig key is gone (this was the pre-existing `'eslint' does not exist in type 'NextConfig'` TS error). Enforcement surface delivered: `npm run lint` (= `eslint`) → **0 errors**, 44 warnings, exit 0. Residual (no CI wiring) → Human Verification #2 |
| 3 | SC-3: No file in the repository contains `@ts-nocheck` | ✓ VERIFIED | Repo-wide scan over `*.{ts,tsx,js,jsx}` (excluding node_modules/.next/.planning prose) → zero matches. The plan-scoped gate (`app/ components/ lib/ hooks/ utils/ types/`) also empty. All 5 original files (team-invite-form, enhanced-invite-dialog, invite-accept-form, bulk-invite-dialog, team-rpc) are typed |
| 4 | SC-4: Dashboard team pages compile without `any[]` casts or eslint-disable comments on Supabase queries | ✓ VERIFIED | `grep -rE "as any\|: any\|eslint-disable"` over all 4 dashboard files → zero matches; `npm run typecheck` 0 errors repo-wide; teams/page.tsx read in full: query via typed `createAdminClient()` (`createServiceRoleClient<Database>`), rows mapped through Database-generic-inferred shapes. The one `m.role as TeamRole` is a typed-interface boundary cast (DB types role as text) — explicitly permitted by Plan 04 Task 2 action text |
| 5 | SC-5: Missing `NEXT_PUBLIC_API_URL` fails loudly — never silently routes to a dead tunnel URL | ✓ VERIFIED | `lib/api-client.ts:3-7`: module-load guard `if (!envApiUrl) throw new Error("NEXT_PUBLIC_API_URL is required...")` before any export is usable; zero `trycloudflare` matches repo-wide. Behavior class empirically demonstrated during the phase itself (the structurally identical Firebase module-load guard crashed `next build` at prerender until env vars were added — 01-04 checkpoint). Remaining `https://dropitx.com` fallbacks (5 sites) are the stable production domain for share/invite links, not ephemeral URLs |
| 6 | Plan-01: errors helper + team-rpc/token-security typed, lint-clean | ✓ VERIFIED | `lib/errors.ts` exports exactly `getErrorMessage(e: unknown): string`; team-rpc.ts: 0 `@ts-nocheck`, 0 `Promise<any>`, imports getErrorMessage (line 11); token-security.ts: 0 `catch (error: any)`, imports getErrorMessage (line 10); repo-wide tsc/eslint clean covers all three files |
| 7 | Plan-02: all 4 component files typed, lint-clean, no catch(err:any) | ✓ VERIFIED | Per-file: 0 `@ts-nocheck` in each; invite-accept-form + team-invite-form use `getErrorMessage`; both dialogs use the pre-existing `instanceof Error` pattern (Plan 02 Task 3 explicitly allowed keeping it). Repo-wide typecheck/lint green covers all 4 |
| 8 | Plan-03: Database types generated and threaded through Supabase factories | ✓ VERIFIED (with supersession note) | `types/database.generated.ts` exists (831 lines, exports `Database`). **Supersession:** `utils/supabase/client.ts` and `middleware.ts` were deleted mid-phase by the user's Firebase auth migration (commit `12ab719`, between Plans 03 and 04) — only `utils/supabase/server.ts` remains, and it threads `createServiceRoleClient<Database>`. All 4 dashboard consumers route through this typed factory, so HYG-04's intent (typed Supabase responses) holds via the sole surviving factory |
| 9 | Plan-03: api-client fail-fast, no tunnel fallback | ✓ VERIFIED | (folded into SC-5) |
| 10 | Plan-04: full gate suite green at HEAD | ✓ VERIFIED | Verifier re-ran: `npm run typecheck` exit 0 (0 errors); `npm run lint` exit 0 (0 errors / 44 warnings); `npm run build` exit 0 (19/19 pages, TypeScript phase present); all 4 grep-gates empty; `next.config.ts` free of `ignoreBuildErrors`/`ignoreDuringBuilds` |

**Score:** 10/10 truths verified (0 present, behavior-unverified)

### Ruling: HYG-02 intent vs literal text (dispatched decision)

**Literal text** — "ESLint enforced in production builds (`ignoreDuringBuilds` disabled)" / SC-2 "npm run build fails on any ESLint violation" — is **unimplementable on Next.js 16**: the platform removed build-time ESLint entirely (`next lint` subcommand gone; `eslint` NextConfig key removed from `NextConfig`). Verifier confirmed both facts by execution and by the phase's own pre-existing TS error on the old config key. No configuration, and no amount of additional work, can make `next build` run ESLint on this platform.

**Intent** — "regressions are caught by the compiler instead of shipping to users" — is satisfied at the only enforcement surface Next 16 offers, and the phase delivered it honestly:
- `npm run lint` gate exists, is deterministic, and reports **0 errors** (44 pre-existing warnings locked out of scope);
- AGENTS.md codifies "Lint and build must pass before pushing";
- the deviation is documented in 01-04-SUMMARY (decision 1 + deviation 4), not hidden.

**Residual risk requiring a human decision:** nothing automated runs lint before a production deploy — the repo has **no CI workflows, no vercel.json, no husky hooks** (verified). On Vercel/Dokploy, `next build` alone does not lint. So today ESLint enforcement is convention, not pipeline. Options: repair `check:hygiene` to `tsc --noEmit && eslint .` and rely on convention, or add a CI/build-command gate (see Human Verification #2). This residual — not the literal-vs-intent question — is why SC-2 carries a human item.

**Override suggestion** (to formalize the platform deviation):

```yaml
overrides:
  - must_have: "npm run build fails on any ESLint violation (ignoreDuringBuilds re-enabled to false)"
    reason: "Next.js 16 removed build-time ESLint entirely (next lint subcommand and eslint NextConfig key both gone) — the literal mechanism cannot exist on this platform version; enforcement delivered as the npm run lint gate (0 errors) per 01-04-SUMMARY"
    accepted_by: "{username}"
    accepted_at: "{ISO timestamp}"
```

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | 15 drifted Supabase RPC names + team_invites column drift (WINDOWS.md 1-2, 30 formerly-erroring sites now behind `lib/supabase-untyped.ts`) | Phase 01.1 / cross-repo (dropitx-api/) | 01-04-SUMMARY `affects:` + WINDOWS.md open entries; boundary file documents the reconciliation path |
| 2 | 44 pre-existing ESLint warnings | Later cleanup (locked out-of-scope) | 01-04-SUMMARY key-decisions; verified live 44 warnings / 0 errors |
| 3 | Review warnings WR-02..WR-10 (latent bugs in dead invite/upload components, fabricated analytics deltas WR-09, editor autosave clobber WR-03, etc.) | Phase 01.1+ / backlog | 01-REVIEW.md (0 critical / 10 warnings / 10 info) — advisory, none touch Phase 01 must-haves |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/errors.ts` | exports `getErrorMessage(e: unknown): string` | ✓ VERIFIED | 6 lines, single export, deterministic (instanceof Error → message, else String(e)) |
| `lib/team-rpc.ts` | no @ts-nocheck, no Promise<any>, typed returns | ✓ VERIFIED | all three greps 0; getErrorMessage imported and used |
| `lib/token-security.ts` | no catch (error: any) | ✓ VERIFIED | 0 matches; getErrorMessage imported |
| `package.json` | typecheck script | ✓ VERIFIED | `typecheck = tsc --noEmit` (runnable, exit 0) |
| `types/database.generated.ts` | Database interface from live project | ✓ VERIFIED | 831 lines, `export type Database` present, header documents regeneration |
| `utils/supabase/server.ts` | typed factory | ✓ VERIFIED | `createServiceRoleClient<Database>` (line 11) + `import type { Database }` (line 2) |
| `utils/supabase/client.ts`, `utils/supabase/middleware.ts` | typed factories | ⊘ SUPERSEDED | Deleted by mid-phase Firebase auth migration (`12ab719`) — not a phase failure; Plan 03 self-check verified them at execution time. Sole remaining factory is typed; all dashboard queries flow through it |
| `lib/api-client.ts` | fail-fast, no tunnel URL | ✓ VERIFIED | throw guard lines 3-7; 0 trycloudflare matches |
| `lib/supabase-untyped.ts` | drift containment boundary | ✓ VERIFIED | Documented header referencing deferred-items.md; `unknown` results, `{message}\|null` errors; imported by exactly team-rpc.ts + token-security.ts (intended consumers); 0 `as any` inside |
| 4 component files | no @ts-nocheck | ✓ VERIFIED | per-file grep 0 |
| 4 dashboard files | no any-casts / eslint-disable | ✓ VERIFIED | grep 0; typecheck 0 errors |
| `next.config.ts` | no ignoreBuildErrors/ignoreDuringBuilds | ✓ VERIFIED | 7-line file, `output: "standalone"` only |
| `check:hygiene` script | combined TS+lint gate | ⚠️ BROKEN (WR-01) | `tsc --noEmit && next lint` — `next lint` removed in Next 16; verifier ran `npm run check:hygiene` → exit 1 at the lint stage. Fails closed (never silently passes) but is unusable as written. Not a must_haves artifact (only `typecheck` is) → warning + Human Verification #2 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `lib/team-rpc.ts` | `lib/errors.ts` | `import { getErrorMessage } from "@/lib/errors"` | ✓ WIRED | line 11; used at 407/453/487+ |
| `lib/token-security.ts` | `lib/errors.ts` | same import | ✓ WIRED | line 10; used at 303/359 |
| 4 components | `lib/errors.ts` | getErrorMessage import (where catch blocks read error messages) | ✓ WIRED | 2 components import getErrorMessage; 2 dialogs keep the plan-sanctioned `instanceof Error` pattern — Plan 02 key_link wording ("where they access error messages") and Task 3 action explicitly permit this |
| 4 components | `lib/team-rpc.ts` | typed return consumption | ✓ WIRED | typecheck 0 errors proves the contracts line up |
| `utils/supabase/server.ts` | `types/database.generated.ts` | `import type { Database }` | ✓ WIRED | line 2 |
| `lib/api-client.ts` | build env | module-load throw before any export usable | ✓ WIRED | guard precedes all exports |
| Dashboard files | typed factory | `createAdminClient()` + typed `.from().select()` | ✓ WIRED | all 4 import from `@/utils/supabase/server`; no `as any[]` |
| `team-rpc`/`token-security` drifted calls | `lib/supabase-untyped.ts` | untypedRpc/untypedFrom | ✓ WIRED | both files import it; boundary is the only untyped escape hatch |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| dashboard/teams/page.tsx | `memberships` | `admin.from("team_members").select("role, teams(...)").eq("user_id", user.uid)` | Yes — live Supabase query, mapped to `TeamWithRole[]` and rendered | ✓ FLOWING |
| dashboard/layout.tsx, page.tsx, teams/[slug]/page.tsx | membership/share/event queries | typed `createAdminClient()` queries | Yes — same pattern; typecheck-clean against Database generic | ✓ FLOWING |

(WR-09 notes some *decorative deltas* on dashboard/page.tsx are hardcoded ("+18.2% this week") — flagged in the review as pre-existing UI integrity debt; the underlying share/view counts themselves are real query data.)

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build fails on a TS error (SC-1) | temp probe file with type error → `npm run build` | exit 1, `Type error: Type 'string' is not assignable to type 'number'` at the probe, after "Running TypeScript ..." | ✓ PASS |
| Clean build (authoritative gate) | `npm run build` | exit 0, 19/19 pages generated | ✓ PASS |
| TypeScript gate | `npm run typecheck` | exit 0, zero errors | ✓ PASS |
| ESLint gate | `npm run lint` | exit 0, **0 errors** / 44 warnings | ✓ PASS |
| `next lint` removed on Next 16 (platform fact) | `npx next lint` | `Invalid project directory ... /lint` | ✓ CONFIRMED |
| `check:hygiene` usable (WR-01) | `npm run check:hygiene` | exit 1 at `next lint` stage | ✗ FAIL (fails closed; see WR-01 / Human #2) |
| Probe cleanup / state restored | `rm lib/__ts_gate_probe.ts && git status --porcelain` | probe gone; only pre-existing untracked `.gsd/`, `.planning/config.json` remain | ✓ PASS |

### Probe Execution

Step 7c: SKIPPED — no `scripts/*/tests/probe-*.sh` declared by any PLAN/SUMMARY and this is not a migration/tooling phase; gates above were executed directly instead.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|---------------------|----------|
| HYG-01 | 01-01, 01-02, 01-04 | TS type checking enforced in production builds | ✓ SATISFIED | Negative test proves in-build TS failure; config clean; build exit 0 |
| HYG-02 | 01-01, 01-02, 01-04 | ESLint enforced in production builds | ✓ SATISFIED (platform-adjusted intent; residual → Human #2) | Next 16 platform impossibility verified; `npm run lint` 0 errors is the delivered surface; no CI wiring yet |
| HYG-03 | 01-01, 01-02 | Zero @ts-nocheck in codebase | ✓ SATISFIED | repo-wide grep empty; all 5 original files typed |
| HYG-04 | 01-03, 01-04 | Dashboard queries use typed Supabase responses | ✓ SATISFIED | 0 eslint-disable/no-explicit-any/any-casts in app/(dashboard); typecheck 0 errors through the Database generic |
| HYG-05 | 01-03 | No ephemeral/hardcoded URLs in production defaults (tunnel removed) | ✓ SATISFIED (code level) — human deploy-confirm pending | 0 trycloudflare repo-wide; module-load throw present; REQUIREMENTS.md still shows `[ ] Pending` — consistent with the pending Vercel/Dokploy env confirmation (Human #1); the requirement text itself is code-scoped and done |

Orphaned requirements: none — REQUIREMENTS.md maps exactly HYG-01..05 to Phase 1 and every ID appears in plan frontmatter (P1/P2: HYG-01,02,03; P3: HYG-04,05; P4: HYG-01,02,04).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| package.json | 11 (`check:hygiene`) | invokes removed `next lint` — script can never succeed | ⚠️ Warning | Phase-introduced convenience gate broken; fails closed so nothing ships past it silently, but unusable (WR-01; Human #2) |
| lib/team-rpc.ts, lib/token-security.ts | via boundary | untyped RPC escape hatch | ℹ️ Info | Deliberate, documented, contained in one auditable file; WINDOWS.md 1-2 track reconciliation |
| dashboard/page.tsx | 79-115 | hardcoded decorative analytics deltas (WR-09) | ⚠️ Warning (advisory) | Pre-existing UI integrity debt, out of phase scope; real counts are query-backed |

Debt markers: zero `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` in all 15 phase-modified files scanned. All 19 documented task commits (038f1f6 … 53b711d) exist in git history.

### Human Verification Required

### 1. Production deploy environment check (blocking for next deploy)

**Test:** Confirm `NEXT_PUBLIC_API_URL` **and** all 6 `NEXT_PUBLIC_FIREBASE_*` vars exist in the production build environment (Vercel Project Settings → Environment Variables → Production; note commit `12ab719` also added a Dockerfile for Dokploy — confirm whichever target is live), then trigger one production deploy.
**Expected:** Build completes; `/dashboard/analytics` prerenders without a module-load throw.
**Why human:** Deployment-environment fact, unreadable from the repo. `lib/api-client.ts:3-7` and the Firebase client init throw at module load during prerender — the phase already hit this failure class locally.

### 2. HYG-02 enforcement-surface decision (escalated)

**Test:** Choose: (a) accept `npm run lint` + push convention as the ESLint gate and repair `check:hygiene` to `tsc --noEmit && eslint .`, or (b) add automated pre-deploy lint enforcement (GitHub Actions / Vercel build command override).
**Expected:** A working, documented gate; ideally an accepted `overrides:` entry (suggested above) for the SC-2 literal text.
**Why human:** In-build ESLint cannot exist on Next 16 (verified); repo currently has no CI/vercel.json/husky, so lint-before-deploy is convention only.

### 3. Advisory review findings triage

**Test:** Acknowledge 01-REVIEW.md (0 critical / 10 warnings / 10 info) — especially WR-04 (dead components importing service-role client + Node crypto into `"use client"` files — an AGENTS.md violation waiting for the first importer), WR-02 (EncryptionToggle infinite retry), WR-03 (dueling autosaves), WR-09 (fabricated analytics).
**Expected:** Findings routed to Phase 01.1+/backlog.
**Why human:** Advisory, pre-existing, outside Phase 01 must-haves; prioritization is a product decision.

### Gaps Summary

No gaps. Every must-have truth, artifact, and key link verified against HEAD — including a behavioral negative test proving the production build fails closed on TypeScript errors. The two judgment calls, both resolving in the phase's favor on documented evidence: (1) HYG-02's literal text is a Next 16 platform impossibility, delivered instead as a green separate lint gate with an honest paper trail — with a real residual (no automated pre-deploy lint wiring) escalated for human decision; (2) two of the three Plan-03 Supabase factories were deleted by the user's own mid-phase Firebase migration, and the sole surviving factory carries the Database generic that all dashboard queries flow through. The verifier's negative-test probe was removed and git state confirmed clean afterward.

---

_Verified: 2026-08-16T06:56:43Z_
_Verifier: the agent (gsd-verifier)_
