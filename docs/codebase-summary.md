# DropItX - Codebase Summary

## Project Overview

**DropItX** is a Next.js 16 frontend for secure file sharing with inline editing, advanced privacy controls, and team collaboration. Upload HTML and Markdown files, write with an integrated CodeMirror 6 editor, generate short shareable links with optional passwords, and manage content programmatically via REST API or CLI. Supports end-to-end encryption, burn-after-reading, version history, comments, QR code sharing, and analytics.

**Status**: v1.4.1 (2026-04-26) — Production ready with comprehensive feature set.

## Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript 5 (strict) |
| **Editor** | CodeMirror 6 + markdown extensions (loaded via `next/dynamic` with SSR disabled) |
| **Viewer** | `react-markdown` + `remark-gfm` + Shiki syntax highlighting |
| **Styling** | Tailwind CSS 4 + shadcn/ui + Clay design system (light-first, warm cream, terracotta accent) |
| **Data** | None in the frontend: every read and write goes through the FastAPI backend (Postgres and S3-compatible storage live behind it) |
| **Auth** | Firebase Auth (Google, GitHub, email/password); the server holds an httpOnly Firebase session cookie |
| **Backend API** | FastAPI (Python) at `NEXT_PUBLIC_API_URL` — all business logic except OG image rendering and the session cookie routes |
| **File Upload** | `react-dropzone` (≤ 50 MB files) |
| **Theme** | `next-themes` (light/dark mode) |
| **Analytics** | Recorded by the API (`POST /api/analytics/track`); no third-party analytics in the frontend |
| **Rate Limiting** | Enforced by the API; the frontend shows a toast on 429 |
| **CLI** | `packages/cli/` — TypeScript ESM, binary `dropitx` |
| **Encryption** | Web Crypto API (AES-256-GCM, client-side) |

## Directory Structure

```
app/                           # Next.js App Router (routes + layouts)
├── (public)/                  # Public routes (landing, editor, shares, auth)
│   ├── page.tsx              # Landing page (HeroSection + ProofCards + WorkflowSteps + CTA)
│   ├── editor/page.tsx       # Markdown editor with live preview
│   ├── s/[slug]/page.tsx     # Share viewer (handles .html/.md/.encrypted)
│   ├── embed/[slug]/page.tsx # oEmbed viewer
│   ├── search/page.tsx       # Full-text search results
│   ├── auth/login/page.tsx   # Email/password + OAuth login
│   ├── auth/reset-password/page.tsx
│   ├── auth/update-password/page.tsx
│   ├── auth/callback/route.ts # PKCE code exchange
│   ├── auth/confirm/route.ts  # Email confirmation
│   └── invite/accept/page.tsx # Team invite acceptance
├── (dashboard)/              # Protected dashboard routes (redirect unauthenticated)
│   ├── dashboard/page.tsx    # Share list + stats
│   ├── dashboard/profile/page.tsx
│   ├── dashboard/favorites/page.tsx
│   ├── dashboard/analytics/page.tsx
│   ├── dashboard/analytics/[slug]/page.tsx
│   ├── dashboard/teams/page.tsx
│   ├── dashboard/teams/new/page.tsx
│   ├── dashboard/teams/[slug]/page.tsx
│   ├── dashboard/teams/[slug]/members/page.tsx
│   └── dashboard/teams/[slug]/settings/page.tsx
├── api/
│   ├── og-image/[slug]/route.tsx   # OG image generation (metadata only)
│   └── auth/session-login, session-logout  # Firebase session cookie
├── layout.tsx, error.tsx, not-found.tsx, loading.tsx
├── globals.css, markdown-viewer.css, favicon.ico
└── [root middleware.ts: /dashboard session-cookie gate + security headers]

components/                    # React components (composable, feature-organized)
├── ui/                        # Primitives: button, card, input, dialog, select, etc.
├── [Feature areas]/
│   ├── editor-*.tsx          # Editor components (pane, preview, toolbar, publish-bar)
│   ├── share-*.tsx           # Share components (password-gate, link, analytics-tracker)
│   ├── encryption-toggle.tsx # Encryption UI
│   ├── burn-*.tsx            # Burn-after-reading (toggle, tracker, warning, state)
│   ├── expiration-*.tsx      # Expiration select + badge + state
│   ├── comments-section.tsx  # Comments/discussion
│   ├── version-history.tsx   # Version history viewer
│   ├── file-*.tsx            # Multi-file support (tabs, list-sidebar)
│   ├── qr-code-button.tsx    # QR code modal
│   ├── upload-*.tsx          # Upload (dropzone, progress)
│   ├── markdown-viewer.tsx, html-viewer.tsx
│   ├── search-*.tsx          # Search (bar, results)
│   ├── dashboard-*.tsx       # Dashboard (sidebar-nav, mobile-nav, toolbar, share-list)
│   ├── analytics/*.tsx       # Analytics (stats-cards, view-chart, geo-chart, top-performers)
│   ├── auth-*.tsx, password-*.tsx # Auth + password
│   ├── team-*.tsx            # Team features (nav, member-row, activity-feed)
│   ├── invite-*.tsx          # Invite system (dialog, status card, notification bell)
│   ├── header-*.tsx          # Header (bar, nav, mobile-drawer)
│   ├── landing-*.tsx, hero-*.tsx, proof-cards.tsx, workflow-steps.tsx, cta-section.tsx
│   └── theme-provider.tsx

lib/                           # Utilities and helpers
├── api-client.ts            # authFetch() + Firebase ID token Bearer + 401 retry (browser)
├── server-api.ts            # serverApiFetch() — server components to FastAPI
├── api-types.ts             # Generated from the API's OpenAPI spec
├── firebase/                # client.ts, auth.ts, server.ts (session cookie verification)
├── crypto.ts                # Web Crypto API (AES-256-GCM encrypt/decrypt, key generation)
├── draft-storage.ts         # localStorage draft persistence (autosave)
├── file-utils.ts            # File handling (multi-file logic)
├── share-data.ts, share-unlock.ts, dashboard-data.ts  # Typed API readers
├── analytics.ts             # Event names + no-op trackEvent
├── team-utils.ts, team-event-utils.ts
├── use-auth-user.ts         # Custom hook for current user
├── use-auto-save.ts, use-editor-auto-save.ts
├── editor-extensions/       # CodeMirror extensions (slash-commands, image-drop, image-preview)
├── api-utils.ts, api-key.ts
├── oembed-utils.ts
├── password.ts, nanoid.ts, slugify-handle.ts, validation.ts
├── nav-links.ts, shiki-highlighter.ts
└── use-scroll-sync.ts, invite-utils.ts

hooks/                        # Custom React hooks
├── use-auth-user.ts
├── use-email-validation.ts
├── use-team.ts
└── use-toast.ts

types/                        # TypeScript interfaces
├── share.ts, team.ts, team-event.ts, analytics.ts

packages/cli/                # Standalone CLI tool
├── src/index.ts            # Binary entry: dropitx
├── src/commands/
│   ├── login.ts
│   ├── publish.ts
│   ├── update.ts
│   ├── delete.ts
│   ├── list.ts
│   └── whoami.ts

docs/                         # Documentation
├── project-overview-pdr.md
├── system-architecture.md
├── codebase-summary.md
├── code-standards.md
├── deployment-guide.md
├── design-guidelines.md
├── project-roadmap.md
└── project-changelog.md

public/                       # Static assets (favicon, icons, images)
.env.example, next.config.ts, tsconfig.json, tailwind.config.ts, package.json
```

## Core Features

### File Sharing
- **Upload**: Drag-drop HTML/Markdown (up to 50 MB per file)
- **Share Links**: Short nanoid slugs (`/s/abc123`)
- **Custom Slugs**: Optional vanity URLs (`handle/my-doc`)
- **Auto-expire**: Default 30-day expiration (customizable via expiration-select)
- **Delete Token**: Anonymous deletion for file-upload shares

### Editor & Markdown
- **In-Browser Editor**: CodeMirror 6 with Markdown support
- **Live Preview**: React-markdown + Shiki syntax highlighting
- **Slash Commands**: `/image`, `/heading`, `/code`, `/link`, `/list` etc.
- **Image Drag-Drop**: Inline preview + upload through the API
- **Auto-Draft**: localStorage persistence with dirty-state warning
- **Editor Publish**: Title, custom slug, privacy toggle

### Privacy & Security
- **Password Protection**: verified by the API (`POST /api/shares/{slug}/unlock`); the unlocked content renders in place, with no frontend access cookie (a refresh asks again); owners skip the password
- **End-to-End Encryption**: AES-256-GCM client-side (Web Crypto API), key in URL fragment
  - **Crypto utilities**: `lib/crypto.ts` provides symmetric encryption/decryption with Uint8Array support
  - **Encryption UI**: Toggle in editor/share flow; decryption happens client-side
  - **Secure key exchange**: Encryption key never touches server, shared via URL fragment only
- **Burn-After-Reading**: Share self-destructs on its first content read; the page shows a reveal state and the client reads `/content` only on an explicit click
  - **UI components**: `burn-after-reading-toggle.tsx`, `reveal-share-content.tsx`, `burned-state.tsx`
  - **Immutable once viewed**: View flag prevents re-access, secure + user-friendly
- **Private Shares**: Hidden from search, owner-only access (the API answers 404 to everyone else)
- **Rate Limiting**: enforced by the API

### Advanced Features
- **Burn-After-Reading**: Share self-destructs on first view
- **Version History**: Track revisions, restore previous versions
- **Comments**: Thread discussion on shared content
- **Multi-File Support**: Multiple files per share (tabs + sidebar)
- **QR Code Generation**: Auto-generate + download QR for share URLs
- **Expiration Select**: Configurable expiry (5min to forever)

### Analytics
- **Page Views**: `ShareAnalyticsTracker` posts slug, referrer and embed flag to the API, which derives visitor, country and referrer source
- **Custom Events**: document_uploaded, content_published, share_viewed
- **Geographic**: IP-based location tracking
- **Referrer Tracking**: Where traffic originates
- **Per-Share Dashboard**: Individual share metrics

### Team Collaboration
- **Workspaces**: Owner creates, invites members
- **Shared Content**: Assign shares to workspace
- **Role-Based Access**: owner / editor / viewer (legacy `admin` and `member` values still render)
- **Invite System**: Single + bulk invite, token-based accept/decline
- **Activity Feed**: Team events tracking

### Programmatic Access
- **REST API v1**: `/api/v1/documents`, `/api/v1/keys` (Bearer auth)
- **CLI Tool**: `dropitx` binary (publish, update, delete, list, login)
- **API Keys**: SHA-256 hashed, soft-revokable
- **oEmbed**: Standardized content embedding for WordPress/Medium

## Authentication & Authorization

### Session Auth (Browser)
- **Sign-in**: Google + GitHub + email/password via Firebase Auth
- **Session**: `POST /api/auth/session-login` mints an httpOnly `session` cookie (14 days, SameSite=Lax) from the ID token; `middleware.ts` gates `/dashboard/*` on its presence and server components verify it with `firebase-admin`
- **Bearer**: browser calls send the Firebase ID token; server components send the session cookie

### API Key Auth (Programmatic)
- **Key Format**: `shk_` prefix + 48 hex chars
- **Storage**: SHA-256 hash only (plaintext never stored)
- **Revocation**: Soft-delete via `revoked_at` timestamp
- **Rate Limit**: Same as session auth (10 req/min)

### Share Access (Password-Protected)
- **Unlock Flow**: `PasswordGate` posts the password to the API's `/api/shares/{slug}/unlock` and renders the returned content in place
- **Gate Order**: private (API 404 unless owner) → owner sees content → password gate for non-owners → login redirect for anonymous visitors of plain shares

## Database

The frontend has no database access. The schema, RLS and migrations belong to `dropitx-api` (`infra/init`); the frontend sees rows only as JSON the API returns, typed in `lib/api-types.ts` and `types/`.

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | FastAPI backend (required) | `https://api.example.com` |
| `NEXT_PUBLIC_FIREBASE_*` (6 variables) | Firebase web SDK config | see `.env.example` |
| `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase Admin credentials (server-only) | (service account) |
| `NEXT_PUBLIC_APP_URL` | Canonical origin for absolute links | `https://dropitx.com` |
| `NEXT_PUBLIC_APP_HOST` | App host without scheme; Docker build arg, not read by code today | `dropitx.com` |

## Release History

Entries below are historical: they describe what each release shipped, not the current stack (Supabase and Vercel Analytics have since been removed).

### v1.4.1 (2026-04-26)

### Bug Fixes
- Fixed search page blank/stuck when navigating from dashboard while logged in
- Replaced unreliable `searchParams` Promise prop with `useSearchParams()` hook
- Added `AbortController` to cancel stale fetches on rapid input

### v1.4.0 (2026-04-26)
- Vercel Analytics integration with custom event tracking
- PII sanitization in analytics (strips query params from URLs)

### v1.3.1 (2026-04-26)
- HeaderBar compound component system (responsive navigation)
- Consolidated header + dashboard sidebar layout

### v1.3.0 (2026-04-25)
- **Brand Refresh**: ShareHTML → DropItX rebrand
- **Design System**: Blue (hue 264) → Violet (hue 293), orange accents
- **Logotype**: `[x] dropitx` in Geist Mono
- **CLI Rename**: `share-html` → `dropitx`

### v1.2.0 (2026-04-25)
- Password-protected shares with bcryptjs
- Rate limiting migrated from Upstash Redis to Supabase Postgres
- Share views gated behind login or password

### v1.1.0 (2026-04-24)
- Markdown editor (CodeMirror 6) with split-pane preview
- Inline image upload + drag-drop
- Slash commands
- Editor auto-save + dirty-state warning
- REST API v1 for programmatic management
- CLI tool (`dropitx` binary)
- Private shares support
- API key management UI

### v1.0.0 (2026-04-23)
- Initial MVP: file upload, search, auth, dashboard, themes

## Development Workflow

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev        # http://localhost:3000

# Build for production
npm run build

# Type-check and lint
npm run check:hygiene

# CLI development
cd packages/cli && npm run build && npm link
```

## Key Architectural Decisions

1. **Frontend-Only Next.js**: Pure client-side app; all API logic in FastAPI backend for scalability
2. **Firebase for identity, FastAPI for data**: Firebase Auth owns sign-in and the session cookie; the API owns every row and file
3. **CodeMirror 6 SSR Disabled**: Loaded via `next/dynamic` to avoid build-time errors
4. **Web Crypto API**: Client-side encryption for E2E feature without server key storage
5. **localStorage Drafts**: Offline-first editor with auto-recovery on page reload
6. **Token-Based Invites**: Secure, shareable invite links with email validation
7. **API-enforced authorization**: Access rules live in the API; the frontend carries no database keys
8. **API-side analytics**: Page views are recorded by the API; no third-party analytics sink

## Known Gaps

- **No test suite**: Zero unit/integration/E2E tests (planned for future hardening phase)
- **No offline support**: Service Worker for offline drafts planned
- **Limited mobile UX**: Mobile-responsive but not native app
- **Comment moderation**: No spam filtering or content moderation tools
- **Custom branding**: White-label/custom domain not yet supported

## Files to Start With

1. **`app/layout.tsx`** - Root layout and global setup
2. **`components/home-page.tsx`** - Landing page orchestrator
3. **`app/(dashboard)/dashboard/page.tsx`** - Dashboard entry
4. **`lib/api-client.ts`** - Backend communication (Firebase Bearer auth)
5. **`components/editor-shell.tsx`** - Editor entry point (CodeMirror 6)
6. **`components/share-page-client.tsx`** - Share viewer logic
