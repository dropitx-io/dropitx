# Requirements (PRDs)

> Synthesized from classified PRDs. One entry per requirement (`REQ-{slug}`).
> Two PRDs in this set: project-overview-pdr.md (formal FR1–FR12 + acceptance
> criteria) and project-roadmap.md (product direction, no acceptance criteria —
> classifier notes confirm). Both carry precedence PRD; both `locked: false`.

## REQ-file-upload
- source: docs/project-overview-pdr.md
- description: Accept `.html`, `.htm`, `.md` file uploads via drag-and-drop, up to 50 MB.
- acceptance:
  - Users can drag and drop HTML/Markdown files onto the upload area
  - File size validation (max 50 MB)
  - File type validation (`.html`, `.htm`, `.md`)
  - Progress feedback during upload
  - Success notification with generated share link
  - Error messages for invalid files or size limits
- scope: file sharing, upload, file validation

## REQ-editor-publish
- source: docs/project-overview-pdr.md
- description: Create shares from Markdown content with title, custom slug, and `is_private` flag.
- acceptance:
  - CodeMirror editor with split-pane live preview
  - Publish creates a share with optional title, custom slug, `is_private` flag
  - Auto-draft persists to localStorage on change
  - Dirty-state warning on page unload
  - Image drag-and-drop into editor inserts Markdown image syntax
- scope: markdown editor, authoring

## REQ-link-generation
- source: docs/project-overview-pdr.md
- description: Create unique readable slugs using nanoid for each share.
- acceptance:
  - Each upload/publish generates a unique URL slug
  - Links follow format `https://app.domain/s/{slug}`
  - Custom slugs follow `handle/slug` format
  - Delete tokens generated for file-upload shares
  - Links work immediately after creation
- scope: file sharing, link generation

## REQ-html-rendering
- source: docs/project-overview-pdr.md
- description: Display HTML content in a sandboxed iframe with CSP.
- acceptance: absent (no dedicated acceptance block; covered by "HTML Rendering: Display content in sandboxed iframe with CSP")
- scope: html viewer, security

## REQ-markdown-rendering
- source: docs/project-overview-pdr.md
- description: Render Markdown with GFM + syntax highlighting.
- acceptance: absent (no dedicated acceptance block)
- scope: markdown viewer

## REQ-image-upload
- source: docs/project-overview-pdr.md
- description: Accept PNG/JPG/GIF/WebP up to 5 MB; return public URL for inline use.
- acceptance: absent (no dedicated acceptance block)
- scope: markdown editor, image upload

## REQ-search
- source: docs/project-overview-pdr.md
- description: Full-text search with pagination (10 results per page).
- acceptance: absent (no dedicated acceptance block)
- scope: search, discovery

## REQ-metadata
- source: docs/project-overview-pdr.md
- description: Track filename, file size, MIME type, view count, source.
- acceptance: absent (no dedicated acceptance block)
- scope: file sharing, metadata

## REQ-expiration
- source: docs/project-overview-pdr.md
- description: Automatic deletion after 30 days.
- acceptance: absent (no dedicated acceptance block)
- scope: share lifecycle, expiration

## REQ-security
- source: docs/project-overview-pdr.md
- description: Token-based deletion, RLS, API key auth (SHA-256 hash stored).
- acceptance:
  - All write endpoints protected by rate limiting
  - RLS on all database tables
  - Compensating transaction: delete storage if DB insert fails
  - API key hashing with Node `crypto` (no external service)
- scope: security, rate limiting, RLS, API keys

## REQ-privacy
- source: docs/project-overview-pdr.md
- description: `is_private` shares hidden from search and public listing for non-owners.
- acceptance:
  - `is_private` shares excluded from search results for non-owners
  - `is_private` shares return 403 on `/s/[slug]` for non-owners
- scope: privacy, RLS, search

## REQ-api-keys
- source: docs/project-overview-pdr.md
- description: Generate, list, revoke API keys; only SHA-256 hash persisted.
- acceptance:
  - Authenticated users can create named API keys from dashboard
  - Key displayed once at creation; only SHA-256 hash stored
  - Bearer token requests authenticated via `lib/api-auth.ts`
  - `revoked_at` soft-delete preserves audit history
  - `last_used_at` updated asynchronously on each auth
- scope: developer access, API keys, REST API

## REQ-roadmap-feature-completion (roadmap direction — no acceptance criteria)
- source: docs/project-roadmap.md
- description: Wire incomplete features end-to-end (Phase 5.2): comments backend persistence + RLS; version history revision table + restore logic; multi-file backend support + file organization; verify QR code `/api/qr/{slug}` endpoint. New features: custom expiration dates (beyond presets), share templates, email notifications, share activity feed.
- acceptance: absent (roadmap doc contains no acceptance criteria — classifier notes confirm: "No user stories or acceptance criteria")
- scope: feature completion, comments, version history, multi-file, QR code

## REQ-roadmap-production-hardening (roadmap direction — no acceptance criteria)
- source: docs/project-roadmap.md
- description: Phase 5.1 production hardening: unit/integration/E2E tests (target >80% coverage); error monitoring (Sentry/Datadog); structured JSON logging; performance dashboards (Lighthouse CI, Core Web Vitals); alert rules; third-party security audit; penetration testing; GDPR/CCPA compliance audit; performance baseline (FCP, LCP, CLS); DB query optimization; CDN cache refinement.
- acceptance: absent (roadmap doc contains no acceptance criteria)
- scope: testing, observability, security audit, performance

## REQ-roadmap-enterprise-growth (roadmap direction — no acceptance criteria)
- source: docs/project-roadmap.md
- description: Phase 6 (2027) enterprise & growth: white-label / custom domain; SSO (SAML/OIDC); advanced team permissions (read-only, comment-only, admin); audit logs + GDPR data deletion; monetization tiers (free / team-pro $10–20/mo / enterprise); usage-based billing; mobile apps or PWA; API rate-limit tiers; developer docs + SDKs.
- acceptance: absent (roadmap doc contains no acceptance criteria)
- scope: enterprise, monetization, SSO, mobile, growth
