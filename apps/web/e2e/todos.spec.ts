import { test, expect } from '@playwright/test';
import { truncateTodos, seedTodos, TEST_TODOS } from './helpers/db';

const API_BASE_URL = 'http://localhost:3000';

test.describe('UJ-2: View Todos', () => {
  test.beforeEach(async () => {
    await truncateTodos();
  });

  test.describe('populated state', () => {
    test.beforeEach(async () => {
      await seedTodos(TEST_TODOS);
    });

    test('displays all seeded todos with correct text and sections', async ({
      page,
      request,
    }) => {
      // 1. Capture API response for reference
      const apiResponse = await request.get(`${API_BASE_URL}/todos`);
      expect(apiResponse.ok()).toBeTruthy();
      const { data: apiTodos } = await apiResponse.json();

      // 2. Navigate to the app
      await page.goto('/');

      // 3. Assert each todo from API is rendered in the UI
      for (const todo of apiTodos) {
        await expect(page.getByText(todo.text)).toBeVisible();
      }

      // 4. Assert active section header shows correct count
      const activeTodos = apiTodos.filter(
        (t: { isCompleted: boolean }) => !t.isCompleted,
      );
      const completedTodos = apiTodos.filter(
        (t: { isCompleted: boolean }) => t.isCompleted,
      );

      await expect(
        page.getByRole('heading', {
          name: `ACTIVE — ${activeTodos.length}`,
        }),
      ).toBeVisible();

      await expect(
        page.getByRole('heading', {
          name: `COMPLETED — ${completedTodos.length}`,
        }),
      ).toBeVisible();

      // 5. Assert completed todos have strikethrough styling
      for (const todo of completedTodos) {
        const todoElement = page.getByText(todo.text);
        const textDecoration = await todoElement.evaluate(
          (el) => getComputedStyle(el).textDecorationLine,
        );
        expect(textDecoration).toBe('line-through');
      }

      // 6. Assert creation timestamps are displayed for each todo
      for (const todo of apiTodos) {
        // Each TodoItem renders formatTimestamp(createdAt) producing e.g. "Mar 10, 3:45 PM"
        // Locate the list item containing the todo text, then assert a date-like string is present
        const listItem = page.locator('li').filter({ hasText: todo.text });
        await expect(
          listItem.getByText(
            /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{1,2}:\d{2}\s*(AM|PM)\b/i,
          ),
        ).toBeVisible();
      }
    });

    test('persists todos after page reload (NFR-4)', async ({ page }) => {
      await page.goto('/');

      // Verify todos are present
      for (const todo of TEST_TODOS) {
        await expect(page.getByText(todo.text)).toBeVisible();
      }

      // Reload and verify again
      await page.reload();

      for (const todo of TEST_TODOS) {
        await expect(page.getByText(todo.text)).toBeVisible();
      }
    });
  });

  test.describe('empty state', () => {
    test('displays EmptyState with first-use call-to-action (UX-4)', async ({
      page,
    }) => {
      // beforeEach already truncated — no seeding
      await page.goto('/');

      await expect(
        page.getByRole('heading', { name: 'Nothing here yet.' }),
      ).toBeVisible();
      await expect(
        page.getByText('Type above to capture your first task.'),
      ).toBeVisible();
    });
  });
});
