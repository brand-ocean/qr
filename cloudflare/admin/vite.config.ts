import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  // Served under viralsgame.nl/admin, so all asset URLs are /admin/-prefixed.
  base: '/admin/',
  plugins: [
    // Two-tone "Bulk" icons imported as `*.svg?react` (kiesbeter icon library).
    // preset-default keeps the opacity="0.4" secondary layer that BulkIcon
    // remaps to a CSS variable, so a single `color` drives the whole icon.
    svgr({
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: { overrides: { removeViewBox: false } },
            },
            {
              name: 'prefixIds',
              params: { prefixIds: true, prefixClassNames: true },
            },
          ],
        },
      },
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
      // Convex functions + generated types live one level up (shared with the worker).
      '@convex': resolve(root, '../convex'),
    },
  },
  server: {
    // Allow importing ../convex/_generated during dev.
    fs: { allow: [resolve(root, '..')] },
  },
  build: {
    outDir: resolve(root, '../public/admin'),
    emptyOutDir: true,
  },
});
