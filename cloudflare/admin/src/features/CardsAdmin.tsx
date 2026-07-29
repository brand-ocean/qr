import { api } from '@convex/_generated/api';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { useAction, useMutation, useQuery } from 'convex/react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  AddIcon,
  AlertIcon,
  ClockIcon,
  DeleteIcon,
  EditIcon,
  GridIcon,
  ImageIcon,
  ListIcon,
  ReloadIcon,
  SearchIcon,
  SortDownIcon,
  SortUpIcon,
} from '../components/icons';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../components/ui/table';
import { useAdmin, type CardDoc } from '../lib/adminContext';
import { formatWhen } from '../lib/format';
import { STATUS_META, type Status } from '../lib/status';
import { formatClip, youtubeThumb, youtubeWatchUrl } from '../lib/youtube';
import { CardDialog } from './CardDialog';

type View = 'list' | 'grid';
type StatusFilter = 'all' | Status;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'ok', label: 'Werkt' },
  { value: 'broken', label: 'Kapot' },
  { value: 'allowlisted', label: 'Genegeerd' },
  { value: 'unknown', label: 'Ongecheckt' },
  { value: 'error', label: 'ERROR' },
];

const columnHelper = createColumnHelper<CardDoc>();

function SortHeader({
  label,
  sorted,
  onToggle,
}: {
  label: string;
  sorted: false | 'asc' | 'desc';
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="-mx-1 flex items-center gap-1 rounded px-1 py-0.5 text-xs font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
    >
      {label}
      {sorted === 'asc' ? (
        <SortUpIcon className="text-accent-500 size-3.5" />
      ) : sorted === 'desc' ? (
        <SortDownIcon className="text-accent-500 size-3.5" />
      ) : (
        <SortDownIcon className="size-3.5 opacity-30" />
      )}
    </button>
  );
}

// Resolve what image to show for a card: a custom override thumbnail wins,
// otherwise the YouTube-derived thumbnail; null means "no image" (ERROR card
// without an override) → placeholder.
function cardThumbSrc(card: CardDoc): string | null {
  return (
    card.thumbnail ??
    (card.videoId === 'ERROR' ? null : youtubeThumb(card.videoId))
  );
}

function VideoThumb({ card }: { card: CardDoc }) {
  const src = cardThumbSrc(card);
  if (src === null) {
    return (
      <div className="flex h-9 w-16 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-400 dark:bg-gray-800">
        <ImageIcon className="size-4" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="h-9 w-16 shrink-0 rounded object-cover"
      loading="lazy"
    />
  );
}

export function CardsAdmin() {
  const cards = useQuery(api.cards.list);
  const removeCard = useMutation(api.cards.remove);
  const runCheck = useAction(api.availability.runCheck);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [view, setView] = useState<View>('list');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'cardId', desc: false },
  ]);
  const [dialog, setDialog] = useState<
    { mode: 'create' } | { mode: 'edit'; card: CardDoc } | null
  >(null);
  const [checking, setChecking] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CardDoc | null>(null);
  const cardsById = useRef(new Map<string, CardDoc>());
  const { setCardActions } = useAdmin();

  const statusFiltered = useMemo(() => {
    const list = cards ?? [];
    cardsById.current = new Map(list.map((c) => [c.cardId, c]));
    if (statusFilter === 'all') return list;
    return list.filter((c) => c.availabilityStatus === statusFilter);
  }, [cards, statusFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('cardId', {
        header: 'Kaart',
        cell: (ctx) => (
          <div className="flex items-center gap-2.5">
            <VideoThumb card={ctx.row.original} />
            <span className="font-medium text-gray-900 dark:text-gray-50">
              {ctx.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('quote', {
        header: 'Quote',
        cell: (ctx) => (
          <span className="block max-w-[240px] truncate" title={ctx.getValue()}>
            {ctx.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('videoId', {
        header: 'Video',
        enableSorting: false,
        cell: (ctx) =>
          ctx.getValue() === 'ERROR' ? (
            <span className="text-gray-400">ERROR</span>
          ) : (
            <a
              href={youtubeWatchUrl(ctx.getValue())}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-accent-600 dark:text-accent-400 font-mono text-xs hover:underline"
            >
              {ctx.getValue()}
            </a>
          ),
      }),
      columnHelper.display({
        id: 'clip',
        header: 'Clip',
        cell: (ctx) => (
          <span className="text-gray-500 tabular-nums dark:text-gray-400">
            {formatClip(ctx.row.original.startTime, ctx.row.original.endTime)}
          </span>
        ),
      }),
      columnHelper.accessor('year', {
        header: 'Jaar',
        cell: (ctx) => <span className="tabular-nums">{ctx.getValue()}</span>,
      }),
      columnHelper.accessor((row) => row.contentWarning, {
        id: 'contentWarning',
        header: 'Waarschuwing',
        cell: (ctx) =>
          ctx.getValue() ? (
            <Badge variant="warning">
              <AlertIcon className="size-3.5" /> Ja
            </Badge>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          ),
      }),
      columnHelper.accessor((row) => row.scanCount ?? 0, {
        id: 'scanCount',
        header: 'Scans',
        cell: (ctx) => <span className="tabular-nums">{ctx.getValue()}</span>,
      }),
      columnHelper.accessor('availabilityStatus', {
        id: 'status',
        header: 'Status',
        cell: (ctx) => {
          const meta = STATUS_META[ctx.getValue()];
          return <Badge variant={meta.variant}>{meta.label}</Badge>;
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="sr-only">Acties</span>,
        cell: (ctx) => (
          <div
            className="flex justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setDialog({ mode: 'edit', card: ctx.row.original })
              }
              aria-label="Bewerken"
            >
              <EditIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => requestDelete(ctx.row.original)}
              aria-label="Verwijderen"
            >
              <DeleteIcon className="size-4 text-red-600 dark:text-red-400" />
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: statusFiltered,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    globalFilterFn: (row, _columnId, value) => {
      const q = String(value).trim().toLowerCase();
      if (!q) return true;
      const c = row.original;
      return (
        c.cardId.toLowerCase().includes(q) ||
        c.quote.toLowerCase().includes(q) ||
        c.videoId.toLowerCase().includes(q)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 24 } },
  });

  const rows = table.getRowModel().rows;
  const totalFiltered = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const from = totalFiltered === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalFiltered);

  async function onCheck() {
    setChecking(true);
    const id = toast.loading('Bezig met controleren…');
    try {
      const s = await runCheck({});
      toast.success(
        `Check klaar: ${s.ok} werken, ${s.broken} kapot, ${s.allowlisted} genegeerd.`,
        { id },
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Check mislukt.', {
        id,
      });
    } finally {
      setChecking(false);
    }
  }

  // Delete asks for confirmation via a Base UI modal (see ConfirmDialog below).
  function requestDelete(card: CardDoc) {
    setDeleteTarget(card);
  }
  async function performDelete(card: CardDoc) {
    try {
      await removeCard({ id: card._id });
      toast.success(`Kaart ${card.cardId} verwijderd.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verwijderen mislukt.');
    }
  }

  // Expose card actions to the app-wide right-click menu (AppContextMenu).
  useEffect(() => {
    setCardActions({
      getCard: (id) => cardsById.current.get(id) ?? null,
      edit: (card) => setDialog({ mode: 'edit', card }),
      remove: (card) => requestDelete(card),
    });
    return () => setCardActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCardActions]);

  const counts = useMemo(() => {
    const base = {
      total: 0,
      ok: 0,
      broken: 0,
      lastChecked: null as number | null,
    };
    for (const c of cards ?? []) {
      base.total++;
      if (c.availabilityStatus === 'ok') base.ok++;
      if (c.availabilityStatus === 'broken') base.broken++;
      if (
        c.lastCheckedAt !== undefined &&
        (base.lastChecked === null || c.lastCheckedAt > base.lastChecked)
      ) {
        base.lastChecked = c.lastCheckedAt;
      }
    }
    return base;
  }, [cards]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-50">
            Kaarten
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {cards ? `${counts.total} kaarten` : 'Laden…'} · {counts.ok} werken
            ·{' '}
            <span
              className={
                counts.broken > 0 ? 'text-red-600 dark:text-red-400' : ''
              }
            >
              {counts.broken} kapot
            </span>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
            <ClockIcon className="size-3.5" />
            Laatst gecheckt: {formatWhen(counts.lastChecked)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCheck}
            isLoading={checking}
          >
            <ReloadIcon className="size-4" /> Check nu
          </Button>
          <Button size="sm" onClick={() => setDialog({ mode: 'create' })}>
            <AddIcon className="size-4" /> Nieuwe kaart
          </Button>
        </div>
      </div>

      {/* Toolbar: search + status chips + view toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-8"
            placeholder="Zoek op kaart, quote of video-id…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={
                statusFilter === f.value
                  ? 'bg-accent-500 rounded-md px-2.5 py-1.5 text-xs font-medium text-white'
                  : 'rounded-md bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex rounded-md border border-gray-300 p-0.5 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setView('list')}
            aria-label="Lijstweergave"
            className={
              view === 'list'
                ? 'bg-accent-500 rounded p-1.5 text-white'
                : 'rounded p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-50'
            }
          >
            <ListIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setView('grid')}
            aria-label="Rasterweergave"
            className={
              view === 'grid'
                ? 'bg-accent-500 rounded p-1.5 text-white'
                : 'rounded p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-50'
            }
          >
            <GridIcon className="size-4" />
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <Card className="p-0">
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="hover:bg-transparent dark:hover:bg-transparent"
                >
                  {hg.headers.map((header) => (
                    <TableHeaderCell
                      key={header.id}
                      className={header.id === 'actions' ? 'text-right' : ''}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <SortHeader
                          label={String(header.column.columnDef.header)}
                          sorted={header.column.getIsSorted()}
                          onToggle={
                            header.column.getToggleSortingHandler() as () => void
                          }
                        />
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHeaderCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-card-id={row.original.cardId}
                  className="cursor-pointer"
                  onClick={() =>
                    setDialog({ mode: 'edit', card: row.original })
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === 'actions' ? 'text-right' : ''
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              Geen kaarten gevonden.
            </p>
          ) : null}
        </Card>
      ) : (
        <GridView
          rows={rows.map((r) => r.original)}
          onEdit={(c) => setDialog({ mode: 'edit', card: c })}
        />
      )}

      {/* Pagination */}
      {rows.length > 0 ? (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span className="tabular-nums">
            {from}–{to} van {totalFiltered}
          </span>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm dark:border-gray-800 dark:bg-gray-950"
            >
              {[24, 48, 96].map((n) => (
                <option key={n} value={n}>
                  {n} per pagina
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              size="sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Vorige
            </Button>
            <span className="tabular-nums">
              {pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Volgende
            </Button>
          </div>
        </div>
      ) : null}

      {dialog ? (
        <CardDialog
          mode={dialog.mode}
          card={dialog.mode === 'edit' ? dialog.card : undefined}
          onClose={() => setDialog(null)}
        />
      ) : null}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Kaart verwijderen?"
        description={`Kaart ${deleteTarget?.cardId} wordt permanent verwijderd.`}
        confirmLabel="Verwijderen"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) void performDelete(deleteTarget);
        }}
      />
    </div>
  );
}

// Thumbnail grid — an alternative to the list, same filtered/sorted/paged rows.
function GridView({
  rows,
  onEdit,
}: {
  rows: CardDoc[];
  onEdit: (card: CardDoc) => void;
}): ReactNode {
  if (rows.length === 0) {
    return (
      <p className="px-3 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
        Geen kaarten gevonden.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {rows.map((card) => {
        const meta = STATUS_META[card.availabilityStatus];
        const thumbSrc = cardThumbSrc(card);
        return (
          <button
            type="button"
            key={card._id}
            data-card-id={card.cardId}
            onClick={() => onEdit(card)}
            className="group overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
              {thumbSrc === null ? (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <ImageIcon className="size-6" />
                </div>
              ) : (
                <img
                  src={thumbSrc}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
              <span className="absolute top-1.5 right-1.5">
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </span>
              {card.contentWarning ? (
                <span className="absolute top-1.5 left-1.5 rounded bg-yellow-400/90 p-1 text-black">
                  <AlertIcon className="size-3.5" />
                </span>
              ) : null}
            </div>
            <div className="p-2.5">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                {card.quote}
              </p>
              <p className="mt-0.5 flex items-center justify-between text-xs text-gray-400">
                <span>{card.cardId}</span>
                <span className="tabular-nums">
                  {formatClip(card.startTime, card.endTime)}
                </span>
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
