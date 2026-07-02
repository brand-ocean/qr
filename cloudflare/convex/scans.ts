import { v } from 'convex/values';
import { mutation } from './_generated/server';

// UTC 'YYYY-MM-DD' for a timestamp. Kept trivial so it stays deterministic.
function utcDay(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

// Records a single web-player scan/open of a card. Called by the worker
// (fire-and-forget via ctx.waitUntil) on every valid card page render, so it
// must be cheap and must never throw in a way that blocks the player.
//
// Public on purpose: the worker calls it without an auth token. Scan counts are
// non-critical vanity stats, so the (low) risk of inflated counts is acceptable.
export const log = mutation({
  args: { cardId: v.string() },
  handler: async (ctx, { cardId }): Promise<void> => {
    const normalized = cardId.trim().toLowerCase();
    const card = await ctx.db
      .query('cards')
      .withIndex('by_cardId', (q) => q.eq('cardId', normalized))
      .unique();
    if (card === null) {
      return;
    }
    const now = Date.now();
    await ctx.db.patch(card._id, {
      scanCount: (card.scanCount ?? 0) + 1,
      lastScannedAt: now,
    });

    const day = utcDay(now);
    const existing = await ctx.db
      .query('scanDaily')
      .withIndex('by_day', (q) => q.eq('day', day))
      .unique();
    if (existing === null) {
      await ctx.db.insert('scanDaily', { day, count: 1 });
    } else {
      await ctx.db.patch(existing._id, { count: existing.count + 1 });
    }
  },
});
