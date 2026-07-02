import { useEffect, useRef, useState } from 'react';
import { PauseIcon, PlayIcon, ReloadIcon } from '../components/icons';
import { Button } from '../components/ui/button';
import { formatSeconds } from '../lib/youtube';
import { loadYouTubeApi, type YTPlayer } from '../lib/youtubeApi';

type Props = {
  videoId: string;
  startTime: number;
  endTime: number; // 0 = play to natural end
  onChange: (next: { startTime: number; endTime: number }) => void;
};

// Interactive clip trimmer: embeds the YouTube player and lets the admin drag a
// start/end range over a timeline, loop-preview the clip, and snap start/end to
// the current playhead. endTime === 0 means "play to the natural end".
export function VideoTimePicker({
  videoId,
  startTime,
  endTime,
  onChange,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const previewingRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [drag, setDrag] = useState<'start' | 'end' | 'seek' | null>(null);

  const toEnd = endTime === 0;
  const effectiveEnd = toEnd ? duration : endTime;

  // Keep the latest bounds available to the polling interval without re-creating it.
  const boundsRef = useRef({ startTime, effectiveEnd });
  boundsRef.current = { startTime, effectiveEnd };

  // Create the player once; reload the video when videoId changes.
  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled || !mountRef.current) return;
      if (playerRef.current) {
        playerRef.current.cueVideoById({ videoId, startSeconds: startTime });
        return;
      }
      playerRef.current = new YT.Player(mountRef.current, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          disablekb: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (e) => {
            if (cancelled) return;
            setDuration(e.target.getDuration());
            setReady(true);
          },
          onStateChange: (e) => {
            setPlaying(e.data === YT.PlayerState.PLAYING);
            if (e.data === YT.PlayerState.ENDED) previewingRef.current = false;
          },
        },
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Poll the playhead; loop the clip while previewing.
  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      const t = p.getCurrentTime();
      setCurrent(t);
      if (!duration && p.getDuration() > 0) setDuration(p.getDuration());
      if (previewingRef.current) {
        const { startTime: s, effectiveEnd: e } = boundsRef.current;
        if (e > 0 && (t >= e - 0.1 || t < s - 0.5)) {
          p.seekTo(s, true);
        }
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [ready, duration]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  function seekTo(seconds: number) {
    playerRef.current?.seekTo(seconds, true);
    setCurrent(seconds);
  }

  function playClip() {
    if (!playerRef.current) return;
    previewingRef.current = true;
    playerRef.current.seekTo(startTime, true);
    playerRef.current.playVideo();
  }

  function pause() {
    previewingRef.current = false;
    playerRef.current?.pauseVideo();
  }

  function secondsFromClientX(clientX: number): number {
    const track = trackRef.current;
    if (!track || duration <= 0) return 0;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(ratio * duration);
  }

  function onHandleDown(which: 'start' | 'end') {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      // Don't let the track's seek handler also fire when grabbing a handle.
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDrag(which);
      previewingRef.current = false;
    };
  }

  // Click/drag on the track background scrubs the playhead (fast-forward/rewind),
  // independent of the start/end handles.
  function onTrackDown(e: React.PointerEvent) {
    if (duration <= 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    previewingRef.current = false;
    setDrag('seek');
    seekTo(secondsFromClientX(e.clientX));
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const secs = secondsFromClientX(e.clientX);
    if (drag === 'seek') {
      seekTo(secs);
    } else if (drag === 'start') {
      const max = toEnd ? duration - 1 : endTime - 1;
      const next = Math.min(secs, Math.max(0, max));
      onChange({ startTime: next, endTime });
      seekTo(next);
    } else {
      const next = Math.max(secs, startTime + 1);
      onChange({ startTime, endTime: Math.min(next, duration) });
      seekTo(Math.min(next, duration));
    }
  }

  function onPointerUp() {
    setDrag(null);
  }

  const pct = (secs: number) =>
    duration > 0 ? `${Math.min(100, (secs / duration) * 100)}%` : '0%';

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
        <div ref={mountRef} className="h-full w-full" />
        {!ready ? (
          <div className="absolute inset-0 flex items-center justify-center text-white/70">
            <ReloadIcon className="size-6 animate-spin" />
          </div>
        ) : null}
      </div>

      {/* Timeline with draggable start/end handles */}
      <div className="select-none">
        <div
          ref={trackRef}
          className="relative h-8 cursor-pointer touch-none rounded-md bg-gray-100 dark:bg-gray-800"
          onPointerDown={onTrackDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* selected range */}
          <div
            className="bg-accent-500/25 absolute inset-y-0 rounded-md"
            style={{
              left: pct(startTime),
              right: `calc(100% - ${pct(effectiveEnd || duration)})`,
            }}
          />
          {/* playhead (scrubbable via the track) */}
          {ready ? (
            <div
              className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-gray-900 dark:bg-white"
              style={{ left: pct(current) }}
            >
              <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-gray-900 dark:bg-white" />
            </div>
          ) : null}
          {/* start handle */}
          <button
            type="button"
            aria-label="Startpunt"
            onPointerDown={onHandleDown('start')}
            className="bg-accent-500 absolute inset-y-0 flex w-4 -translate-x-1/2 cursor-ew-resize touch-none items-center justify-center rounded"
            style={{ left: pct(startTime) }}
          >
            <span className="h-3 w-0.5 rounded bg-white/80" />
          </button>
          {/* end handle (hidden when playing to natural end) */}
          {!toEnd ? (
            <button
              type="button"
              aria-label="Eindpunt"
              onPointerDown={onHandleDown('end')}
              className="bg-accent-600 absolute inset-y-0 flex w-4 -translate-x-1/2 cursor-ew-resize touch-none items-center justify-center rounded"
              style={{ left: pct(endTime) }}
            >
              <span className="h-3 w-0.5 rounded bg-white/80" />
            </button>
          ) : null}
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-500 tabular-nums dark:text-gray-400">
          <span>0:00</span>
          <span>{ready ? formatSeconds(duration) : '—'}</span>
        </div>
      </div>

      {/* Readouts + snap buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={playing ? pause : playClip}
          disabled={!ready}
          // Fixed width so the play/pause label swap never shifts the toolbar.
          className="w-32 justify-center"
        >
          {playing ? (
            <PauseIcon className="size-4" />
          ) : (
            <PlayIcon className="size-4" />
          )}
          {playing ? 'Pauze' : 'Speel clip'}
        </Button>
        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 tabular-nums dark:bg-gray-800 dark:text-gray-300">
          Nu: {formatSeconds(current)}
        </span>
        <Button
          variant="light"
          size="sm"
          disabled={!ready}
          onClick={() =>
            onChange({
              startTime: Math.min(
                Math.round(current),
                toEnd ? duration - 1 : endTime - 1,
              ),
              endTime,
            })
          }
        >
          Zet start = nu
        </Button>
        <Button
          variant="light"
          size="sm"
          disabled={!ready || toEnd}
          onClick={() =>
            onChange({
              startTime,
              endTime: Math.max(Math.round(current), startTime + 1),
            })
          }
        >
          Zet eind = nu
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex gap-4 tabular-nums">
          <span className="text-gray-600 dark:text-gray-300">
            Start: <strong>{formatSeconds(startTime)}</strong>
          </span>
          <span className="text-gray-600 dark:text-gray-300">
            Eind:{' '}
            <strong>{toEnd ? 'einde video' : formatSeconds(endTime)}</strong>
          </span>
        </div>
        <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            className="accent-accent-500 size-4"
            checked={toEnd}
            onChange={(e) =>
              onChange({
                startTime,
                endTime: e.target.checked
                  ? 0
                  : Math.min(
                      startTime + 15,
                      duration > 0 ? duration : startTime + 15,
                    ),
              })
            }
          />
          Speel tot einde
        </label>
      </div>
    </div>
  );
}
