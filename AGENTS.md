# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working in this repository.

## Project Overview

This is a React Native + Expo mobile app (iOS and Android, no web) built with New Architecture and Expo Router file-based routing.

- App is now direct-entry (no auth gate)
- Primary flow is QR/deeplink card scanning and video playback
- UI strings are hardcoded in Dutch
- Card data (video id, clip times, quote, volume, thumbnail) is never bundled:
  app, web player and availability checks all read live from Convex prod
  (`tacit-crab-381`). Admin edits in the dashboard are live everywhere.

## Development Commands

### Setup

```bash
pnpm install
```

### Run

```bash
pnpm dev
pnpm prebuild
pnpm ios
pnpm android
pnpm start
```

### Quality

```bash
pnpm tsc:check
pnpm vitest:run
pnpm lint
pnpm lint:format
pnpm format
pnpm videos:check
```

### Data

There is no data pipeline. Cards live in Convex (`cloudflare/convex/cards.ts`)
and are edited via the admin at `viralsgame.nl/admin`.

## Architecture

### Current Route and Playback Flow

- `src/app/_layout.tsx`
  - Root Slot + `GestureHandlerRootView`
- `src/app/(app)/_layout.tsx`
  - App stack wrapper (no auth redirect)
- `src/app/(app)/(tabs)/_layout.tsx`
  - Registers `index`, `rules`, `scanner`, `video/[id]`, `[cardId]`
- `src/app/(app)/(tabs)/[cardId].tsx`
  - Redirects `/kaartXXXX` to `/(app)/(tabs)/video/[id]`
- `src/app/(app)/(tabs)/video/[id].tsx`
  - Renders `video.quote`
  - Shows content warning gate when `contentWarning === true`
- `src/ui/QRScanner.tsx`
  - Parses and normalizes card IDs from:
    - `https://viralsgame.nl/kaart0001`
    - `https://www.viralsgame.nl/kaart0001`
    - `viralsgame://kaart0001`
    - `viralsgame.nl/kaart0001`
  - Does not validate existence; the video screen asks Convex
- `src/convex/client.ts`
  - `useCard(cardId)` live-subscribes to `cards:getForPlayer` on prod
  - `useIsConvexOffline()` drives the "Geen verbinding" screen
- `src/ui/YouTubePlayer.tsx`
  - `endTime = 0`: play until natural end
  - `endTime > 0`: loop clip from `startTime`

### Card Data Contract

`PlayerCard` in `src/convex/client.ts` mirrors `cards:getForPlayer`
(`cloudflare/convex/cards.ts`):

- `cardId`
- `quote`
- `videoId` (`'ERROR'` for a retired card)
- `startTime`
- `endTime`
- `year`
- `contentWarning`
- `volume`
- `thumbnail`

## Operational Checks

### Baseline Check

```bash
pnpm tsc:check
pnpm videos:check
```

### Dataset Spot Check

```bash
cd cloudflare && npx convex data cards --prod --limit 400 --format jsonl | wc -l
```

Expected:

- count is `267`
- `kaart0241` is the error card (`videoId: 'ERROR'`)

### QR / Deep Link Manual Checklist

- QR scanner accepts each format listed above.
- iOS sim deep link:

```bash
xcrun simctl openurl booted "viralsgame://kaart0001"
```

- Android deep link:

```bash
adb shell am start -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d "viralsgame://kaart0001"
```

### Universal Link Device Check

- Test on physical device by opening:
  - `https://viralsgame.nl/kaart0001`
- Domain and metadata touchpoints:
  - `app.json` (`ios.associatedDomains`, `android.intentFilters`)
  - `docs/cloudflare-universal-links.md`

### Android Release Configuration

Config plugins in `plugins/` (CommonJS `.cjs`, because the repo is `"type": "module"`):

- `withAndroidGameCompat.cjs`
  - Sets `android:appCategory="game"` and the
    `PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY` property.
  - Purpose: from targetSdk 36, Android ignores `android:screenOrientation` on
    screens `>=600dp`. Games are exempt, but only when they declare
    `appCategory`. This is what keeps the landscape lock working on tablets.
  - The opt-out property stops working at targetSdk 37. At that point
    `index.tsx` and `video/[id].tsx` need real portrait layouts; both currently
    assume width > height (`flexDirection: 'row'`, `logoWidth = height * 0.75`,
    fixed `width: 185` button rail).
- `withoutDevClientInReleaseBuilds.cjs`
  - Adds `expoAutolinking.exclude` to `android/settings.gradle`.
  - Purpose: Android autolinking has no debug/release distinction (`debugOnly`
    is Apple-only), so `expo-dev-launcher` otherwise ships in the production
    AAB along with Compose, Koin, Apollo, MLKit and
    `play-services-code-scanner`.
  - Active when `EAS_BUILD_PROFILE` is set and is not `development`, or when
    `EXPO_EXCLUDE_DEV_CLIENT=1`. Local prebuild keeps the dev client.

R8 is enabled through `expo-build-properties` in `app.json`
(`enableMinifyInReleaseBuilds`, `enableShrinkResourcesInReleaseBuilds`).
Keep rules for VisionCamera, Worklets, SVG, WebView and Expo modules live in
the same plugin config and are appended to `android/app/proguard-rules.pro`.

Verify a release configuration without building:

```bash
EAS_BUILD_PROFILE=production npx expo prebuild --platform android --clean
grep -n "exclude" android/settings.gradle
grep -n "appCategory\|PROPERTY_COMPAT" android/app/src/main/AndroidManifest.xml
npx expo prebuild --platform android --clean   # restore dev state afterwards
```

R8 and the dev-client exclusion only fail at runtime, so a preview build must
be smoke-tested before submitting to Play:

```bash
eas build -p android --profile preview
```

Check scanner, video playback, the rules modal and a deep link on that APK.

### YouTube Availability Gate

- Script: `scripts/check-youtube-availability.mjs`
- Script command: `pnpm videos:check`
- Source: live Convex prod via `cards:list` (override with `CONVEX_URL` or
  `--convex-url=`)
- Allowlist: the per-card `allowlistReason` set in the admin; retired cards
  (`videoId: 'ERROR'`) are always allowlisted
- Scope: YouTube-only (`videoId` + YouTube oEmbed), no Bunny/local handling.
- CI workflow: `.github/workflows/videos-check.yml`
- Workflow schedule: daily at `07:00 UTC` (`0 7 * * *`)
- Workflow report output:
  - Step summary in GitHub Actions UI (`$GITHUB_STEP_SUMMARY`)
  - Artifact `videos-check-report` containing:
    - `artifacts/videos-check-report.md`
    - `artifacts/videos-check-report.json`

GitHub Actions runbook:

```bash
gh workflow list --repo brand-ocean/qr
gh workflow run videos-check.yml --repo brand-ocean/qr --ref main
gh run list --repo brand-ocean/qr
gh run watch <run-id> --repo brand-ocean/qr
```

Troubleshooting:

- If `pnpm videos:check` fails, review blocking cards in output.
- To generate local reports:
  - `pnpm videos:check --report-md=artifacts/videos-check-report.md --report-json=artifacts/videos-check-report.json`
- If a known broken card must temporarily pass CI, give it an
  allowlist-reden in the admin edit dialog.

## Important Notes

- This repo uses ESM (`"type": "module"`), so TS imports use explicit extensions.
- Node.js 24 and pnpm 10+ expected.
- React Compiler is enabled.
