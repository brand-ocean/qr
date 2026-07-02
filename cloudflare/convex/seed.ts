import { mutation } from './_generated/server';
import { SEED_CARDS } from './seedData';

// One-time import of the current videos.ts dataset into Convex. Safe to run
// repeatedly: it refuses to insert once the table already has cards.
//   npx convex run seed:run
export const run = mutation({
  args: {},
  handler: async (ctx): Promise<{ inserted: number; skipped: boolean }> => {
    const existing = await ctx.db.query('cards').take(1);
    if (existing.length > 0) {
      return { inserted: 0, skipped: true };
    }
    const now = Date.now();
    for (const card of SEED_CARDS) {
      await ctx.db.insert('cards', {
        cardId: card.cardId,
        quote: card.quote,
        videoId: card.videoId,
        startTime: card.startTime,
        endTime: card.endTime,
        year: card.year,
        contentWarning: card.contentWarning,
        availabilityStatus: 'unknown',
        updatedAt: now,
      });
    }
    return { inserted: SEED_CARDS.length, skipped: false };
  },
});
