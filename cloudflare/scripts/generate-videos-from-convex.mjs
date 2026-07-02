#!/usr/bin/env node
// Regenerates the app's src/data/videos.ts from Convex (the source of truth).
// The native app bundles videos.ts, so run this before an app release to pull
// in admin changes.
//
// Usage:
//   CONVEX_URL=https://<deployment>.convex.cloud node scripts/generate-videos-from-convex.mjs
// If CONVEX_URL is unset, it is read from admin/.env.local (VITE_CONVEX_URL).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConvexHttpClient } from 'convex/browser';
import { makeFunctionReference } from 'convex/server';

const here = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(here, '../../src/data/videos.ts');

function resolveConvexUrl() {
  if (process.env.CONVEX_URL) return process.env.CONVEX_URL;
  const envPath = path.resolve(here, '../admin/.env.local');
  if (fs.existsSync(envPath)) {
    const match = fs
      .readFileSync(envPath, 'utf8')
      .match(/^VITE_CONVEX_URL=(.+)$/m);
    if (match) return match[1].trim();
  }
  throw new Error(
    'CONVEX_URL niet gevonden. Zet CONVEX_URL of VITE_CONVEX_URL in admin/.env.local.',
  );
}

function esc(value) {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function serialize(cards) {
  const sorted = [...cards].sort((a, b) => a.cardId.localeCompare(b.cardId));
  const entries = sorted
    .map(
      (c) => `  {
    contentWarning: ${c.contentWarning},
    endTime: ${c.endTime},
    id: '${esc(c.cardId)}',
    quote: '${esc(c.quote)}',
    startTime: ${c.startTime},
    videoId: '${esc(c.videoId)}',
    year: ${c.year},
  },`,
    )
    .join('\n');

  return `/**
 * Video data for the VIRALS Meme Editie app.
 *
 * This file is auto-generated. Source of truth: Convex (admin at /admin).
 * Regenerate with: node scripts/generate-videos-from-convex.mjs
 */

export type VideoCard = {
  readonly contentWarning: boolean;
  readonly endTime: number;
  readonly id: string;
  readonly quote: string;
  readonly startTime: number;
  readonly videoId: string;
  readonly year: number;
};

export const VIDEOS: ReadonlyArray<VideoCard> = [
${entries}
];

/**
 * Lookup map for O(1) video access by ID.
 */
export const VIDEO_BY_ID = new Map<string, VideoCard>(
  VIDEOS.map((video) => [video.id, video]),
);

/**
 * Get a video by its ID.
 * @param id - The video ID (e.g., 'kaart0001')
 * @returns The video card or null if not found
 */
export function getVideoById(id: string): VideoCard | null {
  return VIDEO_BY_ID.get(id) ?? null;
}

/**
 * Get a random video from the collection.
 * @returns A random video card
 */
export function getRandomVideo(): VideoCard {
  const randomIndex = Math.floor(Math.random() * VIDEOS.length);
  return VIDEOS[randomIndex];
}
`;
}

const client = new ConvexHttpClient(resolveConvexUrl());
const listRef = makeFunctionReference('cards:list');
const cards = await client.query(listRef, {});
if (!Array.isArray(cards) || cards.length === 0) {
  throw new Error('Convex gaf geen kaarten terug. Is de data geseed?');
}
fs.writeFileSync(outPath, serialize(cards));
console.log(
  `Wrote ${cards.length} cards to ${path.relative(process.cwd(), outPath)}`,
);
