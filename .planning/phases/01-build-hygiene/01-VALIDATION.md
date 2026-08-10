---
phase: 1
slug: build-hygiene
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-10
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler (tsc) + ESLint (next/core-web-vitals) |
| **Config file** | `tsconfig.json`, `next.config.ts` |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd-verify-work`:** `npm run build` must pass with zero errors
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | HYG-01 | — | N/A | build | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 1-01-02 | 01 | 1 | HYG-03 | — | N/A | source | `grep -r '@ts-nocheck' app/ lib/ components/` returns 0 | ✅ | ⬜ pending |
| 1-01-03 | 01 | 1 | HYG-04 | — | N/A | build | `npx tsc --noEmit` (dashboard pages) | ✅ | ⬜ pending |
| 1-01-04 | 01 | 2 | HYG-05 | — | Missing env var fails loudly | runtime | `NEXT_PUBLIC_API_URL= node -e "require('./lib/api-client')"` throws | ✅ | ⬜ pending |
| 1-01-05 | 01 | 2 | HYG-02 | — | N/A | build | `npm run build` passes ESLint | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` — add `"typecheck": "tsc --noEmit"` script
- [ ] `package.json` — add `"check:hygiene": "tsc --noEmit && next lint"` script

*Existing infrastructure (tsc, ESLint, next build) covers all phase requirements once re-enabled.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| NEXT_PUBLIC_API_URL set in Vercel Production | HYG-05 | Deployment env — not visible from code | Confirm in Vercel Project Settings → Environment Variables that `NEXT_PUBLIC_API_URL` is set for Production |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
