# Fonts Plan (Current Usage + Delivery Plan)

## Goal

Document current custom font usage and provide a concrete plan to lock font behavior before release.

## Current State (As Implemented)

### Loaded at app startup

File: `/Users/brandocean/Codebase/QR/src/app/_layout.tsx`

The app currently loads only `AeonikFono` weights via `useFonts`:

- `AeonikFono-Regular`
- `AeonikFono-Bold`
- `AeonikFono-Black`
- `AeonikFono-Medium`
- `AeonikFono-Light`

### Config plugin font list

File: `/Users/brandocean/Codebase/QR/app.json`

`expo-font` plugin also points to the same `AeonikFono` files in:

- `./assets/fonts/Aeonik_Fono/AeonikFono-Regular.otf`
- `./assets/fonts/Aeonik_Fono/AeonikFono-Bold.otf`
- `./assets/fonts/Aeonik_Fono/AeonikFono-Black.otf`
- `./assets/fonts/Aeonik_Fono/AeonikFono-Medium.otf`
- `./assets/fonts/Aeonik_Fono/AeonikFono-Light.otf`

### Runtime usage pattern

1. Direct style usage (majority of current screens/components):

- Uses `fontFamily: 'AeonikFono-*'`
- Seen in:
  - `/Users/brandocean/Codebase/QR/src/app/(app)/(tabs)/index.tsx`
  - `/Users/brandocean/Codebase/QR/src/app/(app)/(tabs)/video/[id].tsx`
  - `/Users/brandocean/Codebase/QR/src/ui/QRScanner.tsx`
  - `/Users/brandocean/Codebase/QR/src/ui/ViralButton.tsx`
  - `/Users/brandocean/Codebase/QR/src/ui/RulesModal.tsx`
  - `/Users/brandocean/Codebase/QR/src/ui/SuggestionModal.tsx`
  - `/Users/brandocean/Codebase/QR/src/ui/SplashScreen.tsx`
  - `/Users/brandocean/Codebase/QR/src/ui/YouTubePlayer.tsx`

2. `Text` wrapper className mapping:

- File: `/Users/brandocean/Codebase/QR/src/ui/Text.tsx`
- Maps utility classes (`font-bold`, `font-black`, etc.) to `AeonikPro-*`.
- Risk: `AeonikPro` is referenced by mapping logic but not loaded in root layout.

## Delivery Risk

There is a font-family mismatch risk:

- Loaded families: `AeonikFono-*`
- `Text` className mapper default path: `AeonikPro-*`

This can lead to fallback fonts on screens that rely on class-based text weights.

## Recommended Plan

## Phase 1: Decide font strategy

- Option A (recommended for simplicity): **AeonikFono-only**
  - Update `/Users/brandocean/Codebase/QR/src/ui/Text.tsx` mapping to `AeonikFono-*`.
  - Keep current root font loading unchanged.

- Option B: **Mixed strategy (Fono + Pro)**
  - Keep `Text.tsx` mapping to `AeonikPro-*`.
  - Add required `AeonikPro-*` fonts to startup loading in `/Users/brandocean/Codebase/QR/src/app/_layout.tsx`.
  - Ensure app config plugin is aligned if needed for native embedding workflow.

## Phase 2: Alignment updates

- Ensure these files stay in sync:
  - `/Users/brandocean/Codebase/QR/src/app/_layout.tsx`
  - `/Users/brandocean/Codebase/QR/app.json`
  - `/Users/brandocean/Codebase/QR/src/ui/Text.tsx`

## Phase 3: Visual verification

Run manual visual checks on:

- Home: `/Users/brandocean/Codebase/QR/src/app/(app)/(tabs)/index.tsx`
- Scanner: `/Users/brandocean/Codebase/QR/src/app/(app)/(tabs)/scanner.tsx`
- Video screen: `/Users/brandocean/Codebase/QR/src/app/(app)/(tabs)/video/[id].tsx`
- Not found: `/Users/brandocean/Codebase/QR/src/app/+not-found.tsx`
- Modals: rules/suggestion in `/Users/brandocean/Codebase/QR/src/ui/RulesModal.tsx` and `/Users/brandocean/Codebase/QR/src/ui/SuggestionModal.tsx`

## Phase 4: Quality gates

- `pnpm tsc:check`
- `pnpm lint`
- `pnpm vitest:run`

## Definition of Done

- One intentional font strategy chosen and implemented.
- No fallback/system fonts in primary app screens.
- Font config and runtime usage are consistent across layout, app config, and `Text` abstraction.
