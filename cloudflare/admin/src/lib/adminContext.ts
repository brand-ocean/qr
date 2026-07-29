import type { Doc } from '@convex/_generated/dataModel';
import { createContext, useContext, type MutableRefObject } from 'react';

export type View = 'dashboard' | 'cards' | 'roadmap';

// A card enriched with its resolved override thumbnail (null = use the YouTube
// default). Matches the shape returned by api.cards.list.
export type CardDoc = Doc<'cards'> & { thumbnail: string | null };

// Card actions the app-wide context menu can invoke; registered by CardsAdmin.
export type CardMenuActions = {
  getCard: (id: string) => CardDoc | null;
  edit: (card: CardDoc) => void;
  remove: (card: CardDoc) => void;
};

export type AdminContextValue = {
  setView: (view: View) => void;
  dark: boolean;
  toggleDark: () => void;
  cardActionsRef: MutableRefObject<CardMenuActions | null>;
  setCardActions: (actions: CardMenuActions | null) => void;
};

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin buiten AdminContext gebruikt.');
  return ctx;
}
