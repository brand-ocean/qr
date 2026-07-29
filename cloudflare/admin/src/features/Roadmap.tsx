import { api } from '@convex/_generated/api';
import type { Doc, Id } from '@convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { GripVertical, MessageSquare, Plus, Send, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/modal';
import { AppSelect } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { formatWhen } from '../lib/format';
import { cx } from '../lib/utils';

type RoadmapItem = Doc<'roadmapItems'> & {
  creatorName: string;
  commentCount: number;
};
type RoadmapStatus = Doc<'roadmapItems'>['status'];
type RoadmapKind = NonNullable<Doc<'roadmapItems'>['kind']>;
type RoadmapPriority = NonNullable<Doc<'roadmapItems'>['priority']>;

type BadgeVariant = 'default' | 'neutral' | 'success' | 'error' | 'warning';

const STATUSES: RoadmapStatus[] = ['backlog', 'planned', 'inProgress', 'done'];

const COLUMN_META: Record<
  RoadmapStatus,
  { label: string; dotClass: string; textClass: string }
> = {
  backlog: {
    label: 'Backlog',
    dotClass: 'bg-gray-400',
    textClass: 'text-gray-500 dark:text-gray-400',
  },
  planned: {
    label: 'Gepland',
    dotClass: 'bg-accent-500',
    textClass: 'text-accent-700 dark:text-accent-400',
  },
  inProgress: {
    label: 'Mee bezig',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  done: {
    label: 'Klaar',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
};

const KIND_META: Record<RoadmapKind, { label: string; variant: BadgeVariant }> =
  {
    feature: { label: 'Feature', variant: 'default' },
    bug: { label: 'Bug', variant: 'error' },
    improvement: { label: 'Verbetering', variant: 'success' },
    idea: { label: 'Idee', variant: 'warning' },
  };

const PRIORITY_META: Record<
  RoadmapPriority,
  { label: string; variant: BadgeVariant }
> = {
  urgent: { label: 'Urgent', variant: 'error' },
  high: { label: 'Hoog', variant: 'warning' },
  normal: { label: 'Normaal', variant: 'neutral' },
  low: { label: 'Laag', variant: 'neutral' },
};

const KIND_OPTIONS = (Object.keys(KIND_META) as RoadmapKind[]).map((k) => ({
  value: k,
  label: KIND_META[k].label,
}));
const PRIORITY_OPTIONS = (Object.keys(PRIORITY_META) as RoadmapPriority[]).map(
  (p) => ({ value: p, label: PRIORITY_META[p].label }),
);

// How many cards the title-only "Klaar" column shows before "meer laden".
const DONE_PAGE_SIZE = 3;

// The card being dragged, shared across columns via component state.
type Dragging = { id: Id<'roadmapItems'>; status: RoadmapStatus };

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      title={name}
      className="bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
    >
      {initials(name) || '?'}
    </span>
  );
}

export function Roadmap() {
  const items = useQuery(api.roadmap.list);

  const move = useMutation(api.roadmap.move).withOptimisticUpdate(
    (store, args) => {
      const current = store.getQuery(api.roadmap.list, {});
      if (!current) return;
      let order: number;
      if (args.beforeOrder !== undefined && args.afterOrder !== undefined) {
        order = (args.beforeOrder + args.afterOrder) / 2;
      } else if (args.afterOrder !== undefined) {
        order = args.afterOrder - 1024;
      } else if (args.beforeOrder !== undefined) {
        order = args.beforeOrder + 1024;
      } else {
        const orders = current
          .filter((i) => i.status === args.status)
          .map((i) => i.order);
        order =
          args.status === 'done'
            ? Math.min(0, ...orders) - 1024
            : Math.max(0, ...orders) + 1024;
      }
      store.setQuery(
        api.roadmap.list,
        {},
        current.map((i) =>
          i._id === args.itemId ? { ...i, status: args.status, order } : i,
        ),
      );
    },
  );

  const [dragging, setDragging] = useState<Dragging | null>(null);
  const [dragOver, setDragOver] = useState<RoadmapStatus | null>(null);

  const byStatus = useMemo(() => {
    const map = new Map<RoadmapStatus, RoadmapItem[]>();
    for (const status of STATUSES) map.set(status, []);
    for (const item of items ?? []) map.get(item.status)?.push(item);
    for (const list of map.values()) list.sort((a, b) => a.order - b.order);
    return map;
  }, [items]);

  // Drop onto a specific card: insert the dragged card just above it.
  function dropOnCard(target: RoadmapItem) {
    if (!dragging) return;
    const targetItems = (byStatus.get(target.status) ?? []).filter(
      (i) => i._id !== dragging.id,
    );
    const overIndex = targetItems.findIndex((i) => i._id === target._id);
    if (overIndex === -1) return;
    const before = targetItems[overIndex - 1];
    const after = targetItems[overIndex];
    if (dragging.status === target.status && after?._id === dragging.id) return;
    void move({
      itemId: dragging.id,
      status: target.status,
      beforeOrder: before?.order,
      afterOrder: after?.order,
    });
  }

  // Drop onto empty column space: append at the bottom.
  function dropOnColumn(status: RoadmapStatus) {
    if (!dragging) return;
    const columnItems = byStatus.get(status) ?? [];
    if (dragging.status === status && columnItems.at(-1)?._id === dragging.id) {
      return;
    }
    void move({ itemId: dragging.id, status });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-50">
          Roadmap
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Sleep kaarten tussen kolommen. Druk overal op{' '}
          <kbd className="rounded border border-gray-300 bg-gray-100 px-1 font-mono text-xs dark:border-gray-700 dark:bg-gray-800">
            C
          </kbd>{' '}
          om een element aan te klikken en als bug te melden.
        </p>
      </div>

      {items === undefined ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Laden…</p>
      ) : (
        <div className="flex items-start gap-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              items={byStatus.get(status) ?? []}
              dragging={dragging}
              isDragOver={dragOver === status}
              onDragOverColumn={() => dragging && setDragOver(status)}
              onDragLeaveColumn={() =>
                setDragOver((s) => (s === status ? null : s))
              }
              onDropColumn={() => {
                dropOnColumn(status);
                setDragOver(null);
              }}
              onDropCard={(target) => {
                dropOnCard(target);
                setDragOver(null);
              }}
              onDragStart={(item) =>
                setDragging({ id: item._id, status: item.status })
              }
              onDragEnd={() => {
                setDragging(null);
                setDragOver(null);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BoardColumn({
  status,
  items,
  dragging,
  isDragOver,
  onDragOverColumn,
  onDragLeaveColumn,
  onDropColumn,
  onDropCard,
  onDragStart,
  onDragEnd,
}: {
  status: RoadmapStatus;
  items: RoadmapItem[];
  dragging: Dragging | null;
  isDragOver: boolean;
  onDragOverColumn: () => void;
  onDragLeaveColumn: () => void;
  onDropColumn: () => void;
  onDropCard: (target: RoadmapItem) => void;
  onDragStart: (item: RoadmapItem) => void;
  onDragEnd: () => void;
}) {
  const meta = COLUMN_META[status];
  const [adding, setAdding] = useState(false);
  const titleOnly = status === 'done';
  const [visibleCount, setVisibleCount] = useState(DONE_PAGE_SIZE);

  const visibleItems = titleOnly ? items.slice(0, visibleCount) : items;
  const hiddenCount = items.length - visibleItems.length;

  return (
    <div
      onDragOver={(e) => {
        if (dragging) {
          e.preventDefault();
          onDragOverColumn();
        }
      }}
      onDragLeave={onDragLeaveColumn}
      onDrop={(e) => {
        e.preventDefault();
        onDropColumn();
      }}
      className={cx(
        'flex max-h-[calc(100svh-16rem)] w-72 shrink-0 flex-col rounded-lg border border-gray-200 bg-gray-50 transition-colors dark:border-gray-800 dark:bg-gray-900/50',
        isDragOver && 'border-accent-400 bg-accent-50/60 dark:bg-accent-400/5',
      )}
    >
      <div className="flex shrink-0 items-center gap-2 px-3 py-2.5">
        <span className={cx('size-2 rounded-full', meta.dotClass)} />
        <span
          className={cx(
            'text-xs font-semibold tracking-wide uppercase',
            meta.textClass,
          )}
        >
          {meta.label}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {items.length}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label={`Nieuw item in ${meta.label}`}
          onClick={() => setAdding(true)}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {visibleItems.map((item) => (
          <BoardCard
            key={item._id}
            item={item}
            titleOnly={titleOnly}
            onDragStart={() => onDragStart(item)}
            onDragEnd={onDragEnd}
            onDropCard={() => onDropCard(item)}
            isDragging={dragging?.id === item._id}
          />
        ))}

        {hiddenCount > 0 ? (
          <button
            type="button"
            className="rounded-md px-2 py-1.5 text-center text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            onClick={() => setVisibleCount((c) => c + DONE_PAGE_SIZE)}
          >
            Meer laden ({hiddenCount})
          </button>
        ) : null}

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          onClick={() => setAdding(true)}
        >
          <Plus className="size-4" />
          Nieuw item
        </button>
      </div>

      {adding ? (
        <NewCardModal status={status} onClose={() => setAdding(false)} />
      ) : null}
    </div>
  );
}

function CommentBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      title={`${count} reactie${count === 1 ? '' : 's'}`}
      className="bg-accent-50 text-accent-700 ring-accent-500/20 dark:bg-accent-500/10 dark:text-accent-300 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium ring-1"
    >
      <MessageSquare className="size-3" />
      {count}
    </span>
  );
}

function BoardCard({
  item,
  titleOnly,
  onDragStart,
  onDragEnd,
  onDropCard,
  isDragging,
}: {
  item: RoadmapItem;
  titleOnly: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropCard: () => void;
  isDragging: boolean;
}) {
  const [open, setOpen] = useState(false);
  // A real drag ends with a native click on some browsers; skip that click so
  // dropping a card doesn't also open its dialog.
  const draggedRef = useRef(false);

  const kindMeta = item.kind ? KIND_META[item.kind] : null;
  const priorityMeta = item.priority ? PRIORITY_META[item.priority] : null;

  return (
    <>
      <div
        draggable
        onPointerDown={() => {
          draggedRef.current = false;
        }}
        onDragStart={(e) => {
          draggedRef.current = true;
          e.dataTransfer.effectAllowed = 'move';
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDropCard();
        }}
        onClick={() => {
          if (draggedRef.current) {
            draggedRef.current = false;
            return;
          }
          setOpen(true);
        }}
        className={cx(
          'group relative cursor-grab rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow active:cursor-grabbing dark:border-gray-800 dark:bg-gray-950',
          isDragging && 'opacity-40',
        )}
      >
        <GripVertical className="absolute top-2 right-1.5 size-3.5 text-gray-200 group-hover:text-gray-400 dark:text-gray-700" />
        {titleOnly ? (
          <div className="flex items-start justify-between gap-2 pr-5">
            <p className="text-sm text-gray-900 dark:text-gray-50">
              {item.title}
            </p>
            <CommentBadge count={item.commentCount} />
          </div>
        ) : (
          <>
            {kindMeta || priorityMeta ? (
              <div className="mb-1.5 flex flex-wrap items-center gap-1">
                {kindMeta ? (
                  <Badge variant={kindMeta.variant}>{kindMeta.label}</Badge>
                ) : null}
                {priorityMeta ? (
                  <Badge variant={priorityMeta.variant}>
                    {priorityMeta.label}
                  </Badge>
                ) : null}
              </div>
            ) : null}
            <p className="pr-5 text-sm text-gray-900 dark:text-gray-50">
              {item.title}
            </p>
            {item.description ? (
              <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            ) : null}
            <div className="mt-2 flex items-center justify-between">
              <Avatar name={item.creatorName} />
              <div className="flex items-center gap-2">
                <CommentBadge count={item.commentCount} />
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatWhen(item._creationTime)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      {open ? (
        <EditCardModal item={item} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}

function EditCardModal({
  item,
  onClose,
}: {
  item: RoadmapItem;
  onClose: () => void;
}) {
  const update = useMutation(api.roadmap.update);
  const remove = useMutation(api.roadmap.remove);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? '');
  const [kind, setKind] = useState<RoadmapKind | null>(item.kind ?? null);
  const [priority, setPriority] = useState<RoadmapPriority | null>(
    item.priority ?? null,
  );

  function save() {
    if (title.trim() === '') return;
    void update({ itemId: item._id, title, description, kind, priority })
      .then(() => toast.success('Item bijgewerkt.'))
      .catch((err: unknown) =>
        toast.error(err instanceof Error ? err.message : 'Opslaan mislukt.'),
      );
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Item bewerken">
      <div className="space-y-3">
        <Input
          value={title}
          placeholder="Titel"
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          value={description}
          placeholder="Omschrijving (optioneel)"
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex gap-2">
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
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Aangemaakt door {item.creatorName} op {formatWhen(item._creationTime)}
        </p>
        <CommentsThread itemId={item._id} />
      </div>
      <div className="mt-5 flex items-center justify-between gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            void remove({ itemId: item._id })
              .then(() => toast.success('Item verwijderd.'))
              .catch((err: unknown) =>
                toast.error(
                  err instanceof Error ? err.message : 'Verwijderen mislukt.',
                ),
              );
            onClose();
          }}
        >
          <Trash2 className="size-4" /> Verwijderen
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Annuleren
          </Button>
          <Button size="sm" onClick={save} disabled={title.trim() === ''}>
            Opslaan
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function CommentsThread({ itemId }: { itemId: Id<'roadmapItems'> }) {
  const comments = useQuery(api.roadmap.comments, { itemId });
  const addComment = useMutation(api.roadmap.addComment);
  const [body, setBody] = useState('');

  function send() {
    const trimmed = body.trim();
    if (trimmed === '') return;
    setBody('');
    void addComment({ itemId, body: trimmed }).catch((err: unknown) =>
      toast.error(err instanceof Error ? err.message : 'Versturen mislukt.'),
    );
  }

  return (
    <div className="space-y-2 border-t border-gray-200 pt-3 dark:border-gray-800">
      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        Reacties
      </p>
      <div className="max-h-56 space-y-2 overflow-y-auto">
        {comments === undefined ? (
          <p className="text-xs text-gray-400 dark:text-gray-500">Laden…</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Nog geen reacties.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="flex gap-2">
              <Avatar name={c.authorName} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {c.authorName}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatWhen(c._creationTime)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {c.body}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex items-end gap-2">
        <Textarea
          value={body}
          rows={2}
          placeholder="Reactie… (⌘/Ctrl+Enter verstuurt)"
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
        />
        <Button size="sm" onClick={send} disabled={body.trim() === ''}>
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function NewCardModal({
  status,
  onClose,
}: {
  status: RoadmapStatus;
  onClose: () => void;
}) {
  const create = useMutation(api.roadmap.create);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<RoadmapKind | null>(null);
  const [priority, setPriority] = useState<RoadmapPriority | null>(null);

  function submit() {
    const trimmed = title.trim();
    if (trimmed === '') return;
    void create({
      title: trimmed,
      status,
      description: description.trim() || undefined,
      kind: kind ?? undefined,
      priority: priority ?? undefined,
    })
      .then(() => toast.success('Item toegevoegd.'))
      .catch((err: unknown) =>
        toast.error(err instanceof Error ? err.message : 'Aanmaken mislukt.'),
      );
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Nieuw item · ${COLUMN_META[status].label}`}
    >
      <div className="space-y-3">
        <Input
          autoFocus
          value={title}
          placeholder="Titel"
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
        <Textarea
          value={description}
          placeholder="Omschrijving (optioneel)"
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex gap-2">
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
        <Button variant="secondary" size="sm" onClick={onClose}>
          Annuleren
        </Button>
        <Button size="sm" onClick={submit} disabled={title.trim() === ''}>
          Toevoegen
        </Button>
      </div>
    </Modal>
  );
}
