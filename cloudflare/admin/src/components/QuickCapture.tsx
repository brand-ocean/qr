import { api } from '@convex/_generated/api';
import type { Doc } from '@convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { SquareDashedMousePointer, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Modal } from './ui/modal';
import { AppSelect } from './ui/select';
import { Textarea } from './ui/textarea';

type RoadmapStatus = Doc<'roadmapItems'>['status'];
type RoadmapKind = NonNullable<Doc<'roadmapItems'>['kind']>;
type RoadmapPriority = NonNullable<Doc<'roadmapItems'>['priority']>;

const STATUS_OPTIONS: { value: RoadmapStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'planned', label: 'Gepland' },
  { value: 'inProgress', label: 'Mee bezig' },
  { value: 'done', label: 'Klaar' },
];
const KIND_OPTIONS: { value: RoadmapKind; label: string }[] = [
  { value: 'feature', label: 'Feature' },
  { value: 'bug', label: 'Bug' },
  { value: 'improvement', label: 'Verbetering' },
  { value: 'idea', label: 'Idee' },
];
const PRIORITY_OPTIONS: { value: RoadmapPriority; label: string }[] = [
  { value: 'low', label: 'Laag' },
  { value: 'normal', label: 'Normaal' },
  { value: 'high', label: 'Hoog' },
  { value: 'urgent', label: 'Urgent' },
];

// Everything we capture about the picked element. Shown read-only in the
// dialog and serialized into the item description on save.
type ElementContext = {
  page: string;
  element: string;
  text: string;
  path: string;
  html: string;
  source: string | null;
};

// Human/AI-readable selector for one element: tag plus its most identifying
// attribute (id, data-slot, aria-label, name) · Tailwind class soup is noise.
function describeElement(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  if (element.id !== '') return `${tag}#${element.id}`;
  const slot = element.getAttribute('data-slot');
  if (slot !== null) return `${tag}[data-slot=${slot}]`;
  const aria = element.getAttribute('aria-label');
  if (aria !== null) return `${tag}[aria-label="${aria}"]`;
  const name = element.getAttribute('name');
  if (name !== null) return `${tag}[name=${name}]`;
  return tag;
}

// DOM path from a recognizable ancestor down to the element (max 6 levels).
function selectorPath(element: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = element;
  while (current && current.tagName !== 'BODY' && parts.length < 6) {
    parts.unshift(describeElement(current));
    current = current.parentElement;
  }
  return parts.join(' > ');
}

// Nearest source-file annotation (some dev tooling injects data-tsd-source);
// the single most useful pointer for fixing a bug at the right spot.
function sourceOf(element: HTMLElement): string | null {
  const host = element.closest('[data-tsd-source]');
  return host instanceof HTMLElement
    ? host.getAttribute('data-tsd-source')
    : null;
}

function captureContext(element: HTMLElement, text: string): ElementContext {
  return {
    page: window.location.pathname,
    element: describeElement(element),
    text,
    path: selectorPath(element),
    html: `${element.outerHTML.replace(/\s+/g, ' ').slice(0, 300)}${
      element.outerHTML.length > 300 ? '…' : ''
    }`,
    source: sourceOf(element),
  };
}

function serializeContext(context: ElementContext): string {
  return [
    `Pagina: ${context.page}`,
    context.source === null ? null : `Bestand: ${context.source}`,
    `Element: ${context.element}${
      context.text === '' ? '' : ` · "${context.text}"`
    }`,
    `Pad: ${context.path}`,
    `HTML: ${context.html}`,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}

type HoverHighlight = { rect: DOMRect; label: string } | null;

// True when the keyboard focus sits in a field, so the "C" hotkey never fires
// while the user is typing.
function isEditableTarget(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  );
}

// Devtools-style element picker: while active, hovering highlights the element
// under the cursor and a click captures it. Subscribing to the DOM like this is
// the external-system sync that belongs in a hook.
function useElementPicker(
  active: boolean,
  onHover: (highlight: HoverHighlight) => void,
  onPick: (context: ElementContext) => void,
  onCancel: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = 'crosshair';

    // The picker's own UI (hint bar, highlight) is excluded via the
    // data-quick-capture marker; the highlight is pointer-events-none anyway.
    const resolve = (
      target: EventTarget | null,
    ): { element: HTMLElement; text: string } | null => {
      if (!(target instanceof HTMLElement)) return null;
      if (target.closest('[data-quick-capture]')) return null;
      const text = (target.innerText ?? '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 140);
      return { element: target, text };
    };

    const onMouseMove = (event: MouseEvent) => {
      const picked = resolve(event.target);
      onHover(
        picked
          ? {
              rect: picked.element.getBoundingClientRect(),
              label: `${describeElement(picked.element)}${
                picked.text === '' ? '' : ` · ${picked.text}`
              }`,
            }
          : null,
      );
    };
    // Swallow presses in the capture phase so buttons/links underneath do not
    // activate while picking.
    const swallow = (event: Event) => {
      if (resolve(event.target)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const onClick = (event: MouseEvent) => {
      const picked = resolve(event.target);
      if (!picked) return;
      event.preventDefault();
      event.stopPropagation();
      onPick(captureContext(picked.element, picked.text));
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };

    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('pointerdown', swallow, true);
    document.addEventListener('mousedown', swallow, true);
    document.addEventListener('mouseup', swallow, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.body.style.cursor = previousCursor;
      document.removeEventListener('mousemove', onMouseMove, true);
      document.removeEventListener('pointerdown', swallow, true);
      document.removeEventListener('mousedown', swallow, true);
      document.removeEventListener('mouseup', swallow, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [active, onHover, onPick, onCancel]);
}

// App-wide quick capture: press C anywhere (outside a field) to enter an
// element-picker. Hovering highlights the element under the cursor; clicking
// opens a dialog that files a roadmap item (default kind "bug") with the picked
// element's context baked into the description.
export function QuickCapture() {
  const [mode, setMode] = useState<'idle' | 'picking' | 'dialog'>('idle');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [context, setContext] = useState<ElementContext | null>(null);
  const [status, setStatus] = useState<RoadmapStatus>('backlog');
  const [kind, setKind] = useState<RoadmapKind | null>('bug');
  const [priority, setPriority] = useState<RoadmapPriority | null>(null);
  const [hovered, setHovered] = useState<HoverHighlight>(null);
  const create = useMutation(api.roadmap.create);

  const openDialog = useCallback((nextContext: ElementContext | null) => {
    setTitle('');
    setNotes('');
    setContext(nextContext);
    setStatus('backlog');
    setKind('bug');
    setPriority(null);
    setHovered(null);
    setMode('dialog');
  }, []);

  const startPicking = useCallback(() => {
    setHovered(null);
    setMode('picking');
  }, []);

  const cancel = useCallback(() => setMode('idle'), []);

  // Global "C" hotkey (only while idle and not typing in a field).
  useEffect(() => {
    if (mode !== 'idle') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key !== 'c' && event.key !== 'C') return;
      if (isEditableTarget(document.activeElement)) return;
      event.preventDefault();
      startPicking();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mode, startPicking]);

  useElementPicker(mode === 'picking', setHovered, openDialog, cancel);

  function submit() {
    const trimmed = title.trim();
    if (trimmed === '') return;
    const blocks: string[] = [];
    if (notes.trim() !== '') blocks.push(notes.trim());
    if (context !== null) {
      blocks.push(`--- Context ---\n${serializeContext(context)}`);
    }
    void create({
      title: trimmed,
      status,
      description: blocks.length === 0 ? undefined : blocks.join('\n\n'),
      kind: kind ?? undefined,
      priority: priority ?? undefined,
    })
      .then(() => toast.success('Toegevoegd aan de roadmap.'))
      .catch((err: unknown) =>
        toast.error(err instanceof Error ? err.message : 'Toevoegen mislukt.'),
      );
    setMode('idle');
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Bug melden / opmerking (C)"
        title="Bug melden / opmerking (C)"
        disabled={mode !== 'idle'}
        onClick={startPicking}
      >
        <SquareDashedMousePointer className="size-5" />
      </Button>

      {mode === 'picking' && hovered ? (
        <div
          data-quick-capture
          className="border-accent-500 bg-accent-500/10 pointer-events-none fixed z-50 rounded-md border-2"
          style={{
            top: hovered.rect.top,
            left: hovered.rect.left,
            width: hovered.rect.width,
            height: hovered.rect.height,
          }}
        >
          <span className="bg-accent-500 absolute -top-6 left-0 max-w-md truncate rounded px-1.5 py-0.5 font-mono text-xs text-white">
            {hovered.label}
          </span>
        </div>
      ) : null}

      {mode === 'picking' ? (
        <div
          data-quick-capture
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-gray-200 bg-white py-2 pr-2 pl-4 shadow-lg dark:border-gray-800 dark:bg-gray-950"
        >
          <SquareDashedMousePointer className="text-accent-500 size-4 shrink-0" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Klik op een element om te melden, of druk op Esc om te stoppen
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openDialog(null)}
          >
            Zelf typen
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Annuleren"
            onClick={cancel}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : null}

      <Modal
        open={mode === 'dialog'}
        onClose={cancel}
        title="Toevoegen aan roadmap"
      >
        <div className="space-y-3">
          <Input
            autoFocus
            value={title}
            placeholder="Titel — wat is er aan de hand?"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
          />

          {context !== null ? (
            <div className="space-y-1.5 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
              <p className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Context
              </p>
              <p className="font-mono text-xs text-gray-900 dark:text-gray-50">
                {context.element}
                <span className="text-gray-400 dark:text-gray-500">
                  {' '}
                  op {context.page}
                </span>
              </p>
              {context.text !== '' ? (
                <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                  “{context.text}”
                </p>
              ) : null}
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                  Meer info
                </summary>
                <div className="mt-1.5 space-y-1 font-mono text-[11px] break-all text-gray-500 dark:text-gray-400">
                  {context.source !== null ? (
                    <p>Bestand: {context.source}</p>
                  ) : null}
                  <p>Pad: {context.path}</p>
                  <p>HTML: {context.html}</p>
                </div>
              </details>
            </div>
          ) : null}

          <Textarea
            value={notes}
            placeholder="Extra informatie (optioneel)"
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex gap-2">
            <AppSelect
              aria-label="Status"
              value={status}
              onValueChange={(v) => setStatus(v ?? 'backlog')}
              options={STATUS_OPTIONS}
            />
            <AppSelect
              aria-label="Type"
              value={kind}
              onValueChange={setKind}
              options={KIND_OPTIONS}
              placeholder="Geen type"
            />
            <AppSelect
              aria-label="Prioriteit"
              value={priority}
              onValueChange={setPriority}
              options={PRIORITY_OPTIONS}
              placeholder="Geen prioriteit"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={cancel}>
            Annuleren
          </Button>
          <Button size="sm" onClick={submit} disabled={title.trim() === ''}>
            Toevoegen
          </Button>
        </div>
      </Modal>
    </>
  );
}
