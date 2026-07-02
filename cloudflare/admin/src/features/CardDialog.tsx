import { api } from '@convex/_generated/api';
import type { Doc } from '@convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import type React from 'react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { CancelIcon, VideoIcon } from '../components/icons';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { formatClip, parseYouTubeId } from '../lib/youtube';
import { VideoTimePicker } from './VideoTimePicker';

type Props = {
  mode: 'create' | 'edit';
  card?: Doc<'cards'>;
  onClose: () => void;
};

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

export function CardDialog({ mode, card, onClose }: Props) {
  const createCard = useMutation(api.cards.create);
  const updateCard = useMutation(api.cards.update);

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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const trimmedVideo = videoId.trim();
  const showPicker = YT_ID.test(trimmedVideo);

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
