import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react';
import { useCallback, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import { AppContextMenu } from './components/AppContextMenu';
import { ReloadIcon } from './components/icons';
import { Nav } from './components/Nav';
import { CardsAdmin } from './features/CardsAdmin';
import { Dashboard } from './features/Dashboard';
import { Login } from './features/Login';
import {
  AdminContext,
  type CardMenuActions,
  type View,
} from './lib/adminContext';

function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('viralsAdminTheme', next ? 'dark' : 'light');
  }
  return [dark, toggle];
}

function AdminShell() {
  const [view, setView] = useState<View>('dashboard');
  const [dark, toggleDark] = useDarkMode();
  const cardActionsRef = useRef<CardMenuActions | null>(null);
  const setCardActions = useCallback((actions: CardMenuActions | null) => {
    cardActionsRef.current = actions;
  }, []);

  return (
    <AdminContext.Provider
      value={{ setView, dark, toggleDark, cardActionsRef, setCardActions }}
    >
      <AppContextMenu>
        <Nav
          view={view}
          onView={setView}
          dark={dark}
          onToggleDark={toggleDark}
        />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {view === 'dashboard' ? (
            <Dashboard onOpenCards={() => setView('cards')} />
          ) : (
            <CardsAdmin />
          )}
        </main>
      </AppContextMenu>
      <Toaster
        theme={dark ? 'dark' : 'light'}
        richColors
        position="bottom-right"
      />
    </AdminContext.Provider>
  );
}

export function App() {
  return (
    <>
      <AuthLoading>
        <div className="flex min-h-svh items-center justify-center">
          <ReloadIcon className="text-accent-500 size-6 animate-spin" />
        </div>
      </AuthLoading>
      <Unauthenticated>
        <Login />
      </Unauthenticated>
      <Authenticated>
        <AdminShell />
      </Authenticated>
    </>
  );
}
