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
  allowlistReason: v.optional(v.string()),
};

// --- Public reads -----------------------------------------------------------

// All cards, sorted by card id. Used by the admin table, the videos.ts export
// script, and as a bulk source for the worker.
export const list = query({
  args: {},
  handler: async (ctx): Promise<Doc<'cards'>[]> => {
    const cards = await ctx.db.query('cards').withIndex('by_cardId').collect();
    return cards.sort((a, b) => a.cardId.localeCompare(b.cardId));
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
