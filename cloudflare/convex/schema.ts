import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// Availability status of a card's YouTube video, written by the check.
// - ok:          oEmbed returned 200 (video plays).
// - broken:      oEmbed non-200 / unreachable and not allowlisted.
// - allowlisted: known broken but deliberately ignored (has a reason).
// - error:       videoId === 'ERROR' (card intentionally has no working video).
// - unknown:     never checked yet.
export const availabilityStatusValidator = v.union(
  v.literal('ok'),
  v.literal('broken'),
  v.literal('allowlisted'),
  v.literal('error'),
  v.literal('unknown'),
);

export default defineSchema({
  ...authTables,

  cards: defineTable({
    // Public card id, e.g. "kaart0001". Unique; the scanner/deeplink key.
    cardId: v.string(),
    quote: v.string(),
    // YouTube video id, or the sentinel 'ERROR' for a retired card.
    videoId: v.string(),
    startTime: v.number(),
    // 0 = play to natural end; > 0 = loop clip from startTime to endTime.
    endTime: v.number(),
    year: v.number(),
    contentWarning: v.boolean(),

    // Deliberately-ignored broken video. When set, the check reports the card
    // as 'allowlisted' instead of 'broken'.
    allowlistReason: v.optional(v.string()),

    // Latest availability result (written by availability.recordResults).
    availabilityStatus: availabilityStatusValidator,
    lastHttpStatus: v.optional(v.number()),
    lastCheckedAt: v.optional(v.number()),

    // Total number of times this card was scanned/opened on the web player.
    // Incremented (non-blocking) by the worker via scans.log.
    scanCount: v.optional(v.number()),
    lastScannedAt: v.optional(v.number()),

    updatedAt: v.number(),
  }).index('by_cardId', ['cardId']),

  // Per-day scan totals across all cards, for the dashboard trend chart.
  // day is a UTC 'YYYY-MM-DD' string.
  scanDaily: defineTable({
    day: v.string(),
    count: v.number(),
  }).index('by_day', ['day']),
});
