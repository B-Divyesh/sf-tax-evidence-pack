import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:4173', browserName: 'chromium', headless: true },
  webServer: { command: 'SITE_MANIFEST_FIXTURE=tests/fixtures/latest.json node scripts/serve-dist.mjs', port: 4173, reuseExistingServer: false },
});
