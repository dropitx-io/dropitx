# Project Changelog

All notable changes to DropItX.

## [Unreleased]

### Changed
- **API-only data path**: every dashboard, share, team, invite, analytics and profile read now goes through the FastAPI backend (`serverApiFetch` on the server, `authFetch` in the browser). The frontend no longer talks to a database or storage service.
- **Password-protected shares** are unlocked by the API (`POST /api/shares/{slug}/unlock`) and rendered in place; there is no frontend access cookie and no `SHARE_ACCESS_SECRET`.
- **Burn-after-reading and one-time shares** show a reveal state; the content is read only on an explicit click.
- **Team invites** use `/invite/[token]` (the API's `invite_url`); `/invite/accept?token=` redirects to it.
- **Analytics**: page views are recorded by the API; `trackEvent` in `lib/analytics.ts` is a no-op with its original signature.
- **Server API address**: optional runtime variable `API_INTERNAL_URL` for server-side calls (falls back to `NEXT_PUBLIC_API_URL`).
- **Editor**: the end-to-end encryption toggle is no longer offered because nothing on the share page can decrypt; the editor always publishes `encrypted: false`.
- **Upload box**: the unreachable multi-file mode was removed.
- **Env and scripts**: `NEXT_PUBLIC_SUPABASE_URL` is no longer a Docker build arg; `check:hygiene` is `tsc --noEmit && eslint`.

### Removed
- `@supabase/ssr`, `@supabase/supabase-js` and `@vercel/analytics`, the `generate-db-types` script, `utils/supabase/`, `supabase/` (schema and migrations), `types/database.generated.ts`.
- `lib/team-rpc.ts`, `lib/token-security.ts`, `lib/supabase-untyped.ts`, `lib/analytics-track.ts` (and with it `ANALYTICS_TOKEN_SECRET`), `lib/share-access-cookie.ts`, `lib/referrer-parser.ts`.
- Unused components: multi-file upload, dashboard share card, encrypted content viewer, tag manager, the Supabase invite forms, the Vercel analytics mount.

Earlier entries below are historical and describe the stack as it was at the time.

## [v2.5.0] — 2026-07-18

### Added
- **Clay Design System**: Complete redesign from Orange to warm, light-first Clay system
  - Canvas: warm cream (#f7eee6) instead of dark charcoal
  - Accent: terracotta (#b46a46) for primary actions and focus rings
  - Organic radii: 14px, 22px, 34px, pill (9999px) for friendly shapes
  - Soft elevation: Layered shadows with inset highlights for three-dimensionality
  - Dark companion: Optional muted warm-dark palette for accessibility
- **End-to-End Encryption**: AES-256-GCM client-side encryption (Web Crypto API)
  - `lib/crypto.ts` utilities with Uint8Array/BufferSource compatibility fix
  - `encryption-toggle.tsx`, `encrypted-content-viewer.tsx` components
  - Encryption key in URL fragment, never touches server
  - Secure share creation and decryption in browser
- **Burn-After-Reading**: Shares self-destruct atomically on first view
  - `burn-after-reading-toggle.tsx`, `burn-after-reading-tracker.tsx`, `burned-state.tsx` components
  - `burn-warning-banner.tsx` for user awareness
  - Immutable once viewed; prevents re-access; secure + user-friendly

### Changed
- **Design Tokens**: 56-token migration in `app/globals.css`
  - All color variables now use hex for light mode (primary)
  - Dark mode adds `.dark` selector with warm-dark companion
  - Radius tokens hardcoded (no calc) for clarity and consistency
- **Landing Page**: Reorganized sections for Clay aesthetic with updated spacing/shadows
- **Dashboard**: Sidebar and card layouts refreshed with Clay styling
- **Typography**: Refined fluid heading scales (40–76px large, 28–36px medium)
- **Middleware**: Clarified session refresh logic to prevent cross-tab logouts

### Files Modified
- `app/globals.css` — full token replacement (56 tokens, light + dark)
- `components/` — All components inherit Clay styling via updated tokens
- All feature components updated to use Clay color palette
- Design documentation updated in `docs/design-guidelines.md`

---

## [v2.4.0] — 2026-05-24

### Added
- **Route group reorganization**: Pages split into `(public)` and `(dashboard)` route groups for layout separation
- **Landing page redesign**: HeroSection with animated HeroCanvas, ProofCards, WorkflowSteps, CtaSection, LandingFooter
- **Dashboard restyle**: New sidebar layout with DashboardSidebarNav (desktop), DashboardMobileNav (mobile), DashboardToolbar
- **New shared components**: PageHeader, StatCard, EmptyStateCard, Badge UI primitive
- **Public layout**: `app/(public)/layout.tsx` with HeaderBar
- **Dashboard layout**: `app/(dashboard)/dashboard/layout.tsx` with sidebar navigation

### Changed
- **Agentic Design System migration**: Complete visual identity overhaul from violet to orange
- **Primary color**: `#a855f7` (violet, OKLCH H=293) → `#FF5701` (orange, `oklch(0.655 0.222 47)`)
- **Neutral palette**: Cool gray (H=260) → warm gray (H=47) across all surfaces, borders, muted text
- **Display font**: Added Playfair Display (400, 700, 900) as `--font-display` for headings
- **`--font-heading`** aliased to `--font-display` (was `--font-mono`) — card.tsx, page-header.tsx auto-adapt
- **Data visualization palette**: Added `--chart-1` through `--chart-5` with distinct hues (orange, teal, amber, rose, sky blue)
- **Analytics charts**: Migrated from monochrome violet to multi-hue palette
- **Heading elements**: Applied `font-display` to h1-h3 across feature components

### Removed
- All hardcoded `#a855f7` hex values (OG image route, embed page)
- All `bg-purple-500` Tailwind default palette classes (invite dialogs)
- All hardcoded OKLCH H=293 values (analytics charts, referrer colors)
- Zero violet/purple references remain in codebase

### Files Modified
- `app/globals.css` — full token replacement (40+ tokens, light + dark)
- `app/layout.tsx` — Playfair Display font loading
- `app/api/og-image/[slug]/route.tsx` — orange brand color
- `app/(public)/embed/[slug]/page.tsx` — orange fallback color
- `components/analytics/analytics-geo-chart.tsx` — multi-hue palette
- `components/analytics/analytics-view-chart.tsx` — multi-hue palette
- `components/analytics/analytics-referrer-chart.tsx` — multi-hue palette
- `components/bulk-invite-dialog.tsx` — `bg-primary` class
- `components/enhanced-invite-dialog.tsx` — `bg-primary` class
- `components/hero-section.tsx`, `proof-cards.tsx`, `cta-section.tsx`, `profile-form.tsx`, `workflow-steps.tsx` — `font-display` headings

## [v2.3.0] — 2026-05-02

### Changed
- **Migrated all frontend API calls to FastAPI backend**: All 24 Next.js API route handlers (~2,400 lines) removed. Frontend now calls `dropitx-api.onrender.com` directly via `authFetch()` with JWT Bearer auth
- **`lib/api-client.ts`**: Added `authFetch()` with singleton Supabase client, JWT Bearer token injection, and 401 retry with session refresh
- **17 client components updated**: All authenticated fetch calls migrated from `fetch(getApiUrl(...))` to `authFetch()`
- **Analytics tracker**: Updated to snake_case fields (`tracking_token`, `share_id`, `is_embed`) for FastAPI compatibility
- **Share password form**: Preserved dual auth (JWT + delete_token) for anonymous and authenticated users

### Removed
- **24 Next.js API route handlers** deleted (`app/api/*/route.ts`)
- **5 orphaned utility files** deleted: `lib/api-auth.ts`, `lib/rate-limit.ts`, `lib/validate-editor-content.ts`, `lib/extract-text.ts`, `lib/extract-title-from-markdown.ts`
- **OG image route preserved** at `app/api/og-image/`

### Architecture
- Next.js is now a pure frontend — zero API routes (except OG image generation)
- `NEXT_PUBLIC_API_URL=https://dropitx-api.onrender.com` set as build-time env var
- Rollback via `git revert` if needed

## [v2.2.1] — 2026-04-29

### Added
- **Team Invite Accept UI**: Complete invite acceptance system with notification bell and decline functionality
- **Decline Team Invite RPC**: Secure decline functionality with email validation and event emission
- **Dashboard Invitations API**: GET endpoint for fetching pending invitations with team and inviter data
- **Decline API Route**: POST endpoint for declining team invitations with error handling
- **Notification Bell Component**: Header-mounted popover showing pending invites with accept/decline actions
- **Auto-Signup Accept Flow**: Unauthenticated users can sign up and automatically accept invitations
- **Invite Accept UI Enhancements**: Fixed status handling for declined invitations, redirect path validation
- **Bell Auto-Refresh**: Manual revalidation on window focus for real-time updates
- **Toast Notifications**: Instant feedback for accept/decline actions

### Team Invite Architecture
- **Single Invite**: Role-based invite with email validation and server-side verification
- **Bulk Invite**: Batch processing with progress tracking and error handling
- **Invite Resend**: Secure token-based resend functionality with rate limiting
- **Accept Flow**: Secure token-based acceptance with automatic team membership
- **Decline Flow**: Secure token-based decline with status updates and event tracking
- **RPC Client**: Type-safe server communication for team operations
- **Token Security**: Secure invite token generation, validation, and management
- **UI System**: Header notification bell with auto-refresh for pending invites

### Infrastructure Updates
- **New API Routes**: `/api/dashboard/invitations` and `/api/invite/decline`
- **New SQL Migration**: `decline_team_invite` RPC with email validation and event emission
- **Enhanced Components**: `InviteNotificationBell` with popover and invite management
- **Type Safety**: Enhanced TypeScript interfaces for invite system components
- **Error Handling**: Comprehensive error handling for invite operations and API routes

---

## [v2.2.0] — 2026-04-29

### Added
- **Enhanced Team Invite System**: Complete invite management with role selection and email validation
- **Team Invite Form**: Enhanced form with role selection, email validation, and team selection
- **Enhanced Invite Dialog**: Advanced dialog with invite link generation and team RPC client integration
- **Bulk Invite Dialog**: Support for inviting multiple team members at once with progress tracking
- **Invite Accept Flow**: Complete flow from invite acceptance to team membership
- **Team RPC Client**: Type-safe server communication for team operations using lib/team-rpc.ts
- **Token Security Utilities**: Secure invite token management with lib/token-security.ts
- **New UI Primitives**: Dialog, select, textarea, alert, and skeleton components
- **New Hooks**: use-email-validation for real-time email validation, use-team for team state management, use-toast for notifications
- **Copy-Button Component**: Enhanced copy functionality for share links and invite URLs

### Team Invite Architecture
- **Single Invite**: Role-based invite with email validation and server-side verification
- **Bulk Invite**: Batch processing with progress tracking and error handling
- **Invite Resend**: Secure token-based resend functionality with rate limiting
- **Accept Flow**: Secure token-based acceptance with automatic team membership
- **RPC Client**: Type-safe server communication for team operations
- **Token Security**: Secure invite token generation, validation, and management

### Security Enhancements
- **Invite Token Validation**: Server-side token validation with expiration checking
- **Rate Limiting**: Enhanced rate limiting for invite operations (bulk/resend)
- **Email Validation**: Real-time email format validation with duplicate checking
- **Access Control**: Role-based access control for team operations

### Infrastructure Updates
- **New API Routes**: `/api/dashboard/teams/[slug]/invites/bulk` and `/api/dashboard/teams/[slug]/invites/[id]/resend`
- **Enhanced Components**: New team-specific components with improved UX
- **Type Safety**: Enhanced TypeScript interfaces for team invite system
- **Error Handling**: Comprehensive error handling for invite operations

---

## [v2.1.0] — 2026-04-29

### Added
- **Email/Password Authentication**: Complete email auth system with signup, login, password reset, and email confirmation flows
- **Split-screen Login Page**: Redesigned `/auth/login` with split-screen layout showing email form alongside OAuth buttons
- **Email Signup Flow**: Users can create accounts with email/password via PKCE flow with email verification
- **Password Reset System**: Complete flow from reset request → email link → password update
- **Email Confirmation**: Verification page for email address confirmation
- **Enhanced Auth UI**: New form components for email authentication with proper validation

### Infrastructure Enhancements
- **Supabase Email Auth**: Extended auth system to include email/password alongside OAuth providers
- **Security**: PKCE flow for email auth, password hashing, and secure session management
- **User Experience**: Seamless switching between OAuth and email authentication methods

### New Pages and Routes
- `/auth/login`: Split-screen layout with email form and OAuth options
- `/auth/reset-password`: Password reset request and email link handling
- `/auth/update-password`: Password update after reset link verification
- `/auth/confirm`: Email verification and confirmation
- Enhanced `/auth/callback` to handle email auth alongside OAuth

---

## [v2.0.1] — 2026-04-28

### Added
- **RLS Policy Hardening**: Fixed infinite recursion and permission errors for team workspaces
- **Authentication Role Migration**: Changed RLS policies from `anon` to `authenticated` role for proper access control
- **Team Workspace Stability**: Resolved issues with workspace member management and access permissions

### Infrastructure Enhancements
- **Database Stability**: Fixed recursive queries in team member policies
- **Security Improvements**: Proper role-based access control across all workspace tables
- **Performance**: Optimized RLS policies for better query performance

### Database Migrations
- `20260428000001_fix_team_owner_trigger_rls.sql`: RLS fixes for team workspace owner policies
- `20260428000002_fix_team_members_rls_recursion.sql`: Fixed infinite recursion in team member policies
- `20260428000003_fix_teams_insert_policy.sql`: Team member insertion policy fixes
- `20260428000004_fix_rls_policies_use_anon_role.sql`: RLS policy updates using anon role
- `20260428162629_fix_rls_policies_to_authenticated.sql`: RLS policies changed to authenticated role

---

## [v2.0.0] — 2026-04-26

### Added
- **oEmbed API**: Standardized content embedding with `GET /api/oembed` endpoint supporting JSON and XML formats
- **Rich Metadata Generation**: Title, author, embed code generation for third-party platform integration
- **WordPress/Medium Compatibility**: XML response format for popular content management systems
- **Analytics System**: Real-time user engagement tracking with `analytics_events` table
- **Behavioral Analytics**: Page views, search queries, upload tracking, and API usage monitoring
- **Content Performance Metrics**: Popular shares, search trends, and geographic distribution analysis
- **Team Workspaces**: Collaborative workspace creation and management system
- **Role-Based Access Control**: Owner vs member permissions for workspace content
- **Workspace Sharing**: Members can share content to workspaces and organize collectively
- **Invitation System**: Workspace owners can add/remove members with email invitations
- **Private Workspace Isolation**: Row-level security ensuring data privacy between workspaces

### Infrastructure Enhancements
- **Analytics Dashboard**: Real-time metrics dashboard showing user engagement and content performance
- **Embed Security**: Domain validation, CSP headers, and content filtering for embedded iframes
- **Workspace APIs**: Full CRUD operations for workspaces, members, and shared content
- **Performance Monitoring**: Request rates, error tracking, and endpoint popularity analysis

### Database Migrations
- `20260426000001_add_analytics_tables.sql`: `analytics_events` table for user tracking
- `20260426000002_add_team_workspaces.sql`: `team_workspaces`, `workspace_members`, `workspace_shares` tables
- `20260426000003_add_oembed_support.sql`: Enhanced share metadata for embedding

### New Environment Variables
- `ANALYTICS_SECRET` — Secret key for analytics data signing and validation
- `EMBED_ALLOWED_DOMAINS` — Comma-separated list of approved embedding domains

### New Dependencies
- `uuid` — For generating unique session and event identifiers
- `@radix-ui/react-toast` — Analytics notification system
- `recharts` — Dashboard charting and data visualization

---

## [v1.3.2] — 2026-04-26

### Added
- **HeaderBar compound component system**:
  - `HeaderBar`: Main orchestrator managing responsive state and mobile drawer
  - `HeaderNav`: Desktop navigation with menu toggle functionality
  - `HeaderMobileDrawer`: Slide-out mobile navigation with backdrop and close functionality
- **Navigation utilities**: `lib/nav-links.ts` (centralized links), `lib/use-auth-user.ts` (auth state hook)
- **Layout optimization**: Removed duplicate logo and profile from dashboard sidebar

### Changed
- **Header standardization**: Replaced inline header in `app/layout.tsx` with `HeaderBar` compound component
- **Dashboard layout**: Simplified sidebar by moving logo and profile to header component

### Components Architecture
New compound pattern improves:
- **Reusability**: Single header across all layouts
- **Maintainability**: Centralized header logic and styling
- **Responsive design**: Proper mobile/desktop state management
- **Performance**: Reduced component duplication

---

## [v1.3.1] — 2026-04-25

---

## [v1.3.1] — 2026-04-25

### Changed
- **Typography**: Replaced Geist Sans + Geist Mono with Ubuntu + Ubuntu Mono across all pages, markdown viewer, and code blocks

---

## [v1.3.0] — 2026-04-25

### Changed
- **Rebrand**: ShareHTML → DropItX with electric violet identity (OKLCH color tokens, updated all UI components)

---

## [v1.2.0] — 2026-04-25

### Added
- **Password protection for shares**: bcryptjs hash stored in `shares.password_hash`; `has_password: boolean` flag exposed to clients (raw hash never sent)
- **`PasswordGate` component**: full-page password entry form rendered when a share is password-protected
- **`SharePasswordForm` component**: reusable set/remove password form used in dashboard share cards
- **`POST /api/shares/[slug]/unlock`**: verifies password and issues an HMAC-SHA256 signed HttpOnly access cookie (24 h TTL)
- **`POST /api/shares/[slug]/set-password`**: owner or delete_token auth; sets or clears `password_hash`
- **`lib/password.ts`**: bcryptjs `hashPassword` / `verifyPassword` helpers
- **`lib/share-access-cookie.ts`**: HMAC-SHA256 cookie signing/verification using `SHARE_ACCESS_SECRET`
- **`checkPasswordRateLimit`** in `lib/rate-limit.ts`: 5 attempts / 10 min per IP sliding window; fail-closed (503) when Redis is unavailable
- **View gate on `/s/[slug]`**: layered access control — owner bypass → is_private → access cookie → password gate → auth gate → login redirect; view count increments only after gate passes
- **Login redirect**: `app/auth/login/page.tsx` reads `?next=` param (validated as `/s/*`), passes through OAuth callback, shows "Sign in to view shared content" contextual message
- **Dashboard lock/unlock toggle**: share cards show password lock state with set/remove controls via `SharePasswordForm`
- **Password section in `ShareLink`**: anonymous upload flow can optionally set a password on the share
- **CLI `-P/--password` flag**: `share-html publish <file> -P <password>` sets password on publish
- **API v1 `password` field**: `POST /api/v1/documents` and `PATCH /api/v1/documents/[slug]` accept optional `password` field

### Database Migrations
- `20260425000001_add_share_password.sql`: `shares.password_hash` (nullable TEXT)

### New Environment Variable
- `SHARE_ACCESS_SECRET` — 32+ char random string for HMAC cookie signing (required for password-gated shares)

### New Dependencies
- `bcryptjs` — password hashing

### Security Model
- All `/s/[slug]` views require login OR valid password cookie. Owner always bypasses gate.
- `password_hash` is never returned to the client; API exposes `has_password: boolean` only.
- Rate limiting is fail-closed: if Redis is unavailable, password unlock returns 503 (no silent bypass).

---

## [v1.1.0] — 2026-04-24

### Added
- **Markdown editor** (`/editor`): CodeMirror 6 with live split-pane preview (react-markdown + shiki)
- **Editor components**: `EditorShell`, `EditorPane`, `EditorPreview`, `EditorToolbar`, `EditorPublishBar`
- **Editor extensions** (`lib/editor-extensions/`): slash commands, image drag-and-drop
- **Auto-draft**: `useEditorAutoSave` persists editor content to localStorage; dirty-state unload warning
- **Publishing API**: `POST /api/publish` — create share from Markdown content (title, custom_slug, is_private)
- **Inline image upload**: `POST /api/images/upload` — PNG/JPG/GIF/WebP, max 5 MB, auth required
- **REST API v1**: `POST/GET /api/v1/documents`, `GET/PATCH/DELETE /api/v1/documents/[slug]`
- **API key management**: `POST/GET /api/v1/keys`, `DELETE /api/v1/keys/[id]`
- **`ApiKeyManager` component**: Dashboard UI for creating and revoking API keys
- **`lib/api-auth.ts`**: SHA-256 hash + `api_keys` table lookup for Bearer token auth
- **Private shares**: `is_private` flag on `shares`; hidden from search and public listing for non-owners
- **Custom slugs**: `handle/slug` format via `custom_slug` column with partial unique index
- **CLI tool** (`packages/cli/`): binary `dropitx`; commands: `login`, `publish`, `update`, `delete`, `list`, `whoami`

### Database Migrations
- `20260424000001_add_editor_columns.sql`: `shares.source`, `shares.custom_slug`, `shares.is_private`, `shares.updated_at`
- `20260424000002_add_api_keys.sql`: `api_keys` table + RLS policies
- `20260424000003_private_search_filter.sql`: updates `search_shares` RPC to filter private shares by owner

### Changed
- `shares.source` column distinguishes `'upload'` from `'editor'` shares
- `search_shares` RPC updated to exclude private shares for non-owners

---

## [v1.0.0] — 2026-04-23

### Added
- **User authentication**: Google and GitHub OAuth via Supabase (PKCE flow)
- **`/auth/login`**: OAuth sign-in page with Google and GitHub buttons
- **`/auth/callback`**: PKCE code-exchange route; bootstraps `user_profiles` on first login
- **User dashboard** (`/dashboard`): share list with stats (count, total views, storage used)
- **Profile settings** (`/dashboard/profile`): edit display name and avatar URL
- **Favorites** (`/dashboard/favorites`): bookmark and browse saved shares
- **`BookmarkToggle`** component: add/remove favorites with optimistic update
- **`AuthUserMenu`** component: header dropdown with profile link and logout
- **`DashboardShareCard`** component: share card with stats and owner actions
- **`ProfileForm`** component: display name + avatar form with save feedback
- **Blue accent design system**: full UI overhaul with OKLCH color tokens in `app/globals.css`
- **50 MB upload limit**: increased from 10 MB (storage bucket, server API, client dropzone)
- **Markdown file support**: `.md` upload, react-markdown + remark-gfm + shiki viewer, preview/raw toggle
- **`MarkdownViewer`** + **`MarkdownViewerWrapper`** components (lazy-loaded via `next/dynamic`)
- **RLS hardening**: `user_profiles`, `favorites` tables with owner-only policies; `shares.user_id` ownership tracking
- **Middleware**: `utils/supabase/middleware.ts` for session refresh and `/dashboard/*` route protection

### Database Migrations
- `20260423000001_add_auth_tables.sql`: `user_profiles`, `favorites`, `shares.user_id`, `shares.title`

### Dependencies Added
- `@supabase/ssr` — SSR cookie-based session management
- `react-markdown` — Markdown parsing and rendering
- `remark-gfm` — GitHub Flavored Markdown support
- `shiki` — syntax highlighting with JS regex engine
- `next-themes` — class-based dark/light theme switching

---

## [2026-04-22] — Upload Size Increase & Markdown Support

### Added
- Markdown file upload (`.md` files)
- Client-side Markdown viewer with react-markdown + shiki
- Preview/raw toggle for Markdown shares
- GitHub-like prose styling (`app/markdown-viewer.css`)

### Changed
- Upload size limit: 10 MB → 50 MB (dropzone, API, Supabase bucket)
- Upload API: accepts `.md` extension and `text/markdown` MIME type
- `lib/extract-text.ts`: handles Markdown content for search indexing

---

## [2026-04-22] — Initial Platform Release

### Core Features
- HTML file upload with drag-and-drop
- Share link generation (nanoid 10-character slugs)
- Sandboxed HTML viewer with CSP headers
- Full-text search with pagination (TSVECTOR + GIN index)
- Light/dark theme switching
- Rate limiting (10 req/min per IP via Upstash Redis)
- 30-day automatic file expiration
- Delete token-based authorization
- Responsive design

### Tech Stack
- Next.js 16 with App Router, React 19, TypeScript 5
- Supabase (PostgreSQL + Storage)
- Tailwind CSS 4, shadcn/ui
- Vercel deployment
