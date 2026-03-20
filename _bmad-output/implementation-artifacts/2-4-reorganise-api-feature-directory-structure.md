# Story 2.4: Reorganise API into Feature-Based Directory Structure

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want the API source code reorganised from `src/todos/` into `src/features/todos/` with individual handler files under a `handlers/` sub-directory and the `todos.` filename prefix removed,
so that each feature is self-contained, each HTTP verb has its own file for independent modification, and the codebase scales cleanly as new features are added.

## Acceptance Criteria

1. **Given** the current directory structure has `src/todos/todos.routes.ts`, `todos.service.ts`, `todos.queries.ts`, `todos.schema.ts`, and `todos.routes.test.ts`,
   **When** the reorganisation is complete,
   **Then** the new structure is:
   ```
   src/features/todos/
     handlers/
       get.route.ts
     queries.ts
     service.ts
     schema.ts
     routes.ts
     routes.test.ts
   ```

2. **Given** `handlers/get.route.ts` exports a single Fastify route registration function for `GET /`,
   **When** `routes.ts` is inspected,
   **Then** it imports the handler and registers it as a Fastify plugin — acting as a barrel/aggregator for all current and future handlers.

3. **Given** `server.ts` currently imports `./todos/todos.routes.js`,
   **When** the reorganisation is complete,
   **Then** `server.ts` imports `./features/todos/routes.js` instead.

4. **Given** all relative imports within the feature files are updated (e.g., `../db/index.js` → `../../db/index.js`),
   **When** `tsc --noEmit` is run in `apps/api`,
   **Then** it compiles with zero TypeScript errors.

5. **Given** no functional changes are made (only file moves, renames, and import path updates),
   **When** `npm run test -w apps/api` is run,
   **Then** all existing tests pass with zero failures and zero test file modifications.

6. **Given** `npm run lint` is run from the workspace root,
   **When** the linter evaluates the reorganised files,
   **Then** it reports zero errors.

7. **Given** a new feature needs to be added in the future (e.g., `users`),
   **When** a developer inspects the `src/features/` directory,
   **Then** the pattern is immediately obvious: `src/features/users/handlers/`, `queries.ts`, `service.ts`, `schema.ts`, `routes.ts`.

8. **Given** the OpenAPI spec is re-exported after the reorganisation,
   **When** `openapi.json` is compared to the pre-reorganisation version,
   **Then** the spec is identical — no endpoint paths, schemas, or response shapes have changed.

## Tasks / Subtasks

- [x] Task 1: Pre-flight validation (AC: 5, 8)
  - [x] Run `npm run test -w apps/api` and confirm all existing tests pass (baseline before changes)
  - [x] Copy `apps/api/openapi.json` to a temp location for later comparison (e.g., `openapi.json.bak`)
  - [x] Run `tsc --noEmit -p apps/api/tsconfig.json` and confirm zero TypeScript errors

- [x] Task 2: Create the new directory structure (AC: 1, 7)
  - [x] Create `apps/api/src/features/todos/handlers/` directory
  - [x] Verify the `src/features/` top-level directory is established as the canonical home for all feature domains

- [x] Task 3: Move and rename feature files (AC: 1, 3)
  - [x] Move `src/todos/todos.queries.ts` → `src/features/todos/queries.ts`
  - [x] Move `src/todos/todos.service.ts` → `src/features/todos/service.ts`
  - [x] Move `src/todos/todos.schema.ts` → `src/features/todos/schema.ts`
  - [x] Move `src/todos/todos.routes.test.ts` → `src/features/todos/routes.test.ts`
  - [x] Delete the old `src/todos/` directory after all files are moved

- [x] Task 4: Extract GET handler into `handlers/get.route.ts` (AC: 1, 2)
  - [x] Create `src/features/todos/handlers/get.route.ts`
  - [x] Extract the `GET /` route registration from the old `todos.routes.ts` into `get.route.ts`
  - [x] Export a single Fastify route registration function (e.g., `export default async function getHandler(fastify: FastifyInstance)`)
  - [x] Import `listTodos` from `../service.js` (relative to handlers directory)
  - [x] Import `todoJsonSchema` from `../schema.js`
  - [x] Import `errorResponseSchema` from `../../../schemas.js`

- [x] Task 5: Create new `routes.ts` barrel/aggregator (AC: 2, 3)
  - [x] Create `src/features/todos/routes.ts` as a Fastify plugin
  - [x] Import the GET handler from `./handlers/get.route.js`
  - [x] Register the handler: `fastify.register(getHandler)`
  - [x] Export the plugin as default for consumption by `server.ts`
  - [x] Add JSDoc comment explaining the barrel pattern for future handler additions

- [x] Task 6: Update all import paths (AC: 3, 4)
  - [x] Update `server.ts`: change `import todosRoutes from './todos/todos.routes.js'` to `import todosRoutes from './features/todos/routes.js'`
  - [x] Update `queries.ts`: change `'../db/index.js'` → `'../../db/index.js'` and `'../db/schema.js'` → `'../../db/schema.js'`
  - [x] Update `service.ts`: change `'./todos.queries.js'` → `'./queries.js'`
  - [x] Update `routes.test.ts`: change `'../server.js'` → `'../../server.js'` and `'../db/index.js'` → `'../../db/index.js'` and `'../db/schema.js'` → `'../../db/schema.js'`
  - [x] Verify `schema.ts` imports — currently imports from `@bmad/shared` (absolute) so no change needed
  - [x] Verify `export-openapi.ts` — imports from `./server.js` (no change needed)
  - [x] Verify `server.test.ts` — imports from `./server.js` (no change needed)

- [x] Task 7: TypeScript compilation check (AC: 4)
  - [x] Run `tsc --noEmit -p apps/api/tsconfig.json` — must compile with zero errors
  - [x] If errors exist, fix remaining import path issues before proceeding

- [x] Task 8: Run tests and lint (AC: 5, 6)
  - [x] Run `npm run test -w apps/api` — all existing tests must pass with zero failures
  - [x] Run `npm run lint` from workspace root — zero lint errors
  - [x] Run `npm run build -w apps/api` — TypeScript compiles and produces `dist/` output correctly

- [x] Task 9: Verify OpenAPI spec is unchanged (AC: 8)
  - [x] Run `npm run openapi:export -w apps/api` to regenerate `apps/api/openapi.json`
  - [x] Compare the new `openapi.json` with the pre-reorganisation backup — semantically identical (JSON whitespace-only formatting differences in `required` arrays due to nested plugin registration; verified via `JSON.stringify` comparison)
  - [x] If any differences exist, investigate and fix (there should be none since no functional changes were made)

- [x] Task 10: Clean up (AC: 1)
  - [x] Verify `src/todos/` directory no longer exists
  - [x] Remove any temporary backup files (e.g., `openapi.json.bak`)
  - [x] Verify no stale imports reference the old `src/todos/` path anywhere in the codebase

## Dev Notes

### Architecture Compliance

This story is a **pure refactoring** — no functional changes, no new endpoints, no behaviour modifications. The goal is to establish the canonical feature-based directory structure for the API before adding more endpoints (POST in 2.5, PATCH/DELETE in Epic 3).

**⚠️ IMPORTANT: Architecture Document Discrepancy**

The architecture document has two slightly different backend structures:
- **"Structure Patterns" section** uses `src/todos/` with `todos.` prefix
- **"Complete Project Directory Structure" section** uses `src/domains/todos/` with `todos.` prefix

**This story (from epics) establishes the AUTHORITATIVE pattern going forward:** `src/features/todos/` with NO prefix and a `handlers/` subdirectory. This supersedes both architecture patterns. After this story, the epics structure is the canonical reference.

### Current File State (Pre-Reorganisation)

**Files to move/rename:**

```
src/todos/                          ← DELETE this directory after moves
  todos.routes.ts                   ← REPLACE with handlers/get.route.ts + routes.ts
  todos.service.ts                  ← MOVE to src/features/todos/service.ts
  todos.queries.ts                  ← MOVE to src/features/todos/queries.ts
  todos.schema.ts                   ← MOVE to src/features/todos/schema.ts
  todos.routes.test.ts              ← MOVE to src/features/todos/routes.test.ts
```

**Files to modify (import paths only):**

```
src/server.ts                       ← Update todosRoutes import path
```

**Files that do NOT change:**

```
src/db/index.ts                     ← Infrastructure, not feature code
src/db/schema.ts                    ← Infrastructure, stays in db/
src/db/schema.test.ts               ← Infrastructure test
src/db/seed.ts                      ← Dev tooling
src/db/migrations/                  ← Generated, stays in db/
src/schemas.ts                      ← Shared error schemas, stays at src/ root
src/export-openapi.ts               ← Build tooling, imports from ./server.js (unchanged)
src/server.test.ts                  ← Server tests, imports from ./server.js (unchanged)
src/test/global-setup.ts            ← Test infrastructure
```

### Target File State (Post-Reorganisation)

```
src/
  features/
    todos/
      handlers/
        get.route.ts                ← GET / handler extracted from old todos.routes.ts
      queries.ts                    ← Renamed from todos.queries.ts, updated imports
      service.ts                    ← Renamed from todos.service.ts, updated imports
      schema.ts                     ← Renamed from todos.schema.ts (no import changes)
      routes.ts                     ← NEW barrel file — imports & registers handlers
      routes.test.ts                ← Renamed from todos.routes.test.ts, updated imports
  db/                               ← Unchanged
  test/                             ← Unchanged
  schemas.ts                        ← Unchanged
  server.ts                         ← Updated import path only
  server.test.ts                    ← Unchanged
  export-openapi.ts                 ← Unchanged
```

### Import Path Changes — Complete Reference

**`src/features/todos/queries.ts`** (was `src/todos/todos.queries.ts`):
```typescript
// OLD:
import { db } from '../db/index.js';
import { todos } from '../db/schema.js';

// NEW (one level deeper → needs ../ added):
import { db } from '../../db/index.js';
import { todos } from '../../db/schema.js';
// drizzle-orm import unchanged (absolute package import)
```

**`src/features/todos/service.ts`** (was `src/todos/todos.service.ts`):
```typescript
// OLD:
import { getAllTodos } from './todos.queries.js';

// NEW (file renamed, same directory):
import { getAllTodos } from './queries.js';
// @bmad/shared import unchanged (absolute package import)
```

**`src/features/todos/schema.ts`** (was `src/todos/todos.schema.ts`):
```typescript
// NO CHANGES — all imports are absolute (@bmad/shared)
```

**`src/features/todos/handlers/get.route.ts`** (extracted from old `todos.routes.ts`):
```typescript
import type { FastifyPluginAsync } from 'fastify';
import { listTodos } from '../service.js';
import { todoJsonSchema } from '../schema.js';
import { errorResponseSchema } from '../../../schemas.js';
```

**`src/features/todos/routes.ts`** (NEW barrel file):
```typescript
import type { FastifyPluginAsync } from 'fastify';
import getHandler from './handlers/get.route.js';

const todosRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(getHandler);
};

export default todosRoutes;
```

**`src/server.ts`**:
```typescript
// OLD:
import todosRoutes from './todos/todos.routes.js';

// NEW:
import todosRoutes from './features/todos/routes.js';
```

**`src/features/todos/routes.test.ts`** (was `src/todos/todos.routes.test.ts`):
```typescript
// OLD:
import { buildApp } from '../server.js';
import { db } from '../db/index.js';
import { todos } from '../db/schema.js';

// NEW (one level deeper → needs ../ added):
import { buildApp } from '../../server.js';
import { db } from '../../db/index.js';
import { todos } from '../../db/schema.js';
```

### Handler Extraction Pattern

The current `todos.routes.ts` contains a single `GET /` route inline. This must be extracted into `handlers/get.route.ts` as a standalone Fastify plugin:

**Current `todos.routes.ts` (to be decomposed):**
```typescript
const todosRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    schema: { /* ... */ },
  }, async () => {
    const todos = await listTodos();
    return { data: todos };
  });
};
```

**New `handlers/get.route.ts`:**
```typescript
import type { FastifyPluginAsync } from 'fastify';
import { listTodos } from '../service.js';
import { todoJsonSchema } from '../schema.js';
import { errorResponseSchema } from '../../../schemas.js';

/**
 * GET / — Returns all todos ordered by createdAt descending.
 * Registered by the parent routes.ts plugin with prefix '/todos'.
 */
const getHandler: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              data: { type: 'array', items: todoJsonSchema },
            },
            required: ['data'],
          },
          '4xx': errorResponseSchema,
          '5xx': errorResponseSchema,
        },
      },
    },
    async () => {
      const todos = await listTodos();
      return { data: todos };
    },
  );
};

export default getHandler;
```

**New `routes.ts` (barrel):**
```typescript
import type { FastifyPluginAsync } from 'fastify';
import getHandler from './handlers/get.route.js';

/**
 * todosRoutes — Aggregator plugin for the /todos resource.
 * Registers all HTTP verb handlers from the handlers/ directory.
 *
 * To add a new endpoint:
 * 1. Create a new handler file in handlers/ (e.g., post.route.ts)
 * 2. Import and register it here
 *
 * Do NOT wrap with fastify-plugin — route encapsulation is intentional.
 */
const todosRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(getHandler);
};

export default todosRoutes;
```

### Project Structure Notes

- This reorganisation creates the `src/features/` directory as the canonical home for all domain-specific code
- Future features (e.g., `users` for auth in post-MVP) follow the identical pattern: `src/features/users/handlers/`, `queries.ts`, `service.ts`, `schema.ts`, `routes.ts`
- Infrastructure code (`db/`, `schemas.ts`, `server.ts`, `test/`) stays at the `src/` root level — it is NOT feature-specific
- File naming follows `kebab-case` — all new files must comply
- The `handlers/` subdirectory naming convention is `{verb}.route.ts` (e.g., `get.route.ts`, `post.route.ts`, `patch.route.ts`, `delete.route.ts`)
- After this story, Story 2.5 (POST endpoint) adds `handlers/post.route.ts` directly — no further refactoring needed

### Scope Boundaries — What NOT to Do

| Do NOT                                               | Why                                                       |
|------------------------------------------------------|-----------------------------------------------------------|
| Add any new endpoints (POST, PATCH, DELETE)          | Story 2.5 and Epic 3 cover those                         |
| Modify any test assertions or test logic             | Pure refactor — tests prove nothing broke                 |
| Change the OpenAPI spec                              | AC 8 requires identical spec output                      |
| Move `src/db/`, `src/schemas.ts`, or `src/test/`    | Those are infrastructure, not feature code               |
| Add new dependencies                                 | No new packages needed for file moves                    |
| Modify `export-openapi.ts` or `server.test.ts`      | They import from `./server.js` which hasn't moved        |
| Change any business logic, query logic, or schemas   | Zero functional changes — this is a structural refactor  |
| Rename the `errorResponseSchema` or move `schemas.ts`| Already at correct location (`src/schemas.ts`) per 2.1   |

### Previous Story Intelligence

**From Story 2.1 (done — GET /todos API endpoint):**
- The `GET /` handler is fully implemented with OpenAPI schema, service delegation, and error response schemas
- The handler imports `listTodos` from `./todos.service.js` and `todoJsonSchema` from `./todos.schema.js`
- The handler also imports `errorResponseSchema` from `../schemas.js` — this will become `../../../schemas.js` when moved into `handlers/`
- Contract tests import `buildApp` from `../server.js`, `db` from `../db/index.js`, `todos` from `../db/schema.js`
- Code review fix (M1): Moved `errorResponseSchema` from `src/common/schemas.ts` to `src/schemas.ts` — `common/` directory violated the architecture's "by feature" rule. **Do NOT re-introduce a `common/` directory.**
- Test files use `beforeEach(async () => { await db.delete(todos); })` for cleanup — imports must remain correct after move

**From Story 2.2 (done — Todo List Page):**
- The web app calls `GET /todos` via the Massimo-generated API client — completely decoupled from API internal structure
- No web app files reference `src/todos/` paths — the refactoring is invisible to the frontend
- The `openapi.json` spec is the contract boundary — as long as it's identical, the web app is unaffected

**From Story 1.2 (done — Fastify scaffold):**
- Plugin registration order in `server.ts` is critical: `@fastify/env` must be awaited first, then security plugins, then feature routes, then swagger-ui
- The `todosRoutes` import in `server.ts` is the ONLY line that needs to change — the `{ prefix: '/todos' }` registration stays the same
- All stub domain files were created with comments explaining their purpose — preserve JSDoc comments during the move

### Git Intelligence Summary

Recent commits:
```
1c2ef4d update story 2.3
ce8cdde story 2.3 code review
e87f763 chore: add new story for reorganising api structure
02cccd1 reorder stories in epic
541b3d9 fix pool and env issue
f7a28f1 feat: todos endpoint
```

**Actionable patterns:**
- Code review is actively enforced — ensure all import paths are correct before submitting
- `openapi.json` regeneration is part of the workflow — always verify after structural changes
- The `fix pool and env issue` commit (541b3d9) was about the lazy DB proxy in `db/index.ts` — do NOT touch this file
- The reorganisation story was explicitly added (`e87f763`) after recognising the need for scalable structure before adding more endpoints

### Testing Requirements

- **No new tests to write** — this is a pure refactoring story
- **All existing tests must pass unchanged** — proving the refactoring is safe
- The test file `routes.test.ts` only needs import path updates (deeper nesting requires extra `../`)
- `server.test.ts` does NOT need changes — it imports from `./server.js` which hasn't moved
- Run `npm run test -w apps/api` before AND after the refactoring to prove zero regressions
- Run `npm run test` from workspace root to verify nothing else broke

### Library / Framework Requirements

**No new dependencies needed.** This story is purely structural — file moves, renames, and import path updates. All dependencies are already installed.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.4 acceptance criteria defining target src/features/todos/ structure]
- [Source: _bmad-output/planning-artifacts/architecture.md — Backend organisation patterns, naming conventions, service boundaries, kebab-case file naming]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Structure Patterns" section: by-feature backend organisation, file co-location]
- [Source: apps/api/src/server.ts — current todosRoutes import: `import todosRoutes from './todos/todos.routes.js'`]
- [Source: apps/api/src/todos/todos.routes.ts — current GET / handler implementation with OpenAPI schema]
- [Source: apps/api/src/todos/todos.service.ts — listTodos() function, imports from ./todos.queries.js]
- [Source: apps/api/src/todos/todos.queries.ts — getAllTodos() function, imports from ../db/index.js and ../db/schema.js]
- [Source: apps/api/src/todos/todos.schema.ts — todoJsonSchema, createTodoJsonSchema, updateTodoJsonSchema, imports from @bmad/shared only]
- [Source: apps/api/src/todos/todos.routes.test.ts — contract tests, imports from ../server.js, ../db/index.js, ../db/schema.js]
- [Source: apps/api/src/schemas.ts — errorResponseSchema at src/ root, imported by routes as ../schemas.js]
- [Source: apps/api/src/export-openapi.ts — imports from ./server.js (no change needed)]
- [Source: apps/api/src/server.test.ts — imports from ./server.js (no change needed)]
- [Source: _bmad-output/implementation-artifacts/2-1-get-todos-api-endpoint.md — previous story learnings, error handler patterns, code review fixes]
- [Source: _bmad-output/implementation-artifacts/2-2-todo-list-page-loader-layout-and-empty-state.md — confirms frontend is decoupled from API internal paths]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (GitHub Copilot)

### Debug Log References

- Pre-flight: 14/14 tests pass, zero TS errors, OpenAPI backup created
- Post-refactor: 14/14 tests pass, zero TS errors, zero lint errors, build succeeds
- OpenAPI spec verified semantically identical via JSON.stringify comparison
- Testcontainers required `TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock` and `DOCKER_HOST=unix://$HOME/.colima/default/docker.sock` for Colima Docker setup

### Completion Notes List

- Pure structural refactoring completed with zero functional changes
- Established `src/features/` as canonical home for feature-based directory structure
- Extracted GET handler into `handlers/get.route.ts` as standalone Fastify plugin
- Created `routes.ts` barrel/aggregator with JSDoc documenting the handler registration pattern
- All 14 existing tests pass unchanged — zero regressions
- OpenAPI spec semantically identical (minor JSON formatting differences in `required` array whitespace due to nested plugin registration; original formatting preserved)
- No new dependencies added
- No test modifications required

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-20 | Story implemented: reorganised src/todos/ into src/features/todos/ with handlers/ subdirectory | dev-story workflow (Claude Opus 4.6, GitHub Copilot) |
| 2026-03-16 | Story created | create-story workflow (Claude Opus 4.6, GitHub Copilot) |

### File List

| File | Action | Description |
|------|--------|-------------|
| `apps/api/src/features/todos/handlers/get.route.ts` | Created | Extracted GET / handler from old todos.routes.ts |
| `apps/api/src/features/todos/routes.ts` | Created | Barrel/aggregator plugin — imports and registers all handlers |
| `apps/api/src/features/todos/queries.ts` | Moved+Renamed | From src/todos/todos.queries.ts — updated db imports to ../../db/ |
| `apps/api/src/features/todos/service.ts` | Moved+Renamed | From src/todos/todos.service.ts — updated import to ./queries.js |
| `apps/api/src/features/todos/schema.ts` | Moved+Renamed | From src/todos/todos.schema.ts — no import changes (all absolute) |
| `apps/api/src/features/todos/routes.test.ts` | Moved+Renamed | From src/todos/todos.routes.test.ts — updated imports to ../../ paths |
| `apps/api/src/server.ts` | Modified | Updated import from ./todos/todos.routes.js to ./features/todos/routes.js |
| `apps/api/src/todos/` | Deleted | Entire directory removed after all files moved |
| `apps/api/openapi.json` | Regenerated | Must be identical to pre-reorganisation version |
