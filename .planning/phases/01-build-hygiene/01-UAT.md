---
status: testing
phase: 01-build-hygiene
source: [01-VERIFICATION.md]
started: 2026-08-16T07:05:00Z
updated: 2026-08-16T07:05:00Z
---

## Current Test

number: 2
name: HYG-02 enforcement surface decision (Next 16)
expected: |
  Either (a) accept `npm run lint` (currently 0 errors) + push convention as the
  gate and repair the broken `check:hygiene` script to `tsc --noEmit && eslint .`,
  or (b) wire ESLint into an automated pre-deploy pipeline (GitHub Actions /
  Vercel build command). Next 16 removed build-time ESLint — in-build enforcement
  is a platform impossibility, not an implementation gap.
awaiting: user response

## Tests

### 1. Production deploy environment check
expected: Vercel/Dokploy Production defines `NEXT_PUBLIC_API_URL` and all 6 `NEXT_PUBLIC_FIREBASE_*` vars; a triggered production build completes (module-load guards in `lib/api-client.ts` and `lib/firebase/client.ts` crash the prerender otherwise).
result: blocked
blocked_by: third-party
reason: "Agent check: last production deployment is 2026-07-20 (7e0309f, predates Firebase migration 12ab719 pushed Aug 15 — never deployed); Phase 01's 20 commits unpushed; Vercel CLI has no credentials so production env vars could not be read. Deploy + env confirmation pending user action."

### 2. HYG-02 enforcement surface decision (Next 16)
expected: Either (a) accept `npm run lint` (currently 0 errors) + push convention as the gate and repair the broken `check:hygiene` script to `tsc --noEmit && eslint .`, or (b) wire ESLint into an automated pre-deploy pipeline (GitHub Actions / Vercel build command). Next 16 removed build-time ESLint — in-build enforcement is a platform impossibility, not an implementation gap.
result: [pending]

### 3. Review findings triage acknowledgment
expected: The 10 advisory warnings in 01-REVIEW.md (WR-01..WR-10) are acknowledged and routed to later phases — especially WR-04 (dead invite components import the service-role client + Node crypto into "use client" files) and WR-09 (fabricated analytics deltas on the dashboard). None block Phase 01's goal.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 1

## Gaps
