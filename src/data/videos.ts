/**
 * Video data for the VIRALS Meme Editie app.
 *
 * To add videos from a CSV, convert the data to this format:
 * CSV columns: id,name,videoId,startTime,endTime,emoji
 *
 * QR codes should link to: virals-app://video/{id}
 */

export type VideoCard = {
  readonly emoji: string;
  readonly endTime: number;
  readonly id: string;
  readonly name: string;
  readonly startTime: number;
  readonly videoId: string;
};

/**
 * All available videos. Add/update entries here when client provides new CSV data.
 */
export const VIDEOS: ReadonlyArray<VideoCard> = [
  {
    emoji: '🎤',
    endTime: 58,
    id: 'rick-roll',
    name: 'Rick Roll',
    startTime: 43,
    videoId: 'dQw4w9WgXcQ',
  },
  {
    emoji: '🧟',
    endTime: 345,
    id: 'thriller',
    name: 'Thriller',
    startTime: 330,
    videoId: 'sOnqjkJTMaA',
  },
  {
    emoji: '✏️',
    endTime: 75,
    id: 'take-on-me',
    name: 'Take On Me',
    startTime: 60,
    videoId: 'djV11Xbc914',
  },
  {
    emoji: '💃',
    endTime: 75,
    id: 'single-ladies',
    name: 'Single Ladies',
    startTime: 60,
    videoId: '4m1EFMoRFvY',
  },
  {
    emoji: '🕺',
    endTime: 155,
    id: 'billie-jean',
    name: 'Billie Jean',
    startTime: 140,
    videoId: 'Zi_XLOBDo_Y',
  },
] as const;

/**
 * Lookup map for O(1) video access by ID.
 */
export const VIDEO_BY_ID = new Map<string, VideoCard>(
  VIDEOS.map((video) => [video.id, video]),
);

/**
 * Get a video by its ID.
 * @param id - The video ID (e.g., 'rick-roll')
 * @returns The video card or null if not found
 */
export function getVideoById(id: string): VideoCard | null {
  return VIDEO_BY_ID.get(id) ?? null;
}

/**
 * Get a random video from the collection.
 * @returns A random video card
 */
export function getRandomVideo(): VideoCard {
  const randomIndex = Math.floor(Math.random() * VIDEOS.length);
  return VIDEOS[randomIndex];
}
