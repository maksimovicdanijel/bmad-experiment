# Story 1.2: Scaffold Fastify API with Drizzle ORM

Status: review

## Story

As a **developer**,
I want a runnable Fastify v5 API server with Drizzle ORM connected to a local PostgreSQL database, all recommended security and infrastructure plugins registered in correct order, and the full domain directory structure in place,
So that route implementation can begin immediately in Epic 2 without any further infrastructure setup.

## Acceptance Criteria

1. **Given** `docker compose up -d postgres` has been run, **When** `npm run dev -w apps/api` is executed, **Then** the Fastify server starts on **port 3000** and logs a ready message with no errors.

2. **Given** the API is running, **When** `GET /documentation/json` is called, **Then** it returns a valid OpenAPI 3.0 JSON document (served by `@fastify/swagger`).

3. **Given** `drizzle.config.ts` points at the local PostgreSQL instance, **When** `npm run db:migrate -w apps/api` is run, **Then** Drizzle applies all pending migrations creating the `todos` table without errors.

4. **Given** the `todos` Drizzle schema defines `id` (UUID v4), `text` (varchar 255), `isCompleted` (boolean), `createdAt` (timestamp), **When** `tsc --noEmit` is run in `apps/api`, **Then** it compiles with zero TypeScript errors.

5. **Given** the domain directory structure `src/todos/` exists with stub files (`todos.routes.ts`, `todos.service.ts`, `todos.queries.ts`, `todos.schema.ts`), **When** `server.ts` registers `todosRoutes` as a Fastify plugin with prefix `/todos`, **Then** the server starts and the plugin registers without errors.

6. **Given** `@fastify/env` is registered first in `server.ts` with a schema requiring `DATABASE_URL`, **When** the server starts without `DATABASE_URL` set, **Then** it exits immediately with a clear validation error message instead of crashing on first DB call.

7. **Given** `@fastify/helmet` is registered in `server.ts` after `@fastify/env`, **When** any API endpoint is called, **Then** the response includes secure HTTP headers (including `X-Frame-Options`, `X-Content-Type-Options`, and a `Content-Security-Policy`).

8. **Given** `@fastify/rate-limit` is registered in `server.ts` with a limit of 1000 requests per minute per IP, **When** a client sends more than 1000 requests within 60 seconds, **Then** subsequent requests receive a `429 Too Many Requests` response.

9. **Given** `@fastify/cors` is registered in `server.ts`, **When** a request arrives with an `Origin` header matching the web app origin, **Then** the response includes appropriate CORS headers permitting the request.

10. **Given** all plugins are registered in the correct order (`@fastify/env` → `@fastify/helmet` → `@fastify/cors` → `@fastify/rate-limit` → `@fastify/swagger` → feature routes → `@fastify/swagger-ui`), **When** the server starts, **Then** all plugins initialise without encapsulation or ordering errors.

## Tasks / Subtasks

- [x] **Task 1: Install new production and dev dependencies** (AC: 1, 3, 4, 8)
  - [x] In `apps/api`, add production deps: `drizzle-orm`, `pg`, `@neondatabase/serverless`, `@fastify/swagger`, `@fastify/swagger-ui`, `@fastify/rate-limit`, `dotenv`
  - [x] In `apps/api`, add dev deps: `drizzle-kit`, `@types/pg`
  - [x] Run `npm install` from monorepo root and confirm zero errors with correct hoisting

- [x] **Task 2: Create Drizzle DB schema and client** (AC: 3, 4)
  - [x] [RED] Write failing test in `src/db/schema.test.ts`: import `todos` from `./schema.js` and assert the column names as a sanity check
  - [x] Create `src/db/schema.ts` — `pgTable('todos', { id: uuid PK defaultRandom, text: varchar(255) NOT NULL, isCompleted: boolean NOT NULL default false, createdAt: timestamp withTimezone mode:'string' NOT NULL defaultNow })`
  - [x] [GREEN] Confirm the schema test passes and `tsc --noEmit` passes with zero errors
  - [x] Create `src/db/index.ts` — exports a `db` Drizzle client using the node-postgres adapter (`drizzle-orm/node-postgres`), reading `DATABASE_URL` from `process.env`

- [x] **Task 3: Configure Drizzle Kit and database migration scripts** (AC: 3)
  - [x] Create `drizzle.config.ts` at `apps/api/` root — `import 'dotenv/config'`, `defineConfig({ schema: './src/db/schema.ts', out: './src/db/migrations', dialect: 'postgresql', dbCredentials: { url: process.env.DATABASE_URL! } })`
  - [x] Add scripts to `apps/api/package.json`: `"db:generate": "drizzle-kit generate"` and `"db:migrate": "drizzle-kit migrate"`
  - [x] Create `apps/api/.env` (git-ignored — add to `apps/api/.gitignore` if it doesn't exist): `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bmad_experiment`
  - [x] Run `npm run db:generate -w apps/api` — confirm `src/db/migrations/0001_init.sql` (or similar) is created
  - [x] Verify migration SQL creates `todos` table with correct columns
  - [x] With docker-compose postgres running, run `npm run db:migrate -w apps/api` — confirm `todos` table appears in the database

- [x] **Task 4: Create todos domain stub files** (AC: 5)
  - [x] Create `src/todos/todos.schema.ts` — import Zod schemas from `@bmad/shared`; export a `createTodoJsonSchema` and `updateTodoJsonSchema` (JSON Schema objects for Fastify route validation, converted from Zod using `zod-to-json-schema`) plus a `todoJsonSchema` for response shapes
  - [x] Create `src/todos/todos.queries.ts` — stub module with JSDoc comment indicating it will contain Drizzle queries; no exports yet
  - [x] Create `src/todos/todos.service.ts` — stub module with JSDoc comment indicating it will contain business logic; no exports yet
  - [x] Create `src/todos/todos.routes.ts` — Fastify `FastifyPluginAsync`, no routes yet; just registers the plugin and exports `todosRoutes` as default

- [x] **Task 5: Update server.ts with all plugins in correct order** (AC: 1, 2, 5, 6, 7, 8, 9, 10)
  - [x] [RED] Write failing tests in `src/server.test.ts`: test `GET /health` → 200 `{ status: 'ok' }`, `GET /documentation/json` → 200 with `openapi: '3.0.0'` in body, security header `x-content-type-options: nosniff` present on any response
  - [x] Refactor `server.ts` to export `buildApp(): Promise<FastifyInstance>` instead of a raw `app` const — this enables testable server creation
  - [x] Register `@fastify/env` FIRST (await before other plugins); schema: `DATABASE_URL` required, `PORT` default `'3000'`, `HOST` default `'0.0.0.0'`, `CORS_ORIGIN` default `'http://localhost:5173'`, `NODE_ENV` default `'development'`
  - [x] Add TypeScript interface augmentation for `FastifyInstance.config` to type the env values
  - [x] Register `@fastify/helmet` (after env)
  - [x] Register `@fastify/cors` with `origin: app.config.CORS_ORIGIN`
  - [x] Register `@fastify/rate-limit` with `max: 1000, timeWindow: '1 minute'`
  - [x] Register `@fastify/swagger` with `openapi: { openapi: '3.0.0', info: { title: 'bmad-experiment API', version: '1.0.0' } }`
  - [x] Register `todosRoutes` with `{ prefix: '/todos' }`
  - [x] Register `@fastify/swagger-ui` LAST with `routePrefix: '/documentation'`
  - [x] Keep the existing `GET /health` route returning `{ status: 'ok' }`
  - [x] Update the standalone startup block to call `buildApp()` and use `app.config.PORT` and `app.config.HOST`; fix default port from 3001 to **3000**
  - [x] [GREEN] Confirm all three server tests pass

- [x] **Task 6: Run full validation** (AC: 1–10)
  - [x] Run `tsc --noEmit` in `apps/api` — zero TypeScript errors
  - [x] Run `npm run test -w apps/api` — all tests pass (schema test + server tests)
  - [x] Run `npm run lint -w apps/api` — zero ESLint errors
  - [x] With docker-compose postgres running, start `npm run dev -w apps/api` — server starts on port 3000, `GET /health` returns 200, `GET /documentation/json` returns OpenAPI JSON

## Dev Notes

### Critical Context from Story 1.1

Story 1.1 delivered a **minimal Fastify skeleton** — `apps/api/src/server.ts` has only `Fastify({ logger: true })`, a `/health` route, and no plugins. The following already exist and must NOT be broken:
- `apps/api/src/server.ts` — exports `const app` (will be refactored to `buildApp()` in Task 5)
- `apps/api/package.json` — already has: `fastify ^5.8.2`, `@fastify/cors ^10.1.0`, `@fastify/env ^5.0.3`, `@fastify/helmet ^13.0.2`, `@fastify/sensible ^6.0.4`, `@bmad/shared: "*"`
- `apps/api/tsconfig.json` — extends `../../tsconfig.base.json`, `paths: { "@bmad/shared": ["../../packages/shared/src/index.ts"] }`
- `packages/shared/src/types.ts` — exports `Todo`, `CreateTodoRequest`, `UpdateTodoRequest`, `ApiSuccess<T>`, `ApiError`
- `packages/shared/src/schemas.ts` — exports `createTodoSchema`, `updateTodoSchema` (Zod)

**Port fix required**: Current `server.ts` has `|| 3001` fallback. AC #1 requires port 3000. Change default to `3000`.

### New Dependencies to Install in `apps/api`

**Production:**
```
drizzle-orm           # Drizzle ORM core
pg                    # node-postgres driver (local dev adapter)
@neondatabase/serverless  # Neon HTTP adapter (production)
@fastify/swagger      # OpenAPI spec generation (requires Fastify v5 compat version)
@fastify/swagger-ui   # Swagger UI at /documentation
@fastify/rate-limit   # Rate limiting (1000 req/min)
dotenv                # For drizzle.config.ts env loading
```

**Dev:**
```
drizzle-kit           # CLI: generate + migrate
@types/pg             # TypeScript types for pg
```

> ⚠️ All packages in `apps/api` are `"type": "module"` — confirm all installed packages support ESM or use `esModuleInterop` (already enabled in tsconfig.base.json).

### File Structure to Create

```
apps/api/
├── src/
│   ├── db/
│   │   ├── index.ts            # Drizzle client (new)
│   │   ├── schema.ts           # Drizzle table definitions (new)
│   │   ├── schema.test.ts      # Schema sanity test (new)
│   │   └── migrations/         # drizzle-kit generated SQL (new)
│   │       └── 0001_*.sql
│   ├── todos/                  # Domain stub files (new) — NOTE: 'src/todos/' per AC
│   │   ├── todos.routes.ts
│   │   ├── todos.service.ts
│   │   ├── todos.queries.ts
│   │   └── todos.schema.ts
│   ├── server.ts               # Updated: buildApp(), all plugins, fix port
│   └── server.test.ts          # New: integration tests
├── drizzle.config.ts           # New: Drizzle Kit config
├── .env                        # New (git-ignored): local DATABASE_URL
└── package.json                # Updated: new deps + db scripts
```

> ⚠️ **Architecture Discrepancy**: `architecture.md` shows `src/domains/todos/` but AC #5 explicitly says `src/todos/`. Use `src/todos/` — the AC is the acceptance gate. Story 2.1 will use whichever structure this story creates.

### Drizzle Schema (`src/db/schema.ts`)

```typescript
import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  text: varchar('text', { length: 255 }).notNull(),
  isCompleted: boolean('is_completed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});

export type TodoRow = typeof todos.$inferSelect;
export type NewTodoRow = typeof todos.$inferInsert;
```

**Critical**: `mode: 'string'` on `createdAt` ensures Drizzle returns ISO 8601 strings, matching the `Todo.createdAt: string` type in `@bmad/shared`. DB column is `snake_case`; Drizzle maps to `camelCase` automatically via column aliases.

### Drizzle Client (`src/db/index.ts`)

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

**Local dev only**: Uses `drizzle-orm/node-postgres` with a `pg.Pool`. For production (Neon), the driver switches to `drizzle-orm/neon-http` + `@neondatabase/serverless`. Implement the production adapter when deploying (Epic 4) — a simple `NODE_ENV === 'production'` check or separate config. For now, node-postgres works fine with both local postgres and Neon.

> ⚠️ `pg.Pool` does **NOT** connect eagerly — it only connects on first query. Tests that don't make DB queries will not require a live database connection.

### Drizzle Config (`apps/api/drizzle.config.ts`)

```typescript
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

`import 'dotenv/config'` at the top automatically loads `apps/api/.env` when drizzle-kit commands are run — no need for `dotenv-cli` or manual env export.

### server.ts Refactor: `buildApp()` Pattern

Refactor from `export const app = Fastify(...)` to:

```typescript
import Fastify, { type FastifyInstance } from 'fastify';
import fastifyEnv from '@fastify/env';
// ... other plugin imports

const envSchema = {
  type: 'object' as const,
  required: ['DATABASE_URL'],
  properties: {
    DATABASE_URL: { type: 'string' },
    PORT:         { type: 'string', default: '3000' },
    HOST:         { type: 'string', default: '0.0.0.0' },
    CORS_ORIGIN:  { type: 'string', default: 'http://localhost:5173' },
    NODE_ENV:     { type: 'string', default: 'development' },
  },
};

// Augment FastifyInstance with config property
declare module 'fastify' {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string;
      PORT: string;
      HOST: string;
      CORS_ORIGIN: string;
      NODE_ENV: string;
    };
  }
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  // @fastify/env MUST be awaited first — other plugins read app.config
  await app.register(fastifyEnv, { schema: envSchema, dotenv: true });

  app.register(fastifyHelmet);
  app.register(fastifyCors, { origin: app.config.CORS_ORIGIN });
  app.register(fastifyRateLimit, { max: 1000, timeWindow: '1 minute' });
  app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: { title: 'bmad-experiment API', version: '1.0.0' },
    },
  });
  app.register(todosRoutes, { prefix: '/todos' });
  app.register(fastifySwaggerUI, { routePrefix: '/documentation' });

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}

// Start server only when NOT in test mode
if (process.env.NODE_ENV !== 'test') {
  const app = await buildApp();
  await app.listen({
    port: Number(app.config.PORT),
    host: app.config.HOST,
  });
}
```

**Why `await` for `@fastify/env`**: `@fastify/env` populates `fastify.config` asynchronously. Awaiting its registration guarantees `app.config.CORS_ORIGIN` is readable when registering `@fastify/cors`. Without the await, `app.config` would be undefined.

**Plugin registration order is mandatory per AC #10**:
`@fastify/env` → `@fastify/helmet` → `@fastify/cors` → `@fastify/rate-limit` → `@fastify/swagger` → feature routes → `@fastify/swagger-ui`

`@fastify/swagger-ui` MUST be last — it renders docs from routes already registered.

### todos.routes.ts Stub Pattern

```typescript
import type { FastifyPluginAsync } from 'fastify';

const todosRoutes: FastifyPluginAsync = async (_fastify) => {
  // Routes will be implemented in Stories 2.1 and 2.2
  // Do NOT use fastify-plugin here — route encapsulation is intentional
};

export default todosRoutes;
```

Do NOT wrap with `fastify-plugin` — route plugins are intentionally encapsulated. `fastify-plugin` is for shared decorators (like a db plugin), not for route plugins.

### TDD Approach for This Story

**Schema test (`src/db/schema.test.ts`)** — verifies column names exist at runtime (supplements TypeScript compile-time checking):

```typescript
import { describe, it, expect } from 'vitest';
import { todos } from './schema.js';

describe('todos Drizzle schema', () => {
  it('has the expected column keys', () => {
    const columns = Object.keys(todos);
    expect(columns).toContain('id');
    expect(columns).toContain('text');
    expect(columns).toContain('isCompleted');
    expect(columns).toContain('createdAt');
  });
});
```

**Server tests (`src/server.test.ts`)** — uses `@fastify/inject` (built into Fastify), does NOT require a live database:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './server.js';

// Ensure DATABASE_URL is set before @fastify/env validates it
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/bmad_experiment';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('GET /health', () => {
  it('returns 200 with { status: "ok" }', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ status: 'ok' });
  });
});

describe('GET /documentation/json', () => {
  it('returns a valid OpenAPI 3.0 document', async () => {
    const res = await app.inject({ method: 'GET', url: '/documentation/json' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.openapi).toBe('3.0.0');
    expect(body.info.title).toBe('bmad-experiment API');
  });
});

describe('Security headers', () => {
  it('includes x-content-type-options from @fastify/helmet', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});
```

> ⚠️ `pg.Pool` only connects on first query — tests that use `app.inject()` without making DB queries do not need a live database. The pool is created when `src/db/index.ts` is imported but connects lazily.

### ESM Local Import Extensions

All local file imports MUST use `.js` extensions (TypeScript resolves them to `.ts` during compilation, and the compiled output needs `.js` for Node.js ESM):

```typescript
// ✅ Correct
import { todosRoutes } from './todos/todos.routes.js';
import { db } from './db/index.js';
import { todos } from './schema.js';

// ❌ Wrong — breaks in compiled Node.js ESM output
import { todosRoutes } from './todos/todos.routes';
```

### `apps/api/package.json` Scripts to Add

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate":  "drizzle-kit migrate"
  }
}
```

`drizzle.config.ts` uses `import 'dotenv/config'`, so running these scripts from the `apps/api/` directory automatically loads `apps/api/.env`.

### `.gitignore` — ensure `apps/api/.env` is git-ignored

The `apps/api/.env` file contains `DATABASE_URL` with credentials. Verify root `.gitignore` or add `apps/api/.gitignore`:
```
.env
```

The existing `.env.example` at root already documents `DATABASE_URL` — no update needed.

### Architecture Boundaries Enforced

- **`todos.routes.ts`** — Fastify plugin only; all business logic delegates to service (empty stub for now)
- **`todos.service.ts`** — pure TypeScript functions only; NO Fastify types, NO Drizzle imports (empty stub for now)
- **`todos.queries.ts`** — Drizzle calls only; NO business logic (empty stub for now)
- **`todos.schema.ts`** — Zod schemas re-exported from `@bmad/shared` + JSON Schema objects for Fastify validation
- **`src/db/index.ts`** — Drizzle client ONLY; `todos.queries.ts` imports `db` from here directly (no Fastify decorator needed for this project scale)

### References

- Story 1.2 ACs: [epics.md — Story 1.2](../planning-artifacts/epics.md)
- Plugin registration order: [architecture.md — API & Communication Patterns](../planning-artifacts/architecture.md)
- Backend feature organisation: [architecture.md — Structure Patterns](../planning-artifacts/architecture.md)
- TDD process patterns: [architecture.md — Process Patterns](../planning-artifacts/architecture.md)
- Drizzle + Neon adapters: [architecture.md — Database & ORM](../planning-artifacts/architecture.md)
- Complete project structure: [architecture.md — Complete Project Directory Structure](../planning-artifacts/architecture.md)
- Naming conventions: [architecture.md — Naming Patterns](../planning-artifacts/architecture.md)
- Enforcement anti-patterns: [architecture.md — Enforcement Guidelines](../planning-artifacts/architecture.md)
- Story 1.1 learnings: [1-1-initialise-monorepo-scaffold.md](./1-1-initialise-monorepo-scaffold.md)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

- Removed `rootDir: "./src"` from `apps/api/tsconfig.json` — the explicit `rootDir` conflicted with `@bmad/shared` path alias resolving to `../../packages/shared/src/`. TypeScript infers `rootDir` as `src/` from the `include` glob when not explicitly set, preserving the `dist/` output structure while allowing cross-workspace imports.
- Added `"*.ts"` to `include` in `apps/api/tsconfig.json` so that `drizzle.config.ts` (at repo root level of `apps/api/`) is covered by the TypeScript project and parsed correctly by ESLint `parserOptions: { project: true }`.
- Removed `_fastify` parameter from `todos.routes.ts` stub (TypeScript allows omitting unused callback params) to satisfy `@typescript-eslint/no-unused-vars`.
- Migration file generated as `0000_unusual_sentinels.sql` (drizzle-kit names based on diff hash, not sequential).

### Completion Notes List

- Installed all production deps: `drizzle-orm`, `pg`, `@neondatabase/serverless`, `@fastify/swagger`, `@fastify/swagger-ui`, `@fastify/rate-limit`, `dotenv`, `zod-to-json-schema`
- Installed dev deps: `drizzle-kit`, `@types/pg`
- Created `src/db/schema.ts` with `todos` pgTable (uuid PK, varchar text, boolean isCompleted, timestamptz createdAt)
- Created `src/db/schema.test.ts` — TDD Red→Green verified column keys
- Created `src/db/index.ts` — Drizzle client using `drizzle-orm/node-postgres` with `pg.Pool`
- Created `drizzle.config.ts` — uses `dotenv/config`, targets `src/db/schema.ts`, outputs to `src/db/migrations/`
- Added `db:generate` and `db:migrate` scripts to `apps/api/package.json`
- Created `apps/api/.env` (git-ignored via root `.gitignore`)
- Migration `0000_unusual_sentinels.sql` generated and applied successfully to local postgres
- Created `src/todos/todos.schema.ts` — `createTodoJsonSchema`, `updateTodoJsonSchema` (via `zod-to-json-schema`), `todoJsonSchema`
- Created `src/todos/todos.queries.ts` — stub with JSDoc
- Created `src/todos/todos.service.ts` — stub with JSDoc
- Created `src/todos/todos.routes.ts` — `FastifyPluginAsync` stub, exported as default
- Created `src/server.test.ts` — TDD Red→Green for GET /health, GET /documentation/json, security headers
- Refactored `server.ts` to `buildApp()` pattern with full plugin registration order per AC#10
- Server starts on port 3000; `GET /health` → `{"status":"ok"}`; `GET /documentation/json` → valid OpenAPI 3.0 doc
- All 4 tests pass (1 schema + 3 server); zero TypeScript errors; zero lint errors

### File List

- `apps/api/package.json` — added deps + `db:generate`/`db:migrate` scripts
- `apps/api/tsconfig.json` — removed explicit `rootDir`, added `*.ts` to include
- `apps/api/drizzle.config.ts` — new: Drizzle Kit config
- `apps/api/.env` — new (git-ignored): local DATABASE_URL
- `apps/api/src/server.ts` — refactored: `buildApp()` pattern, all plugins in correct order, port 3000
- `apps/api/src/server.test.ts` — new: integration tests (health, OpenAPI, security headers)
- `apps/api/src/db/schema.ts` — new: Drizzle todos table definition
- `apps/api/src/db/schema.test.ts` — new: schema column key sanity test
- `apps/api/src/db/index.ts` — new: Drizzle node-postgres client
- `apps/api/src/db/migrations/0000_unusual_sentinels.sql` — new: initial todos table migration
- `apps/api/src/todos/todos.schema.ts` — new: Zod→JSON Schema conversions for Fastify
- `apps/api/src/todos/todos.queries.ts` — new: stub (to be implemented in Story 2.1)
- `apps/api/src/todos/todos.service.ts` — new: stub (to be implemented in Story 2.1)
- `apps/api/src/todos/todos.routes.ts` — new: Fastify plugin stub with `/todos` prefix

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-09 | Story created | create-story workflow |
| 2026-03-09 | Story implemented: Fastify v5 + Drizzle ORM scaffold with all plugins, todos domain stubs, migrations, and full test coverage | dev agent (Claude Sonnet 4.6) |
