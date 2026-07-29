import { ConvexReactClient, useQuery } from 'convex/react';
import { makeFunctionReference } from 'convex/server';

// The game ships with a baked-in dataset (src/data/videos.ts) and works fully
// offline. Convex is used only for one live, optional bit of data: a custom
// thumbnail an admin can set per card. If Convex is unreachable, playback still
// works — the poster just falls back to a low-res YouTube still.
//
// Points at the prod deployment (tacit-crab-381), matching the admin's
// cloudflare/admin/.env.production.
const CONVEX_URL = 'https://tacit-crab-381.eu-west-1.convex.cloud';

export const convex = new ConvexReactClient(CONVEX_URL);

// Mirror of the `cards.getForPlayer` return shape (see cloudflare/convex/cards.ts).
// Referenced by string so the game doesn't need the backend's generated `api`.
type PlayerCard = {
  cardId: string;
  contentWarning: boolean;
  endTime: number;
  quote: string;
  startTime: number;
  thumbnail: string | null;
  videoId: string;
  volume: number;
  year: number;
};

const getForPlayer = makeFunctionReference<
  'query',
  { cardId: string },
  PlayerCard | null
>('cards:getForPlayer');

// Live-subscribes to a single card's custom thumbnail.
// Returns `undefined` while loading, `null` if no card / no custom thumbnail,
// or the thumbnail URL. `cardId` may be empty to skip the query.
export function useCardThumbnail(cardId: string): string | null | undefined {
  const card = useQuery(getForPlayer, cardId ? { cardId } : 'skip');
  if (card === undefined) {
    return undefined;
  }
  return card?.thumbnail ?? null;
}

// Live-subscribes to a single card's playback volume (0–100). Falls back to
// 100 (full volume) while loading, when the card is missing, or when Convex is
// unreachable — so playback volume never depends on the network. Convex
// dedupes this with useCardThumbnail: both share one `getForPlayer` query.
export function useCardVolume(cardId: string): number {
  const card = useQuery(getForPlayer, cardId ? { cardId } : 'skip');
  return card?.volume ?? 100;
}
