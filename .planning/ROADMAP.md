# Roadmap: DropItX

## Overview

DropItX is feature-complete at v2.5.0 but not hardened. This milestone closes the gap between "feature-complete" and "production-hardened": restore build integrity, establish test coverage, close security gaps, wire the three UI-only features to their backends, and add the observability needed to run with confidence. Each phase builds on the last — you cannot secure or extend code the compiler cannot check.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Build Hygiene** - Restore type safety and lint enforcement so the compiler catches regressions
- [ ] **Phase 2: Testing Foundation** - Establish unit and E2E test infrastructure covering critical security modules
- [ ] **Phase 3: Security Hardening** - Close CSP, credential, sandbox, and silent-failure gaps
- [ ] **Phase 4: Feature Completion** - Wire comments, version history, multi-file, QR, and custom expiration backends
- [ ] **Phase 5: Observability** - Add error monitoring, structured logging, perf tracking, and loading states

## Phase Details

### Phase 1: Build Hygiene
**Goal**: The production build enforces type safety and linting, so regressions are caught by the compiler instead of shipping to users
**Depends on**: Nothing (first phase — the build pipeline is broken and blocks confident work on everything else)
**Requirements**: HYG-01, HYG-02, HYG-03, HYG-04, HYG-05
**Success Criteria** (what must be TRUE):
  1. `npm run build` fails on any TypeScript error (ignoreBuildErrors re-enabled to false)
  2. `npm run build` fails on any ESLint violation (ignoreDuringBuilds re-enabled to false)
  3. No file in the repository contains `@ts-nocheck` (all 5 files typed: team-invite-form, enhanced-invite-dialog, invite-accept-form, bulk-invite-dialog, team-rpc)
  4. Dashboard team pages compile without `any[]` casts or eslint-disable comments on Supabase queries
  5. A missing `NEXT_PUBLIC_API_URL` fails loudly at build or runtime — never silently routes to a dead tunnel URL
**Plans**: 4 plans
- [ ] 01-01-PLAN.md — Remove @ts-nocheck from team-rpc.ts (shared dependency) + create errors helper + narrow token-security catches
- [ ] 01-02-PLAN.md — Remove @ts-nocheck from 4 team component files + narrow all catch blocks
- [ ] 01-03-PLAN.md — Generate Supabase Database types + thread generic through client factories + replace tunnel URL with fail-fast
- [ ] 01-04-PLAN.md — Type dashboard queries (remove any-casts) + flip build config flags as final gate

### Phase 2: Testing Foundation
**Goal**: Critical code paths are protected by automated tests, so changes can be made and shipped with confidence
**Depends on**: Phase 1 (type safety must be restored before tests can assert typed contracts)
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. `npm test` runs the Vitest unit suite and passes
  2. `npm run e2e` runs the Playwright suite and passes
  3. AES-256-GCM encryption round-trips, HMAC cookie sign/verify, API auth header injection + 401 retry, and team RPC calls are covered by passing tests
  4. A coverage threshold gate blocks work that drops critical-module coverage below the configured floor
**Plans**: TBD

### Phase 3: Security Hardening
**Goal**: The application defends against script injection, credential misuse, and silent failures
**Depends on**: Phase 2 (security fixes must be verified by tests, especially on the modules Phase 2 covered)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06
**Success Criteria** (what must be TRUE):
  1. The browser receives a Content-Security-Policy header restricting script, style, and connect sources
  2. A missing `SHARE_ACCESS_SECRET` prevents startup — no silent fallback to the service role key
  3. User-uploaded HTML rendered in the iframe cannot execute eval-based scripts (unsafe-eval removed from CSP)
  4. A backend failure (e.g., Supabase unreachable) shows a branded error state instead of the raw Next.js error page
  5. Critical user actions — invite acceptance, password unlock, comment posting — surface errors to the user instead of silently failing
**Plans**: TBD

### Phase 4: Feature Completion
**Goal**: UI-complete features are fully functional end-to-end, not just rendered shells
**Depends on**: Phase 1 (typed foundation for new RPC/contract code) and Phase 3 (new persistence adds attack surface that must sit on a hardened base)
**Requirements**: FEAT-01, FEAT-02, FEAT-03, FEAT-04, FEAT-05
**Success Criteria** (what must be TRUE):
  1. A user can post a comment on a share and see it persist across sessions and reloads
  2. A user can view the revision history of a share and restore a previous version
  3. A user can upload and organize multiple files within a single share
  4. A user can generate and download a QR code for any share link
  5. A user can set a custom expiration date on a share beyond the preset options
**Plans**: TBD

### Phase 5: Observability
**Goal**: The team can see what is happening in production and users see responsive loading states instead of blank screens
**Depends on**: Phase 4 (features must be complete before instrumenting them; loading states wrap the final page shapes)
**Requirements**: OBS-01, OBS-02, OBS-03, OBS-04, OBS-05
**Success Criteria** (what must be TRUE):
  1. Frontend exceptions appear in an error monitoring dashboard (Sentry or Datadog)
  2. Requests carry a request_id correlatable across structured logs
  3. A performance dashboard tracks Lighthouse scores and Core Web Vitals over time
  4. Slow-loading dashboard and share pages show skeleton or loading states instead of blank screens
  5. A user with hundreds of shares sees paginated results, not an unbounded load
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Build Hygiene | 0/4 | Planned | - |
| 2. Testing Foundation | 0/0 | Not started | - |
| 3. Security Hardening | 0/0 | Not started | - |
| 4. Feature Completion | 0/0 | Not started | - |
| 5. Observability | 0/0 | Not started | - |
