# Deployment Guide

This guide covers deploying the DropItX frontend. The frontend holds no database, storage or rate-limit credentials: it talks to the FastAPI backend (`dropitx-api`) for every read and write, and to Firebase for sign-in. The backend's own deployment (Postgres, MinIO, Kubernetes manifests) is documented in that repository.

## Prerequisites

- Node.js 20+ and npm (for local runs), or Docker (for the image)
- A reachable `dropitx-api` instance whose `ALLOWED_ORIGINS` includes the frontend origin
- A Firebase project (web app config and a service-account key)

## Environment Variables

| Variable | Kind | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_API_URL` | build arg | FastAPI backend base URL. Required. |
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` | build args | Firebase web SDK config. Required. |
| `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` | runtime | Firebase Admin credentials used to mint and verify the `session` cookie. Required; server-only. |
| `NEXT_PUBLIC_APP_URL` | build arg | Canonical site origin for absolute share, embed and QR links. Defaults to `https://dropitx.com`. |
| `NEXT_PUBLIC_APP_HOST` | build arg | App host without scheme. Declared in the Dockerfile; no code reads it today. |

`NEXT_PUBLIC_*` values are inlined into the client bundle when the image is built, so changing one requires a rebuild. The full reference is in [CONFIGURATION.md](./CONFIGURATION.md).

## Docker Image

The `Dockerfile` installs dependencies, runs `npm run build` (Next.js standalone output) and serves it with `node server.js` on port 3000.

```bash
docker image build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=... \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=... \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=... \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=... \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=... \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=... \
  --build-arg NEXT_PUBLIC_APP_URL=https://dropitx.com \
  --build-arg NEXT_PUBLIC_APP_HOST=dropitx.com \
  -t dropitx-fe .

docker run --rm -p 3000:3000 \
  -e FIREBASE_ADMIN_PROJECT_ID=... \
  -e FIREBASE_ADMIN_CLIENT_EMAIL=... \
  -e FIREBASE_ADMIN_PRIVATE_KEY=... \
  dropitx-fe
```

The compile fetches Google Fonts (`next/font/google`), so the image build needs outbound network access. The compile does not validate environment variables; a green build does not prove they are set.

Server components call the API directly, so `NEXT_PUBLIC_API_URL` must be reachable from the running container as well as from browsers. The same value is used in both places, so it must resolve to the API from inside the container; `localhost` there means the container itself.

## Other Hosts

Any host that runs a Next.js 16 server works if it provides the same variables: the `NEXT_PUBLIC_*` ones at build time and the `FIREBASE_ADMIN_*` ones at run time. Run `npm run build` then `npm start`.

## Local Development

```bash
npm install
cp .env.example .env.local   # fill in env vars
npm run dev                  # http://localhost:3000
```

## CLI Tool

The CLI is the separate `dropitx-cli` repository (Python, published to PyPI as `dropitx`). It talks to the same backend with an API key generated from `/dashboard`.

```bash
pip install dropitx
dropitx login
dropitx publish my-file.md -t "My Doc"
```

## Production Checklist

- [ ] `NEXT_PUBLIC_API_URL`, the six `NEXT_PUBLIC_FIREBASE_*` values and `NEXT_PUBLIC_APP_URL` passed as build args
- [ ] `FIREBASE_ADMIN_*` set on the running container
- [ ] The API's `ALLOWED_ORIGINS` includes the site origin, and `FRONTEND_URL` matches it
- [ ] The site's domain is an authorized domain in the Firebase console (Authentication settings)
- [ ] `npm run check:hygiene` and `npm run build` pass
- [ ] Anonymous flows checked: a public share, a password share (gate and unlock), a burn-after-reading share (reveal state), an embed, an unknown invite link
- [ ] Signed-in flows checked: dashboard, favorites, profile save, analytics, teams, invites, editor publish and edit

## Maintenance

Data retention, expired-share cleanup, storage and rate limiting are owned by the API; see the `dropitx-api` repository. The frontend has no scheduled jobs.
