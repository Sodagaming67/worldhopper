import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

const GAME_PATH = '/worldhopper';

export default defineConfig({
  // Base path matches the GitHub Pages project URL: <org>.github.io/worldhopper/
  base: `${GAME_PATH}/`,

  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Offline caching is a later phase. Until then, ship a self-destroying
      // service worker so any SW already installed in a browser (from an earlier
      // build) unregisters itself and clears its caches — otherwise users get
      // served stale, cached app shells. Re-enable real caching in Phase 4.
      selfDestroying: true,
      devOptions: { enabled: false },
      manifest: {
        name: 'World Hopper',
        short_name: 'WorldHopper',
        description: 'A cooperative family quest game — explore a new world in every chapter.',
        theme_color: '#0E5E78',
        background_color: '#FFF6DD',
        display: 'standalone',
        start_url: `${GAME_PATH}/`,
        scope: `${GAME_PATH}/`,
        icons: [
          { src: `${GAME_PATH}/icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${GAME_PATH}/icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  optimizeDeps: { include: ['phaser'] },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'src/assets'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    // Playwright e2e specs live under src/tests/e2e and use @playwright/test;
    // they must not be picked up by the vitest unit runner.
    exclude: ['**/node_modules/**', '**/dist/**', 'src/tests/e2e/**'],
  },
})
