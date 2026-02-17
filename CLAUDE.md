# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Project Overview

This is a React Native + Expo mobile app (iOS and Android, no web) built with New Architecture and Expo Router file-based routing.

- App is now direct-entry (no auth gate)
- Primary flow is QR/deeplink card scanning and video playback
- UI strings are hardcoded in Dutch

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

### Data Pipeline

```bash
# Reads: /Users/brandocean/Downloads/Virals Meme lijst - Blad1.csv
# Writes: src/data/videos.ts
pnpm videos:generate
```

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
- `src/ui/YouTubePlayer.tsx`
  - `endTime = 0`: play until natural end
  - `endTime > 0`: loop clip from `startTime`
- `src/data/videos.ts`
  - Generated card dataset used by scanner and route playback

### Video Data Contract

`VideoCard` in `src/data/videos.ts`:

- `id`
- `quote`
- `videoId`
- `startTime`
- `endTime`
- `year`
- `contentWarning`

## Operational Checks

### Baseline Check

```bash
pnpm tsc:check
pnpm videos:check
```

### Dataset Spot Check

```bash
node --input-type=module -e "import { VIDEOS, getVideoById } from './src/data/videos.ts'; console.log('count', VIDEOS.length); console.log('has0001', !!getVideoById('kaart0001')); console.log('has0275', !!getVideoById('kaart0275')); console.log('has0025', !!getVideoById('kaart0025')); console.log('has0081', !!getVideoById('kaart0081'));"
```

Expected:

- count is `273`
- `kaart0001` and `kaart0275` are present
- `kaart0025` and `kaart0081` are absent

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

### YouTube Availability Gate

- Script: `scripts/check-youtube-availability.mjs`
- Script command: `pnpm videos:check`
- Allowlist: `config/videos-check-allowlist.json`
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
- If a known broken card must temporarily pass CI, add an explicit allowlist
  entry with `cardId`, `videoId`, `reason`, and `addedOn`.
- Allowlist matching is strict on `cardId` + `videoId`; stale/mismatched
  entries do not suppress failures.

## Important Notes

- This repo uses ESM (`"type": "module"`), so TS imports use explicit extensions.
- Node.js 24 and pnpm 10+ expected.
- React Compiler is enabled.
