# Story 3.1: PATCH /todos/:id API Endpoint

Status: done

## Story

As a **developer**,
I want a `PATCH /todos/:id` endpoint that updates a todo's `isCompleted` status (or `text`) and returns `{ data: Todo }`,
so that the frontend toggle action has a validated, contract-tested write path.

## Acceptance Criteria

1. **Contract test first (TDD):**
  - Given a contract test exists in `patch.route.test.ts` (inside `handlers/`) for the PATCH endpoint (written before the route handler)
   - When the test is run before implementation
   - Then it fails for the right reason (route not found / 404)

2. **Toggle to completed:**
   - Given a valid request body `{ completed: true }` is sent for an existing todo
   - When `PATCH /todos/:id` is called
   - Then it returns `200` with `{ data: Todo }` where `isCompleted` is `true` and all other fields are unchanged

3. **Reactivate (toggle back to active):**
   - Given a valid request body `{ completed: false }` is sent for a completed todo
   - When `PATCH /todos/:id` is called
   - Then it returns `200` with `{ data: Todo }` where `isCompleted` is `false`

4. **Not found:**
   - Given a request is sent for an `id` that does not exist in the database
   - When `PATCH /todos/:id` is called
   - Then it returns `404` with `{ error: { code: 'NOT_FOUND', message: 'Todo not found' } }`

5. **Text validation:**
   - Given a request body with `text` exceeding 255 characters is sent
   - When `PATCH /todos/:id` is called
   - Then it returns `400` with `{ error: { code: 'VALIDATION_ERROR', message: 'text must be between 1 and 255 characters' } }`

6. **Persistence verified:**
   - Given a todo is successfully updated
   - When `GET /todos` is called immediately after
   - Then the updated todo reflects the new `isCompleted` value (data persists — NFR-4)

7. **Architecture boundaries:**
   - Given the route is implemented following architecture boundaries
   - When the code is reviewed
   - Then `routes.ts` delegates to `service.ts`, which delegates to `queries.ts` — no Drizzle imports in service, no business logic in routes

## Tasks / Subtasks

- [x] Task 1: Create contract tests for PATCH /todos/:id (AC: 1)
  - [x] Create `apps/api/src/features/todos/handlers/patch.route.test.ts`
  - [x] Test: returns 200 with `{ data: Todo }` when toggling `completed: true` on an existing todo
  - [x] Test: returns 200 with `{ data: Todo }` when toggling `completed: false` (reactivation)
  - [x] Test: `isCompleted` field reflects the new value; `id`, `text`, `createdAt` unchanged
  - [x] Test: returns 200 when updating `text` field with valid value
  - [x] Test: returns 200 when updating both `text` and `completed` simultaneously
  - [x] Test: returns 404 with `{ error: { code: 'NOT_FOUND', message: 'Todo not found' } }` for non-existent UUID
  - [x] Test: returns 400 with `{ error: { code: 'VALIDATION_ERROR', message: 'text must be between 1 and 255 characters' } }` for text > 255 chars
  - [x] Test: returns 400 for empty text (`""`)
  - [x] Test: returns 400 for invalid UUID format in `:id` param
  - [x] Test: returns 400 for empty body `{}`
  - [x] Test: returns 400 when request body is omitted
  - [x] Test: persists update — `GET /todos` reflects the change after PATCH
  - [x] Run tests — all must FAIL (Red phase of TDD)

- [x] Task 2: Add `updateTodo` query to `queries.ts` (AC: 7)
  - [x] Add `updateTodoById` function to `apps/api/src/features/todos/queries.ts`
  - [x] Function signature: `(id: string, data: { text?: string; isCompleted?: boolean }) => Promise<TodoRow | undefined>`
  - [x] Use Drizzle `db.update(todos).set(data).where(eq(todos.id, id)).returning()` pattern
  - [x] Return `undefined` if no row matched (id not found)
  - [x] Map `completed` from request body to `isCompleted` DB column in the calling layer (service), NOT in queries

- [x] Task 3: Add `updateTodo` service function to `service.ts` (AC: 7)
  - [x] Add `updateTodo` function to `apps/api/src/features/todos/service.ts`
  - [x] Function signature: `(id: string, data: { text?: string; completed?: boolean }) => Promise<Todo | null>`
  - [x] Map request field `completed` → DB field `isCompleted` before passing to query
  - [x] Call `updateTodoById` from queries
  - [x] Return `null` if query returns `undefined` (not found)
  - [x] Use existing `mapRowToTodo()` to convert DB row → `Todo` type
  - [x] No Drizzle imports — only import from `./queries.js`

- [x] Task 4: Create PATCH handler and schema (AC: 2, 3, 4, 5)
  - [x] Create `apps/api/src/features/todos/handlers/patch.schema.ts`
    - [x] Export `patchTodoBodySchema` derived from `updateTodoJsonSchema` in `../schema.ts`
    - [x] Export `patchTodoParamsSchema` — `{ type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] }`
    - [x] Export `patchTodoResponseSchema` — `{ type: 'object', properties: { data: todoJsonSchema }, required: ['data'] }`
  - [x] Create `apps/api/src/features/todos/handlers/patch.route.ts`
    - [x] Follow exact pattern from `post.route.ts`: `FastifyPluginAsync`, `attachValidation: true`
    - [x] Register `PATCH /:id` route with body, params, and response schemas
    - [x] Handle validation errors with `attachValidation` pattern — check for text validation errors, return proper `VALIDATION_ERROR` message
    - [x] Handle empty body `{}` — return 400 with `VALIDATION_ERROR` (at least one field required)
    - [x] Call `updateTodo(id, body)` from service
    - [x] If service returns `null` → reply 404 with `{ error: { code: 'NOT_FOUND', message: 'Todo not found' } }`
    - [x] If service returns `Todo` → reply 200 with `{ data: todo }`

- [x] Task 5: Register handler in routes.ts (AC: 7)
  - [x] Import `patchHandler` from `./handlers/patch.route.js` in `apps/api/src/features/todos/routes.ts`
  - [x] Register with `fastify.register(patchHandler)`
  - [x] No prefix change — handler registers `PATCH /:id` which becomes `PATCH /todos/:id` via parent prefix

- [x] Task 6: Run all tests — Green phase (AC: 1–6)
  - [x] Run `npm run test -w apps/api` — all PATCH contract tests pass
  - [x] Run existing GET and POST tests — no regressions
  - [x] Verify persistence: PATCH then GET in test confirms updated value returned

- [x] Task 7: Export updated OpenAPI spec
  - [x] Run `npm run export:openapi -w apps/api` (or equivalent) to regenerate `apps/api/openapi.json`
  - [x] Verify the spec includes `PATCH /todos/{id}` with correct request/response schemas
  - [x] Verify existing GET and POST endpoints unchanged in spec

## Dev Notes

### Architecture Compliance

**Service boundary pattern (MUST follow):**
- `patch.route.ts` → only Fastify types, delegates to `service.ts`
- `service.ts` → pure TypeScript, maps `completed` → `isCompleted`, delegates to `queries.ts`
- `queries.ts` → Drizzle only, returns raw `TodoRow | undefined`
- `schema.ts` / `patch.schema.ts` → Zod-derived JSON Schema for Fastify validation

**Error handling pattern (from architecture + `server.ts` global error handler):**
- 400 validation → handler catches `request.validationError` via `attachValidation: true` and returns `{ error: { code: 'VALIDATION_ERROR', message: '...' } }`
- 404 not found → handler checks service return, sends `{ error: { code: 'NOT_FOUND', message: 'Todo not found' } }`
- 500 unexpected → caught by global `setErrorHandler` in `server.ts`, returns `{ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }`

**Request body field naming:**
- Request uses `completed` (boolean, from `@bmad/shared` `UpdateTodoRequest`)
- DB column is `isCompleted` (via `is_completed` in Drizzle)
- Service layer maps `completed` → `isCompleted` before passing to queries
- Response always returns `isCompleted` (via `mapRowToTodo`)

**`updateTodoSchema` already exists in `@bmad/shared`:**
```typescript
export const updateTodoSchema = z.object({
  text: z.string().min(1).max(255).optional(),
  completed: z.boolean().optional(),
});
```
The `updateTodoJsonSchema` is already exported from `apps/api/src/features/todos/schema.ts`. Reuse it — do NOT redefine.

**Empty body handling:**
The `updateTodoSchema` makes both fields optional. An empty body `{}` technically passes Zod validation but is semantically invalid (no fields to update). The handler MUST check for empty body and return 400:
```typescript
if (!body.text && body.completed === undefined) {
  return reply.status(400).send({
    error: { code: 'VALIDATION_ERROR', message: 'At least one field (text or completed) is required' },
  });
}
```

### Project Structure Notes

**New files to create:**
```
apps/api/src/features/todos/handlers/
  patch.route.ts          # PATCH /:id handler
  patch.route.test.ts     # Contract tests
  patch.schema.ts         # JSON schemas for validation + OpenAPI
```

**Files to modify:**
```
apps/api/src/features/todos/routes.ts     # Register patchHandler
apps/api/src/features/todos/service.ts    # Add updateTodo function
apps/api/src/features/todos/queries.ts    # Add updateTodoById function
```

**Files NOT to touch:**
```
apps/api/src/server.ts                    # Global error handler already handles 500s
apps/api/src/schemas.ts                   # errorResponseSchema already exported
apps/api/src/db/schema.ts                 # Drizzle schema unchanged
apps/api/src/features/todos/schema.ts     # updateTodoJsonSchema already exported
packages/shared/src/schemas.ts            # updateTodoSchema already exists
packages/shared/src/types.ts              # UpdateTodoRequest already defined
apps/api/src/features/todos/handlers/get.route.ts   # Untouched
apps/api/src/features/todos/handlers/post.route.ts  # Untouched
```

### Existing Code Patterns to Follow

**Handler file pattern** (from `post.route.ts`):
```typescript
import type { FastifyPluginAsync } from 'fastify';
import { updateTodo } from '../service.js';
import { patchTodoBodySchema, patchTodoParamsSchema, patchTodoResponseSchema } from './patch.schema.js';
import { errorResponseSchema } from '../../../schemas.js';

const patchHandler: FastifyPluginAsync = async (fastify) => {
  fastify.patch<{ Params: { id: string }; Body: UpdateTodoRequest }>(
    '/:id',
    { schema: { ... }, attachValidation: true },
    async (request, reply) => { ... }
  );
};

export default patchHandler;
```

**Schema file pattern** (from `post.schema.ts`):
```typescript
import { todoJsonSchema, updateTodoJsonSchema } from '../schema.js';

export { updateTodoJsonSchema as patchTodoBodySchema };

export const patchTodoParamsSchema = { ... } as const;
export const patchTodoResponseSchema = { ... } as const;
```

**Test file pattern** (from `post.route.test.ts`):
```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../../server.js';
import { db } from '../../../db/index.js';
import { todos } from '../../../db/schema.js';

let app: FastifyInstance;

beforeAll(async () => { app = await buildApp(); await app.ready(); });
afterAll(async () => { await app.close(); });
beforeEach(async () => { await db.delete(todos); });
```

**Query pattern** (from `queries.ts`):
```typescript
import { eq } from 'drizzle-orm';  // NEW import needed
import { db } from '../../db/index.js';
import { todos } from '../../db/schema.js';
```

**Service function pattern** (from `service.ts`):
```typescript
export async function updateTodo(id: string, data: { text?: string; completed?: boolean }): Promise<Todo | null> {
  // Map 'completed' → 'isCompleted' for DB
  const dbData: { text?: string; isCompleted?: boolean } = {};
  if (data.text !== undefined) dbData.text = data.text;
  if (data.completed !== undefined) dbData.isCompleted = data.completed;

  const row = await updateTodoById(id, dbData);
  if (!row) return null;
  return mapRowToTodo(row);
}
```

### Testing Requirements

**Contract test file: `patch.route.test.ts`**

Tests MUST use `@fastify/inject` via `app.inject()` — no running server.

1. **Setup:** Create a todo via `db.insert(todos).values(...)` in test, capture its `id`
2. **Happy path — toggle completed:** `PATCH /todos/:id` with `{ completed: true }` → 200, `isCompleted: true`
3. **Happy path — reactivate:** `PATCH /todos/:id` with `{ completed: false }` → 200, `isCompleted: false`
4. **Happy path — update text:** `PATCH /todos/:id` with `{ text: 'Updated' }` → 200, `text: 'Updated'`
5. **Happy path — both fields:** `PATCH /todos/:id` with `{ text: 'New', completed: true }` → 200, both updated
6. **Not found:** `PATCH /todos/<random-uuid>` → 404, `{ error: { code: 'NOT_FOUND', message: 'Todo not found' } }`
7. **Validation — long text:** `{ text: 'a'.repeat(256) }` → 400, `VALIDATION_ERROR`
8. **Validation — empty text:** `{ text: '' }` → 400, `VALIDATION_ERROR`
9. **Validation — invalid UUID:** `PATCH /todos/not-a-uuid` → 400
10. **Validation — empty body:** `{}` → 400, `VALIDATION_ERROR`
11. **Persistence:** PATCH then GET — updated value confirmed in list

**No mocks needed** — tests run against ephemeral testcontainers PostgreSQL via `global-setup.ts`.

### Previous Story Intelligence

**From Story 2.8 (Loading & Error States):**
- Last story in Epic 2. All Epic 2 stories are done.
- Frontend `ErrorBar` component now exists for action-level errors (network/server).
- Error type discrimination added: `validation` vs `server` in action responses.
- The frontend is ready to consume PATCH endpoint once it exists.

**From Story 2.5 (POST /todos endpoint):**
- Established the handler pattern: `FastifyPluginAsync`, `attachValidation: true`, validation error discrimination.
- POST schema file pattern: separate `post.schema.ts` importing from parent `schema.ts`.
- Service generates UUID in create — PATCH does NOT generate new IDs.

**From Story 2.4 (API reorganisation):**
- Feature-based directory structure established: `src/features/todos/handlers/`.
- `routes.ts` is the barrel/aggregator that registers all handlers.
- Each HTTP verb gets its own handler file in `handlers/`.

### Git Intelligence Summary

Recent commits show iterative development pattern:
- `c9be10b e2e tests` — E2E for create todo journey
- `88159a2 feat: add todo` — TaskInput component + action
- `d04f739 code review` — Review-driven refinements
- `0b80244 feat: create todo endpoint` — POST handler following same pattern

All Epic 2 stories are done. This is the first story in Epic 3 (Manage Todo Lifecycle).

### Anti-Patterns to Avoid

- Do **NOT** import Drizzle ORM in `service.ts` — only `queries.ts` touches Drizzle
- Do **NOT** put business logic (field mapping, null checks) in `patch.route.ts` — delegate to service
- Do **NOT** use `any` — type everything with `UpdateTodoRequest` from `@bmad/shared`
- Do **NOT** redefine `updateTodoSchema` — it already exists in `@bmad/shared`
- Do **NOT** redefine `updateTodoJsonSchema` — it already exists in `schema.ts`
- Do **NOT** use `console.log` — use `request.log` for server-side logging
- Do **NOT** return 200 for not-found — return 404 with proper error envelope
- Do **NOT** expose stack traces — global error handler in `server.ts` already handles 500s
- Do **NOT** modify existing GET/POST handlers or their tests
- Do **NOT** modify `server.ts` — the PATCH route is registered through the existing `todosRoutes` plugin chain
- Do **NOT** accept `isCompleted` in the request body — the API contract uses `completed` (mapped to `isCompleted` in the service layer)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1] — Story requirements and acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] — PATCH /todos/:id contract: `{ text?: string, completed?: boolean }` → `{ data: Todo }`
- [Source: _bmad-output/planning-artifacts/architecture.md#Service Boundaries] — routes → service → queries layer separation
- [Source: _bmad-output/planning-artifacts/architecture.md#Error handling — backend] — 400/404/500 error envelope patterns
- [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns] — `{ data: T }` success, `{ error: { code, message } }` error envelope
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — camelCase JSON, snake_case DB, kebab-case files
- [Source: packages/shared/src/types.ts] — `UpdateTodoRequest { text?: string; completed?: boolean }`
- [Source: packages/shared/src/schemas.ts] — `updateTodoSchema` (Zod) already defined
- [Source: apps/api/src/features/todos/schema.ts] — `updateTodoJsonSchema` already exported
- [Source: apps/api/src/features/todos/handlers/post.route.ts] — Handler pattern reference (attachValidation, error discrimination)
- [Source: apps/api/src/features/todos/handlers/post.schema.ts] — Schema file pattern reference
- [Source: apps/api/src/features/todos/handlers/post.route.test.ts] — Test file pattern reference (buildApp, inject, beforeEach truncation)
- [Source: apps/api/src/features/todos/service.ts] — `mapRowToTodo()` reuse, service function pattern
- [Source: apps/api/src/features/todos/queries.ts] — Query function pattern, Drizzle usage
- [Source: apps/api/src/server.ts] — Global error handler (500s), plugin registration order

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Red phase: All PATCH contract tests confirmed FAILING before implementation (route not found / 404 responses)
- Green phase: All 12 tests pass after implementing query → service → handler → registration chain
- Full regression: 35/35 tests pass across 5 test files (patch, post, get, health, schema)
- Lint: Clean pass, no issues
- OpenAPI: Spec regenerated, confirms PATCH /todos/{id} present alongside existing GET /todos/ and POST /todos/

### Completion Notes List

- Implemented PATCH /todos/:id endpoint following TDD red-green cycle
- Architecture boundaries strictly maintained: routes → service → queries, no Drizzle in service
- Field mapping `completed` → `isCompleted` handled in service layer as specified
- Empty body `{}` rejected with 400 VALIDATION_ERROR
- Missing body request is normalized to 400 VALIDATION_ERROR with domain-specific message
- Invalid UUID params rejected with 400 via Fastify schema validation
- Reused existing `updateTodoJsonSchema` from `schema.ts` (derived from `@bmad/shared` `updateTodoSchema`)
- Reused `mapRowToTodo()` for consistent response serialisation
- All 7 acceptance criteria satisfied

### Change Log

- 2026-04-06: Implemented PATCH /todos/:id API endpoint (Story 3.1)
  - Created contract tests (11 tests) for all happy paths, error cases, and persistence verification
  - Added `updateTodoById` query function using Drizzle `db.update().set().where().returning()` pattern
  - Added `updateTodo` service function with `completed` → `isCompleted` field mapping
  - Created PATCH handler with `attachValidation: true`, validation error discrimination, empty body check, and 404 handling
  - Created patch schema file reusing `updateTodoJsonSchema` from parent `schema.ts`
  - Registered `patchHandler` in `routes.ts`
  - Regenerated `openapi.json` with PATCH /todos/{id} endpoint
- 2026-04-06: Senior Developer Review (AI) automatic fixes applied
  - Added missing contract test for PATCH requests where body is omitted
  - Normalized missing-body validation response to domain-specific `VALIDATION_ERROR` message
  - Updated acceptance criteria wording to match implemented contract-test filename
  - Documented git/story file-list scope discrepancy with explicit out-of-scope context

### File List

**New files:**
- `apps/api/src/features/todos/handlers/patch.route.ts` — PATCH /:id handler
- `apps/api/src/features/todos/handlers/patch.route.test.ts` — Contract tests (12 tests)
- `apps/api/src/features/todos/handlers/patch.schema.ts` — JSON schemas for validation + OpenAPI

**Modified files:**
- `apps/api/src/features/todos/queries.ts` — Added `updateTodoById` function, added `eq` import from `drizzle-orm`
- `apps/api/src/features/todos/service.ts` — Added `updateTodo` function, imported `updateTodoById`
- `apps/api/src/features/todos/routes.ts` — Imported and registered `patchHandler`
- `apps/api/openapi.json` — Regenerated with PATCH /todos/{id} endpoint

**Out-of-scope files currently modified in working tree (not part of Story 3.1 implementation):**
- `apps/web/app/components/TaskInput.tsx`
- `apps/web/app/components/TaskInput.test.tsx`
- `apps/web/app/routes/home.tsx`
- `apps/web/app/routes/home.test.tsx`
- `apps/web/test-results/.last-run.json`

## Senior Developer Review (AI)

### Outcome

Approved

### Review Summary (2026-04-06)

- Verified AC coverage and task claims against implementation files and tests
- Resolved medium findings by:
  - adding missing-body PATCH test coverage
  - normalizing missing-body validation response messaging
  - removing ambiguity in AC test-file naming
  - documenting git/story scope differences explicitly

### Findings Resolution

- HIGH: 0 open
- MEDIUM: 0 open
- LOW: 0 open
