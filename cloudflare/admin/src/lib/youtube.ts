// YouTube helpers shared by the cards list, grid and time picker.

// Extracts an 11-character YouTube video id from a bare id or any common URL
// form (watch?v=, youtu.be/, /shorts/, /embed/). Returns null if none found,
// so callers can leave partial input untouched while typing.
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /\/shorts\/([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
    /\/live\/([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return null;
}

export function youtubeThumb(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function youtubeWatchUrl(videoId: string, startTime = 0): string {
  const base = `https://www.youtube.com/watch?v=${videoId}`;
  return startTime > 0 ? `${base}&t=${Math.floor(startTime)}s` : base;
}

// "0:00" style mm:ss (or h:mm:ss for long videos).
export function formatSeconds(total: number): string {
  const s = Math.max(0, Math.floor(total));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

// Human clip description, e.g. "0:00–0:10" or "0:12 → einde".
export function formatClip(startTime: number, endTime: number): string {
  const start = formatSeconds(startTime);
  return endTime > 0
    ? `${start}–${formatSeconds(endTime)}`
    : `${start} → einde`;
}
