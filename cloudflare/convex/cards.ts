import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from './_generated/server';

// Card data is served publicly on viralsgame.nl, so reads are open. Writes
// require an authenticated admin.
async function requireAdmin(ctx: MutationCtx | QueryCtx): Promise<void> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error('Niet ingelogd.');
  }
}

function normalizeCardId(raw: string): string {
  const value = raw.trim().toLowerCase();
  if (!/^kaart\d{4}$/.test(value)) {
    throw new Error(`Ongeldig kaart-id: "${raw}". Verwacht formaat kaartXXXX.`);
  }
  return value;
}

const cardFields = {
  quote: v.string(),
  videoId: v.string(),
  startTime: v.number(),
  endTime: v.number(),
  year: v.number(),
  contentWarning: v.boolean(),
  // Per-card playback volume (0–100). Unset = 100 (full volume).
  volume: v.optional(v.number()),
  // Optional thumbnail override; falls back to the YouTube thumbnail when unset.
  thumbnailId: v.optional(v.id('_storage')),
  thumbnailUrl: v.optional(v.string()),
  allowlistReason: v.optional(v.string()),
};

// Resolve the override thumbnail for a card: an uploaded image (storage) wins
// over a chosen YouTube frame / pasted URL. Returns null when neither is set,
// so callers fall back to the derived YouTube thumbnail.
async function resolveThumbnail(
  ctx: QueryCtx,
  card: Doc<'cards'>,
): Promise<string | null> {
  if (card.thumbnailId !== undefined) {
    return await ctx.storage.getUrl(card.thumbnailId);
  }
  return card.thumbnailUrl ?? null;
}

// --- Public reads -----------------------------------------------------------

export type CardWithThumbnail = Doc<'cards'> & { thumbnail: string | null };

// All cards, sorted by card id, each enriched with a resolved override
// `thumbnail` (null when the card uses the default YouTube thumbnail). Used by
// the admin table, the videos.ts export script, and as a bulk source for the
// worker.
export const list = query({
  args: {},
  handler: async (ctx): Promise<CardWithThumbnail[]> => {
    const cards = await ctx.db.query('cards').withIndex('by_cardId').collect();
    const sorted = cards.sort((a, b) => a.cardId.localeCompare(b.cardId));
    return await Promise.all(
      sorted.map(async (card) => ({
        ...card,
        thumbnail: await resolveThumbnail(ctx, card),
      })),
    );
  },
});

// Single card for the web player. Returns only what the player page needs.
export const getForPlayer = query({
  args: { cardId: v.string() },
  handler: async (ctx, { cardId }) => {
    const normalized = cardId.trim().toLowerCase();
    const card = await ctx.db
      .query('cards')
      .withIndex('by_cardId', (q) => q.eq('cardId', normalized))
      .unique();
    if (card === null) {
      return null;
    }
    return {
      cardId: card.cardId,
      quote: card.quote,
      videoId: card.videoId,
      startTime: card.startTime,
      endTime: card.endTime,
      year: card.year,
      contentWarning: card.contentWarning,
      volume: card.volume ?? 100,
      thumbnail: await resolveThumbnail(ctx, card),
    };
  },
});

// --- Authed writes ----------------------------------------------------------

export const create = mutation({
  args: { cardId: v.string(), ...cardFields },
  handler: async (ctx, args): Promise<string> => {
    await requireAdmin(ctx);
    const cardId = normalizeCardId(args.cardId);
    const existing = await ctx.db
      .query('cards')
      .withIndex('by_cardId', (q) => q.eq('cardId', cardId))
      .unique();
    if (existing !== null) {
      throw new Error(`Kaart ${cardId} bestaat al.`);
    }
    return await ctx.db.insert('cards', {
      cardId,
      quote: args.quote,
      videoId: args.videoId,
      startTime: args.startTime,
      endTime: args.endTime,
      year: args.year,
      contentWarning: args.contentWarning,
      volume: args.volume,
      thumbnailId: args.thumbnailId,
      thumbnailUrl: args.thumbnailUrl,
      allowlistReason: args.allowlistReason,
      availabilityStatus: 'unknown',
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: { id: v.id('cards'), ...cardFields },
  handler: async (ctx, args): Promise<void> => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, {
      quote: args.quote,
      videoId: args.videoId,
      startTime: args.startTime,
      endTime: args.endTime,
      year: args.year,
      contentWarning: args.contentWarning,
      volume: args.volume,
      // Passing undefined clears the override (falls back to YouTube thumbnail).
      thumbnailId: args.thumbnailId,
      thumbnailUrl: args.thumbnailUrl,
      allowlistReason: args.allowlistReason,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id('cards') },
  handler: async (ctx, { id }): Promise<void> => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});

// Short-lived upload URL for a custom thumbnail image. The client POSTs the
// file to this URL, gets back a storage id, and saves it on the card via
// `update({ thumbnailId })`.
export const generateThumbnailUploadUrl = mutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
