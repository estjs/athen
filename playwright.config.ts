import process from 'node:process';
import { defineConfig, devices } from '@playwright/test';

const reuseExistingServer = !process.env.CI;
const webServerTimeout = 120 * 1000;
const previewSpec = /preview\.spec\.ts/;

export default defineConfig({
  testDir: 'e2e',
  timeout: 30 * 1000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:8730',
  },
  webServer: [
    {
      command: 'pnpm docs:dev',
      url: 'http://localhost:8730',
      reuseExistingServer,
      timeout: webServerTimeout,
    },
    {
      command: 'pnpm docs:build && pnpm docs:preview',
      url: 'http://localhost:4173',
      reuseExistingServer,
      timeout: webServerTimeout,
    },
  ],
  projects: [
    {
      name: 'chromium',
      testIgnore: previewSpec,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: previewSpec,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testIgnore: previewSpec,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      testIgnore: previewSpec,
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'preview-chromium',
      testMatch: previewSpec,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4173',
      },
    },
  ],
});
