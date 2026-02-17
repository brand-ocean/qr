# Cloudflare Universal Links Setup (viralsgame.nl)

This runbook configures `https://viralsgame.nl/kaartXXXX` so QR scans open the app and route to the correct card.

## What this Worker does

1. Serves `/.well-known/apple-app-site-association` (AASA) for iOS Universal Links.
2. Serves `/apple-app-site-association` (same payload for compatibility).
3. Serves `/.well-known/assetlinks.json` for Android App Links.
4. Serves a fallback web page for `/kaartXXXX` that attempts app open and shows store buttons.

## Required placeholders

Replace these values before deploy:

- `YOUR_TEAM_ID` (Apple Developer Team ID)
- `YOUR_SHA256_FINGERPRINT` (Android signing cert fingerprint)
- `YOUR_APP_STORE_URL` (iOS store URL)
- `YOUR_PLAY_STORE_URL` (Android store URL)

Bundle/package identifiers in this app:

- iOS bundle ID: `nl.viralsgame.app`
- Android package: `nl.viralsgame.app`

## Worker (TypeScript)

```ts
interface Env {
  APP_STORE_URL: string;
  PLAY_STORE_URL: string;
}

const AASA = {
  applinks: {
    apps: [],
    details: [
      {
        appID: 'YOUR_TEAM_ID.nl.viralsgame.app',
        paths: ['/kaart*'],
      },
    ],
  },
};

const ASSET_LINKS = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'nl.viralsgame.app',
      sha256_cert_fingerprints: ['YOUR_SHA256_FINGERPRINT'],
    },
  },
];

function fallbackHtml(cardId: string, env: Env) {
  const escapedCardId = cardId.replace(/[^a-z0-9]/gi, '');
  const deepLink = `viralsgame://${escapedCardId}`;

  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Virals Game</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 24px; background: #22B331; color: #fff; }
      .card { max-width: 520px; margin: 0 auto; background: #111; border-radius: 16px; padding: 20px; }
      h1 { margin: 0 0 12px; }
      p { line-height: 1.5; }
      .buttons { display: grid; gap: 12px; margin-top: 16px; }
      a { display: block; text-decoration: none; font-weight: 700; text-align: center; border-radius: 10px; padding: 12px; }
      .primary { background: #FFCC00; color: #000; }
      .secondary { background: #fff; color: #111; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Open Virals Game</h1>
      <p>Kaart: <strong>${escapedCardId}</strong></p>
      <p>Als de app is geïnstalleerd, wordt deze automatisch geopend. Zo niet, installeer de app via een store hieronder.</p>
      <div class="buttons">
        <a class="primary" href="${deepLink}">Open App</a>
        <a class="secondary" href="${env.APP_STORE_URL}">Download op iPhone</a>
        <a class="secondary" href="${env.PLAY_STORE_URL}">Download op Android</a>
      </div>
    </div>
    <script>
      setTimeout(() => {
        window.location.href = '${deepLink}';
      }, 120);
    </script>
  </body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (
      pathname === '/.well-known/apple-app-site-association' ||
      pathname === '/apple-app-site-association'
    ) {
      return new Response(JSON.stringify(AASA), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    if (pathname === '/.well-known/assetlinks.json') {
      return new Response(JSON.stringify(ASSET_LINKS), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    const match = pathname.match(/^\/(kaart\d{4})$/i);
    if (match?.[1]) {
      return new Response(fallbackHtml(match[1].toLowerCase(), env), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

## Wrangler config example

```json
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "viralsgame-links",
  "main": "src/index.ts",
  "compatibility_date": "2026-02-17",
  "routes": [
    {
      "pattern": "viralsgame.nl/*",
      "zone_name": "viralsgame.nl"
    },
    {
      "pattern": "www.viralsgame.nl/*",
      "zone_name": "viralsgame.nl"
    }
  ],
  "vars": {
    "APP_STORE_URL": "YOUR_APP_STORE_URL",
    "PLAY_STORE_URL": "YOUR_PLAY_STORE_URL"
  }
}
```

## Deploy steps

1. `npx wrangler whoami`
2. `npx wrangler deploy`
3. Verify endpoints:
   - `https://viralsgame.nl/.well-known/apple-app-site-association`
   - `https://viralsgame.nl/.well-known/assetlinks.json`
   - `https://viralsgame.nl/kaart0001`

## DNS / Cloudflare notes

- Route both `viralsgame.nl/*` and `www.viralsgame.nl/*` to this Worker.
- Keep endpoints on HTTPS.
- Do not redirect `/.well-known/*` routes.
- `AASA` and `assetlinks.json` must be directly reachable with status `200`.
