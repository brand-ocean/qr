// Absolute Dutch date/time, e.g. "2 jul, 14:22". Returns "nooit" for null.
export function formatWhen(ts: number | null | undefined): string {
  if (ts === null || ts === undefined) return 'nooit';
  return new Date(ts).toLocaleString('nl-NL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
