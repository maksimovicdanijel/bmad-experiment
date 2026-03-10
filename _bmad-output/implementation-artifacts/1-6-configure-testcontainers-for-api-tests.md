# Story 1.6: Configure Testcontainers for API Tests

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want API tests to automatically boot an ephemeral PostgreSQL container via testcontainers so that all contract and integration tests run against a real database with zero manual setup,
so that tests are fully deterministic, require no external `docker compose up` step, and the DB layer is never mocked.

## Acceptance Criteria

1. **Given** `testcontainers` and `@testcontainers/postgresql` are installed as devDependencies in `apps/api`,
   **When** the `package.json` is inspected,
   **Then** both packages are listed under `devDependencies`.

2. **Given** `vitest.config.ts` in `apps/api` references a `globalSetup` file,
   **When** `npm run test -w apps/api` is executed without any running PostgreSQL container,
   **Then** testcontainers boots a PostgreSQL container, Drizzle migrations run against it, `DATABASE_URL` is set in `process.env`, all tests execute against the ephemeral database, and the container is torn down after tests complete.

3. **Given** the global setup boots PostgreSQL and runs migrations,
   **When** any test file imports `db` from `../db/index.js` or calls `buildApp()`,
   **Then** queries execute against the testcontainers-managed database (not the docker-compose dev instance).

4. **Given** all existing tests in `server.test.ts` remain unchanged (except removing the hardcoded `DATABASE_URL` fallback),
   **When** `npm run test -w apps/api` is run,
   **Then** all existing tests pass as before.

5. **Given** the testcontainers setup is complete,
   **When** `npm run test` is run from the workspace root,
   **Then** API tests pass without requiring `docker compose up -d postgres` first.

6. **Given** CI runs in GitHub Actions with Docker available,
   **When** the test step executes,
   **Then** testcontainers boots PostgreSQL in CI and all tests pass without additional CI configuration.

## Tasks / Subtasks

- [x] Task 1: Install testcontainers dependencies (AC: 1)
  - [x] Run `npm install -D testcontainers @testcontainers/postgresql -w apps/api`
  - [x] Verify packages appear in `apps/api/package.json` devDependencies

- [x] Task 2: Create global setup for Vitest (AC: 2, 3)
  - [x] Create `apps/api/src/test/global-setup.ts`
  - [x] Import `PostgreSqlContainer` from `@testcontainers/postgresql`
  - [x] Boot a PostgreSQL container (use `postgres:16-alpine` image to match project baseline)
  - [x] Set `process.env.DATABASE_URL` to the container's connection string
  - [x] Run Drizzle migrations via `execSync('npx drizzle-kit migrate')` — `drizzle.config.ts` reads `DATABASE_URL` from env
  - [x] Export the container reference for teardown (via `provide` / Vitest global setup return pattern)

- [x] Task 3: Create global teardown for Vitest (AC: 2)
  - [x] Teardown handled via returned function from globalSetup (no separate file needed — Vitest supports this pattern natively)

- [x] Task 4: Wire up vitest.config.ts (AC: 2)
  - [x] Add `globalSetup: ['./src/test/global-setup.ts']` to `vitest.config.ts`
  - [x] Default pool `forks` propagates `process.env.DATABASE_URL` correctly to test workers

- [x] Task 5: Remove hardcoded DATABASE_URL fallback from server.test.ts (AC: 4)
  - [x] Remove or replace the `process.env.DATABASE_URL = process.env.DATABASE_URL ?? '...'` line
  - [x] The env var is now set by global setup — no fallback needed
  - [x] Verify all existing tests still pass

- [x] Task 6: Validate end-to-end (AC: 2, 4, 5, 6)
  - [x] Stop any running docker-compose postgres: `docker compose down`
  - [x] Run `npm run test -w apps/api` — all 10 tests pass (3 files) using testcontainers
  - [x] Run `npm run test` from workspace root — all 13 tests pass across all workspaces
  - [x] Run `npm run lint -w apps/api` — zero lint errors
  - [x] Run `npm run build -w apps/api` — TypeScript compiles with zero errors

## Dev Notes

### Architecture Compliance

This story modifies **test infrastructure only** — zero changes to production source code. The three-layer architecture (`routes → service → queries`) and all existing source files remain untouched.

### Existing Code Context

**Files to modify:**
- `apps/api/vitest.config.ts` — add `globalSetup` config
- `apps/api/src/server.test.ts` — remove hardcoded `DATABASE_URL` fallback (lines 8–10)

**Files to create:**
- `apps/api/src/test/global-setup.ts` — testcontainers boot + migrations
- `apps/api/src/test/global-teardown.ts` — container cleanup

**Files to NOT touch:**
- `apps/api/src/db/index.ts` — pool creation from `process.env.DATABASE_URL` (works as-is)
- `apps/api/src/db/schema.ts` — table definitions (unchanged)
- `apps/api/src/server.ts` — app builder (unchanged)
- `apps/api/drizzle.config.ts` — already reads `DATABASE_URL` from env (unchanged)
- `docker-compose.yml` — local dev DB remains for `npm run dev` (unchanged)

### Implementation Pattern

**Global setup approach (recommended):**

```typescript
// apps/api/src/test/global-setup.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'node:child_process';

export default async function setup() {
  const container = await new PostgreSqlContainer('postgres:16-alpine').start();

  process.env.DATABASE_URL = container.getConnectionUri();

  // Run Drizzle migrations against the ephemeral container
  execSync('npx drizzle-kit migrate', {
    cwd: new URL('../../..', import.meta.url).pathname,
    env: { ...process.env, DATABASE_URL: container.getConnectionUri() },
    stdio: 'pipe',
  });

  // Store for teardown
  return async function teardown() {
    await container.stop();
  };
}
```

**Key points:**
- `postgres:16-alpine` matches the docker-compose baseline (PostgreSQL 16)
- `execSync` for migrations uses the same `drizzle.config.ts` that dev uses — no duplication
- Vitest `globalSetup` can return a teardown function (no separate file needed)
- `process.env.DATABASE_URL` is set before any test file loads, so `db/index.ts` pool creation picks it up

### Vitest Config Pattern

```typescript
// apps/api/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globalSetup: ['./src/test/global-setup.ts'],
    // pool: 'forks' is default — env vars propagate correctly
  },
});
```

### Database Schema Reference

The migration file `apps/api/src/db/migrations/0000_unusual_sentinels.sql` creates the `todos` table. Drizzle-kit migrate will apply this to the ephemeral container automatically.

### `db/index.ts` — Pool Creation (DO NOT MODIFY)

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

This module-level pool creation reads `DATABASE_URL` at import time. Since `globalSetup` sets the env var before test files are loaded, this works without modification.

### `server.test.ts` — Current Hardcoded Fallback (TO REMOVE)

```typescript
// Lines 8-10 — REMOVE THIS:
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/bmad_experiment';
```

After this story, the global setup provides `DATABASE_URL`. No test file should set it.

### Testing Requirements

- After implementation, all existing tests must continue to pass
- No database mocking anywhere — all tests hit real PostgreSQL via testcontainers
- Container startup adds ~3–5 seconds to test suite cold start (acceptable trade-off)
- Run full validation: `npm run test -w apps/api`, `npm run lint -w apps/api`, `npm run build -w apps/api`

### Previous Story Intelligence

From Story 1.5 (review):
- Docker is already a project requirement — testcontainers adds no new external dependency
- Keep changes narrowly scoped to test infrastructure
- Evidence-based completion notes expected during review

From Story 1.4 (done):
- Vitest is already configured and working in `apps/api`
- Test patterns established: `describe/it/expect`, `beforeAll/afterAll`, `@fastify/inject`
- Root `npm run test` runs all workspace tests

### Project Structure Notes

- New files go in `apps/api/src/test/` directory (new directory — test utilities)
- All filenames use `kebab-case`: `global-setup.ts`, `global-teardown.ts`
- Test utilities are NOT co-located with source — infrastructure-level, not feature-level

### Library / Framework Requirements

- `testcontainers` — official Node.js testcontainers library; requires Docker daemon running
- `@testcontainers/postgresql` — PostgreSQL module for testcontainers; provides `PostgreSqlContainer`
- `postgres:16-alpine` Docker image — matches project PostgreSQL baseline
- No version pinning needed — use latest stable of both packages

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — test infrastructure, TDD requirements, Vitest config]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1 scope, test infrastructure story]
- [Source: apps/api/vitest.config.ts — current Vitest configuration]
- [Source: apps/api/src/server.test.ts — existing test patterns, hardcoded DATABASE_URL fallback]
- [Source: apps/api/drizzle.config.ts — migration config reads DATABASE_URL from env]
- [Source: apps/api/src/db/index.ts — pool creation from process.env.DATABASE_URL]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Installed `testcontainers@^11.12.0` and `@testcontainers/postgresql@^11.12.0` as devDependencies in `apps/api`
- Created `apps/api/src/test/global-setup.ts` with Vitest globalSetup pattern: boots `postgres:16-alpine` container, runs Drizzle migrations via `execSync`, sets `process.env.DATABASE_URL`, and returns a teardown function that stops the container
- No separate teardown file needed — Vitest natively supports teardown via returned function from globalSetup
- Updated `apps/api/vitest.config.ts` to reference the new globalSetup file
- Removed hardcoded `DATABASE_URL` fallback from `apps/api/src/server.test.ts` (lines 8–10) — env var now provided by globalSetup
- All 10 API tests pass (3 files: server.test.ts, schema.test.ts, todos.routes.test.ts) against ephemeral testcontainers PostgreSQL
- All 13 workspace tests pass from root `npm run test` without requiring `docker compose up -d postgres`
- Zero lint errors, zero TypeScript build errors
- Container startup adds ~4s to cold test run (acceptable trade-off for deterministic, real-database testing)
- Note: Colima users need `DOCKER_HOST` and `TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE` env vars set; GitHub Actions CI has Docker natively available

### Senior Developer Review (AI)

**Review Date:** 2026-03-10
**Review Outcome:** Approve (after fixes)
**Issues Found:** 1 High, 3 Medium, 2 Low

**Action Items (all resolved):**
- [x] [HIGH] Test files leaked into production `dist/` build — fixed via `tsconfig.build.json` + updated `build` script
- [x] [MED] `package-lock.json` not documented in File List — added to File List
- [x] [MED] `stdio: 'pipe'` in execSync swallowed migration errors — added try/catch with stderr capture and re-throw
- [x] [MED] No startup timeout on container — added `withStartupTimeout(120_000)`
- [x] [LOW] Verbose `__dirname` polyfill — simplified to `new URL('../..', import.meta.url).pathname`
- [x] [LOW] No explicit startup timeout — addressed above

### Change Log

- 2026-03-10: Implemented testcontainers integration for API tests — all tasks complete
- 2026-03-10: Code review fixes — 6 issues resolved (build hygiene, error handling, timeout, docs)

### File List

**New files:**
- `apps/api/src/test/global-setup.ts`
- `apps/api/tsconfig.build.json`

**Modified files:**
- `apps/api/package.json` (added testcontainers devDependencies, updated build script to use tsconfig.build.json)
- `apps/api/vitest.config.ts` (added globalSetup configuration)
- `apps/api/src/server.test.ts` (removed hardcoded DATABASE_URL fallback)
- `package-lock.json` (updated dependency tree)
