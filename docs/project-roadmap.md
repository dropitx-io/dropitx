# DropItX - Project Roadmap

## Current Status

**Version**: 1.4.1 (released 2026-04-26)  
**Phase**: Production Ready — Core features complete, hardening phase in progress

**Platform note**: the frontend now reads and writes only through the FastAPI backend and signs in with Firebase. Supabase, Upstash and Vercel Analytics references in the phase history below describe the stack at the time each phase shipped.

---

## Shipped Features

### Phase 1: Core Functionality — COMPLETE ✅
**Nov–Dec 2024**
- HTML file upload with drag-and-drop
- Share link generation (nanoid slugs)
- Sandboxed HTML viewer with CSP headers
- Supabase schema with RLS policies
- File storage in Supabase Storage

### Phase 2: Enhanced Features — COMPLETE ✅
**Jan–Feb 2025**
- Full-text search with pagination (TSVECTOR + GIN + RPC)
- Rate limiting via Upstash Redis (10 req/min)
- Light/dark theme switching
- File metadata tracking
- 30-day automatic expiration
- Delete token-based authorization

### Phase 2.5: Upload & Markdown — COMPLETE ✅
**Apr 2026**
- Markdown (.md) file upload support
- react-markdown + Shiki syntax highlighting
- Preview/raw toggle for Markdown files
- Upload size limit increased to 50 MB

### Phase 3: Auth, Editor & API — COMPLETE ✅
**Apr 2026**
- Google/GitHub OAuth via Supabase (PKCE flow)
- Email/password authentication
- User dashboard with share history + stats
- Profile settings management
- Favorites/bookmark system
- Markdown editor (CodeMirror 6) with split-pane preview
- Slash commands + image drag-and-drop
- Auto-draft persistence to localStorage
- REST API v1 for programmatic management
- API key management (SHA-256 hashed)
- Private shares (`is_private` flag)
- CLI tool (`dropitx` binary)

### Phase 3.5: Share Access Security — COMPLETE ✅
**Apr 2025–2026**
- Password protection for shares (bcryptjs hash)
- PasswordGate component for entry
- HMAC-SHA256 signed access cookies (24h TTL)
- Password rate limiting (5 attempts/10 min per IP)
- Login redirect with contextual messaging
- CLI `-P/--password` flag

### Phase 3.6: Enhanced Authentication — COMPLETE ✅
**Apr 29, 2026**
- Email/password authentication with PKCE flow
- Email confirmation and verification pages
- Complete password reset flow
- Split-screen login page redesign

### Phase 3.7: Team Invitations — COMPLETE ✅
**Apr 29, 2026**
- Enhanced invite form with role selection and email validation
- Bulk invite dialog supporting multiple email addresses
- Invite notification bell with auto-refresh
- Decline team invite functionality
- Invite token security utilities
- Auto-signup accept flow for unauthenticated users

### Phase 4: Growth, Engagement & Revenue — COMPLETE ✅
**Apr–May 2026**
- FastAPI backend migration (all API logic moved from Next.js)
- oEmbed support for standardized embedding (WordPress/Medium)
- Share Analytics Dashboard with real-time metrics
- Team Workspaces with role-based access control
- Vercel Analytics integration

### Phase 5: Advanced Features & UI Redesign — COMPLETE ✅
**May–Jun 2026**
- Route group reorganization (`(public)` and `(dashboard)`)
- Landing page redesign (HeroSection, HeroCanvas, ProofCards, WorkflowSteps, CtaSection)
- Dashboard restyle (sidebar navigation, mobile nav, toolbar)
- Design system evolution: Light & Clean → xAI dark monochrome → Orange → **Clay** (light-first, warm cream, terracotta, organic radii)
- New shared components (PageHeader, StatCard, EmptyStateCard, Badge)

### Phase 5.5: Feature Completion & Crypto — COMPLETE ✅
**Jun 2026**
- **End-to-End Encryption**: AES-256-GCM client-side (Web Crypto API), key in URL fragment
  - `lib/crypto.ts` utilities with Uint8Array/BufferSource compatibility
  - Encryption toggle UI and encrypted content viewer
- **Burn-After-Reading**: Share self-destructs on first view (atomic, secure)
  - `burn-after-reading-toggle.tsx`, `burn-after-reading-tracker.tsx`, `burned-state.tsx` components
- **Complete 8 Missing Features** (Gap Analysis from competitor audit):
  - All UI components for B1–B10 feature gap analysis now implemented
  - Includes expiration controls, file tabs, version history UI, comments UI, QR code, analytics

---

## Recently Implemented Advanced Features (Undocumented)

The following features are **UI-ready** in the codebase (components exist) but were **not clearly documented** in the CHANGELOG. They appear to have been implemented in parallel with other work:

| Feature | Components | Status | Notes |
|---------|-----------|--------|-------|
| **End-to-End Encryption** | `encryption-toggle.tsx`, `encrypted-content-viewer.tsx`, `lib/crypto.ts` | ✅ Complete | AES-256-GCM client-side, key in URL fragment |
| **Burn-After-Reading** | `burn-after-reading-toggle.tsx`, `burn-after-reading-tracker.tsx`, `burn-warning-banner.tsx`, `burned-state.tsx` | ✅ Complete | Share self-destructs on first view |
| **Configurable Expiration** | `expiration-select.tsx`, `expiry-badge.tsx`, `expired-state.tsx` | ✅ Complete | Beyond default 30-day option |
| **Version History** | `version-history.tsx` | ✅ UI Complete | Backend support needs verification |
| **Multi-File Support** | `file-tabs.tsx`, `file-list-sidebar.tsx`, `multi-file-upload.tsx` | ✅ UI Complete | Backend support needs verification |
| **Comments/Discussion** | `comments-section.tsx` | ✅ UI Complete | Backend persistence not yet wired |
| **QR Code Generation** | `qr-code-button.tsx` | ✅ Complete | Calls backend `/api/qr/{slug}` endpoint |

---

## Known Gaps & Limitations

### Critical Gaps
1. **Zero Test Suite** (0% code coverage)
   - No unit, integration, or E2E tests
   - High regression risk, difficult scaling
   - **Priority**: P0 before enterprise features

2. **Missing Observability**
   - No error monitoring (Sentry/Datadog)
   - No structured logging or alerting
   - No performance dashboards
   - **Priority**: P1 for reliability

3. **Incomplete Backend Wiring**
   - Comments: UI exists, backend persistence not connected
   - Version history: UI exists, revision tracking incomplete
   - Multi-file: UI exists, full backend support unclear
   - **Priority**: P1 for feature completion

---

## Future Roadmap

### Phase 5.1: Production Hardening (Q3–Q4 2026)
**Goal**: Build for scale and reliability

**Testing**
- [ ] Unit tests for core business logic (auth, crypto, share lifecycle)
- [ ] Integration tests for API client
- [ ] E2E tests for critical user flows (upload → view → delete)
- [ ] Target: >80% code coverage

**Observability**
- [ ] Error monitoring (Sentry or Datadog)
- [ ] Structured logging (JSON logs to Datadog/Loki)
- [ ] Performance dashboards (Lighthouse CI, Core Web Vitals)
- [ ] Alert rules for uptime + error rate

**Security**
- [ ] Third-party security audit
- [ ] Penetration testing
- [ ] GDPR/CCPA compliance audit + documentation
- [ ] Privacy policy update post-encryption feature

**Performance**
- [ ] Performance baseline establishment (FCP, LCP, CLS targets)
- [ ] Database query optimization (slow query logs)
- [ ] CDN cache strategy refinement

---

### Phase 5.2: Feature Completion (Q4 2026)
**Goal**: Wire incomplete features end-to-end

**Features to Complete**
- [ ] Comments: Wire backend persistence + RLS policies
- [ ] Version history: Implement revision table + restore logic
- [ ] Multi-file: Finalize backend support + file organization
- [ ] QR code: Verify backend `/api/qr/{slug}` endpoint

**New Features**
- [ ] Custom expiration dates (not just presets)
- [ ] Share templates (reusable starter content)
- [ ] Email notifications (share created, expiring soon, comments)
- [ ] Share activity feed (view events, comment activity)

---

### Phase 6: Enterprise & Growth (2027)
**Goal**: Support team scaling and revenue

**Team & Enterprise**
- [ ] White-label / custom domain support
- [ ] SSO (SAML/OIDC) for team authentication
- [ ] Advanced team permissions (read-only, comment-only, admin roles)
- [ ] Audit logs + compliance exports (GDPR data deletion)

**Monetization**
- [ ] Freemium tier (current free offering)
- [ ] Team/Pro tier ($10–20/month, increased storage + API calls)
- [ ] Enterprise tier (SSO, custom domains, priority support)
- [ ] Usage-based billing (storage overage, API rate limits)

**Growth**
- [ ] Mobile apps (iOS/Android) or feature-parity PWA
- [ ] API rate limit tiers
- [ ] Developer documentation + SDK examples
- [ ] Community forum or Slack channel

---

## Success Metrics

### Current (MVP Stage)
| Metric | Target | Current Status |
|--------|--------|-----------------|
| Uptime | > 99.9% | Not yet measured |
| Page Load (FCP) | < 1.5 sec | ~1.2 sec ✅ |
| API Response | < 500 ms | ✅ (FastAPI) |
| Error Rate | < 0.5% | Unknown (need monitoring) |
| Code Coverage | > 80% | 0% ❌ (critical gap) |

### Scaling Targets
| Metric | Year 1 | Year 2 |
|--------|--------|---------|
| Daily Active Users | 1,000 | 10,000 |
| Monthly Uploads | ~15,000 | ~150,000 |
| ARR | — | $50k+ |
| Page Load | < 2 sec | < 1.5 sec |
| Uptime | > 99.5% | > 99.9% |

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| API or database outage | Complete downtime (the frontend has no fallback data path) | Low | Monitor the API; clear error states in the UI; regular DR tests |
| Security breach (API key leak) | User data compromise | Low | Soft revocation, hash-only storage, audit logs |
| Performance degradation at scale | User churn | Medium | Need DB profiling, Lighthouse CI, load tests |
| Lack of tests → regression bugs | User trust ↓ | **High** | **P0: build test suite** |
| Compliance violation (GDPR) | Legal liability | Medium | Implement data deletion, update privacy policy |
| Team member absence (solo dev) | Development halt | High | Improve documentation, runbooks |

---

## Investment Areas

### High Value (Start Now)
1. **Test Suite** — Unblock scaling, prevent regressions
2. **Observability** — Catch production issues early
3. **Complete Backend Wiring** — Turn UI-only features into full products

### Medium Value (Start Q4 2026)
1. **Performance Optimization** — Maintain < 2 sec load times at scale
2. **Team/Enterprise Features** — Unlock B2B revenue
3. **Developer Documentation** — Support API/CLI adoption

### Lower Value (2027+)
1. **Mobile Apps** — PWA might be sufficient
2. **White-Label** — Only if enterprise tier demand exists
3. **Advanced Analytics** — Useful for SaaS but not core to MVP

---

## Execution Strategy

### Principle: Ship Value Incrementally
- **No "complete redesigns"**: Iterate on existing foundations
- **No abandoned features**: Finish what's started (e.g., comments, version history)
- **Measure impact**: A/B tests for new features, monitoring for bugs

### Development Pace
- **Velocity**: ~2-week sprints (solo dev)
- **Release Cycle**: Minor releases every 2 weeks, major every 6–8 weeks
- **Documentation**: Updated in-sync with releases

### Quality Gates
- **Before Shipping**: Manual QA on supported browsers (Chrome, Firefox, Safari, Edge)
- **Before Major**: Lighthouse score > 90, no accessibility violations
- **Before Public**: 1-week staging period, monitoring dashboard active

---

## Questions & Next Steps

**Immediate (Next Week)**
- [ ] Verify backend wiring for comments, version history, multi-file
- [ ] Add error monitoring (Sentry setup)
- [ ] Set up performance baseline (Lighthouse CI)

**Short-Term (This Quarter)**
- [ ] Plan and scope test suite (unit + integration + E2E)
- [ ] Complete missing feature backends
- [ ] Update privacy policy post-encryption

**Long-Term (Next Quarter)**
- [ ] Implement test suite
- [ ] Plan enterprise features (SSO, white-label)
- [ ] Design monetization model
