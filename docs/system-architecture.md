# System Architecture

## Overview

DropItX is a Next.js 16 application (App Router), a pure frontend with no database, storage or rate-limit credentials. All data logic runs on the FastAPI backend (`dropitx-api`, at `NEXT_PUBLIC_API_URL`); sign-in is Firebase Auth. Features include team workspaces, analytics dashboard, password-protected shares, burn-after-reading, version history, multi-file support, comments, QR code generation, rich embedding via oEmbed, and programmatic access via REST API. Two auth models reach the API: a Firebase token (browser ID token, or the session cookie forwarded by server components) and an API key (programmatic). End-to-end encrypted publishing and viewing is not available in the web app (planned). Latest design system: Clay (light-first, warm cream canvas, terracotta accent, organic radii).

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                          Browser                             │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────────┐  │
│  │ Upload   │ │ View /s/ │ │/search │ │ /editor          │  │
│  │ Dropzone │ │ Iframe   │ │Results │ │ EditorShell      │  │
│  └────┬─────┘ └────┬─────┘ └───┬────┘ └────────┬─────────┘  │
└───────┼─────────────┼───────────┼───────────────┼────────────┘
        │             │           │               │
        ▼             ▼           ▼               ▼
┌──────────────────────────────────────────────────────────────┐
│                          Next.js                             │
│  Own routes: /api/og-image/[slug], /api/auth/session-login,  │
│  /api/auth/session-logout                                    │
│  Browser code: authFetch() (lib/api-client.ts)               │
│  Server components: serverApiFetch() (lib/server-api.ts)     │
│  middleware.ts: /dashboard session-cookie gate + headers     │
└───────────────┬──────────────────────────────┬───────────────┘
                │ Firebase ID token /          │ sign-in, session
                │ session cookie as Bearer     │ cookie mint+verify
                ▼                              ▼
┌───────────────────────────────────┐  ┌──────────────────────┐
│         FastAPI Backend           │  │    Firebase Auth     │
│  POST /api/upload  GET /api/search│  └──────────────────────┘
│  POST /api/publish                │
│  POST /api/images/upload          │
│  GET/PATCH/DELETE /api/shares/{slug}
│  GET  /api/shares/{slug}/content  │
│  POST /api/shares/{slug}/unlock   │
│  POST /api/analytics/track        │
│  GET  /api/oembed                 │
│  GET|POST /api/v1/keys, /api/v1/documents
│  /api/dashboard/* (shares, analytics, teams)
│  GET /api/invite/{token}, POST /api/invite/accept|decline
│                                   │
│  Postgres, object storage and rate limiting sit behind the API
└───────────────────────────────────┘
```

## Component Hierarchy

```
RootLayout (app/layout.tsx)
├── ThemeProvider
├── AuthProvider (Firebase)
├── ErrorBoundary
├── Toaster (sonner)
└── Routes
    ├── (public)/ (PublicLayout)
    │   ├── HeaderBar
    │   │   ├── HeaderNav (desktop)
    │   │   └── HeaderMobileDrawer (mobile)
    │   ├── / (HomePage — landing)
    │   │   ├── HeroSection + HeroCanvas
    │   │   ├── SearchBar
    │   │   ├── UploadDropzone
    │   │   ├── ProofCards
    │   │   ├── WorkflowSteps
    │   │   ├── CtaSection
    │   │   └── LandingFooter
    │   ├── /editor (SSR disabled via next/dynamic)
    │   │   └── EditorShell
    │   │       ├── EditorToolbar
    │   │       ├── EditorPane (CodeMirror 6)
    │   │       ├── EditorPreview (react-markdown + shiki)
    │   │       └── EditorPublishBar
    │   ├── /s/[slug] (SharePage)
    │   │   ├── PasswordGate (when share has password; unlocks via the API and renders in place)
    │   │   ├── RevealShareContent (burn-after-reading / one-time shares)
    │   │   ├── HtmlViewer (sandboxed iframe, .html files)
    │   │   ├── MarkdownViewerWrapper (lazy loaded, .md files)
    │   │   ├── BookmarkToggle
    │   │   ├── ShareViewedTracker
    │   │   └── ShareAnalyticsTracker
    │   ├── /embed/[slug] (oEmbed viewer)
    │   ├── /search → SearchBar + SearchResults
    │   ├── /auth/login → Email/password + OAuth
    │   ├── /auth/reset-password → Password reset form
    │   ├── /auth/update-password → Password update form
    │   └── /invite/[token] → InviteStatusCard + InviteActions (/invite/accept?token= redirects here)
    │
    └── (dashboard)/ (DashboardLayout)
        ├── DashboardSidebarNav (desktop)
        ├── DashboardMobileNav (mobile)
        ├── DashboardToolbar
        ├── /dashboard/page.tsx (share list + stats)
        │   ├── DashboardShareList
        │   └── ApiKeyManager
        ├── /dashboard/profile → ProfileForm
        ├── /dashboard/favorites → DashboardShareList
        ├── /dashboard/analytics
        │   ├── AnalyticsStatsCards
        │   ├── AnalyticsViewChart, GeoChart, ReferrerChart
        │   ├── AnalyticsTopPerformers
        │   └── AnalyticsEmptyState
        ├── /dashboard/analytics/[slug] → per-share analytics
        ├── /dashboard/teams → team list
        ├── /dashboard/teams/new → CreateTeamForm
        ├── /dashboard/teams/[slug] → team detail
        ├── /dashboard/teams/[slug]/members → TeamMemberRow, InviteMemberDialog
        └── /dashboard/teams/[slug]/settings → team settings
```

## Authentication Architecture

### Session Auth (Browser)
```
User clicks Google/GitHub or submits email/password → /auth/login
  → Firebase SDK signs in (lib/firebase/auth.ts)
  → AuthProvider posts the ID token to POST /api/auth/session-login
  → Server mints an httpOnly `session` cookie (14 days, SameSite=Lax)
  → Redirect to /dashboard (or the ?next= path)

Sign-out → POST /api/auth/session-logout
  → revoke refresh tokens + clear the cookie, then sign out the Firebase client

Password reset → /auth/reset-password → Firebase email → /auth/update-password
```

### API Key Auth (Programmatic)
```
POST /api/v1/keys  →  FastAPI: generate shk_ + 48 hex chars
  →  store SHA-256 hash + key_prefix in api_keys
  →  return full key ONCE

Requests: Authorization: Bearer shk_...
  → FastAPI: SHA-256 hash → SELECT from api_keys WHERE key_hash = ?
```

### Password-Protected Shares
```
PasswordGate → POST {API}/api/shares/{slug}/unlock { password }
  → API verifies the password and returns the content
  → PasswordGate renders it in place; no cookie is set, a refresh asks again
Owners read their own protected content from /content without the password.
```

### Session Gate and Cross-Tab Behavior

`middleware.ts` runs on every request except static assets and `/api/og-image`:
- Redirects `/dashboard/*` to `/auth/login?next=<path>` when the `session` cookie is absent (a presence check; server components verify it with `firebase-admin`)
- Forwards the dashboard path to server components in `x-dashboard-path`
- Adds security headers (and HSTS in production)

The cookie is shared by all tabs, so signing out in one tab ends the session in all of them.

### Auth Layers
| Layer | Implementation |
|-------|---------------|
| Middleware | `/dashboard/*` redirects when the `session` cookie is absent |
| Session | Firebase session cookie, verified server-side with `firebase-admin` |
| Sign-in | Google, GitHub and email/password via Firebase Auth |
| API Key | SHA-256 hash lookup in the API; soft-revoke via `revoked_at` |
| Share access | Password verified by the API per request; no frontend cookie |
| Authorization | Enforced by the API (owner-only, private-share filter, team roles) |

### Calling the API
| Caller | Helper | Credentials |
|--------|--------|-------------|
| Client components | `authFetch()` (`lib/api-client.ts`) | Firebase ID token as Bearer; one forced refresh and retry on 401 |
| Server components | `serverApiFetch()` (`lib/server-api.ts`) | `session` cookie as Bearer when present; forwards `cf-connecting-ip` |
| OG image route | `fetch` to `GET /api/shares/{slug}` | none; metadata only |

## Data Flow

### Upload Flow
```
User drops file → UploadDropzone (.html/.htm/.md, ≤50 MB)
  → authFetch("/api/upload") → FastAPI: rate limit → validate → store file
  → create the share (cleaning up the stored file on failure)
  → Return { slug, shareUrl }
```

### Editor Publish Flow
```
EditorPane → useEditorAutoSave (localStorage draft)
  → EditorPublishBar: title, custom_slug, is_private
  → authFetch("/api/publish") { content, title, custom_slug, is_private }
  → FastAPI creates the share (source='editor') → redirect to /s/[slug]
```

### Image Upload Flow
```
Image dropped in EditorPane → authFetch("/api/images/upload") (≤5 MB)
  → FastAPI stores the image → insert ![alt](url) at cursor
```

### View Flow
```
GET /s/[slug] → getShareMeta (GET /api/shares/{slug}; never counts a view)
  → missing / private-to-others / expired → not found
  → password share (non-owner) → PasswordGate, content fetched after unlock
  → burn-after-reading / one-time share → reveal state; /content is read on a click
  → plain share, anonymous visitor → redirect to /auth/login?next=/s/[slug]
  → otherwise getShareContent (GET /content; counts the view) → render by mime_type
```

### API Key Lifecycle
```
POST /api/v1/keys (name) → create + return key once
GET  /api/v1/keys        → list (prefix only, never hash)
DELETE /api/v1/keys/[id]  → set revoked_at = NOW()
```

## Data Model

The frontend has no database or storage access. Tables, RPCs, buckets and migrations belong to `dropitx-api` (`infra/init`); the frontend sees them as JSON the API returns, typed in `lib/api-types.ts` (generated with `npm run generate-types`) and `types/`. Team member roles the API allows are `owner`, `editor`, `viewer`, plus the legacy `member` and `admin` (`TeamMemberRole` in `types/team.ts`).

## Security Layers

The frontend enforces the following itself; everything else on this list is enforced by the API.

| Layer | Implementation |
|-------|---------------|
| HtmlViewer sandbox | `sandbox="allow-scripts"` + CSP meta tag |
| Security headers | `middleware.ts`: nosniff, `X-Frame-Options: DENY`, referrer policy, permissions policy, HSTS in production |
| Session | httpOnly `session` cookie; `/dashboard/*` gated |
| Metadata paths | `generateMetadata` and the OG route read only `GET /api/shares/{slug}`, never `/content` |
| Token hygiene | Invite tokens and delete tokens are never rendered or logged except where the UI already shows a delete token to its owner; server error messages redact token path segments |

API-side: file and image validation, rate limiting, slug validation, API key hashing and revocation, private-share filtering, password verification, team authorization.

## oEmbed Endpoint

```
GET /api/oembed?url=https://dropitx.app/s/{slug}  → JSON + HTML embed code
```
Response includes: type (rich), provider_name, title, author, iframe embed HTML (800x600).
Security: domain validation, rate limiting, CSP headers for embedded content.

## Analytics Tracking

- **Page Views**: `ShareAnalyticsTracker` posts slug, referrer and embed flag to `POST /api/analytics/track`; the API derives visitor, country and referrer source. Content reads count `view_count`.
- **Product events**: `lib/analytics.ts` keeps `trackEvent` and the event names as a no-op; no third-party analytics sink is wired up, so no page path (including `/invite/<token>`) leaves the app.
- **Dashboard**: `/dashboard/analytics` with charts (Recharts)
- **Per-share**: `/dashboard/analytics/[slug]` for individual share metrics
- **Components**: StatsCards, ViewChart, GeoChart, ReferrerChart, TopPerformers

## Team Workspaces

- **Creation**: Owner creates workspace, auto-added as member
- **Members**: Owner invites via `/api/dashboard/teams/[slug]/invites`
- **Content**: Members share content to the workspace through the API
- **Authorization**: the API enforces membership-based access control
- **API**: CRUD under `/api/dashboard/teams/[slug]/` — members, invites, shares
- **Enhanced Invite System**: 
  - Single invite with role selection and email validation
  - Bulk invite with multiple email addresses support
  - Invite resend functionality
  - Invite page `/invite/[token]` (accept or decline), linked from the API's `invite_url`
  - Invite tokens reach the frontend only through that URL and are redacted from error messages
