import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
import { storageStatePath } from './src/global-setup';

const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error('BASE_URL is missing. Copy .env.example to .env and fill it in.');
}

// Role-specific specs live in tests/<role>/ and run in the matching project,
// pre-authenticated from the storage state written by global setup.
const roleDirs = ['**/customer/**', '**/admin/**'];
// Browser projects skip role specs and API specs; each has its own project.
const notGuest = [...roleDirs, '**/api/**', '**/hybrid/**'];

export default defineConfig({
  testDir: './tests',
  globalSetup: './src/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],

  use: {
    baseURL,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    //headless: !!process.env.CI,   // headed locally, headless in CI
  },

  projects: [
    // Guest (signed out) runs across browsers. Role specs are excluded here.
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: notGuest },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: notGuest },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: notGuest },

    // One project per role, each starting signed in as that role.
    {
      name: 'customer',
      testMatch: '**/customer/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], storageState: storageStatePath('customer') },
    },
    {
      name: 'admin',
      testMatch: '**/admin/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], storageState: storageStatePath('admin') },
    },

    // API tests need no browser and run once, not once per browser.
    { name: 'api', testMatch: '**/api/**/*.spec.ts' },

    // Hybrid tests: arrange through the API, assert in a signed-out browser.
    { name: 'hybrid', testMatch: '**/hybrid/**/*.spec.ts', use: { ...devices['Desktop Chrome'] } },
  ],
});
