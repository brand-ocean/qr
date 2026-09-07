# Virals admin (`/admin`)

A Convex-backed admin for managing the QR card → video links and seeing which
videos still work. Lives entirely under `cloudflare/`, isolated from the Expo
app.

- **Backend:** Convex (`cloudflare/convex/`) — cards table, Convex Auth
  (email + password), daily YouTube availability check.
- **Frontend:** Vite + React SPA (`cloudflare/admin/`), forz visual style
  (Tremor shadcn, blue accent, dark mode, Aeonik Pro). Builds to
  `public/admin/`, served by the worker at `viralsgame.nl/admin`.
- **Live data:** Convex is the single source of truth. The worker reads each
  card from Convex on request (60s per-isolate cache); if Convex is unreachable
  it serves a "even geen verbinding" notice (503), never stale data.
- **Native app:** also reads every card live from Convex (`src/convex/client.ts`,
  query `cards:getForPlayer`). There is no bundled dataset, so admin edits reach
  iOS, Android and web immediately without an app release.

## One-time setup

All commands run from `cloudflare/`.

```bash
npm install

# 1. Create the Convex deployment + generate convex/_generated + deploy functions.
#    Writes CONVEX_DEPLOYMENT to .env.local and prints the deployment URL.
npx convex dev            # leave running, or run `npx convex dev --once`

# 2. Initialize Convex Auth (creates JWT_PRIVATE_KEY + JWKS on the deployment).
npx @convex-dev/auth
#    Then allow your admin email(s) to create an account:
npx convex env set ADMIN_EMAILS "you@example.com,teammate@example.com"
#    Create your account from the login screen (sign-up is blocked for any
#    email not in ADMIN_EMAILS).

# 3. Seed the 267 existing cards into Convex (idempotent; no-op if not empty).
npx convex run seed:run

# 4. Point the admin SPA and worker at the deployment.
echo "VITE_CONVEX_URL=https://<your-deployment>.convex.cloud" > admin/.env.local
#    Also set CONVEX_URL in wrangler.json "vars" to the same URL.
```

## Develop

```bash
npx convex dev            # backend (terminal 1)
npm run admin:dev         # SPA on http://localhost:5173/admin/ (terminal 2)
```

## Deploy

```bash
npm run convex:deploy     # push Convex functions to production
npm run deploy            # builds the SPA (public/admin/) + wrangler deploy
```

Make sure `CONVEX_URL` in `wrangler.json` points at the **production** Convex
deployment before `npm run deploy`.

## What works / what doesn't

Each card shows an availability badge (Werkt / Kapot / Genegeerd / ERROR /
Ongecheckt). It's refreshed by:

- the **"Check nu"** button (runs the YouTube oEmbed check immediately), and
- a **daily Convex cron** at 07:00 UTC (`convex/crons.ts`).

Mark a known-broken video as deliberately ignored by giving it an
**allowlist-reden** in the edit dialog; it then reports as _Genegeerd_ instead
of _Kapot_.

The GitHub Action (`videos-check.yml`, `pnpm videos:check`) and the worker's
manual check (`/check/<key>`) read the same live Convex data, so all three
checks agree. The allowlist-reden on a card is the only allowlist.
