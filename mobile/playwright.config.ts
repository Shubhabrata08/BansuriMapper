import { defineConfig } from '@playwright/test';

const basePath = process.env.BANSURI_PREVIEW_BASE_PATH || '';
const baseURL = process.env.BANSURI_TEST_URL || `http://127.0.0.1:4173${basePath}/`;

export default defineConfig({
  testDir: './e2e',
  outputDir: './artifacts/playwright',
  workers: 1,
  timeout: 60000,
  use: {
    baseURL,
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: 'tablet', use: { viewport: { width: 1024, height: 1366 } } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
  ],
  webServer: process.env.BANSURI_TEST_URL ? undefined : {
    command: 'node scripts/serve-preview.cjs',
    url: baseURL,
    reuseExistingServer: false,
  },
});
