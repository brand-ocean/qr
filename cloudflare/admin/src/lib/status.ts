import type { Doc } from '@convex/_generated/dataModel';

export type Status = Doc<'cards'>['availabilityStatus'];

export type StatusVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'neutral'
  | 'default';

// Dutch labels + badge variants for a card's availability status.
export const STATUS_META: Record<
  Status,
  { label: string; variant: StatusVariant; dot: string }
> = {
  ok: { label: 'Werkt', variant: 'success', dot: 'bg-emerald-500' },
  broken: { label: 'Kapot', variant: 'error', dot: 'bg-red-500' },
  allowlisted: { label: 'Genegeerd', variant: 'warning', dot: 'bg-yellow-500' },
  error: { label: 'ERROR-kaart', variant: 'neutral', dot: 'bg-gray-400' },
  unknown: { label: 'Ongecheckt', variant: 'neutral', dot: 'bg-gray-300' },
};
