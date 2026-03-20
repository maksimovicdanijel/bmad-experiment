import { test, expect } from '@playwright/test';

test.describe('UJ-2: Error State', () => {
  test('displays error boundary when API is unreachable', async ({ page }) => {
    // This test runs against the web server at port 5174
    // which is configured with VITE_API_URL=http://localhost:19999
    // (nothing listens on port 19999)
    await page.goto('/');

    // The SSR loader in home.tsx calls fetchTodos() which fetches from
    // http://localhost:19999/todos — this genuinely fails.
    // The RR ErrorBoundary in root.tsx catches the error and renders.
    await expect(page.getByRole('alert')).toBeVisible();

    // Verify the error boundary renders a meaningful message
    await expect(
      page.getByRole('heading', {
        name: /something went wrong|request failed/i,
      }),
    ).toBeVisible();
  });
});
