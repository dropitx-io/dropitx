# Requirements: DropItX

**Defined:** 2026-08-10
**Core Value:** Users can share content securely via a link in seconds, with full control over who sees it and for how long.

## Validated Requirements (Shipped v2.5.0)

These are confirmed working in production. Listed for traceability; not in active roadmap scope.

- [x] **FR1**: Accept .html/.htm/.md file uploads via drag-and-drop up to 50 MB with progress feedback
- [x] **FR2**: Create shares from Markdown via CodeMirror editor with split-pane preview, custom slug, is_private flag, auto-draft, image drag-and-drop
- [x] **FR3**: Generate unique readable slugs (nanoid); custom slugs as handle/slug; delete tokens for uploads
- [x] **FR4**: Display HTML content in sandboxed iframe with CSP
- [x] **FR5**: Render Markdown with GFM and syntax highlighting (Shiki)
- [x] **FR6**: Accept PNG/JPG/GIF/WebP image uploads up to 5 MB for inline editor use
- [x] **FR7**: Full-text search with pagination (10 results/page), private shares filtered for non-owners
- [x] **FR8**: Track filename, file size, MIME type, view count, source metadata
- [x] **FR9**: Automatic deletion after 30 days (configurable presets shipped)
- [x] **FR10**: Token-based deletion, RLS on all tables, API key auth (SHA-256 hash, no plaintext)
- [x] **FR11**: is_private shares hidden from search and return 403 on /s/[slug] for non-owners
- [x] **FR12**: Generate, list, revoke API keys; SHA-256 hash only; last_used_at updated on auth

## v1 Requirements

Active milestone scope. Each maps to exactly one roadmap phase.

### Build Hygiene

- [ ] **HYG-01**: TypeScript type checking enforced in production builds (ignoreBuildErrors disabled, all errors resolved)
- [ ] **HYG-02**: ESLint enforced in production builds (ignoreDuringBuilds disabled)
- [x] **HYG-03**: Zero @ts-nocheck directives in codebase (5 files currently: team-invite-form, enhanced-invite-dialog, invite-accept-form, bulk-invite-dialog, team-rpc)
- [ ] **HYG-04**: Dashboard queries use typed Supabase responses (no any casts with eslint-disable)
- [ ] **HYG-05**: No ephemeral/hardcoded URLs in production code defaults (Cloudflare tunnel fallback removed)

### Testing

- [ ] **TEST-01**: Vitest configured for unit testing with runnable config and scripts
- [ ] **TEST-02**: Playwright configured for E2E testing with runnable config and scripts
- [ ] **TEST-03**: Critical security modules tested — crypto.ts (AES round-trips), share-access-cookie.ts (HMAC sign/verify), api-client.ts (auth header + 401 retry), team-rpc.ts
- [ ] **TEST-04**: Test coverage threshold enforced as CI/build gate on critical paths

### Security

- [ ] **SEC-01**: Content-Security-Policy header set in middleware (script/style/connect sources restricted)
- [ ] **SEC-02**: SHARE_ACCESS_SECRET required with no service role key fallback (fail-fast if missing)
- [ ] **SEC-03**: iframe sandbox tightened — unsafe-eval removed from HtmlViewer CSP
- [ ] **SEC-04**: Layout-level error boundary for graceful degradation when backend services fail
- [ ] **SEC-05**: Errors surfaced to users on critical paths (no empty catch blocks on invite acceptance, password gates, share access, comment posting)
- [ ] **SEC-06**: Cookie domain configurable via NEXT_PUBLIC_COOKIE_DOMAIN env var

### Feature Completion (backend wiring)

- [ ] **FEAT-01**: Comments backend persistence wired (share_comments table + RLS + API) — frontend UI exists
- [ ] **FEAT-02**: Version history backend wired (share_revisions table + restore logic) — frontend UI exists
- [ ] **FEAT-03**: Multi-file backend support wired (share_files table + file organization) — frontend UI exists
- [ ] **FEAT-04**: QR code endpoint verified functional (/api/qr/{slug} returns image)
- [ ] **FEAT-05**: Custom expiration dates beyond default presets (user-selectable, not just presets)

### Observability

- [ ] **OBS-01**: Error monitoring integrated (Sentry or Datadog) capturing frontend exceptions
- [ ] **OBS-02**: Structured JSON logging available (request_id correlation)
- [ ] **OBS-03**: Performance dashboard tracking Lighthouse CI and Core Web Vitals
- [ ] **OBS-04**: Loading states for slow server components (Suspense boundaries on dashboard and share pages)
- [ ] **OBS-05**: Dashboard query pagination (no unbounded Supabase fetches; infinite scroll or cursor pagination)

## v2 Requirements

Deferred to future milestones (2027 enterprise/growth phase).

### Enterprise

- **ENT-01**: White-label / custom domain support
- **ENT-02**: SSO via SAML/OIDC
- **ENT-03**: Advanced team permissions (read-only, comment-only, admin roles)
- **ENT-04**: Audit logs with GDPR data deletion
- **ENT-05**: API rate-limit tiers

### Growth

- **GRW-01**: Monetization tiers (free / team-pro / enterprise)
- **GRW-02**: Usage-based billing
- **GRW-03**: Mobile apps or PWA
- **GRW-04**: Developer docs and SDKs
- **GRW-05**: Share templates
- **GRW-06**: Email notifications
- **GRW-07**: Share activity feed

### Hardening (post-internal)

- **HRD-01**: Third-party security audit
- **HRD-02**: Penetration testing
- **HRD-03**: GDPR/CCPA compliance audit
- **HRD-04**: DB query optimization and CDN cache refinement

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time collaboration editing | Out of core sharing value; high complexity |
| Video uploads | Storage/bandwidth cost; not core to HTML/markdown sharing |
| Rewriting the FastAPI backend | Backend is in sibling repo; this roadmap tracks frontend integration only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HYG-01 | Phase 1 | Pending |
| HYG-02 | Phase 1 | Pending |
| HYG-03 | Phase 1 | Complete |
| HYG-04 | Phase 1 | Pending |
| HYG-05 | Phase 1 | Pending |
| TEST-01 | Phase 2 | Pending |
| TEST-02 | Phase 2 | Pending |
| TEST-03 | Phase 2 | Pending |
| TEST-04 | Phase 2 | Pending |
| SEC-01 | Phase 3 | Pending |
| SEC-02 | Phase 3 | Pending |
| SEC-03 | Phase 3 | Pending |
| SEC-04 | Phase 3 | Pending |
| SEC-05 | Phase 3 | Pending |
| SEC-06 | Phase 3 | Pending |
| FEAT-01 | Phase 4 | Pending |
| FEAT-02 | Phase 4 | Pending |
| FEAT-03 | Phase 4 | Pending |
| FEAT-04 | Phase 4 | Pending |
| FEAT-05 | Phase 4 | Pending |
| OBS-01 | Phase 5 | Pending |
| OBS-02 | Phase 5 | Pending |
| OBS-03 | Phase 5 | Pending |
| OBS-04 | Phase 5 | Pending |
| OBS-05 | Phase 5 | Pending |

**Coverage:**

- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0

---
*Requirements defined: 2026-08-10*
*Last updated: 2026-08-10 after initial definition (new-project-from-ingest)*
