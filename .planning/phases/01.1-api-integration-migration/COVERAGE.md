# Phase 01.1 — API Coverage Matrix

**Generated:** 2026-08-16 (plan-phase, API Coverage Decision Checkpoint)
**External API:** `https://api.dropitx.site` (FastAPI, 84 endpoints / 17 tag groups — `dropitx-api` sibling repo)
**Detector:** `api-coverage.cjs --json` → `detected: true` (5 signals: `integration/api`, `wire/endpoints`, `wire/api`, `wires/endpoints`)

Default is **INTEGRATE**. This table is the *subtraction record* — every `OPT-OUT` carries a one-line reason.

## Capability Surface

| # | capability | decision | plan | reason (OPT-OUT only) |
|---|-----------|----------|------|------------------------|
| 1 | `GET /health` (liveness smoke) | INTEGRATE | 01.1-01 | — |
| 2 | `NEXT_PUBLIC_API_URL` per-Vercel-environment resolution | INTEGRATE | 01.1-01 | — |
| 3 | `GET /api/shares/{slug}/star` | INTEGRATE | 01.1-01 | — |
| 4 | `POST /api/shares/{slug}/star` | INTEGRATE | 01.1-01 | — |
| 5 | `DELETE /api/shares/{slug}/star` | INTEGRATE | 01.1-01 | — |
| 6 | "list my starred shares" (endpoint does not exist yet) | INTEGRATE — **gated on cross-repo dependency D-01a** | 01.1-11 | Not an opt-out. Frontend work is authored and blocked behind a `checkpoint:decision`; the endpoint must first land in `dropitx-api` and deploy to `api.dropitx.site`. |
| 7 | Profile read (`user_profiles` SSR, frontend Supabase) | INTEGRATE | 01.1-02 | — |
| 8 | Profile write (frontend Route Handler `PUT /api/profile`, per D-02) | INTEGRATE | 01.1-02 | — |
| 9 | `GET /api/explore` (browse) | INTEGRATE | 01.1-06 | — |
| 10 | `GET /api/explore/tags` | INTEGRATE | 01.1-06 | — |
| 11 | `GET /api/explore/trending` | INTEGRATE | 01.1-06 | — |
| 12 | `GET /api/u/{username}` (public profile) | INTEGRATE | 01.1-07 | — |
| 13 | `GET /api/u/{username}/shares` | INTEGRATE | 01.1-07 | — |
| 14 | `POST /api/dashboard/teams/{slug}/domains` (add) | INTEGRATE | 01.1-08 | — |
| 15 | `GET /api/dashboard/teams/{slug}/domains` (list) | INTEGRATE | 01.1-08 | — |
| 16 | `GET /api/dashboard/teams/{slug}/domains/{domain_id}` (detail) | OPT-OUT | — | Redundant: the list endpoint returns the full `CustomDomain` row (`select("*")`), so the row UI needs no second round-trip. |
| 17 | `DELETE /api/dashboard/teams/{slug}/domains/{domain_id}` | INTEGRATE | 01.1-08 | — |
| 18 | `POST /api/dashboard/teams/{slug}/domains/{domain_id}/verify` | INTEGRATE | 01.1-08 | — |
| 19 | `PATCH /api/dashboard/teams/{slug}/domains/{domain_id}/brand` | OPT-OUT | — | Not needed yet: white-label branding is v2 scope (`ENT-01`); API-04 names only "manage custom domains", and UI-SPEC declares no branding surface. |
| 20 | `GET /api/domains/resolve/{domain}` | OPT-OUT | — | Explicitly out of scope: `include_in_schema=False`, server-to-server edge routing, no browser caller. |
| 21 | `POST /api/requests` (create file request) | INTEGRATE | 01.1-09 | — |
| 22 | `GET /api/dashboard/requests` (list mine) | INTEGRATE | 01.1-09 | — |
| 23 | `GET /api/dashboard/requests/{request_id}/uploads` | INTEGRATE | 01.1-09 | — |
| 24 | `PATCH /api/dashboard/requests/{request_id}` | INTEGRATE | 01.1-09 | — |
| 25 | `DELETE /api/dashboard/requests/{request_id}` | INTEGRATE | 01.1-09 | — |
| 26 | `GET /api/requests/{slug}` (public info) | INTEGRATE | 01.1-09 | — |
| 27 | `POST /api/requests/{slug}/upload` (anonymous upload) | INTEGRATE | 01.1-09 | — |
| 28 | `POST /api/encryption/generate-key` | INTEGRATE | 01.1-05 | — |
| 29 | `GET /api/shares/{slug}/encryption-info` | INTEGRATE | 01.1-05 | — |
| 30 | `POST /api/shares/{slug}/encrypt` | INTEGRATE | 01.1-05 | — |
| 31 | `POST /api/shares/{slug}/reencrypt` | INTEGRATE — behind blocking security checkpoint (T-01.1-01) | 01.1-05 | — |
| 32 | `POST /api/publish` + `PUT /api/publish/{slug}` | INTEGRATE (already wired — confirm-only) | 01.1-04 | — |
| 33 | `POST /api/upload` (single) | INTEGRATE (already wired — confirm-only) | 01.1-04 | — |
| 34 | `POST /api/upload/multi` | INTEGRATE (already wired — confirm-only) | 01.1-04 | — |
| 35 | `POST /api/upload/batch` (group upload) | INTEGRATE | 01.1-04 | — |
| 36 | `GET /api/shares/{slug}/files` | INTEGRATE | 01.1-04 | — |
| 37 | `POST /api/images/upload` | INTEGRATE (already wired — confirm-only) | 01.1-04 | — |
| 38 | `POST /api/cli/upload*` | OPT-OUT | — | Explicitly out of scope: consumed by the separate `dropitx-cli` PyPI tool, not this Next.js app (RESEARCH.md §Architectural Responsibility Map). |
| 39 | `GET /api/download/group/{group_slug}` (bulk zip) | INTEGRATE (link-only) | 01.1-04 | — |
| 40 | `GET /api/v1/*` (API-key / CLI-authenticated document routes) | OPT-OUT | — | Explicitly out of scope: parallel API-key-authenticated surface for programmatic clients; API-05 covers the JWT publish path only, and RESEARCH.md forbids merging the two flows without a separate user decision. |

## Summary

- **INTEGRATE:** 35 capabilities across 11 plans (1 of which — #6 — is authored but gated on a cross-repo dependency)
- **OPT-OUT:** 5 capabilities, each with a stated reason
- **Silently dropped:** 0

## Frontend route gap surfaced by this matrix

`POST /api/upload/batch` returns `group_url = {frontend_url}/g/{group_slug}`, but **no `app/(public)/g/[slug]` route exists in this repo**. Plan 01.1-04 therefore does not surface the backend-supplied `group_url` to users; it renders the per-file share URLs plus a direct "Download all" link to `GET /api/download/group/{group_slug}`. Building the `/g/[slug]` group landing page is a flagged follow-up, not a silent omission — see 01.1-04 `must_haves.truths`.
