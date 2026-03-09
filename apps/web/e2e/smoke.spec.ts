import { expect, test } from '@playwright/test';

test('web scaffold homepage renders', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /bmad-experiment web scaffold/i }),
  ).toBeVisible();
});
