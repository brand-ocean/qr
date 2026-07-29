import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import type React from 'react';
import { useRef, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { CancelIcon, ImageIcon, VideoIcon } from '../components/icons';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import type { CardDoc } from '../lib/adminContext';
import { cx } from '../lib/utils';
import { formatClip, parseYouTubeId, youtubeThumb } from '../lib/youtube';
import { VideoTimePicker } from './VideoTimePicker';

type Props = {
  mode: 'create' | 'edit';
  card?: CardDoc;
  onClose: () => void;
};

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

// A still frame from the video itself: YouTube auto-generates hq1/hq2/hq3 at
// roughly 25/50/75% of the video (480×360).
function youtubeFrame(videoId: string, n: 1 | 2 | 3): string {
  return `https://i.ytimg.com/vi/${videoId}/hq${n}.jpg`;
}

export function CardDialog({ mode, card, onClose }: Props) {
  const createCard = useMutation(api.cards.create);
  const updateCard = useMutation(api.cards.update);
  const generateUploadUrl = useMutation(api.cards.generateThumbnailUploadUrl);

  const [cardId, setCardId] = useState(card?.cardId ?? '');
  const [quote, setQuote] = useState(card?.quote ?? '');
  const [videoId, setVideoId] = useState(card?.videoId ?? '');
  const [year, setYear] = useState(
    String(card?.year ?? new Date().getFullYear()),
  );
  const [contentWarning, setContentWarning] = useState(
    card?.contentWarning ?? false,
  );
  const [allowlistReason, setAllowlistReason] = useState(
    card?.allowlistReason ?? '',
  );
  const [startTime, setStartTime] = useState(card?.startTime ?? 0);
  const [endTime, setEndTime] = useState(card?.endTime ?? 0);
  // Per-card playback volume (0–100). Unset on the card means full volume.
  const [volume, setVolume] = useState(card?.volume ?? 100);
  // Thumbnail override: an uploaded image (thumbnailId) wins over a chosen
  // frame / URL (thumbnailUrl); both unset = default YouTube thumbnail.
  const [thumbnailId, setThumbnailId] = useState<Id<'_storage'> | undefined>(
    card?.thumbnailId,
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(
    card?.thumbnailUrl,
  );
  // Local object URL for a just-uploaded image, shown before the card is saved.
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  // Frame URLs that 404 for this video (e.g. maxres missing) are hidden.
  const [failedFrames, setFailedFrames] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const trimmedVideo = videoId.trim();
  const showPicker = YT_ID.test(trimmedVideo);

  // What to render in the thumbnail preview, in priority order.
  const previewSrc =
    localPreview ??
    (thumbnailId !== undefined ? (card?.thumbnail ?? null) : null) ??
    thumbnailUrl ??
    (showPicker ? youtubeThumb(trimmedVideo) : null);

  const usingDefault = thumbnailId === undefined && thumbnailUrl === undefined;

  // Candidate stills YouTube serves for this video, besides the default cover.
  // Any that fail to load (commonly maxres) are dropped from the picker.
  const frameCandidates = showPicker
    ? [
        {
          key: 'hd',
          label: 'HD',
          url: `https://i.ytimg.com/vi/${trimmedVideo}/maxresdefault.jpg`,
        },
        {
          key: 'sd',
          label: 'SD',
          url: `https://i.ytimg.com/vi/${trimmedVideo}/sddefault.jpg`,
        },
        { key: 'f1', label: '25%', url: youtubeFrame(trimmedVideo, 1) },
        { key: 'f2', label: '50%', url: youtubeFrame(trimmedVideo, 2) },
        { key: 'f3', label: '75%', url: youtubeFrame(trimmedVideo, 3) },
      ].filter((c) => !failedFrames.has(c.url))
    : [];

  function chooseFrame(url: string) {
    setThumbnailId(undefined);
    setThumbnailUrl(url);
    setLocalPreview(null);
  }
  function resetThumbnail() {
    setThumbnailId(undefined);
    setThumbnailUrl(undefined);
    setLocalPreview(null);
  }

  async function onUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!res.ok) throw new Error('Upload mislukt.');
      const { storageId } = (await res.json()) as {
        storageId: Id<'_storage'>;
      };
      setThumbnailId(storageId);
      setThumbnailUrl(undefined);
      setLocalPreview(URL.createObjectURL(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload mislukt.');
    } finally {
      setUploading(false);
    }
  }

  async function performSave() {
    setError(null);
    setSubmitting(true);
    const shared = {
      quote: quote.trim(),
      videoId: trimmedVideo,
      startTime,
      endTime,
      year: Number(year),
      contentWarning,
      // Store nothing when at full volume, so the card stays on the default.
      volume: volume >= 100 ? undefined : volume,
      thumbnailId,
      thumbnailUrl,
      allowlistReason: allowlistReason.trim() || undefined,
    };
    try {
      if (mode === 'create') {
        await createCard({ cardId: cardId.trim(), ...shared });
        toast.success(`Kaart ${cardId.trim()} aangemaakt.`);
      } else if (card) {
        await updateCard({ id: card._id, ...shared });
        toast.success(`Kaart ${card.cardId} opgeslagen.`);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt.');
      setSubmitting(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Editing overwrites an existing card — confirm first. Creating is new, so
    // it saves straight away.
    if (mode === 'edit') {
      setConfirmOpen(true);
    } else {
      void performSave();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      role="presentation"
    >
      <div
        className="my-8 w-full max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-50">
            {mode === 'create'
              ? 'Nieuwe kaart'
              : `Kaart bewerken · ${card?.cardId}`}
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Sluiten"
          >
            <CancelIcon className="size-4" />
          </Button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
          {/* Left: metadata */}
          <div className="flex flex-col gap-3">
            {mode === 'create' ? (
              <Field label="Kaart-id (kaartXXXX)">
                <Input
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  placeholder="kaart0268"
                  required
                />
              </Field>
            ) : null}
            <Field label="Quote / titel">
              <Input
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                required
              />
            </Field>
            <Field label="YouTube video-id of volledige URL">
              <Input
                value={videoId}
                onChange={(e) => {
                  // Accept a bare id or any YouTube URL; snap to the id when
                  // one can be extracted (e.g. after pasting a full link).
                  const raw = e.target.value;
                  setVideoId(parseYouTubeId(raw) ?? raw);
                }}
                placeholder="dQw4w9WgXcQ of https://youtu.be/…"
                className="font-mono"
                required
              />
            </Field>
            <Field label="Jaar">
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </Field>
            <div className="flex flex-col gap-1.5">
              <Label>Kapotte video bewust negeren (optioneel)</Label>
              <Input
                value={allowlistReason}
                onChange={(e) => setAllowlistReason(e.target.value)}
                placeholder="Reden, bv. 'tijdelijk offline, komt terug'"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Vul een reden in als een video kapot is maar je die bewust wilt
                houden — de statuscheck toont de kaart dan als “Genegeerd” in
                plaats van “Kapot”. Laat leeg voor normale kaarten.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-50">
              <input
                type="checkbox"
                checked={contentWarning}
                onChange={(e) => setContentWarning(e.target.checked)}
                className="accent-accent-500 size-4"
              />
              Inhoudswaarschuwing tonen vóór de video
            </label>
          </div>

          {/* Right: interactive clip trimmer */}
          <div className="flex flex-col gap-2">
            <Label>Clip instellen</Label>
            {showPicker ? (
              <VideoTimePicker
                key={trimmedVideo}
                videoId={trimmedVideo}
                startTime={startTime}
                endTime={endTime}
                onChange={({ startTime: s, endTime: e }) => {
                  setStartTime(s);
                  setEndTime(e);
                }}
              />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 text-center text-sm text-gray-400 dark:border-gray-700">
                <VideoIcon className="size-7" />
                <span>
                  Vul een geldig YouTube video-id in
                  <br />
                  om de clip interactief in te stellen.
                </span>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Huidige clip: <strong>{formatClip(startTime, endTime)}</strong>
            </p>

            <div className="mt-1 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label>Volume</Label>
                <span className="text-xs font-medium text-gray-500 tabular-nums dark:text-gray-400">
                  {volume}%{volume >= 100 ? ' (standaard)' : ''}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="accent-accent-500 w-full"
                aria-label="Volume"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Zet lager voor kaarten die te hard klinken. 100% = standaard
                YouTube-volume.
              </p>
            </div>
          </div>

          {/* Thumbnail override: default YouTube, a frame from the video, or an
              uploaded image. */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label>Thumbnail</Label>
            <div className="flex flex-wrap items-start gap-3">
              <div className="aspect-video w-40 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <ImageIcon className="size-6" />
                  </div>
                )}
              </div>
              <div className="flex min-w-52 flex-1 flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <ThumbChoice
                    label="Standaard"
                    active={usingDefault}
                    disabled={!showPicker}
                    onClick={resetThumbnail}
                    imgSrc={showPicker ? youtubeThumb(trimmedVideo) : undefined}
                  />
                  {frameCandidates.map((c) => (
                    <ThumbChoice
                      key={c.key}
                      label={c.label}
                      active={thumbnailUrl === c.url}
                      onClick={() => chooseFrame(c.url)}
                      imgSrc={c.url}
                      onError={() =>
                        setFailedFrames((prev) => {
                          const next = new Set(prev);
                          next.add(c.url);
                          return next;
                        })
                      }
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void onUpload(file);
                      e.target.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    isLoading={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="size-4" /> Afbeelding uploaden
                  </Button>
                  {!usingDefault ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetThumbnail}
                    >
                      Standaard herstellen
                    </Button>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Laat leeg voor de standaard YouTube-thumbnail, kies een frame
                  uit de video zelf, of upload een eigen afbeelding.
                </p>
              </div>
            </div>
          </div>

          {error ? (
            <p className="text-sm text-red-600 md:col-span-2 dark:text-red-400">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 md:col-span-2">
            <Button variant="secondary" onClick={onClose} type="button">
              Annuleren
            </Button>
            <Button type="submit" isLoading={submitting}>
              Opslaan
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Wijzigingen opslaan?"
        description={`Dit overschrijft de bestaande gegevens van ${card?.cardId}.`}
        confirmLabel="Overschrijven"
        onConfirm={() => void performSave()}
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

// A small thumbnail source swatch (default / video frame) with its own preview.
function ThumbChoice({
  label,
  active,
  disabled,
  onClick,
  imgSrc,
  onError,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  imgSrc?: string;
  onError?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={label}
      className={cx(
        'relative h-11 w-16 shrink-0 overflow-hidden rounded border bg-gray-100 transition dark:bg-gray-800',
        active
          ? 'border-accent-500 ring-accent-500/40 ring-2'
          : 'border-gray-200 hover:border-gray-400 dark:border-gray-700',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt=""
          className="h-full w-full object-cover"
          onError={onError}
        />
      ) : null}
      <span className="absolute inset-x-0 bottom-0 bg-black/50 py-0.5 text-center text-[9px] font-medium text-white">
        {label}
      </span>
    </button>
  );
}
