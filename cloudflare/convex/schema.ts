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

// --- Roadmap (kanban board + click-to-report feedback) ---------------------

// The four fixed columns a roadmap item can live in.
export const roadmapStatusValidator = v.union(
  v.literal('backlog'),
  v.literal('planned'),
  v.literal('inProgress'),
  v.literal('done'),
);

// What kind of item this is; drives the badge colour on the board.
export const roadmapKindValidator = v.union(
  v.literal('feature'),
  v.literal('bug'),
  v.literal('improvement'),
  v.literal('idea'),
);

export const roadmapPriorityValidator = v.union(
  v.literal('low'),
  v.literal('normal'),
  v.literal('high'),
  v.literal('urgent'),
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

    // Per-card playback volume (0–100). Optional; the players treat an unset
    // value as 100 (full volume). Lets an admin tame the few clips that are
    // noticeably louder than the rest.
    volume: v.optional(v.number()),

    // Optional thumbnail override. Without either, the UI falls back to the
    // YouTube-derived thumbnail (youtubeThumb).
    //  - thumbnailId:  an uploaded image in Convex file storage (takes priority).
    //  - thumbnailUrl: a chosen YouTube frame still (hq1/hq2/hq3) or pasted URL.
    thumbnailId: v.optional(v.id('_storage')),
    thumbnailUrl: v.optional(v.string()),

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

  // Roadmap kanban cards. `order` is a fractional sort key within a column
  // (midpoint insertion on drop), so a move is a single-document patch.
  roadmapItems: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: roadmapStatusValidator,
    order: v.number(),
    kind: v.optional(roadmapKindValidator),
    priority: v.optional(roadmapPriorityValidator),
    // The admin (auth user) who created the item.
    createdBy: v.id('users'),
  }).index('by_status_and_order', ['status', 'order']),

  // Per-item feedback thread (the "back-and-forth" on a roadmap card).
  roadmapComments: defineTable({
    itemId: v.id('roadmapItems'),
    body: v.string(),
    authorUserId: v.optional(v.id('users')),
    // Denormalized display name so the thread renders without a join.
    authorName: v.string(),
  }).index('by_item', ['itemId']),
});
