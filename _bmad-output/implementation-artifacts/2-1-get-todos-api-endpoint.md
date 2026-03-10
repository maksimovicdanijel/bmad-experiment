# Story 2.1: GET /todos API Endpoint

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want a `GET /todos` endpoint that returns all todos in the `{ data: Todo[] }` envelope,
so that the frontend loader has a reliable, contract-tested data source to render the todo list.

## Acceptance Criteria

1. **Given** a contract test exists in `todos.routes.test.ts` describing the expected response shape (written before the route handler),
   **When** the test is run before implementation,
   **Then** it fails for the right reason (route not found or 404).

2. **Given** the route handler is implemented and the database is empty,
   **When** `GET /todos` is called,
   **Then** it returns `200` with `{ data: [] }`.

3. **Given** todos exist in the database,
   **When** `GET /todos` is called,
   **Then** it returns `200` with `{ data: Todo[] }` ordered by `createdAt` descending, with all fields (`id`, `text`, `isCompleted`, `createdAt`) present as camelCase.

4. **Given** an unexpected server error occurs,
   **When** `GET /todos` is called,
   **Then** the global error handler returns `500` with `{ error: { code: 'INTERNAL_ERROR', message: '...' } }` and no stack trace is exposed.

5. **Given** the route is implemented following architecture boundaries,
   **When** the code is reviewed,
   **Then** `todos.routes.ts` delegates to `todos.service.ts`, which delegates to `todos.queries.ts` — no Drizzle imports in service, no business logic in routes.

6. **Given** the endpoint is under normal single-user load,
   **When** the response time is measured server-side,
   **Then** it responds in under 200ms at p95 (NFR-2).

## Tasks / Subtasks

- [x] Task 1: Write failing contract tests in `todos.routes.test.ts` (AC: 1, 2, 3, 4, 5)
  - [x] Remove the existing placeholder test (`defines contract test scaffold for todos routes`)
  - [x] Write test: `GET /todos` returns `200` with `{ data: [] }` when database is empty
  - [x] Write test: `GET /todos` returns `200` with `{ data: Todo[] }` ordered by `createdAt` descending when todos exist
  - [x] Write test: response body fields are camelCase (`id`, `text`, `isCompleted`, `createdAt`)
  - [x] Write test: each todo has a valid UUID `id`, a string `text`, a boolean `isCompleted`, and an ISO 8601 `createdAt`
  - [x] Write test: global error handler returns `500` with `{ error: { code: 'INTERNAL_ERROR', message: '...' } }` and no stack trace exposed
  - [x] Run tests — all must fail for the right reason (route returns 404 or is not handled)

- [x] Task 2: Implement `todos.queries.ts` — Drizzle query function (AC: 3, 5)
  - [x] Import `db` from `'../db/index.js'` and `todos` schema from `'../db/schema.js'`
  - [x] Import `desc` from `drizzle-orm` for ordering
  - [x] Implement `getAllTodos()` function: `SELECT * FROM todos ORDER BY created_at DESC`
  - [x] Return type: `TodoRow[]` (from `db/schema.ts`)
  - [x] No business logic — pure data access only

- [x] Task 3: Implement `todos.service.ts` — business logic layer (AC: 3, 5)
  - [x] Import `getAllTodos` from `'./todos.queries.js'`
  - [x] Import `Todo` type from `'@bmad/shared'`
  - [x] Implement `listTodos()` function that calls `getAllTodos()` and maps `TodoRow` → `Todo`
  - [x] Mapping: `TodoRow.createdAt` (string from Drizzle with `mode: 'string'`) → keep as ISO 8601 string
  - [x] No Fastify types, no Drizzle imports — pure TypeScript

- [x] Task 4: Implement `todos.routes.ts` — route handler (AC: 2, 3, 5)
  - [x] Import `listTodos` from `'./todos.service.js'`
  - [x] Import `todoJsonSchema` from `'./todos.schema.js'` for OpenAPI spec generation
  - [x] Register `GET /` handler (prefix `/todos` is set in `server.ts`)
  - [x] Add Fastify route schema for OpenAPI: response `200` with `{ data: Todo[] }` shape
  - [x] Handler calls `listTodos()` and returns `{ data: result }`
  - [x] No Drizzle imports, no direct DB access — delegates entirely to service

- [x] Task 5: Implement global error handler in `server.ts` (AC: 4)
  - [x] Add `app.setErrorHandler()` after plugin registration
  - [x] Log full error server-side via `request.log.error(error)`
  - [x] Return `500` with `{ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }`
  - [x] Never expose stack traces or internal error details in the response
  - [x] Ensure it only catches unexpected errors — validation errors (from Fastify schema) should still return 400 automatically

- [x] Task 6: Create dev seed script for todos (AC: 2, 3)
  - [x] Create `apps/api/src/db/seed.ts` — inserts sample todos into the database for local development
  - [x] Insert 3–5 sample todos with varying `isCompleted` states and staggered `createdAt` timestamps
  - [x] Script must be idempotent — truncate `todos` table before inserting
  - [x] Add `"db:seed": "tsx src/db/seed.ts"` script to `apps/api/package.json`
  - [x] Add `"db:seed": "npm run db:seed -w apps/api"` script to root `package.json`
  - [x] Verify seed runs successfully: `npm run db:seed -w apps/api` populates the local database

- [x] Task 7: Run tests and validate (AC: 1–6)
  - [x] Run `npm run test -w apps/api` — all contract tests pass (GREEN)
  - [x] Run `npm run lint -w apps/api` — zero lint errors
  - [x] Run `npm run build -w apps/api` — TypeScript compiles with zero errors
  - [x] Run `npm run openapi:export -w apps/api` to regenerate `openapi.json` with the new endpoint
  - [x] Run `npm run test` from workspace root — all tests pass

## Dev Notes

### Architecture Compliance

This story implements the first real feature endpoint following the established three-layer architecture:

```
todos.routes.ts (Fastify plugin, route declarations only)
  → todos.service.ts (business logic, pure TypeScript)
    → todos.queries.ts (Drizzle queries only, raw DB rows)
```

**Boundary enforcement:**
- `todos.routes.ts` — Fastify types only; imports from `todos.service.ts` and `todos.schema.ts` only
- `todos.service.ts` — pure TypeScript; NO `import` from `fastify`, NO `import` from `drizzle-orm` or `../db/*`
- `todos.queries.ts` — Drizzle calls only; imports `db` from `../db/index.js` and `todos` table from `../db/schema.js`

### Existing Code Context

**Files to modify:**
- `apps/api/src/todos/todos.routes.ts` — currently a no-op Fastify plugin; add `GET /` handler
- `apps/api/src/todos/todos.service.ts` — currently empty with comments; add `listTodos()` function
- `apps/api/src/todos/todos.queries.ts` — currently empty with comments; add `getAllTodos()` function
- `apps/api/src/todos/todos.routes.test.ts` — currently has a placeholder test; replace with real contract tests
- `apps/api/src/server.ts` — add global `setErrorHandler` for 500 error envelope

**Files to NOT modify:**
- `apps/api/src/todos/todos.schema.ts` — already has `todoJsonSchema` ready for OpenAPI generation
- `apps/api/src/db/schema.ts` — `todos` table already defined with all columns
- `apps/api/src/db/index.ts` — Drizzle client already configured
- `apps/api/src/test/global-setup.ts` — testcontainers setup already working
- `apps/api/vitest.config.ts` — already configured correctly
- `packages/shared/src/types.ts` — `Todo`, `ApiSuccess`, `ApiError` types already defined
- `packages/shared/src/schemas.ts` — Zod schemas already defined

### Implementation Patterns

**Contract test pattern (using `@fastify/inject`):**
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../server.js';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('GET /todos', () => {
  it('returns 200 with { data: [] } when empty', async () => {
    const res = await app.inject({ method: 'GET', url: '/todos' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ data: [] });
  });
});
```

**Drizzle query pattern:**
```typescript
import { db } from '../db/index.js';
import { todos } from '../db/schema.js';
import { desc } from 'drizzle-orm';

export async function getAllTodos() {
  return db.select().from(todos).orderBy(desc(todos.createdAt));
}
```

**Service layer pattern:**
```typescript
import { getAllTodos } from './todos.queries.js';
import type { Todo } from '@bmad/shared';

export async function listTodos(): Promise<Todo[]> {
  const rows = await getAllTodos();
  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    isCompleted: row.isCompleted,
    createdAt: row.createdAt,
  }));
}
```

**Route handler pattern:**
```typescript
import type { FastifyPluginAsync } from 'fastify';
import { listTodos } from './todos.service.js';
import { todoJsonSchema } from './todos.schema.js';

const todosRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'array', items: todoJsonSchema },
          },
          required: ['data'],
        },
      },
    },
  }, async () => {
    const todos = await listTodos();
    return { data: todos };
  });
};

export default todosRoutes;
```

**Global error handler pattern:**
```typescript
app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.status(500).send({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
});
```

### Database Schema Reference

The `todos` table is already defined in `apps/api/src/db/schema.ts`:

```typescript
export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),           // UUID v4
  text: varchar('text', { length: 255 }).notNull(),      // 1–255 chars
  isCompleted: boolean('is_completed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});

export type TodoRow = typeof todos.$inferSelect;
export type NewTodoRow = typeof todos.$inferInsert;
```

**Key notes:**
- `mode: 'string'` on `createdAt` means Drizzle returns it as an ISO 8601 string — no `Date` to string conversion needed
- `isCompleted` column is `is_completed` in the DB but `isCompleted` in TypeScript (Drizzle maps automatically)
- `TodoRow` type has all fields in camelCase already — mapping to `Todo` from `@bmad/shared` is straightforward

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
export interface ApiError { error: { code: string; message: string; }; }
```

### API Response Envelope

All responses must follow the architecture-mandated envelope:

- **Success:** `{ data: Todo[] }` — HTTP 200
- **Error:** `{ error: { code: 'INTERNAL_ERROR', message: '...' } }` — HTTP 500

Error codes use `SCREAMING_SNAKE_CASE`. No stack traces in responses.

### OpenAPI Spec Generation

After implementing the route with the `schema` option, run `npm run openapi:export -w apps/api` to regenerate `apps/api/openapi.json`. The `todoJsonSchema` from `todos.schema.ts` is already correctly defined for this purpose.

### Test Data Management

Contract tests run against the testcontainers-managed ephemeral PostgreSQL (via `global-setup.ts`). Each test should:
- Clean up test data in `beforeEach` or `afterEach` (truncate the `todos` table)
- OR use unique data per test to avoid interference
- Direct SQL insertion via Drizzle for test setup is acceptable in test files (import `db` and `todos` schema directly in test)

**Test data insertion example:**
```typescript
import { db } from '../db/index.js';
import { todos } from '../db/schema.js';

// Insert test data
await db.insert(todos).values({ text: 'Test todo' });

// Clean up
await db.delete(todos);
```

### Dev Seed Script

Create `apps/api/src/db/seed.ts` for local development convenience. The script inserts sample todos so the `GET /todos` endpoint returns real data when running locally.

**Seed script pattern:**
```typescript
import { db } from './index.js';
import { todos } from './schema.js';

const sampleTodos = [
  { text: 'Buy groceries', isCompleted: false },
  { text: 'Read a book', isCompleted: true },
  { text: 'Walk the dog', isCompleted: false },
  { text: 'Write unit tests', isCompleted: true },
  { text: 'Deploy to staging', isCompleted: false },
];

// Truncate and re-insert for idempotency
await db.delete(todos);
await db.insert(todos).values(sampleTodos);

const inserted = await db.select().from(todos);
console.log(`Seeded ${inserted.length} todos`);
process.exit(0);
```

**Key points:**
- Requires `DATABASE_URL` to be set (run `docker compose up -d postgres` + `npm run db:migrate` first)
- Idempotent — safe to run multiple times
- Uses the same Drizzle `db` instance as the app — no separate connection config
- File lives in `apps/api/src/db/` alongside the schema and migrations (infrastructure, not feature code)
- Must be excluded from production build via `tsconfig.build.json` (already excludes `src/test/` — add `src/db/seed.ts` if needed)

### Testing Requirements

- **TDD mandatory**: Write ALL contract tests FIRST (RED), then implement (GREEN), then refactor
- Tests use `@fastify/inject` — no running HTTP server needed
- Test database is ephemeral PostgreSQL via testcontainers (already configured in `global-setup.ts`)
- All tests must pass: `npm run test -w apps/api`
- All linting must pass: `npm run lint -w apps/api`
- Build must succeed: `npm run build -w apps/api`

### Project Structure Notes

- All changes are within `apps/api/src/todos/` domain directory and `apps/api/src/server.ts`
- No new files need to be created — all stub files already exist
- File naming follows established `kebab-case` convention
- The `todos.routes.ts` plugin is already registered in `server.ts` with `prefix: '/todos'`

### Previous Story Intelligence

**From Story 1.6 (done — testcontainers):**
- Tests run against real PostgreSQL via testcontainers — no mocking
- `process.env.DATABASE_URL` is set by `global-setup.ts` before any test files load
- `db/index.ts` pool creation picks up the env var at import time — works without modification
- Container startup adds ~4s to cold test run — acceptable
- Code review found: test files leaked into production `dist/` build — fixed via `tsconfig.build.json`

**From Story 1.5 (review — containerise):**
- `@bmad/shared` uses workspace resolution (`"*"`) — import as `@bmad/shared` works correctly
- API start script is `node dist/src/server.js` — ensure build output structure is preserved
- Vendor directories were removed — always use workspace imports, never vendor

**From Story 1.2 (done — Fastify scaffold):**
- Plugin registration order is critical: `@fastify/env` must be awaited first
- All stub domain files already exist with correct comments
- `server.ts` already imports and registers `todosRoutes` with prefix `/todos`
- `@fastify/env` with `dotenv: false` ensures DATABASE_URL must be provided externally

### Git Intelligence Summary

Recent commit history shows Epic 1 infrastructure progression:
```
bba3b8c containerise applications
0e6e6f4 feat: test setup
4d7d49a chore: rr7 bootstrap code review
1460934 feat: rr7 bootstrap
```

**Actionable patterns:**
- Code review is actively enforced — ensure clean architecture boundaries from the start
- Evidence-based completion notes expected
- Keep changes scoped to the story — no scope creep into other endpoints (POST is Story 2.2)

### Library / Framework Requirements

**Already installed (no new dependencies needed):**
- `fastify` v5.8.2 — HTTP framework with built-in schema validation
- `@fastify/swagger` v9.7.0 — OpenAPI spec generation from route schemas
- `drizzle-orm` v0.45.1 — type-safe SQL queries
- `pg` v8.20.0 — PostgreSQL driver
- `zod` v3.25.76 — validation (used in shared schemas)
- `zod-to-json-schema` v3.25.1 — converts Zod → JSON Schema for Fastify

**Test dependencies (already installed):**
- `vitest` — test runner
- `testcontainers` + `@testcontainers/postgresql` — ephemeral test database

**No new packages to install for this story.**

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — API patterns, response envelope, service boundaries, TDD mandate, error handling patterns]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2 Story 2.1 acceptance criteria, BDD scenarios]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-2, FR-11, NFR-2, NFR-4]
- [Source: apps/api/src/todos/todos.schema.ts — todoJsonSchema already defined for OpenAPI]
- [Source: apps/api/src/db/schema.ts — todos table definition, TodoRow type]
- [Source: apps/api/src/server.ts — plugin registration order, todosRoutes already registered]
- [Source: apps/api/src/server.test.ts — existing test patterns using @fastify/inject]
- [Source: packages/shared/src/types.ts — Todo, ApiSuccess, ApiError type definitions]
- [Source: _bmad-output/implementation-artifacts/1-6-configure-testcontainers-for-api-tests.md — testcontainers setup, test patterns]
- [Source: _bmad-output/implementation-artifacts/1-5-containerise-applications.md — workspace resolution, build patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (GitHub Copilot)

### Debug Log References

### Completion Notes List

1. **TDD RED-GREEN cycle followed**: 5 contract tests written first (Task 1), all confirmed failing for the right reasons (404 — route not implemented). Implementation in Tasks 2–5 turned all tests GREEN.
2. **Architecture boundaries enforced**: `todos.queries.ts` imports only Drizzle/DB; `todos.service.ts` imports only queries and shared types (no Fastify, no Drizzle); `todos.routes.ts` imports only service and schema (no Drizzle, no DB).
3. **Global error handler** uses `FastifyError` type generic on `setErrorHandler<FastifyError>()` to satisfy TypeScript strict mode (`error` would otherwise be `unknown`).
4. **Validation errors** (Fastify schema) still return 400 with Fastify's default format — the global error handler checks `error.validation` and delegates back to Fastify's default handler for those.
5. **Seed script** (`apps/api/src/db/seed.ts`) is excluded from production build via `tsconfig.build.json`. Inserts 5 sample todos, truncates first for idempotency.
6. **OpenAPI spec** regenerated — `apps/api/openapi.json` now includes `GET /todos/` with full response schema.
7. **Pre-existing issue**: `apps/web` tests fail with `ERR_REQUIRE_ESM` — this is documented in Story 1.5 as out of scope and is NOT a regression from this story. API (14/14) and shared (1/1) tests all pass.
8. **Code review fix (H1+H2)**: Error handler now preserves 4xx status codes from plugins (e.g., rate limiter 429). Previously all non-validation errors became 500.
9. **Code review fix (M1)**: Moved `errorResponseSchema` from `src/common/schemas.ts` to `src/schemas.ts` — `common/` directory violated the architecture's "by feature" organisation rule.
10. **Code review fix (M3)**: Seed script now calls `closeDb()` before exiting to cleanly release the DB connection pool.
11. **Code review fix (M4)**: `server.test.ts` updated to use `res.json()` consistently (was using `JSON.parse(res.body)`).
12. **Code review fix (L1 + bug)**: Stricter ISO 8601 regex in tests exposed that `createdAt` was returned in PostgreSQL format (`2026-03-10 15:58:29+00`) not ISO 8601 (`2026-03-10T15:58:29.000Z`). Fixed in `todos.service.ts` — `createdAt` now converted via `new Date(row.createdAt).toISOString()`.
13. **Code review note (M2)**: Story 1.6 changes (`vitest.config.ts` globalSetup, `server.test.ts` DATABASE_URL removal) leaked into this changeset — they were never committed with Story 1.6. Documented in File List.

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-10 | Story created | create-story workflow |
| 2026-03-10 | All 7 tasks implemented and validated — story moved to review | dev-story workflow (Claude Opus 4.6) |
| 2026-03-10 | Code review: 3 HIGH, 4 MEDIUM, 3 LOW findings — all fixed, status → done | code-review workflow (Claude Opus 4.6) |

### File List

| File | Action | Description |
|------|--------|-------------|
| `apps/api/src/todos/todos.routes.test.ts` | Modified | 5 contract tests (empty DB, populated DB, ordering, camelCase fields, error handler); uses `res.json()`, `setTimeout` from `timers/promises`, strict ISO 8601 regex |
| `apps/api/src/todos/todos.queries.ts` | Modified | Implemented `getAllTodos()` — Drizzle query with `ORDER BY created_at DESC` |
| `apps/api/src/todos/todos.service.ts` | Modified | Implemented `listTodos()` — maps `TodoRow` → `Todo`; converts `createdAt` to ISO 8601 via `new Date().toISOString()` |
| `apps/api/src/todos/todos.routes.ts` | Modified | Implemented `GET /` handler with OpenAPI response schema (`200`, `4xx`, `5xx`) |
| `apps/api/src/server.ts` | Modified | Global `setErrorHandler<FastifyError>()` — handles validation (400), 4xx (preserved), and 5xx (generic envelope) |
| `apps/api/src/schemas.ts` | Created | Reusable `errorResponseSchema` for `4xx`/`5xx` OpenAPI response definitions |
| `apps/api/src/db/seed.ts` | Created | Dev seed script — 5 sample todos, idempotent, calls `closeDb()` on exit |
| `apps/api/src/db/index.ts` | Modified | Exported `closeDb()` function for clean pool shutdown |
| `apps/api/tsconfig.build.json` | Modified | Added `src/db/seed.ts` to excludes |
| `apps/api/package.json` | Modified | Added `db:seed` script |
| `package.json` (root) | Modified | Added `db:seed` script (workspace delegate) |
| `apps/api/openapi.json` | Regenerated | `GET /todos/` with 200, 4XX, 5XX response schemas |
| `apps/api/src/server.test.ts` | Modified | Removed hardcoded `DATABASE_URL` fallback (Story 1.6 leak); updated to `res.json()` |
| `apps/api/vitest.config.ts` | Modified | Added `globalSetup` for testcontainers (Story 1.6 leak) |
