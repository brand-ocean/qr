import type { Doc } from '@convex/_generated/dataModel';
import { createContext, useContext, type MutableRefObject } from 'react';

export type View = 'dashboard' | 'cards';

// Card actions the app-wide context menu can invoke; registered by CardsAdmin.
export type CardMenuActions = {
  getCard: (id: string) => Doc<'cards'> | null;
  edit: (card: Doc<'cards'>) => void;
  remove: (card: Doc<'cards'>) => void;
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
