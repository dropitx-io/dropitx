# DropItX

## What This Is

DropItX is a file and text sharing platform with team collaboration. Users upload HTML/Markdown files or author content in an in-browser Markdown editor, generate shareable links, and control access via privacy flags, passwords, expiration, and end-to-end encryption. Teams get shared workspaces with invite flows and role-based access. A Python CLI and REST API expose the same service to developers.

## Core Value

Users can share content securely via a link in seconds, with full control over who sees it and for how long.

## Business Context

- **Customer**: Individual developers and small teams who share code snippets, HTML demos, and documents
- **Revenue model**: Free tier today; planned team-pro ($10-20/mo) and enterprise tiers (2027)
- **Success metric**: 1,000 DAU / ~15,000 monthly uploads (Year 1 target)
- **Strategy notes**: See docs/project-roadmap.md for scaling and monetization direction

## Requirements

### Validated

Shipped and confirmed working in production (v2.5.0):

- [x] FR1: Accept .html/.htm/.md file uploads via drag-and-drop up to 50 MB
- [x] FR2: Create shares from Markdown via CodeMirror editor with split-pane preview, custom slug, is_private flag
- [x] FR3: Generate unique readable slugs (nanoid) with custom slug and delete token support
- [x] FR4: Display HTML content in sandboxed iframe with CSP
- [x] FR5: Render Markdown with GFM and syntax highlighting
- [x] FR6: Accept PNG/JPG/GIF/WebP image uploads up to 5 MB for inline editor use
- [x] FR7: Full-text search with pagination (10 results/page)
- [x] FR8: Track filename, file size, MIME type, view count, source metadata
- [x] FR9: Automatic deletion after 30 days (configurable presets shipped v2.5.0)
- [x] FR10: Token-based deletion, RLS on all tables, API key auth (SHA-256 hash stored)
- [x] FR11: is_private shares hidden from search and public listing for non-owners
- [x] FR12: Generate, list, revoke API keys; only SHA-256 hash persisted

### Active

Current milestone scope — hardening the feature-complete product and wiring incomplete backends:

- [ ] HYG-01: TypeScript type checking enforced in production builds
- [ ] HYG-02: ESLint enforced in production builds
- [ ] HYG-03: Zero @ts-nocheck directives in codebase
- [ ] HYG-04: Dashboard queries use typed Supabase responses (no any casts)
- [ ] HYG-05: No ephemeral/hardcoded URLs in production code defaults
- [ ] TEST-01: Vitest configured for unit testing
- [ ] TEST-02: Playwright configured for E2E testing
- [ ] TEST-03: Critical security modules tested (crypto, share-access-cookie, api-client, team-rpc)
- [ ] TEST-04: Test coverage threshold enforced as CI gate
- [ ] SEC-01: Content-Security-Policy header set in middleware
- [ ] SEC-02: SHARE_ACCESS_SECRET required with no service role key fallback
- [ ] SEC-03: iframe sandbox tightened (unsafe-eval removed from CSP)
- [ ] SEC-04: Layout-level error boundary for graceful degradation
- [ ] SEC-05: Errors surfaced to users on critical paths (no empty catch blocks)
- [ ] SEC-06: Cookie domain configurable via environment variable
- [ ] FEAT-01: Comments backend persistence wired with RLS protection
- [ ] FEAT-02: Version history backend wired (revision table + restore logic)
- [ ] FEAT-03: Multi-file backend support wired (file organization)
- [ ] FEAT-04: QR code endpoint verified (/api/qr/{slug})
- [ ] FEAT-05: Custom expiration dates beyond default presets
- [ ] OBS-01: Error monitoring integrated (Sentry or Datadog)
- [ ] OBS-02: Structured JSON logging
- [ ] OBS-03: Performance dashboard (Lighthouse CI, Core Web Vitals)
- [ ] OBS-04: Loading states for slow server components (Suspense boundaries)
- [ ] OBS-05: Dashboard query pagination (no unbounded fetches)

### Out of Scope

| Feature | Reason |
|---------|--------|
| Enterprise SSO (SAML/OIDC) | 2027 growth phase; no enterprise demand yet |
| White-label / custom domains | 2027 growth phase; only if enterprise demand materializes |
| Mobile native apps | PWA may suffice; deferred to 2027+ |
| Usage-based billing / monetization tiers | Premature before hardening and feature completion |
| Third-party security audit / penetration testing | External dependency; after internal hardening is complete |
| GDPR/CCPA compliance audit | Legal review needed; after data flows are stabilized |

## Context

**Version state**: Production is at v2.5.0 (2026-07-18) per the changelog (docs/project-changelog.md). The two PRDs (project-overview-pdr.md, project-roadmap.md) are dated snapshots at v1.4.1 and do not reflect the FastAPI migration (v2.3.0), team invites (v2.2.x), E2E encryption, or the Clay design system (v2.5.0). The changelog is the version source of truth.

**"Production ready" definition**: Feature-complete, not hardened. The core sharing workflow, editor, search, API keys, teams, encryption, and lifecycle features all work. Hardening (tests, observability, security audit) is the active roadmap.

**Disputed features**: Comments, version history, and multi-file support are UI-complete only. Their frontend components exist and render, but backend persistence and RPC wiring are not connected. These require explicit backend work (partially in sibling repo dropitx-api/).

**Architecture**: Next.js 16 (App Router) pure frontend on Vercel. FastAPI backend on Render (sibling repo dropitx-api/). Python CLI on PyPI (sibling repo dropitx-cli/). Supabase (Postgres + Storage + JWT auth). Upstash Redis for rate limiting.

**Known tech debt (codebase/CONCERNS.md)**:
- Build pipeline: next.config.ts disables typecheck and lint during builds (ignoreBuildErrors + ignoreDuringBuilds = true)
- Five files use @ts-nocheck totaling ~2,162 lines with zero type safety (team-invite-form, enhanced-invite-dialog, invite-accept-form, bulk-invite-dialog, team-rpc)
- Dashboard pages cast Supabase results to any[] instead of defining response types
- lib/api-client.ts falls back to an ephemeral Cloudflare tunnel URL when NEXT_PUBLIC_API_URL is unset
- Zero tests (no framework configured, no test files)
- Missing CSP header in middleware; service role key reused as HMAC fallback; hardcoded cookie domain
- 19 empty catch blocks silently swallow errors across share access, invite acceptance, password gates

## Constraints

- **Tech stack**: Next.js 16 App Router frontend (this repo), FastAPI backend (sibling), Python CLI (sibling) — all deployed independently. Frontend must remain a pure frontend (only /api/og-image retained).
- **Authentication**: Dual model — Supabase SSR JWT cookies for browsers, SHA-256 hashed API keys for programmatic access. Both must coexist.
- **Database**: Supabase Postgres with RLS on all tables. Schema changes via timestamped migrations only (never edit schema.sql directly). Public reads respect RLS; writes use service_role admin client server-side only.
- **Styling**: Tailwind CSS 4 with OKLCH color tokens in app/globals.css. Clay design system (terracotta #9a5b3c primary, warm cream #f7eee6 background). No CSS-in-JS. WCAG 2.1 AA contrast required.
- **Code standards**: TypeScript strict mode. Functional components under 200 lines. Server components by default; "use client" only when necessary. CodeMirror always via next/dynamic with ssr: false.
- **Cross-repo dependency**: Feature completion (Phase 4) requires coordinated changes in dropitx-api/ backend. This repo's roadmap tracks frontend wiring; backend work is tracked in the sibling repo.

## Key Decisions

SPEC-locked invariants (from system-architecture.md, code-standards.md, design-guidelines.md — treated as locked unless explicitly overturned):

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js as pure frontend; all API logic in FastAPI | Separation of concerns; Vercel-optimized frontend, Render backend | ✓ Good (v2.3.0 migration shipped) |
| Dual auth model (JWT Bearer + API key) | Browser sessions and programmatic access need different trust models | ✓ Good |
| Supabase client factory pattern (client/server/admin) | RLS enforcement boundary; admin client server-only | ✓ Good |
| Clay design system with WCAG AA tokens | Warm, accessible aesthetic; post-2026-07-19 contrast fixes | ✓ Good |
| AES-256-GCM client-side encryption with key in URL fragment | Server never sees plaintext; zero-knowledge sharing | ✓ Good (v2.5.0) |
| Migration-based schema changes only | Audit trail; no direct schema.sql edits for incremental changes | ✓ Good |
| CodeMirror via dynamic import (ssr: false) | Editor requires browser APIs; prevents hydration mismatches | ✓ Good |
| Conventional commits with no AI references | Clean history; matches repo convention | ✓ Good |

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Disable typecheck/lint in production build | Workaround for pre-existing TS errors blocking Vercel deploy | ⚠️ Revisit (Phase 1 re-enables) |
| Hardcode Cloudflare tunnel URL as API fallback | Local dev convenience leaked into production default | ⚠️ Revisit (Phase 1 removes) |

---
*Last updated: 2026-08-10 after project initialization (new-project-from-ingest)*
