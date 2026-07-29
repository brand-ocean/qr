import { SquareKanban } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useAdmin, type CardDoc } from '../lib/adminContext';
import { youtubeWatchUrl } from '../lib/youtube';
import {
  DashboardIcon,
  DeleteIcon,
  EditIcon,
  ExternalIcon,
  GridIcon,
  MoonIcon,
  PlayIcon,
  ReloadIcon,
  SunIcon,
} from './icons';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './ui/context-menu';

// One right-click menu for the whole admin (forz pattern). It replaces the
// browser's native menu everywhere inside the app; when the click lands on an
// element carrying data-card-id, it adds that card's actions on top of the
// always-present navigation actions.
export function AppContextMenu({ children }: { children: React.ReactNode }) {
  const { cardActionsRef, setView, dark, toggleDark } = useAdmin();
  const [card, setCard] = useState<CardDoc | null>(null);

  function onContextMenu(e: React.MouseEvent) {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-card-id]');
    const id = el?.dataset.cardId;
    const actions = cardActionsRef.current;
    setCard(id && actions ? actions.getCard(id) : null);
  }

  const actions = cardActionsRef.current;

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className="block min-h-svh"
        onContextMenu={onContextMenu}
      >
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {card && actions ? (
          <>
            <ContextMenuLabel>{card.cardId}</ContextMenuLabel>
            <ContextMenuItem onClick={() => actions.edit(card)}>
              <EditIcon className="size-4" /> Bewerken
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => window.open(`/${card.cardId}`, '_blank')}
            >
              <PlayIcon className="size-4" /> Kaartpagina testen
            </ContextMenuItem>
            <ContextMenuItem
              disabled={card.videoId === 'ERROR'}
              onClick={() =>
                window.open(
                  youtubeWatchUrl(card.videoId, card.startTime),
                  '_blank',
                )
              }
            >
              <ExternalIcon className="size-4" /> Video openen
            </ContextMenuItem>
            <ContextMenuItem
              variant="destructive"
              onClick={() => actions.remove(card)}
            >
              <DeleteIcon className="size-4" /> Verwijderen
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        ) : null}
        <ContextMenuLabel>Navigatie</ContextMenuLabel>
        <ContextMenuItem onClick={() => setView('dashboard')}>
          <DashboardIcon className="size-4" /> Dashboard
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setView('cards')}>
          <GridIcon className="size-4" /> Kaarten
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setView('roadmap')}>
          <SquareKanban className="size-4" /> Roadmap
        </ContextMenuItem>
        <ContextMenuItem onClick={toggleDark}>
          {dark ? (
            <SunIcon className="size-4" />
          ) : (
            <MoonIcon className="size-4" />
          )}
          Thema wisselen
        </ContextMenuItem>
        <ContextMenuItem onClick={() => window.location.reload()}>
          <ReloadIcon className="size-4" /> Vernieuwen
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
