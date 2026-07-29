import { useAuthActions } from '@convex-dev/auth/react';
import { SquareKanban } from 'lucide-react';
import type { ComponentType } from 'react';
import type { View } from '../lib/adminContext';
import { cx } from '../lib/utils';
import {
  DashboardIcon,
  GridIcon,
  LogoutIcon,
  MoonIcon,
  SunIcon,
} from './icons';
import { QuickCapture } from './QuickCapture';
import { Button } from './ui/button';

const TABS: {
  view: View;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { view: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { view: 'cards', label: 'Kaarten', icon: GridIcon },
  { view: 'roadmap', label: 'Roadmap', icon: SquareKanban },
];

// Horizontal top nav in the issapoule style: sticky bar, logo + tabs with an
// animated accent underline for the active view, theme toggle + sign out.
export function Nav({
  view,
  onView,
  dark,
  onToggleDark,
}: {
  view: View;
  onView: (view: View) => void;
  dark: boolean;
  onToggleDark: () => void;
}) {
  const { signOut } = useAuthActions();

  return (
    <header className="border-border bg-card/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          {/* Homepage wordmark (served at the site root by the worker). */}
          <img
            src="/virals-logo.png"
            alt="Virals"
            className="h-12 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Kaartbeheer
          </span>
        </div>
        <div className="flex items-center gap-1">
          <QuickCapture />
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDark}
            aria-label="Thema wisselen"
          >
            {dark ? (
              <SunIcon className="size-5" />
            ) : (
              <MoonIcon className="size-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void signOut()}
            aria-label="Uitloggen"
          >
            <LogoutIcon className="size-4" />
            <span className="hidden sm:inline">Uitloggen</span>
          </Button>
        </div>
      </div>

      <div className="border-border border-t">
        <nav className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-2 sm:px-4">
          {TABS.map(({ view: to, label, icon: Icon }) => {
            const active = view === to;
            return (
              <button
                key={to}
                type="button"
                onClick={() => onView(to)}
                className={cx(
                  'flex items-center gap-2 border-b-2 px-3 py-2.5 text-base font-medium transition-colors',
                  active
                    ? 'border-accent-500 text-foreground'
                    : 'text-muted-foreground hover:text-foreground border-transparent',
                )}
              >
                <Icon className="size-5" />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
