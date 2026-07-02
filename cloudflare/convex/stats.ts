import { getAuthUserId } from '@convex-dev/auth/server';
import type { Infer } from 'convex/values';
import { query } from './_generated/server';
import type { QueryCtx } from './_generated/server';
import type { availabilityStatusValidator } from './schema';

type Status = Infer<typeof availabilityStatusValidator>;

export type DashboardStats = {
  totalCards: number;
  statusCounts: Record<Status, number>;
  totalScans: number;
  scannedCards: number;
  lastCheckedAt: number | null;
  // Last 30 UTC days (oldest → newest), zero-filled.
  trend: { day: string; count: number }[];
  // Most-scanned cards, highest first.
  topCards: {
    cardId: string;
    quote: string;
    videoId: string;
    scanCount: number;
    status: Status;
  }[];
};

function utcDay(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

async function requireAdmin(ctx: QueryCtx): Promise<void> {
  if ((await getAuthUserId(ctx)) === null) {
    throw new Error('Niet ingelogd.');
  }
}

// Everything the admin dashboard needs, in one reactive query.
export const dashboard = query({
  args: {},
  handler: async (ctx): Promise<DashboardStats> => {
    await requireAdmin(ctx);

    const cards = await ctx.db.query('cards').withIndex('by_cardId').collect();

    const statusCounts: Record<Status, number> = {
      ok: 0,
      broken: 0,
      allowlisted: 0,
      error: 0,
      unknown: 0,
    };
    let totalScans = 0;
    let scannedCards = 0;
    let lastCheckedAt: number | null = null;
    for (const card of cards) {
      statusCounts[card.availabilityStatus]++;
      const scans = card.scanCount ?? 0;
      totalScans += scans;
      if (scans > 0) {
        scannedCards++;
      }
      if (
        card.lastCheckedAt !== undefined &&
        (lastCheckedAt === null || card.lastCheckedAt > lastCheckedAt)
      ) {
        lastCheckedAt = card.lastCheckedAt;
      }
    }

    const topCards = [...cards]
      .filter((card) => (card.scanCount ?? 0) > 0)
      .sort((a, b) => (b.scanCount ?? 0) - (a.scanCount ?? 0))
      .slice(0, 10)
      .map((card) => ({
        cardId: card.cardId,
        quote: card.quote,
        videoId: card.videoId,
        scanCount: card.scanCount ?? 0,
        status: card.availabilityStatus,
      }));

    // 30-day zero-filled trend. Build the day keys from now backwards, then fill
    // from the scanDaily table (small: at most one row per day).
    const daily = await ctx.db.query('scanDaily').withIndex('by_day').collect();
    const byDay = new Map(daily.map((row) => [row.day, row.count]));
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    const trend: { day: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const day = utcDay(now - i * DAY_MS);
      trend.push({ day, count: byDay.get(day) ?? 0 });
    }

    return {
      totalCards: cards.length,
      statusCounts,
      totalScans,
      scannedCards,
      lastCheckedAt,
      trend,
      topCards,
    };
  },
});
