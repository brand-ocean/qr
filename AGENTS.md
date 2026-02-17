# AGENTS.md

## Purpose

Single-page operating guide for agents and engineers working in this repository.

If `CLAUDE.md` and `AGENTS.md` diverge, update both in the same PR.

## Current System Truth

- Expo Router app with no auth gate.
- Card flow is QR/deeplink -> normalized `kaartXXXX` -> `video/[id]`.
- Root/layout files:
  - `src/app/_layout.tsx`: root slot + gesture handler
  - `src/app/(app)/_layout.tsx`: app stack wrapper
  - `src/app/(app)/(tabs)/_layout.tsx`: tab stack + route registrations
- Redirect route:
  - `src/app/(app)/(tabs)/[cardId].tsx` maps `/kaartXXXX` to `/video/[id]`
- Video screen:
  - `src/app/(app)/(tabs)/video/[id].tsx`
  - uses `quote` and content warning gate
- Scanner contract:
  - `src/ui/QRScanner.tsx` parses and lowercases card IDs
- Player contract:
  - `src/ui/YouTubePlayer.tsx`
  - `endTime = 0` => natural end
  - `endTime > 0` => loop clip from `startTime`
- Data contract (`src/data/videos.ts`):
  - `VideoCard = { id, quote, videoId, startTime, endTime, year, contentWarning }`

## Data Source of Truth

- CSV source: `/Users/brandocean/Downloads/Virals Meme lijst - Blad1.csv`
- Generator: `scripts/generate-videos-from-csv.mjs`
- Output: `src/data/videos.ts`

Command:

```bash
pnpm videos:generate
```

## Required Workflow Before/After Changes

### Before Coding

- Inspect touched files with `rg` + `sed`.
- Confirm script/route names before editing.
- Avoid assumptions about generated data; verify against `src/data/videos.ts`.

### After Coding (minimum)

```bash
pnpm tsc:check
```

### Optional Checks

```bash
pnpm vitest:run
pnpm lint
pnpm lint:format
```

Dataset spot check:

```bash
node --input-type=module -e "import { VIDEOS, getVideoById } from './src/data/videos.ts'; console.log('count', VIDEOS.length); console.log('has0001', !!getVideoById('kaart0001')); console.log('has0275', !!getVideoById('kaart0275')); console.log('has0025', !!getVideoById('kaart0025')); console.log('has0081', !!getVideoById('kaart0081'));"
```

## Deep Link / QR Acceptance Checklist

Accepted scanner inputs:

- `https://viralsgame.nl/kaart0001`
- `https://www.viralsgame.nl/kaart0001`
- `viralsgame://kaart0001`
- `viralsgame.nl/kaart0001`

Expected result:

- Scanner resolves to normalized lowercase `kaartXXXX`.
- App navigates to `/(app)/(tabs)/video/[id]` for that card.

Deep link commands:

```bash
xcrun simctl openurl booted "viralsgame://kaart0001"
adb shell am start -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d "viralsgame://kaart0001"
```

## Universal Link Config Touchpoints

- Native config: `app.json`
  - `ios.associatedDomains`
  - `android.intentFilters`
- Cloudflare setup/runbook:
  - `docs/cloudflare-universal-links.md`

Physical device check:

- Open `https://viralsgame.nl/kaart0001` and confirm app route landing.

## Known Pending Work (TODO)

- Add required CI YouTube availability check (`videos:check`) as a separate job.
- Proposed strategy: YouTube oEmbed probes per `videoId`, fail on unavailable IDs, with allowlist support.
- Status: planned only; not implemented yet.
