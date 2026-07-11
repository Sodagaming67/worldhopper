import { defineConfig, devices } from '@playwright/test';

// PW_BASE_URL env overrides for CI against the live GitHub Pages URL;
// defaults to the local `vite preview` server for local runs.
const BASE_URL = process.env.PW_BASE_URL ?? 'http://localhost:4173/worldhopper/';

export default defineConfig({
  testDir: './src/tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
