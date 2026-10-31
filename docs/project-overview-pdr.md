# DropItX - Project Overview & Product Development Requirements

## Executive Summary

**DropItX** is a modern file sharing platform unifying instant content sharing, rich editing, and team collaboration. Users upload HTML/Markdown files, write using an integrated Markdown editor, and share via short links with optional passwords, end-to-end encryption, and burn-after-reading. Designed for developers, technical teams, and knowledge workers who need secure, frictionless sharing.

**Status**: v1.4.1 (2026-04-26) — Production ready. Core features complete; hardening phase planned.

**Tech**: Next.js 16 frontend (Docker image) + FastAPI backend (Postgres and object storage behind it), Firebase Auth for sign-in. The frontend reads and writes only through the API.

## Project Vision

Existing file sharing platforms excel in one dimension (simplicity, privacy, or collaboration) but lack a cohesive experience. DropItX unifies:
- **Instant sharing**: No account required to view
- **Rich editing**: Markdown with live preview
- **Privacy by default**: Passwords, encryption, burn-after-reading
- **Team workflows**: Workspaces, invites, shared content
- **Programmatic access**: REST API + CLI

## Target Users

### Primary
- **Developers**: CLI tool for sharing code, drafts, secrets without UI overhead
- **Technical Teams**: Secure workspace for collaborative content sharing
- **Knowledge Workers**: Quick note-taking + sharing without email friction

### Secondary
- **Project Stakeholders**: Review shared HTML/Markdown builds
- **Educators**: Distribute teaching materials and examples
- **Clients**: Preview website builds pre-deployment

## Core Features

### File Sharing
- **File Upload**: Drag-and-drop HTML and Markdown file upload (up to 50 MB)
- **Link Generation**: Automatic short, shareable URLs (10-character slugs)
- **HTML Viewer**: Secure sandboxed iframe rendering with CSP headers
- **Markdown Viewer**: GitHub-like prose rendering with shiki syntax highlighting

### Authoring
- **Markdown Editor**: Split-pane live preview editor powered by CodeMirror 6
- **Editor Publish**: Publish directly from editor with title, custom slug, and privacy flag
- **Image Upload**: Inline image drag-and-drop in the editor (PNG/JPG/GIF/WebP, max 5 MB)
- **Auto-Draft**: Client-side draft persistence with dirty-state unload warning

### Search & Discovery
- **Search**: Full-text search via Postgres TSVECTOR + GIN index
- **Favorites**: Authenticated users can bookmark shares

### Developer Access
- **REST API**: Bearer API key authentication for programmatic document management
- **API Key Management**: Dashboard UI for generating and revoking API keys
- **CLI Tool**: `dropitx` binary for publish/update/delete/list from the terminal

### Advanced Privacy & Security
- **Password Protection**: verified by the API per unlock; the frontend renders the unlocked content in place and keeps no access cookie
- **End-to-End Encryption**: AES-256-GCM client-side encryption with key in URL fragment
- **Burn-After-Reading**: Share self-destructs on first view
- **Configurable Expiration**: Custom expiry times (5 min to indefinite) beyond default 30 days
- **Multi-File Support**: Bundle multiple files per share with tabs and sidebar navigation

### Community & Engagement
- **Comments/Discussion**: Thread-based comments on shared content
- **Version History**: Track content revisions and restore previous versions
- **QR Code Generation**: Auto-generate and download QR codes for share URLs

### Platform
- **User Auth**: Google, GitHub, and email/password via Firebase Auth; an httpOnly session cookie for server components
- **Dashboard**: Share history, stats (count, total views, storage used)
- **Analytics Dashboard**: Real-time analytics with charts and metrics
- **Team Workspaces**: Collaborative content sharing and management
- **Team Invite System**: Enhanced invite form with role selection and email validation, bulk invite, resend functionality, invite accept flow
- **Team RPC Client**: Type-safe server communication for team operations
- **Token Security**: Utilities for invite token management and security
- **Profile**: Edit display name and avatar
- **Rate Limiting**: 10 requests/minute to prevent abuse

## Technical Requirements

### Functional Requirements
1. **File Upload**: Accept `.html`, `.htm`, `.md` files up to 50 MB
2. **Editor Publish**: Create shares from Markdown content with title, custom slug, `is_private` flag
3. **Link Generation**: Create unique readable slugs using nanoid
4. **HTML Rendering**: Display content in sandboxed iframe with CSP
5. **Markdown Rendering**: Render Markdown with GFM + syntax highlighting
6. **Image Upload**: Accept PNG/JPG/GIF/WebP up to 5 MB; return public URL for inline use
7. **Search**: Full-text search with pagination (10 results per page)
8. **Metadata**: Track filename, file size, MIME type, view count, source
9. **Expiration**: Automatic deletion after 30 days
10. **Security**: Token-based deletion, API-enforced authorization, API key auth (SHA-256 hash stored)
11. **Privacy**: `is_private` shares hidden from search and public listing for non-owners
12. **API Keys**: Generate, list, revoke API keys; only SHA-256 hash persisted

### Non-Functional Requirements
- **Performance**: Fast load times, editor renders without SSR
- **Security**: Input validation, API-enforced authorization, CSP headers, API key hashing, invite tokens never rendered or logged
- **Reliability**: High availability, compensating transactions on upload failure
- **Scalability**: Handle thousands of concurrent uploads
- **Maintainability**: Clean code structure, monorepo with shared types, modular UI primitives
- **Team Collaboration**: Secure invite system with role-based access control and bulk operations

## Acceptance Criteria

### Upload Functionality
- [ ] Users can drag and drop HTML/Markdown files onto the upload area
- [ ] File size validation (max 50 MB)
- [ ] File type validation (`.html`, `.htm`, `.md`)
- [ ] Progress feedback during upload
- [ ] Success notification with generated share link
- [ ] Error messages for invalid files or size limits

### Editor & Publish
- [ ] CodeMirror editor with split-pane live preview
- [ ] Publish creates a share with optional title, custom slug, `is_private` flag
- [ ] Auto-draft persists to localStorage on change
- [ ] Dirty-state warning on page unload
- [ ] Image drag-and-drop into editor inserts Markdown image syntax

### Share Link Generation
- [ ] Each upload/publish generates a unique URL slug
- [ ] Links follow format: `https://app.domain/s/{slug}`
- [ ] Custom slugs follow `handle/slug` format
- [ ] Delete tokens generated for file-upload shares
- [ ] Links work immediately after creation

### API Key Auth
- [ ] Authenticated users can create named API keys from dashboard
- [ ] Key displayed once at creation; only SHA-256 hash stored
- [ ] Bearer token requests authenticated via `lib/api-auth.ts`
- [ ] `revoked_at` soft-delete preserves audit history
- [ ] `last_used_at` updated asynchronously on each auth

### Privacy
- [ ] `is_private` shares excluded from search results for non-owners
- [ ] `is_private` shares return 403 on `/s/[slug]` for non-owners

### Security & Reliability
- [ ] All write endpoints protected by rate limiting
- [ ] Authorization enforced by the API for every read and write
- [ ] Compensating transaction: delete storage if DB insert fails
- [ ] API key hashing in the API (SHA-256; plaintext never stored)

## Technical Constraints

### Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript strict — pure frontend, shipped as a Docker image
- **Backend**: FastAPI (Python) — all data and API logic
- **Editor**: CodeMirror 6, loaded via `next/dynamic` (ssr: false)
- **Database**: PostgreSQL and object storage, owned by the API (the frontend has no access)
- **Auth**: Firebase Auth
- **Styling**: Tailwind CSS 4, shadcn/ui, OKLCH color tokens
- **Rate limiting**: enforced by the API
- **CLI**: `dropitx-cli` — Python, published to PyPI as `dropitx`
- **Analytics**: recorded by the API; no third-party analytics in the frontend

### Infrastructure Constraints
- The frontend deploys as a Docker image (or any Next.js 16 host) and needs only `NEXT_PUBLIC_API_URL`, Firebase config and Firebase Admin credentials
- All data access goes through the API; the frontend holds no database or storage keys

### Security Constraints
- Authorization enforced by the API on every request
- Content Security Policy for HTML rendering
- API key: only SHA-256 hash stored, prefix stored for display
- Input validation on all user inputs

## Project Milestones

### Phase 1: Core Functionality (Complete)
- [x] HTML file upload interface
- [x] Share link generation and viewing
- [x] Database schema and Supabase integration
- [x] Basic error handling and validation

### Phase 2: Enhanced Features (Complete)
- [x] Full-text search with pagination
- [x] Rate limiting and abuse prevention
- [x] Theme switching (light/dark mode)
- [x] Responsive design optimization
- [x] Markdown file upload and viewer
- [x] 50 MB upload limit

### Phase 3: Auth, Editor & API (Complete)
- [x] User authentication (Google/GitHub OAuth + email/password)
- [x] User dashboard with share history and stats
- [x] Profile settings and avatar management
- [x] Favorites/bookmark system
- [x] Markdown editor (CodeMirror) with live split-pane preview
- [x] Publishing API (`POST /api/publish`)
- [x] API key management (create, list, revoke)
- [x] REST API v1 for programmatic document management
- [x] Inline image upload for editor
- [x] CLI tool (`packages/cli/`) with `share-html` binary
- [x] Private shares (`is_private` flag)
- [x] RLS hardening

### Phase 4: Team Workspaces, Analytics & Embed (Complete)
- [x] Analytics dashboard with real-time charts and metrics
- [x] Team workspaces with role-based access control
- [x] Collaborative content sharing and management
- [x] oEmbed support for rich content embedding
- [x] Password protection for shares
- [x] Vercel Analytics integration

### Phase 5: Production Hardening (In Progress)
- [x] Enhanced team invite system with role selection and email validation
- [x] Enhanced invite dialog with invite link generation and team RPC client
- [x] Bulk invite dialog supporting multiple email addresses
- [x] Invite accept flow with team join functionality
- [x] Team RPC client for type-safe server calls
- [x] Token security utilities for invite token management
- [x] New UI primitives: dialog, select, textarea, alert components
- [x] New hooks: use-email-validation, use-team, use-toast
- [ ] Comprehensive test suite (unit, integration, E2E)
- [ ] Security audit and penetration testing
- [ ] Performance benchmarking and optimization
- [ ] Production monitoring and error tracking
- [ ] CI/CD pipeline with automated tests

## Success Metrics

| Category | Metric | Target |
|----------|--------|--------|
| Performance | Page load time | < 2 seconds |
| Performance | Search response | < 500 ms |
| Reliability | Upload success rate | > 99% |
| Reliability | Error rate | < 1% |
| Engagement | Daily active users | 1,000 |
| Engagement | Uploads per day | 500 |

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| API availability | The frontend has no fallback data path; monitor the API and show clear error states |
| Storage cost growth | Storage usage monitoring; expiration cleanup |
| XSS in HTML rendering | Rigorous CSP policy; sandboxed iframe |
| API key compromise | Hashes only stored; instant revocation via `revoked_at` |
| Abuse / spam | Rate limiting; content moderation roadmap |
