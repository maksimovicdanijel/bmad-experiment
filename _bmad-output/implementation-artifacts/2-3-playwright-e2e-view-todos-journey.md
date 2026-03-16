# Story 2.3: Playwright E2E — View Todos Journey

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want Playwright E2E tests covering UJ-2 (returning user views todos),
so that the view slice is backed by automated end-to-end evidence running in CI.

## Acceptance Criteria

1. **Given** E2E test stubs for UJ-2 are written in `apps/web/e2e/todos.spec.ts` before the full stack is wired,
   **When** the tests are run against a clean environment,
   **Then** they fail for the right reason (no content yet) — TDD applies to E2E.

2. **Given** both apps and the database are running,
   **When** the Playwright suite runs the populated-state test,
   **Then** a `beforeEach` hook truncates the `todos` table and runs a DB seed script (inserting known todos directly via SQL), then calls `GET /todos` via Playwright's `request` API context to capture the API response, navigates to the app, and asserts every todo returned by the API is rendered in the UI with correct text, completion status, and visual styling.

3. **Given** both apps and the database are running,
   **When** the Playwright suite runs the empty-state test,
   **Then** a `beforeEach` hook truncates the `todos` table (no seeding), the test navigates to the app, and asserts the `EmptyState` component is displayed with a clear call-to-action prompt (UX-4).

4. **Given** the web app is configured to call a non-existent API endpoint (e.g. wrong port or host),
   **When** the Playwright suite runs the error-state test,
   **Then** the SSR loader genuinely fails to reach the API, and the test asserts the error boundary renders an actionable error message — no test-only code is added to the API.

5. **Given** todos have been seeded via the DB seed script,
   **When** the page is reloaded,
   **Then** the E2E test asserts the todos are still present (data persistence — NFR-4).

6. **Given** the E2E suite runs in CI,
   **When** the GitHub Actions `ci.yml` workflow executes,
   **Then** all UJ-2 tests pass in Chromium with zero flakes.

## Tasks / Subtasks

- [ ] Task 1: Install `pg` and create E2E database helper (AC: 2, 3, 5)
  - [ ] Install `pg` and `@types/pg` as devDependencies in `apps/web`: `npm install -D pg @types/pg -w apps/web`
  - [ ] Create `apps/web/e2e/helpers/db.ts` — E2E database helper module
  - [ ] Implement `truncateTodos()` — runs `DELETE FROM todos` against the test database
  - [ ] Implement `seedTodos(todos)` — runs parameterised `INSERT INTO todos (text, is_completed) VALUES ...` against the test database
  - [ ] Implement `closeDbConnection()` — closes the `pg.Pool` connection for cleanup
  - [ ] Connection uses `DATABASE_URL` env var (same as the API uses: `postgresql://postgres:postgres@localhost:5432/bmad_experiment`)
  - [ ] Export a `TEST_TODOS` constant with known test data for deterministic assertions

- [ ] Task 2: Update Playwright configuration (AC: 4, 6)
  - [ ] Replace `apps/web/e2e/playwright.config.ts` with updated configuration
  - [ ] Configure two Playwright projects:
    - `view-todos` — matches `todos.spec.ts`, uses `baseURL: http://localhost:5173` (Chromium only for MVP)
    - `error-state` — matches `error-state.spec.ts`, uses `baseURL: http://localhost:5174` (Chromium only)
  - [ ] Configure two `webServer` entries:
    - Primary: `npm run dev` at `http://localhost:5173` with `reuseExistingServer: true`
    - Error: `VITE_API_URL=http://localhost:19999 npx react-router dev --port 5174` at `http://localhost:5174` with `reuseExistingServer: true`
  - [ ] Set `globalTeardown` to a module that calls `closeDbConnection()` to clean up the pg pool after all tests
  - [ ] Remove `firefox` and `webkit` projects — Chromium only for MVP per AC 6

- [ ] Task 3: Delete outdated smoke test
  - [ ] Delete `apps/web/e2e/smoke.spec.ts` (tests for old scaffold heading that no longer exists)

- [ ] Task 4: Write populated-state and persistence E2E tests (AC: 1, 2, 5)
  - [ ] Create `apps/web/e2e/todos.spec.ts`
  - [ ] Write `test.describe('UJ-2: View Todos')` block
  - [ ] Add `test.beforeEach` that calls `truncateTodos()` then `seedTodos(TEST_TODOS)`
  - [ ] Add `test.afterAll` that calls `closeDbConnection()`
  - [ ] Write test: **populated state** — use `request.get('http://localhost:3000/todos')` via Playwright's API request context to capture the API response, then `page.goto('/')`, then assert each todo from the API response is rendered in the UI with correct text
  - [ ] Assert active todos (not completed) render in the "ACTIVE" section with full-opacity text
  - [ ] Assert completed todos render in the "COMPLETED" section with strikethrough styling
  - [ ] Assert creation timestamps are displayed for each todo
  - [ ] Write test: **data persistence** — seed DB, navigate to page, call `page.reload()`, assert todos are still present after reload (NFR-4)

- [ ] Task 5: Write empty-state E2E test (AC: 3)
  - [ ] In the same `todos.spec.ts` file, write the empty-state test
  - [ ] `beforeEach` already truncates (no seeding needed for this test — use `test.describe` nesting or separate `beforeEach`)
  - [ ] Write test: **empty state** — `truncateTodos()` explicitly in the test body (or separate describe with its own beforeEach), then `page.goto('/')`, assert heading "Nothing here yet." is visible, assert text "Type above to capture your first task." is visible

- [ ] Task 6: Write error-state E2E test (AC: 4)
  - [ ] Create `apps/web/e2e/error-state.spec.ts` (separate file — runs against the error-project web server on port 5174)
  - [ ] Write test: **error boundary** — `page.goto('/')`, assert the error boundary renders (look for role `alert` or heading text matching "Something went wrong" or "Request failed")
  - [ ] Assert no blank screen — the error boundary message is visible
  - [ ] Do NOT add any test-only code to the API — the web server genuinely fails because `VITE_API_URL` points to port 19999 where nothing is listening

- [ ] Task 7: Update `apps/web/package.json` scripts (AC: 6)
  - [ ] Verify `test:e2e` script points to correct config: `playwright test --config e2e/playwright.config.ts`
  - [ ] Optionally add `test:e2e:headed` script for local debugging: `playwright test --config e2e/playwright.config.ts --headed`

- [ ] Task 8: Run and validate all E2E tests (AC: 1–6)
  - [ ] Ensure PostgreSQL is running: `docker compose up -d postgres`
  - [ ] Ensure API is running: `npm run dev -w apps/api` (or the Playwright webServer handles the web app)
  - [ ] Run `npm run test:e2e -w apps/web` — all tests pass
  - [ ] Verify populated-state test asserts all seeded todos
  - [ ] Verify empty-state test asserts EmptyState with correct copy
  - [ ] Verify error-state test asserts error boundary
  - [ ] Verify persistence test asserts data survives reload
  - [ ] Run `npm run lint -w apps/web` — zero lint errors in new files

## Dev Notes

### Architecture Compliance

This story adds end-to-end tests following the architecture's E2E testing pattern:

```
apps/web/e2e/
├── playwright.config.ts          # Multi-project config (view-todos + error-state)
├── helpers/
│   └── db.ts                     # Direct PostgreSQL helper for seed/truncate
├── todos.spec.ts                 # Populated, empty, persistence tests
└── error-state.spec.ts           # Error boundary test (separate project/web server)
```

**Boundary enforcement:**
- E2E tests live in `apps/web/e2e/` — never co-located with components
- DB helper uses raw `pg` (not Drizzle, not API imports) — no cross-workspace dependency
- Error-state test launches a separate web server with wrong `VITE_API_URL` — no test-only code in API
- Tests seed via direct DB access, not via API endpoints (POST /todos does not exist yet — Story 2.5)

### ⚠️ CRITICAL: Prerequisites Before Running E2E Tests

E2E tests require a running PostgreSQL instance and the API server:

1. **PostgreSQL:** `docker compose up -d postgres` — starts the local DB on port 5432
2. **DB Migrations:** `npm run db:migrate` — ensures the `todos` table exists
3. **API Server:** Must be running at `http://localhost:3000` — either via `npm run dev -w apps/api` or started manually
4. **Web Server:** Playwright's `webServer` config auto-starts `npm run dev` (web app on port 5173)

The Playwright config uses `reuseExistingServer: true` — if the web app is already running, it will reuse it.

### Existing Code Context

**Files to delete:**
- `apps/web/e2e/smoke.spec.ts` — outdated scaffold test (expects heading "bmad-experiment web scaffold" which no longer exists after Story 2.2)

**Files to create:**
- `apps/web/e2e/helpers/db.ts` — PostgreSQL helper for E2E test setup/teardown
- `apps/web/e2e/todos.spec.ts` — Main E2E tests (populated, empty, persistence)
- `apps/web/e2e/error-state.spec.ts` — Error boundary E2E test
- `apps/web/e2e/global-teardown.ts` — Cleanup pg connections after all tests

**Files to modify:**
- `apps/web/e2e/playwright.config.ts` — Multi-project config with two web servers
- `apps/web/package.json` — Add `pg` and `@types/pg` devDependencies

**Files to NOT modify:**
- `apps/web/app/routes/home.tsx` — the page under test; do not change
- `apps/web/app/root.tsx` — error boundary under test; do not change
- `apps/web/app/components/todos/**` — components under test; do not change
- `apps/web/app/lib/api/**` — API wrapper; do not change
- `apps/api/src/**` — no test-only code in the API
- `apps/web/vitest.config.ts` — Vitest config is for unit tests, not E2E

### Implementation Patterns

**E2E Database Helper Pattern (`e2e/helpers/db.ts`):**

```typescript
import pg from 'pg';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/bmad_experiment';

const pool = new pg.Pool({ connectionString: DATABASE_URL });

export const TEST_TODOS = [
  { text: 'Buy groceries', isCompleted: false },
  { text: 'Read a book', isCompleted: true },
  { text: 'Walk the dog', isCompleted: false },
];

export async function truncateTodos(): Promise<void> {
  await pool.query('DELETE FROM todos');
}

export async function seedTodos(
  todos: Array<{ text: string; isCompleted: boolean }>,
): Promise<void> {
  for (const todo of todos) {
    await pool.query(
      'INSERT INTO todos (text, is_completed) VALUES ($1, $2)',
      [todo.text, todo.isCompleted],
    );
  }
}

export async function closeDbConnection(): Promise<void> {
  await pool.end();
}
```

**Key notes:**
- Uses raw `pg` — NOT Drizzle, NOT cross-workspace API imports
- Column names are `snake_case` in SQL (`is_completed`) — Drizzle maps to `camelCase` in TypeScript
- `id` and `created_at` use database defaults (`defaultRandom()` UUID, `defaultNow()` timestamp)
- The `pool` is reused across tests for connection efficiency
- `closeDbConnection()` called in `globalTeardown` or `afterAll` to prevent hanging connections

**Playwright Config Pattern (`e2e/playwright.config.ts`):**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  retries: 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'view-todos',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5173' },
      testMatch: 'todos.spec.ts',
    },
    {
      name: 'error-state',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5174' },
      testMatch: 'error-state.spec.ts',
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'VITE_API_URL=http://localhost:19999 npx react-router dev --port 5174',
      url: 'http://localhost:5174',
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
```

**Key notes:**
- Two projects: `view-todos` and `error-state` — each targets its own web server
- The error-state web server starts with `VITE_API_URL=http://localhost:19999` — port 19999 has nothing listening
- `reuseExistingServer: true` — if servers are already running, Playwright reuses them (important for local dev)
- Chromium only for MVP — no Firefox/WebKit (epics AC says "Chromium with zero flakes")
- The `npm run dev` command for the primary web server starts `react-router dev` on port 5173

**If `react-router dev --port 5174` does not work**, the alternative is to use the Vite `--port` flag:
```bash
VITE_API_URL=http://localhost:19999 npx vite dev --port 5174
```
Or set the port via environment variable by modifying `vite.config.ts` to read a port env var. Test which approach works and use the one that succeeds.

**Populated-State Test Pattern (`e2e/todos.spec.ts`):**

```typescript
import { test, expect } from '@playwright/test';
import {
  truncateTodos,
  seedTodos,
  closeDbConnection,
  TEST_TODOS,
} from './helpers/db';

const API_BASE_URL = 'http://localhost:3000';

test.describe('UJ-2: View Todos', () => {
  test.beforeEach(async () => {
    await truncateTodos();
  });

  test.afterAll(async () => {
    await closeDbConnection();
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
      const activeTodos = apiTodos.filter((t: { isCompleted: boolean }) => !t.isCompleted);
      const completedTodos = apiTodos.filter((t: { isCompleted: boolean }) => t.isCompleted);
      // Section headers render label + count, e.g. "ACTIVE — 2"

      // 5. Assert completed todos have visual distinction (strikethrough)
      // Use CSS assertion or visual check
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
```

**Error-State Test Pattern (`e2e/error-state.spec.ts`):**

```typescript
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
    await expect(
      page.getByRole('alert'),
    ).toBeVisible();

    // Verify the error boundary renders a meaningful message
    // root.tsx ErrorBoundary renders "Something went wrong" for unexpected errors
    // or "Request failed" for route error responses
    await expect(
      page.getByRole('heading', { name: /something went wrong|request failed/i }),
    ).toBeVisible();
  });
});
```

**Key notes on error-state test:**
- This runs against a SEPARATE web server on port 5174 (Playwright project `error-state`)
- That web server is started with `VITE_API_URL=http://localhost:19999` — nothing listens there
- The SSR loader in `home.tsx` calls `fetchTodos()` → calls Massimo-generated `getTodos()` → fetches from `http://localhost:19999/todos` → connection refused
- The React Router error boundary in `root.tsx` catches this and renders the error UI
- The error boundary renders role="alert" with heading "Something went wrong" (for unexpected errors) or "Request failed" (for route error responses)
- NO test-only code is added to the API — the API continues to behave identically in all environments

### Previous Story Intelligence

**From Story 2.2 (done — Todo List Page, Loader, Layout & Empty State):**

- `home.tsx` loader calls `fetchTodos()` which uses the Massimo-generated `getTodos()` method
- `fetchTodos()` is in `apps/web/app/lib/api/todos.server.ts` — imports from Massimo client and reads `VITE_API_URL` via `setup.server.ts`
- When `fetchTodos()` fails (API unreachable), it throws an `Error` — this propagates to the RR error boundary
- EmptyState component renders with `role="status"` and `aria-live="polite"`
- EmptyState `first-use` variant: heading "Nothing here yet.", text "Type above to capture your first task."
- TodoItem component renders todo text with `line-through` + reduced opacity for completed todos
- SectionHeader renders label (e.g., "ACTIVE") with count in format "ACTIVE — 2"
- `@testing-library/react` and `@testing-library/jest-dom` installed; `lucide-react` for icons
- Chakra `List.Root` / `List.Item` used for semantic `<ul>` / `<li>` structure
- Massimo client had bugs that were patched (status code matching, undefined types) — be aware if regenerating

**From Story 2.1 (done — GET /todos API Endpoint):**

- `GET /todos` returns `{ data: Todo[] }` ordered by `createdAt` descending
- All fields are camelCase in JSON: `id`, `text`, `isCompleted`, `createdAt`
- `createdAt` is ISO 8601 string (e.g., `"2026-03-10T15:58:29.000Z"`)
- Seed script at `apps/api/src/db/seed.ts` inserts 5 sample todos (3 active, 2 completed)
- Global error handler returns `{ error: { code: 'INTERNAL_ERROR', message: '...' } }` for 500s

**From Story 1.4 (done — Test Infrastructure):**

- Playwright installed as `@playwright/test: ^1.58.2` in `apps/web`
- Playwright config at `apps/web/e2e/playwright.config.ts`
- Outdated smoke test at `apps/web/e2e/smoke.spec.ts` (must be deleted — tests old scaffold)
- E2E scripts: `test:e2e` and `test:e2e:list` in web `package.json`

**From Story 1.6 (done — Testcontainers):**

- API tests use testcontainers for ephemeral PostgreSQL — E2E tests do NOT use testcontainers
- E2E tests connect to the same local PostgreSQL from `docker-compose.yml` that the API uses
- Connection string: `postgresql://postgres:postgres@localhost:5432/bmad_experiment`

### Git Intelligence Summary

Recent commit history:
```
1c2ef4d update story 2.3
ce8cdde story 2.3 code review
e87f763 chore: add new story for reorganising api structure
e3264db view todos
02cccd1 reorder stories in epic
541b3d9 fix pool and env issue
f7a28f1 feat: todos endpoint
```

**Actionable patterns:**
- The `pool` issue fix (commit `541b3d9`) was about DB connection pooling — ensure the E2E DB helper properly manages connections and closes the pool in teardown
- Story 2.2 code review was thorough — the dev agent was required to refactor API wrapper, extract TodoItem, patch Massimo client bugs
- Keep E2E tests focused: this story covers VIEW tests only — do NOT test create, update, or delete (those are Stories 2.7 and 3.4)

### Database Schema Reference

The `todos` table is defined in `apps/api/src/db/schema.ts`:

```typescript
export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),           // UUID v4 auto-generated
  text: varchar('text', { length: 255 }).notNull(),      // 1–255 chars
  isCompleted: boolean('is_completed').notNull().default(false),  // DB column: is_completed
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),  // DB column: created_at
});
```

**Critical for E2E DB helper:**
- SQL column names are `snake_case`: `is_completed`, `created_at`
- `id` and `created_at` have database defaults — do NOT include in INSERT statements
- `is_completed` has a default of `false` — include explicitly when seeding completed todos
- Truncate via `DELETE FROM todos` (not `TRUNCATE` which may require special permissions)

### Shared Types Reference

From `packages/shared/src/types.ts`:
```typescript
export interface Todo {
  id: string;           // UUID v4
  text: string;         // 1–255 characters
  isCompleted: boolean;
  createdAt: string;    // ISO 8601
}

export interface ApiSuccess<T> { data: T; }
```

The API response from `GET /todos` returns `ApiSuccess<Todo[]>` = `{ data: Todo[] }`.

### Environment Variables Reference

From `.env.example`:
```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bmad_experiment
PORT=3000
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
VITE_API_URL=http://localhost:3000
```

**For E2E tests:**
- `DATABASE_URL` — used by the E2E DB helper (`e2e/helpers/db.ts`) for direct PostgreSQL access
- `VITE_API_URL` — used by the web app's SSR loader; overridden to `http://localhost:19999` for the error-state web server
- The API must be running at `http://localhost:3000` for populated/empty/persistence tests

### UI Elements to Assert

**Populated state:**
| Element | Selector approach | Expected content |
|---|---|---|
| Active section header | `getByRole('heading')` + text match | "ACTIVE — {count}" |
| Todo text | `getByText(todo.text)` | Each seeded todo's text |
| Completed section header | `getByRole('heading')` + text match | "COMPLETED — {count}" |
| Completed todo styling | CSS assertion | `text-decoration: line-through` and reduced opacity |
| Creation timestamps | Visible text near each todo | Formatted date (e.g., "Mar 10, 3:45 PM") |

**Empty state:**
| Element | Selector approach | Expected content |
|---|---|---|
| EmptyState container | `getByRole('status')` | Contains heading + text |
| Heading | `getByRole('heading', { name: 'Nothing here yet.' })` | "Nothing here yet." |
| Description text | `getByText('Type above to capture your first task.')` | CTA copy |

**Error state:**
| Element | Selector approach | Expected content |
|---|---|---|
| Error boundary alert | `getByRole('alert')` | Error message container |
| Error heading | `getByRole('heading')` | "Something went wrong" or "Request failed" |
| Error details | `getByText(...)` | Descriptive error text |

### Component Hierarchy Under Test

```
root.tsx (Layout + ErrorBoundary)
└── routes/home.tsx (loader → fetchTodos → API)
    ├── SectionHeader (label="ACTIVE", count=N)
    ├── EmptyState (variant="first-use") — when no todos exist
    ├── EmptyState (variant="all-done") — when only completed todos exist
    ├── List.Root (active todos)
    │   └── TodoItem (todo text + createdAt timestamp)
    ├── SectionHeader (label="COMPLETED", count=N)
    └── List.Root (completed todos)
        └── TodoItem (strikethrough text + createdAt timestamp)
```

### Testing Patterns

**Playwright API Request Context:**
Use `request` fixture (from `test` function args) to call the API directly:
```typescript
test('example', async ({ page, request }) => {
  const response = await request.get('http://localhost:3000/todos');
  const { data } = await response.json();
  // Use 'data' to drive assertions on the rendered page
});
```

**Test Isolation:**
- Every test starts with `truncateTodos()` to ensure deterministic state
- `seedTodos()` inserts known data AFTER truncation
- Tests are independent — no test relies on another test's side effects
- `closeDbConnection()` in `afterAll` prevents hanging pg connections

**Assertion Best Practices:**
- Use Playwright's auto-waiting locators: `page.getByRole()`, `page.getByText()`
- Use `await expect(locator).toBeVisible()` — auto-waits with timeout
- For CSS assertions (strikethrough), use `locator.evaluate()` or check computed styles
- For counting elements, use `await expect(page.getByRole('listitem')).toHaveCount(N)`

### Scope Boundaries — What NOT to Build

| Feature | Why NOT in this story | Which story |
|---|---|---|
| Create todo E2E test | Separate create journey | Story 2.7 |
| Complete/delete E2E tests | Manage lifecycle journeys | Story 3.4 |
| TaskInput component | Not being tested here | Story 2.6 |
| POST /todos endpoint | Not yet implemented | Story 2.5 |
| Loading indicator tests | Loading & error states story | Story 2.8 |
| Firefox/WebKit E2E runs | Chromium only for MVP | Future enhancement |
| GitHub Actions `ci.yml` setup | CI pipeline story | Story 4.1 |

This story tests the VIEW journey (UJ-2) only — populated, empty, error, and persistence scenarios.

### Library / Framework Requirements

**To install (devDependencies in `apps/web`):**
- `pg` — PostgreSQL client for direct DB access in E2E helpers
- `@types/pg` — TypeScript types for `pg`

**Already installed (no changes needed):**
- `@playwright/test: ^1.58.2` — Playwright test runner
- All web app dependencies — React, Chakra UI, React Router, etc.

**No other new packages should be installed for this story.**

### Project Structure Notes

All new E2E files follow the established pattern:
```
apps/web/e2e/
├── playwright.config.ts          # MODIFIED — multi-project, two web servers
├── helpers/
│   └── db.ts                     # NEW — PostgreSQL helper for seed/truncate
├── global-teardown.ts            # NEW — cleanup pg connections
├── todos.spec.ts                 # NEW — populated, empty, persistence tests
└── error-state.spec.ts           # NEW — error boundary test
```

- File naming: `kebab-case` — always
- E2E tests in `apps/web/e2e/` — never co-located with components
- Test helpers in `e2e/helpers/` — utility functions for test setup
- One describe block per user journey
- Tests must be independent (no order dependency)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2 Story 2.3 acceptance criteria, BDD scenarios, implementation notes]
- [Source: _bmad-output/planning-artifacts/architecture.md — E2E test co-location, Playwright config, test patterns, TDD mandate]
- [Source: _bmad-output/planning-artifacts/prd.md — UJ-2 (returning user views todos), NFR-4 (data persistence), UX-4 (empty state CTA)]
- [Source: _bmad-output/implementation-artifacts/2-2-todo-list-page-loader-layout-and-empty-state.md — EmptyState variants, TodoItem rendering, SectionHeader anatomy, API wrapper patterns, theme tokens]
- [Source: _bmad-output/implementation-artifacts/2-1-get-todos-api-endpoint.md — GET /todos response shape, error handler, seed script, test data management]
- [Source: apps/web/e2e/playwright.config.ts — current Playwright config to modify]
- [Source: apps/web/e2e/smoke.spec.ts — outdated smoke test to delete]
- [Source: apps/web/app/routes/home.tsx — page under test (loader + layout)]
- [Source: apps/web/app/root.tsx — ErrorBoundary under test]
- [Source: apps/web/app/components/todos/empty-state/empty-state.tsx — EmptyState component under test]
- [Source: apps/web/app/components/todos/todo-item/todo-item.tsx — TodoItem component under test]
- [Source: apps/web/app/lib/api/setup.server.ts — VITE_API_URL configuration]
- [Source: apps/web/app/lib/api/todos.server.ts — fetchTodos() using Massimo client]
- [Source: apps/api/src/db/schema.ts — todos table schema (snake_case columns)]
- [Source: apps/api/src/db/seed.ts — existing seed script pattern]
- [Source: packages/shared/src/types.ts — Todo, ApiSuccess types]
- [Source: .env.example — DATABASE_URL, VITE_API_URL env vars]
- [Source: docker-compose.yml — PostgreSQL service on port 5432]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (GitHub Copilot)

### Debug Log References

### Completion Notes List

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-16 | Story created | create-story workflow (Claude Opus 4.6) |

### File List

**New files:**
- `apps/web/e2e/helpers/db.ts` — PostgreSQL helper for E2E test seed/truncate
- `apps/web/e2e/global-teardown.ts` — Cleanup pg connections after all tests
- `apps/web/e2e/todos.spec.ts` — Populated, empty, persistence E2E tests
- `apps/web/e2e/error-state.spec.ts` — Error boundary E2E test

**Modified files:**
- `apps/web/e2e/playwright.config.ts` — Multi-project config with two web servers
- `apps/web/package.json` — Add `pg` and `@types/pg` devDependencies

**Deleted files:**
- `apps/web/e2e/smoke.spec.ts` — Outdated scaffold smoke test
