# DropItX

Drop HTML and Markdown files, write in the built-in editor, and get short shareable links. Programmatic access via REST API and CLI. Built with Next.js 16 (frontend), FastAPI (backend), Firebase Auth, and Tailwind CSS.

## Features

- **Upload**: Drag-and-drop HTML and Markdown files (up to 50 MB)
- **Editor**: Markdown editor with live split-pane preview (CodeMirror 6)
- **Markdown**: GitHub-like rendered preview with syntax highlighting, toggle to raw source
- **Share**: Short slug-based URLs (`/s/abc123`), optional custom slugs
- **Private shares**: `is_private` flag hides shares from search and public listing
- **Password Protection**: Passwords verified by the API; unlocked content renders in place
- **End-to-End Encryption**: not available in the web app yet (planned); the editor does not offer it until the share page can decrypt
- **Burn-After-Reading**: Share self-destructs on first view
- **Expiration**: Configurable share expiration (default 30 days)
- **Multi-File**: View multi-file shares with tabs (creating them from the web upload box is not available)
- **Comments**: Thread discussion on shared content
- **Version History**: Track and restore previous versions
- **QR Codes**: Auto-generate QR codes for share URLs
- **Search**: Full-text search across all content
- **Auth**: Google and GitHub OAuth; user dashboard, profile, favorites
- **API**: REST API v1 for programmatic document management (Bearer API key)
- **CLI**: `dropitx` binary for publish/update/delete from the terminal
- **Analytics**: View counts, geographic data, referrer tracking
- **Teams**: Workspace collaboration with role-based access
- **Security**: Sandboxed iframe viewing with CSP, rate limiting, API-enforced authorization

## Tech Stack

- **Next.js 16** (App Router, React 19) — pure frontend, shipped as a Docker image
- **FastAPI** (Python) — the backend API; the frontend's only data path
- **TypeScript** (strict mode)
- **Firebase Auth** (Google, GitHub, email/password)
- **CodeMirror 6** (Markdown editor, SSR-disabled)
- **Tailwind CSS 4** + shadcn/ui (Clay design system — light-first, warm cream, terracotta accent, organic radii)
- **CLI**: `dropitx-cli` — Python, published to PyPI as `dropitx`

## Getting Started

### Prerequisites

- Node.js 20+
- A running `dropitx-api` instance
- A Firebase project (web config and a service-account key)

### Setup

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env.local

# Run development server
npm run dev   # http://localhost:3000
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | FastAPI backend URL (required), e.g. `http://localhost:8000` |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web SDK config (6 variables, see `.env.example`) |
| `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase Admin credentials (server-only) |
| `NEXT_PUBLIC_APP_URL` | Canonical site origin for absolute links |
| `NEXT_PUBLIC_APP_HOST` | App host without scheme (Docker build arg) |

The database schema belongs to `dropitx-api`; this repository has no migrations. See `docs/CONFIGURATION.md` for details.

## CLI Quick Start

```bash
# Install the CLI
pip install dropitx

# Authenticate (generate an API key at /dashboard first)
dropitx login

# Publish a Markdown file
dropitx publish README.md -t "My Doc"

# Publish as private
dropitx publish notes.md -t "Private Notes" -p

# List your documents
dropitx list

# Update content
dropitx update abc123 updated.md

# Delete
dropitx delete abc123
```

## API Reference

All API endpoints are served by the FastAPI backend. v1 endpoints require `Authorization: Bearer <api-key>`. Generate keys at `/dashboard`.

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/documents` | Create document |
| `GET` | `/api/v1/documents` | List documents (`?limit=&offset=`) |
| `GET` | `/api/v1/documents/:slug` | Get metadata + URL |
| `PATCH` | `/api/v1/documents/:slug` | Update content/metadata |
| `DELETE` | `/api/v1/documents/:slug` | Delete (204) |

**Create document request body:**
```json
{
  "content": "# Hello\n\nMarkdown content here.",
  "title": "My Document",
  "slug": "my-custom-slug",
  "is_private": false
}
```

### API Keys

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/keys` | Create API key (returned once) |
| `GET` | `/api/v1/keys` | List keys (prefix only, no hash) |
| `DELETE` | `/api/v1/keys/:id` | Revoke key (soft-delete) |

## Project Structure

```
app/                  # Next.js App Router pages (pure frontend)
app/editor/           # Markdown editor (SSR-disabled)
app/api/              # OG image route and session login/logout
components/           # React components (ui/ for primitives)
lib/                  # Utilities (api-client, server-api, firebase, etc.)
lib/editor-extensions/# CodeMirror slash commands, image drop
types/                # TypeScript interfaces
public/               # Static assets
docs/                 # Project documentation
```

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build + TypeScript check
- `npm run lint` — ESLint
- `npm run check:hygiene` — `tsc --noEmit && eslint`

## Documentation

See `docs/` for detailed documentation:

- [Project Overview & PDR](docs/project-overview-pdr.md)
- [System Architecture](docs/system-architecture.md)
- [Codebase Summary](docs/codebase-summary.md)
- [Code Standards](docs/code-standards.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Design Guidelines](docs/design-guidelines.md)
- [Project Roadmap](docs/project-roadmap.md)
- [Changelog](docs/project-changelog.md)
