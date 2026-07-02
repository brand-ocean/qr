import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  throw new Error('VITE_CONVEX_URL ontbreekt. Zet deze in admin/.env.local.');
}

const convex = new ConvexReactClient(convexUrl);

// Respect saved / system dark-mode preference before first paint.
const stored = localStorage.getItem('viralsAdminTheme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (stored === 'dark' || (stored === null && prefersDark)) {
  document.documentElement.classList.add('dark');
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('#root ontbreekt.');
}

createRoot(root).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <App />
    </ConvexAuthProvider>
  </StrictMode>,
);
