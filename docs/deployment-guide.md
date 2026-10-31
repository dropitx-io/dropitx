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
| `API_INTERNAL_URL` | runtime (optional) | Address the Next.js server uses to reach the API when it differs from the public one (internal service name, `host.docker.internal`). Defaults to `NEXT_PUBLIC_API_URL`. Never a build arg. |
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
  -e API_INTERNAL_URL=http://api.internal:8000 \
  dropitx-fe
```

The compile fetches Google Fonts (`next/font/google`), so the image build needs outbound network access. The compile does not validate environment variables; a green build does not prove they are set.

Server components call the API directly, from inside the container. `NEXT_PUBLIC_API_URL` is also what the container uses unless `API_INTERNAL_URL` is set, and `localhost` inside a container means the container itself. When the public URL is not reachable from the container, pass an internal address at run time, for example `-e API_INTERNAL_URL=http://host.docker.internal:8000` (add `--add-host=host.docker.internal:host-gateway` on Linux). Browsers keep using the public URL.

In production, set `API_INTERNAL_URL` to an address that does not traverse Cloudflare, such as the in-cluster service name. Cloudflare overwrites `CF-Connecting-IP`, and the API keys its rate limits on that header, so server-side calls routed through Cloudflare would all appear to come from Cloudflare's addresses and share one rate-limit bucket instead of the visitor's.

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
- [ ] `FIREBASE_ADMIN_*` set on the running container, and `API_INTERNAL_URL` if the container cannot reach `NEXT_PUBLIC_API_URL`
- [ ] The API's `ALLOWED_ORIGINS` includes the site origin, and `FRONTEND_URL` matches it
- [ ] The site's domain is an authorized domain in the Firebase console (Authentication settings)
- [ ] `npm run check:hygiene` and `npm run build` pass
- [ ] Anonymous flows checked: a public share, a password share (gate and unlock), a burn-after-reading share (reveal state), an embed, an unknown invite link
- [ ] Signed-in flows checked: dashboard, favorites, profile save, analytics, teams, invites, editor publish and edit

## Maintenance

Data retention, expired-share cleanup, storage and rate limiting are owned by the API; see the `dropitx-api` repository. The frontend has no scheduled jobs.
