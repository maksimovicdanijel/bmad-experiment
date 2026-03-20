import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  retries: 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'error-state',
      testMatch: 'error-state.spec.ts',
    },
  ],
  webServer: {
    command:
      'VITE_API_URL=http://localhost:19999 npx react-router dev --port 5174',
    port: 5174,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
