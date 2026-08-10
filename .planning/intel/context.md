# Context (DOCs)

> Running notes keyed by topic, synthesized from classified DOCs. Each block is
> attributed with `- source:`. DOC is lowest precedence (ADR > SPEC > PRD > DOC);
> where a DOC contradicts a SPEC/PRD, the higher-precedence source wins (see
> INGEST-CONFLICTS.md). DOC content here is preserved verbatim-by-topic for
> downstream roadmapper context.

## Project status & versioning

- source: docs/project-changelog.md
- DropItX changelog v1.0.0 (2026-04-23) through v2.5.0 (2026-07-18). Product started as "ShareHTML" (v1.3.0 rebrand ShareHTML → DropItX, violet identity), then Orange design system (v2.4.0, 2026-05-24), then Clay design system (v2.5.0, 2026-07-18). v2.3.0 (2026-05-02) migrated all 24 Next.js API route handlers (~2,400 lines) to FastAPI; Next.js became pure frontend (only `/api/og-image` retained). v2.5.0 added E2E encryption (AES-256-GCM, `lib/crypto.ts`, key in URL fragment) and burn-after-reading.

## Design system history

- source: docs/project-changelog.md
- Design system evolution: Blue accent (v1.0.0) → violet/electric-violet OKLCH (v1.3.0 rebrand) → Orange `#FF5701` + Playfair Display + warm gray (v2.4.0) → Clay warm cream `#f7eee6` + terracotta accent (v2.5.0). v2.4.0 removed all hardcoded `#a855f7` violet and `bg-purple-500` classes; zero violet/purple references remained at that point. NOTE: v2.5.0 changelog lists Clay primary/terracotta accent as `#b46a46`; the live Clay token (per docs/design-guidelines.md SPEC and the 2026-07-19 WCAG journal) is `#9a5b3c` after the WCAG AA contrast fix — SPEC/journal win over this DOC value.

## Security & lifecycle features (shipped)

- source: docs/project-changelog.md
- v1.2.0 (2026-04-25): password protection — bcryptjs `shares.password_hash`; HMAC-SHA256 signed HttpOnly access cookie (24h) via `SHARE_ACCESS_SECRET`; rate limit fail-closed (503 if Redis down); layered view gate on `/s/[slug]`; CLI `-P/--password` flag. v2.0.0 (2026-04-26): oEmbed API, analytics system (`analytics_events`), team workspaces with RLS. v2.0.1 (2026-04-28): RLS policy hardening (fixed infinite recursion in team member policies; `anon` → `authenticated` role migration). v2.5.0: E2E encryption + burn-after-reading.

## Team invite system (shipped)

- source: docs/project-changelog.md
- v2.2.0 (2026-04-29): enhanced team invite — role selection, email validation, bulk invite with progress tracking, invite resend, accept flow, team RPC client (`lib/team-rpc.ts`), token security (`lib/token-security.ts`), new UI primitives (dialog, select, textarea, alert, skeleton), new hooks (use-email-validation, use-team, use-toast). v2.2.1 (2026-04-29): invite accept UI, decline RPC, notification bell with auto-refresh, auto-signup accept flow for unauthenticated users.

## Advanced features — undocumented / UI-only (from roadmap)

- source: docs/project-roadmap.md
- Several features are UI-ready in code but were not clearly documented in the changelog: End-to-End Encryption (complete), Burn-After-Reading (complete), Configurable Expiration (complete), Version History (UI complete — backend support needs verification), Multi-File Support (UI complete — backend support needs verification), Comments/Discussion (UI complete — backend persistence not yet wired), QR Code Generation (complete — calls `/api/qr/{slug}`). See INGEST-CONFLICTS.md WARNING: overview PRD lists comments/version-history/multi-file as complete core features; roadmap marks them UI-only/incomplete.

## Known gaps & limitations

- source: docs/project-roadmap.md
- Critical: (1) Zero test suite (0% coverage) — P0 before enterprise. (2) Missing observability — no Sentry/Datadog, no structured logging/alerting, no perf dashboards — P1. (3) Incomplete backend wiring — comments persistence not connected, version history revision tracking incomplete, multi-file backend unclear — P1.

## Success metrics (current)

- source: docs/project-overview-pdr.md
- Performance: page load <2s; search <500ms. Reliability: upload success >99%; error rate <1%. Engagement: 1,000 DAU; 500 uploads/day.

## Success metrics (MVP + scaling, roadmap)

- source: docs/project-roadmap.md
- Current: uptime >99.9% (not measured); FCP <1.5s (~1.2s actual); API response <500ms (achieved); error rate <0.5% (unknown — needs monitoring); code coverage >80% (0% — critical gap). Scaling targets: Year 1 1,000 DAU / ~15,000 monthly uploads; Year 2 10,000 DAU / ~150,000 monthly uploads / ARR $50k+. Page load <2s Y1 → <1.5s Y2. Uptime >99.5% Y1 → >99.9% Y2.

## Risk assessment

- source: docs/project-overview-pdr.md
- Upstash availability → monitor health, graceful degradation allows requests through. Storage cost growth → usage monitoring, expiration cleanup. XSS in HTML rendering → rigorous CSP, sandboxed iframe. API key compromise → hashes only stored, instant revocation via `revoked_at`. Abuse/spam → rate limiting, content moderation roadmap.

## Risk assessment (expanded, roadmap)

- source: docs/project-roadmap.md
- Supabase outage → fallback RLS→app-layer, regular DR tests. Security breach (API key leak) → soft revocation, hash-only, audit logs. Performance degradation at scale → DB profiling, Lighthouse CI, load tests. Lack of tests → regression bugs (HIGH likelihood) → P0 build test suite. GDPR compliance violation → data deletion + privacy policy update. Solo-dev absence → improve docs + runbooks.

## Execution strategy

- source: docs/project-roadmap.md
- Ship value incrementally — no complete redesigns; no abandoned features (finish comments, version history); measure impact (A/B tests + monitoring). ~2-week sprints (solo dev); minor releases every 2 weeks, major every 6–8 weeks; docs updated in-sync. Quality gates: manual QA on Chrome/Firefox/Safari/Edge before shipping; Lighthouse >90 + zero a11y violations before major; 1-week staging + monitoring dashboard before public.

## Investment priorities

- source: docs/project-roadmap.md
- High value (start now): test suite; observability; complete backend wiring. Medium (Q4 2026): performance optimization; team/enterprise features; developer documentation. Lower (2027+): mobile apps (PWA may suffice); white-label (only if enterprise demand); advanced analytics.

## Environment variables (referenced across changelog)

- source: docs/project-changelog.md
- `NEXT_PUBLIC_API_URL` (FastAPI base, v2.3.0). `SHARE_ACCESS_SECRET` (HMAC cookie signing, v1.2.0). `ANALYTICS_SECRET` (analytics signing, v2.0.0). `EMBED_ALLOWED_DOMAINS` (oEmbed domain allowlist, v2.0.0).

## Plan: 8 missing features (implementation plan)

- source: docs/plans/2026-05-30-missing-features.md
- Implementation plan for 8 competitive features vs Pastebin/PrivateBin/Gist, split across two agents. Agent 1 (Security & Lifecycle): (1) E2E encryption — `lib/crypto.ts` Web Crypto API, AES-256-GCM, key in URL fragment, `encrypted`/`encryption_iv`/`encryption_salt` columns; (2) Expiration/auto-delete — presets 5min..forever, `delete_expired_shares()` pg_cron; (3) Burn-after-reading — `burn_after_reading` column, atomic serve-then-delete; (4) Version history — `share_revisions` table, GET revisions + POST restore. Agent 2 (Collaboration & UX): (5) Multi-file — `share_files` table, tabs + sidebar; (6) Comments — `share_comments` table, nested replies via `parent_id`; (7) QR codes — `/shares/{slug}/qr` via `qrcode` Python lib, cached; (8) Draft autosave — `lib/draft-storage.ts` localStorage, 2s debounce. NOTE: status per roadmap — encryption/burn/expiration complete; version history, multi-file, comments UI-only with backend unwired.

## Plan: tech trends & best practices upgrade

- source: docs/plans/2026-05-30-tech-trends-best-practices.md
- 11-task upgrade plan across FastAPI backend (Phase 1) and Next.js frontend (Phase 2). Backend: (1) structured JSON logging `core/logging_config.py` with `request_id` ContextVar; (2) request-tracking middleware `core/middleware.py` (`x-request-id`, `x-response-time`); (3) security headers middleware (CSP, HSTS, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy); (4) deep health check `/health/deep` verifying Supabase; (5) response caching headers (share `max-age=60 swr=300`; search `max-age=30 swr=60`; oEmbed `max-age=3600`); (6) global exception handler `core/exceptions.py` (`RateLimitError` 429, `ShareNotFoundError` 404, generic 500). Frontend: (7) Next.js middleware security headers; (8) React error boundary `components/error-boundary.tsx` wrapping app in `app/layout.tsx`; (9) Suspense boundaries + `dashboard/loading.tsx` skeleton; (10) API type safety via `openapi-typescript` from FastAPI OpenAPI spec → `lib/api-types.ts`; (11) rate-limit feedback UI (`RateLimitError` in `lib/api-client.ts`, toast component). NOTE: roadmap lists structured logging + error monitoring as P1 gaps (not yet done).

## Journal: Clay developers page & WCAG contrast fixes

- source: docs/journals/2026-07-19-clay-developers-page-wcag-fixes.md
- 2026-07-19 (High severity, Resolved). Shipped "For developers" teaser on landing + footer link + new `/developers` page (5 CLI commands + terminal mock). Discovered CLAUDE.md was stale — Clay design system was already live in production (commits 7d6cc17, ec5e67d, ebe4c40, 7fc9995), contradicting documented "dark mode + violet" architecture. Found systemic WCAG AA contrast failures in Clay tokens themselves (below 4.5:1); fixed mechanically via relative-luminance formula. Token fixes: `--muted-foreground` #7a6a60→#766860 (3.6→4.51:1); `--primary`/`--accent`/`--meta`/`--ring`/`--sidebar-primary` #b46a46→#9a5b3c (3.8→4.6:1); `--success` #4d8f5a→#468352 (3.9→4.52:1). Code review caught 2 issues: a11y regression in landing terminal mock (output line not `aria-hidden`) and hardcoded pre-fix hex values in `app/api/og-image/[slug]/route.tsx` + `app/(public)/embed/[slug]/page.tsx` (build-time/SSR can't read CSS custom properties). Lesson: cross-reference CLAUDE.md against `git log` before trusting documented architecture; WCAG contrast fixes need mechanical rigor (luminance formula + 4.5:1 min), applied as shared token fix. Next steps: docs-sync check in PR process; document WCAG token methodology in `docs/design-guidelines.md`; audit og-image/embed for other drifted hex values.
