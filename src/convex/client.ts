import {
  ConvexReactClient,
  useConvexConnectionState,
  useQuery,
} from 'convex/react';
import { makeFunctionReference } from 'convex/server';

// Convex is the single source of truth for card data. The app has no bundled
// dataset: every card (video id, clip times, quote, volume, thumbnail) is read
// live from the prod deployment, so admin changes in the dashboard reach the
// app immediately without a new release.
//
// Points at the prod deployment (tacit-crab-381), matching the worker's
// cloudflare/wrangler.json and the admin's cloudflare/admin/.env.production.
const CONVEX_URL = 'https://tacit-crab-381.eu-west-1.convex.cloud';

export const convex = new ConvexReactClient(CONVEX_URL);

// Mirror of the `cards.getForPlayer` return shape (see cloudflare/convex/cards.ts).
// Referenced by string so the game doesn't need the backend's generated `api`.
export type PlayerCard = {
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

// Live-subscribes to a single card. Returns `undefined` while loading, `null`
// when the card does not exist, or the card. `cardId` may be empty to skip.
export function useCard(cardId: string): PlayerCard | null | undefined {
  return useQuery(getForPlayer, cardId ? { cardId } : 'skip');
}

// True while the client has no WebSocket to Convex. Used to tell "still
// loading" apart from "no connection" so the player can show a retry screen.
export function useIsConvexOffline(): boolean {
  const state = useConvexConnectionState();
  return !state.isWebSocketConnected;
}
