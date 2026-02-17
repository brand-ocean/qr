# Plan: Import CSV Video Data + Universal Links via Cloudflare

## Context

The app currently has 5 hardcoded test videos. The user has a CSV with ~275 real Dutch viral video cards. Each physical card has a QR code linking to a URL like `viralsgame.nl/kaart0275`. These URLs need to open the app and play the correct video clip (with start/end times from the CSV).

## Step 1: Update `VideoCard` type and generate data from CSV

**File:** `src/data/videos.ts`

Update the `VideoCard` type to match the CSV structure:

```typescript
export type VideoCard = {
  readonly id: string; // "kaart0001"
  readonly quote: string; // "Dikke BMW" (the viral quote)
  readonly videoId: string; // YouTube video ID extracted from URL
  readonly startTime: number; // Start seconds
  readonly endTime: number; // End seconds (0 if not specified)
  readonly year: number; // Year of the viral
  readonly contentWarning: boolean; // true if ☠️ column is "X"
};
```

Parse the CSV (`~/Downloads/Virals Meme lijst - Blad1.csv`) and generate the `VIDEOS` array:

- Extract YouTube video IDs from various URL formats (`youtu.be/ID`, `youtube.com/watch?v=ID`, etc.)
- Use card number from "URL Spel" column as `id` (e.g., `kaart0001`)
- Only include cards that have both a card number AND a valid YouTube URL
- Skip Google Drive links (kaart0025, kaart0081) - incompatible with YouTube player
- Parse start/end times to numbers (default 0)
- Map `☠️` column: "X" = `contentWarning: true`

Keep existing helper functions (`getVideoById`, `getRandomVideo`, `VIDEO_BY_ID` Map).

## Step 2: Update UI references from `name` to `quote`

**Files to update:**

- `src/app/(app)/(tabs)/video/[id].tsx` (line 79): `video.name` → `video.quote`
- `src/app/(app)/(tabs)/index.tsx`: No changes needed (doesn't display video name)
- Remove `emoji` references from video display (cards won't have individual emojis)

## Step 2b: Add content warning modal for ☠️ cards

**File:** `src/app/(app)/(tabs)/video/[id].tsx`

Cards with `contentWarning: true` should show a warning before playing. Add a simple state check: if the video has `contentWarning` and the user hasn't acknowledged it yet, show a warning overlay with a "Doorgaan" (Continue) button before showing the player.

## Step 3: Update QR scanner to support `viralsgame.nl` URLs

**File:** `src/ui/QRScanner.tsx` (line 36)

Change the URL pattern to match universal link format:

```typescript
// Support: https://viralsgame.nl/kaart0001 and viralsgame://kaart0001
const universalMatch = code.value.match(
  /^https?:\/\/(?:www\.)?viralsgame\.nl\/(kaart\d+)/,
);
const schemeMatch = code.value.match(/^viralsgame:\/\/(kaart\d+)/);
const videoId = universalMatch?.[1] ?? schemeMatch?.[1];
```

## Step 4: Add deep link route for `/kaartXXXX` URLs

**New file:** `src/app/(app)/(tabs)/[cardId].tsx`

When the app is opened via `viralsgame.nl/kaart0275`, Expo Router maps this to a dynamic `[cardId]` route. This component redirects to the existing `video/[id]` screen:

```typescript
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function CardRedirect() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  if (cardId?.startsWith('kaart')) {
    return <Redirect href={`/(app)/(tabs)/video/${cardId}`} />;
  }
  return <Redirect href="/" />;
}
```

## Step 5: Configure universal links in `app.json`

**File:** `app.json`

Add iOS associated domains:

```json
"ios": {
  "associatedDomains": ["applinks:viralsgame.nl", "applinks:www.viralsgame.nl"],
  ...
}
```

Add Android intent filters:

```json
"android": {
  "intentFilters": [
    {
      "action": "VIEW",
      "autoVerify": true,
      "data": [
        { "scheme": "https", "host": "viralsgame.nl", "pathPrefix": "/kaart" },
        { "scheme": "https", "host": "www.viralsgame.nl", "pathPrefix": "/kaart" }
      ],
      "category": ["BROWSABLE", "DEFAULT"]
    }
  ],
  ...
}
```

## Step 6: Cloudflare setup (manual / instructions)

Provide a Cloudflare Worker script to serve at `viralsgame.nl` that:

1. Serves `/.well-known/apple-app-site-association` (AASA) for iOS universal links
2. Serves `/.well-known/assetlinks.json` for Android App Links
3. For `/kaartXXXX` URLs: redirects to the app, or shows a fallback web page if app is not installed

The Worker template will use **placeholders** (`YOUR_TEAM_ID`, `YOUR_SHA256_FINGERPRINT`) that the user fills in later.

## Step 7: Rebuild native projects

After app.json changes:

```bash
pnpm prebuild --clean
pnpm ios  # or pnpm android
```

## Verification

1. **Data:** Run `pnpm tsc:check` to verify TypeScript compiles with new video data
2. **QR Scanner:** Test scanning a QR code with `https://viralsgame.nl/kaart0001` format
3. **Deep Link (simulator):** `xcrun simctl openurl booted "viralsgame://kaart0001"`
4. **Universal Links (physical device only):** Visit `https://viralsgame.nl/kaart0001` in Safari
5. **Random video:** Verify "Test Video (Dev)" button still works with new data

## Files Modified

| File                                  | Change                                                |
| ------------------------------------- | ----------------------------------------------------- |
| `src/data/videos.ts`                  | New type, ~275 videos from CSV                        |
| `src/ui/QRScanner.tsx`                | Updated URL pattern                                   |
| `src/app/(app)/(tabs)/video/[id].tsx` | `name` → `quote`, remove `emoji`, add content warning |
| `src/app/(app)/(tabs)/[cardId].tsx`   | **New** - redirect route for deep links               |
| `app.json`                            | Associated domains + intent filters                   |
