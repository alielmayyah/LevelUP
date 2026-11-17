import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // One worker per CPU core (Playwright's default is half), locally and in CI.
  workers: '100%',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 15'] } },
    { name: 'android', use: { ...devices['Pixel 7'] } },
    { name: 'small', use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 640 } } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    // E2E_PROD=1 runs the suite against the production build instead of the dev server.
    command: process.env.E2E_PROD ? 'npm run build && npx vite preview --port 5173 --strictPort' : 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Community is hidden in the shipped app; VITE_COMMUNITY=true runs its specs too.
    env: { VITE_USE_MOCKS: 'true', VITE_COMMUNITY: process.env.VITE_COMMUNITY ?? 'false' },
  },
});
