# Cloudflare Worker — Pre-Launch Checklist

## Status

Worker code is deployed. DNS propagation for `viralsgame.nl` is still pending — routes will not activate until the zone is fully live in Cloudflare.

## Before the Worker is fully live

- [ ] **Fill iOS Team ID** — replace `YOUR_TEAM_ID` in `cloudflare/src/index.ts` with the Apple Developer Team ID (10-character alphanumeric string, e.g. `AB12CD34EF`)
- [ ] **Fill store URLs** — update `APP_STORE_URL` and `PLAY_STORE_URL` in `cloudflare/wrangler.json` with the real App Store and Google Play URLs once the app is published
- [ ] **Run `wrangler deploy`** after the `viralsgame.nl` zone is active in Cloudflare
- [ ] **Verify endpoints** respond with HTTP 200:
  - `https://viralsgame.nl/.well-known/apple-app-site-association`
  - `https://viralsgame.nl/.well-known/assetlinks.json`
  - `https://viralsgame.nl/kaart0001` (fallback HTML page)

## Later — iOS Universal Link activation

After the AASA endpoint is live and returning 200, Apple's CDN needs to crawl it before Universal Links activate on device. Steps:

1. Install the app build that includes the `applinks:viralsgame.nl` associated domain entitlement.
2. Open `https://viralsgame.nl/kaart0001` on a physical iOS device — the system should intercept and open the app directly.
3. If Universal Links do not activate, trigger a re-crawl by removing and re-installing the app, or use the [AASA Validator](https://branch.io/resources/aasa-validator/) to confirm the payload is correct.
