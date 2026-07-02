import { v } from 'convex/values';
import { internal } from './_generated/api';
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from './_generated/server';
import { availabilityStatusValidator } from './schema';

const CHECK_CONCURRENCY = 20;

type CheckOutcome = 'ok' | 'broken' | 'allowlisted' | 'error';

type CheckResult = {
  cardId: string;
  status: CheckOutcome;
  httpStatus?: number;
};

export type CheckSummary = {
  checked: number;
  ok: number;
  broken: number;
  allowlisted: number;
  error: number;
};

function oembedUrl(videoId: string): string {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;
}

// Minimal projection of cards for the check (avoids shipping full docs).
export const cardsForCheck = internalQuery({
  args: {},
  handler: async (
    ctx,
  ): Promise<
    { cardId: string; videoId: string; allowlistReason?: string }[]
  > => {
    const cards = await ctx.db.query('cards').withIndex('by_cardId').collect();
    return cards.map((card) => ({
      cardId: card.cardId,
      videoId: card.videoId,
      allowlistReason: card.allowlistReason,
    }));
  },
});

// Writes the check outcome back onto each card.
export const recordResults = internalMutation({
  args: {
    results: v.array(
      v.object({
        cardId: v.string(),
        status: availabilityStatusValidator,
        httpStatus: v.optional(v.number()),
      }),
    ),
    checkedAt: v.number(),
  },
  handler: async (ctx, { results, checkedAt }): Promise<void> => {
    for (const result of results) {
      const card = await ctx.db
        .query('cards')
        .withIndex('by_cardId', (q) => q.eq('cardId', result.cardId))
        .unique();
      if (card === null) {
        continue;
      }
      await ctx.db.patch(card._id, {
        availabilityStatus: result.status,
        lastHttpStatus: result.httpStatus,
        lastCheckedAt: checkedAt,
      });
    }
  },
});

// Core check logic (no auth) — used by the daily cron and the authed action.
export const runScheduledCheck = internalAction({
  args: {},
  handler: async (ctx): Promise<CheckSummary> => {
    const cards = await ctx.runQuery(internal.availability.cardsForCheck, {});

    const results: CheckResult[] = new Array(cards.length);
    let next = 0;
    const lane = async (): Promise<void> => {
      while (next < cards.length) {
        const index = next++;
        const card = cards[index];
        if (card.videoId === 'ERROR') {
          results[index] = { cardId: card.cardId, status: 'error' };
          continue;
        }
        let httpStatus = -1;
        try {
          httpStatus = (await fetch(oembedUrl(card.videoId))).status;
        } catch {
          httpStatus = -1;
        }
        if (httpStatus === 200) {
          results[index] = { cardId: card.cardId, status: 'ok', httpStatus };
        } else if (card.allowlistReason !== undefined) {
          results[index] = {
            cardId: card.cardId,
            status: 'allowlisted',
            httpStatus,
          };
        } else {
          results[index] = {
            cardId: card.cardId,
            status: 'broken',
            httpStatus,
          };
        }
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(CHECK_CONCURRENCY, cards.length) }, lane),
    );

    const checkedAt = Date.now();
    await ctx.runMutation(internal.availability.recordResults, {
      results,
      checkedAt,
    });

    const count = (status: CheckOutcome): number =>
      results.filter((r) => r.status === status).length;
    return {
      checked: results.length,
      ok: count('ok'),
      broken: count('broken'),
      allowlisted: count('allowlisted'),
      error: count('error'),
    };
  },
});

// Admin "Check nu" button — requires an authenticated admin.
export const runCheck = action({
  args: {},
  handler: async (ctx): Promise<CheckSummary> => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Niet ingelogd.');
    }
    return await ctx.runAction(internal.availability.runScheduledCheck, {});
  },
});
