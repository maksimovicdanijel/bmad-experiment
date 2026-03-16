---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# bmad-experiment - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for bmad-experiment, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR-1:** Users can create a todo by entering a text description (1–255 characters) and submitting it
- **FR-2:** Users can view all todos in a single list displaying text, completion status, and creation timestamp
- **FR-3:** Users can mark any active todo as complete, triggering an immediate visual change
- **FR-4:** Users can mark any completed todo as active, restoring it to active styling
- **FR-5:** Users can delete any todo (active or completed), removing it permanently from the list
- **FR-6:** All todo data (text, completion status, creation timestamp) persists across page refreshes and browser sessions
- **FR-7:** Each todo is assigned a unique identifier upon creation
- **FR-8:** When no todos exist, the UI displays an empty state with a clear prompt to create the first todo
- **FR-9:** While data is loading, the UI displays a loading indicator within 200ms of request initiation
- **FR-10:** When an operation fails, the UI displays an actionable error message with a retry option
- **FR-11:** The backend exposes a REST API supporting create, read, update, and delete operations for todos
- **FR-12:** API validates that todo text is between 1 and 255 characters, returning a descriptive error for invalid input

### NonFunctional Requirements

- **NFR-1:** Page initial load completes in under 1 second on a standard broadband connection (10 Mbps+), as measured by Largest Contentful Paint (LCP)
- **NFR-2:** API responds to all CRUD requests in under 200ms at 95th percentile under normal load (single user), as measured by server-side request timing
- **NFR-3:** UI updates reflect user actions (create, complete, delete) within 100ms of API response, as perceived by the user
- **NFR-4:** Zero data loss — all successfully acknowledged writes persist across server restarts and page refreshes, verified by persistence tests
- **NFR-5:** Application recovers from transient network errors without requiring a full page reload
- **NFR-6:** UI renders correctly and is fully interactive on viewports from 320px to 1920px wide, verified by responsive layout tests
- **NFR-7:** All interactive elements meet minimum touch target size of 44×44px on mobile viewports
- **NFR-8:** Color contrast ratios meet WCAG 2.1 AA standards (minimum 4.5:1 for text) for all UI elements
- **NFR-9:** Codebase achieves minimum 80% test coverage across unit, API contract, and end-to-end tests
- **NFR-10:** Project setup from clone to running application completes in under 10 minutes following documented instructions
- **NFR-11:** Backend architecture uses separation of concerns (routing, business logic, data access) enabling addition of authentication without modifying existing endpoint contracts

### Additional Requirements

**From Architecture:**

- **ARCH-1:** Monorepo scaffold using npm workspaces — `apps/web`, `apps/api`, `packages/shared` — must be initialised as the very first story (Epic 1 Story 1)
- **ARCH-2:** TypeScript strict mode enabled across all apps and shared packages
- **ARCH-3:** `packages/shared` owns the canonical `Todo` type and API contract types, imported as `@bmad/shared`
- **ARCH-4:** Fastify v5 REST API with `@fastify/swagger` + `@fastify/swagger-ui` for OpenAPI spec generation at `/documentation/json`
- **ARCH-5:** Drizzle ORM schema-first — `schema.ts` is the single source of truth; migrations via `drizzle-kit generate` + `drizzle-kit migrate`
- **ARCH-6:** Local dev PostgreSQL via `docker-compose.yml`; production via Neon Postgres serverless
- **ARCH-7:** React Router v7 with `@react-router/node` SSR adapter — server-side loaders call Fastify API; mutations via RR actions
- **ARCH-8:** Massimo OpenAPI client generation — `npm run generate:client` produces `apps/web/app/lib/api.client.ts` from `apps/api/openapi.json`
- **ARCH-9:** Optimistic UI using `useFetcher` + React 19's `useOptimistic` hook — instant state updates with automatic revert on error
- **ARCH-10:** Chakra UI v3 with Charcoal Focus dark theme (`defineConfig` extension) — dark mode only, no toggle
- **ARCH-11:** `prefers-reduced-motion` respected via Chakra's built-in animation handling
- **ARCH-12:** Vitest for all unit and contract tests (FE + BE); `@fastify/inject` for contract tests without a running server
- **ARCH-13:** Playwright (Chromium/Firefox/WebKit) for E2E tests in `apps/web/e2e/`
- **ARCH-14:** Multi-stage Dockerfiles for both apps (`build → node:alpine` for web SSR; `tsc build → node:alpine` for API)
- **ARCH-15:** GitHub Actions CI/CD — `ci.yml` (lint, test, build, E2E), `deploy.yml` (reusable), `staging.yml` (push to main), `production.yml` (tag push)
- **ARCH-16:** Changesets for versioning — staging on every push to `main`; production triggered by Changesets git tag
- **ARCH-17:** Fly.io deployment — two apps: `bmad-experiment-web` + `bmad-experiment-api` (staging + production variants)
- **ARCH-18:** ESLint v9 flat config + Prettier + Husky + lint-staged (pre-commit hooks)
- **ARCH-19:** TDD mandatory (Red → Green → Refactor) for all code in `apps/web` and `apps/api` — no implementation without a failing test first
- **ARCH-20:** Backend feature organisation by domain: `src/todos/` containing `todos.routes.ts`, `todos.service.ts`, `todos.queries.ts`, `todos.schema.ts`, `todos.routes.test.ts`
- **ARCH-21:** API response envelope: `{ data: T }` for success, `{ error: { code, message } }` for errors; `204 No Content` for deletes

**From UX Design:**

- **UX-1:** Task input field immediately visible and focused on page load — no navigation required to create a task
- **UX-2:** Task submission via Enter key or dedicated add button
- **UX-3:** Visual distinction between active and completed tasks — strikethrough text + dimmed color on completed items
- **UX-4:** Empty state displays clear call-to-action inviting first task creation
- **UX-5:** Loading indicator appears within 200ms of request initiation (CSS `animation-delay`, not JS timer)
- **UX-6:** Error state displays actionable message with retry option — inline display, not modal
- **UX-7:** Micro-interactions/animations for task state transitions (mark complete/reactivate, delete)
- **UX-8:** Touch targets minimum 44×44px on mobile viewports (NFR-7 reinforced in UX spec)
- **UX-9:** Responsive layout — single-column stack on mobile, comfortable max-width container on desktop
- **UX-10:** Creation timestamp displayed per task item (relative or formatted)
- **UX-11:** Dark mode only — Charcoal Focus theme; no light/dark toggle in MVP

### FR Coverage Map

| FR    | Epic        | Description                                                                     |
| ----- | ----------- | ------------------------------------------------------------------------------- |
| FR-1  | Epic 2      | Create todo — `POST /todos`, `TaskInput` component, create action               |
| FR-2  | Epic 2      | View all todos — `GET /todos`, RR loader, `TaskItem` list render                |
| FR-3  | Epic 3      | Mark complete — `PATCH /todos/:id`, `TaskItem` checkbox, toggle action          |
| FR-4  | Epic 3      | Reactivate todo — same PATCH endpoint, same toggle action                       |
| FR-5  | Epic 3      | Delete todo — `DELETE /todos/:id`, `TaskItem` delete button, delete action      |
| FR-6  | Epic 2      | Persistence — Drizzle + Neon writes; verified in contract + E2E tests           |
| FR-7  | Epic 2      | Unique ID — UUID v4 assigned at creation in `todos.queries.ts`                  |
| FR-8  | Epic 2      | Empty state — `EmptyState` component, conditional render in loader data         |
| FR-9  | Epic 2      | Loading indicator — CSS `animation-delay` on `TaskInput` submitting state       |
| FR-10 | Epic 2      | Error state — `ErrorBar` component, action `return { error: ... }`              |
| FR-11 | Epics 2 & 3 | REST API — `GET` + `POST` in Epic 2; `PATCH` + `DELETE` in Epic 3               |
| FR-12 | Epic 2      | Validation — Zod schema in `todos.schema.ts`, shared with client pre-validation |

## Epic List

### Epic 1: Monorepo Foundation & Production-Ready Skeleton

Establish the complete project scaffold — npm workspaces monorepo, shared types package (`@bmad/shared`), Fastify API skeleton with OpenAPI + Drizzle wired up, React Router v7 SSR app skeleton, Chakra UI v3 dark theme, ESLint/Prettier/Husky, Vitest + Playwright test infrastructure, multi-stage Dockerfiles, and local PostgreSQL via docker-compose. The repo is runnable locally with `npm run dev`, all tests pass (even if there's nothing to test yet), and CI passes on every commit — with zero user-facing features yet.
**FRs covered:** None directly (enables all)
**NFRs covered:** NFR-9 (test infra), NFR-10 (setup < 10 min), NFR-11 (separation of concerns)
**ARCH covered:** ARCH-1 through ARCH-20

### Epic 2: View & Capture Todos

Users can open the application, immediately see a focused task input field, type a todo and submit it with Enter or the add button, and see it appear in the list instantly. The list shows all todos with their text and creation timestamps. If no todos exist, a clear empty-state prompt invites the first entry. Loading indicators appear within 200ms. Errors display inline with a retry option. All data persists across refreshes and sessions. All NFR performance, responsive layout, touch targets, and accessibility requirements are met. Includes a tech-debt story (2.4) to reorganise the API into a feature-based directory structure with per-handler files before adding more endpoints.
**FRs covered:** FR-1, FR-2, FR-6, FR-7, FR-8, FR-9, FR-10, FR-11, FR-12
**NFRs covered:** NFR-1, NFR-2, NFR-3, NFR-4, NFR-5, NFR-6, NFR-7, NFR-8, NFR-9, NFR-11

### Epic 3: Manage Todo Lifecycle

Users can mark any todo as complete (immediate strikethrough + dimmed styling via optimistic UI), reactivate a completed todo if they change their mind, and permanently delete any todo — all with automatic revert and inline error messaging on failure. The full PATCH and DELETE endpoints are live and contract-tested. E2E tests cover all 6 user journeys end-to-end.
**FRs covered:** FR-3, FR-4, FR-5
**NFRs covered:** NFR-3, NFR-4, NFR-5, NFR-9

### Epic 4: CI/CD Pipeline & Production Deployment

The GitHub Actions CI pipeline (lint → unit tests → contract tests → build → Playwright E2E) runs on every branch and PR. Reusable deploy workflows push to staging on every merge to `main` and to production on Changesets-generated version tags. Neon staging and production branches are provisioned, Fly.io staging and production apps are live, and `DATABASE_URL` secrets are configured. The full staging → production promotion flow is verified end-to-end.
**FRs covered:** None directly (makes all FRs production-accessible)
**NFRs covered:** NFR-10 (deploy in single command)
**ARCH covered:** ARCH-15, ARCH-16, ARCH-17

---

## Epic 1: Monorepo Foundation & Production-Ready Skeleton

Establish the complete project scaffold — npm workspaces monorepo, shared types package (`@bmad/shared`), Fastify API skeleton with OpenAPI + Drizzle wired up, React Router v7 SSR app skeleton, Chakra UI v3 dark theme, ESLint/Prettier/Husky, Vitest + Playwright test infrastructure, multi-stage Dockerfiles, and local PostgreSQL via docker-compose. The repo is runnable locally with `npm run dev`, all tests pass, and CI passes on every commit — with zero user-facing features yet.

### Story 1.1: Initialise Monorepo Scaffold

As a **developer**,
I want a fully configured npm workspaces monorepo with shared types package, TypeScript strict mode, ESLint v9, Prettier, and Husky pre-commit hooks,
So that all subsequent development follows consistent conventions from the very first commit.

**Acceptance Criteria:**

**Given** the repo is cloned,
**When** `npm install` is run from the root,
**Then** all workspace dependencies install without errors and `node_modules` is correctly hoisted

**Given** the monorepo is set up,
**When** `npm run lint` is run from the root,
**Then** ESLint v9 flat config (`eslint.config.js`) runs across all workspaces with zero errors

**Given** a file is staged for commit,
**When** `git commit` is executed,
**Then** Husky pre-commit hook runs `lint-staged`, linting and formatting only the staged files, and blocks the commit on any errors

**Given** `packages/shared` is configured with `name: "@bmad/shared"`,
**When** imported as `@bmad/shared` in `apps/web` or `apps/api`,
**Then** TypeScript resolves the module correctly with full type information

**Given** `tsconfig.base.json` exists at root with `strict: true`,
**When** `apps/web`, `apps/api`, and `packages/shared` each extend it,
**Then** `tsc --noEmit` passes across all workspaces with strict mode enforced

**Given** `.prettierrc` is configured at root (single quotes, semi, 2-space indent, trailing commas),
**When** `prettier --check .` is run,
**Then** all files in the repo conform to the format rules

### Story 1.2: Scaffold Fastify API with Drizzle ORM

As a **developer**,
I want a runnable Fastify v5 API server with Drizzle ORM connected to a local PostgreSQL database, all recommended security and infrastructure plugins registered in correct order, and the full domain directory structure in place,
So that route implementation can begin immediately in Epic 2 without any further infrastructure setup.

**Acceptance Criteria:**

**Given** `docker compose up -d postgres` has been run,
**When** `npm run dev -w apps/api` is executed,
**Then** the Fastify server starts on port 3000 and logs a ready message with no errors

**Given** the API is running,
**When** `GET /documentation/json` is called,
**Then** it returns a valid OpenAPI 3.0 JSON document (served by `@fastify/swagger`)

**Given** `drizzle.config.ts` points at the local PostgreSQL instance,
**When** `npm run db:migrate -w apps/api` is run,
**Then** Drizzle applies all pending migrations creating the `todos` table without errors

**Given** the `todos` Drizzle schema defines `id` (UUID v4), `text` (varchar 255), `isCompleted` (boolean), `createdAt` (timestamp),
**When** `tsc --noEmit` is run in `apps/api`,
**Then** it compiles with zero TypeScript errors

**Given** the domain directory structure `src/todos/` exists with stub files (`todos.routes.ts`, `todos.service.ts`, `todos.queries.ts`, `todos.schema.ts`),
**When** `server.ts` registers `todosRoutes` as a Fastify plugin with prefix `/todos`,
**Then** the server starts and the plugin registers without errors

**Given** `@fastify/env` is registered first in `server.ts` with a schema requiring `DATABASE_URL`,
**When** the server starts without `DATABASE_URL` set,
**Then** it exits immediately with a clear validation error message instead of crashing on first DB call

**Given** `@fastify/helmet` is registered in `server.ts` after `@fastify/env`,
**When** any API endpoint is called,
**Then** the response includes secure HTTP headers (including `X-Frame-Options`, `X-Content-Type-Options`, and a `Content-Security-Policy`)

**Given** `@fastify/rate-limit` is registered in `server.ts` with a limit of 1000 requests per minute per IP,
**When** a client sends more than 1000 requests within 60 seconds,
**Then** subsequent requests receive a `429 Too Many Requests` response

**Given** `@fastify/cors` is registered in `server.ts`,
**When** a request arrives with an `Origin` header matching the web app origin,
**Then** the response includes appropriate CORS headers permitting the request

**Given** all plugins are registered in the correct order (`@fastify/env` → `@fastify/helmet` → `@fastify/cors` → `@fastify/rate-limit` → `@fastify/swagger` → feature routes → `@fastify/swagger-ui`),
**When** the server starts,
**Then** all plugins initialise without encapsulation or ordering errors

### Story 1.3: Scaffold React Router v7 SSR Web App with Chakra UI

As a **developer**,
I want a runnable React Router v7 SSR app with Chakra UI v3 dark theme, the Massimo client generation script wired up, and a root error boundary,
So that frontend component implementation can begin immediately in Epic 2 without further tooling setup.

**Acceptance Criteria:**

**Given** the API is running,
**When** `npm run dev -w apps/web` is executed,
**Then** the RR v7 Node dev server starts and the app loads in a browser at `localhost:5173` with no console errors

**Given** Chakra UI v3 is installed and `ChakraProvider` wraps the app root in `root.tsx`,
**When** the app renders,
**Then** the Charcoal Focus dark theme is applied, `colorMode` is forced to `dark`, and `prefers-reduced-motion` is respected via Chakra's built-in handling

**Given** `apps/api/openapi.json` has been exported from the API build,
**When** `npm run generate:client` is run from the root,
**Then** `apps/web/app/lib/api.client.ts` is generated without errors and the file type-checks cleanly

**Given** `root.tsx` exports an `ErrorBoundary` component,
**When** a route throws an unhandled error,
**Then** the `ErrorBoundary` renders an error message instead of a blank screen or crash

**Given** `react-router.config.ts` is configured with the `@react-router/node` adapter,
**When** `npm run build -w apps/web` is run,
**Then** it produces a Node.js server bundle without TypeScript or build errors

### Story 1.4: Configure Test Infrastructure

As a **developer**,
I want Vitest configured for both `apps/api` and `apps/web`, and Playwright configured in `apps/web/e2e/`, with root-level `npm run test` working across all workspaces,
So that TDD (Red → Green → Refactor) can be practised from the first story of Epic 2.

**Acceptance Criteria:**

**Given** Vitest is configured in `apps/api`,
**When** `npm run test -w apps/api` is run,
**Then** it discovers and runs all `*.test.ts` files in `src/` and reports results without errors

**Given** Vitest is configured in `apps/web`,
**When** `npm run test -w apps/web` is run,
**Then** it discovers and runs all `*.test.tsx` files in `app/` and reports results without errors

**Given** `npm run test` is run from the workspace root,
**When** tests exist in any workspace,
**Then** all workspace test suites run and results are aggregated

**Given** `apps/web/e2e/playwright.config.ts` is configured pointing at the local web server,
**When** `npx playwright test --list` is run,
**Then** it lists any discovered spec files without configuration errors

**Given** a stub contract test exists at `apps/api/src/todos/todos.routes.test.ts`,
**When** the API test suite runs,
**Then** the stub test file is discovered and passes (even if it contains only a placeholder `it.todo()`)

### Story 1.5: Containerise Applications

As a **developer**,
I want multi-stage Dockerfiles for both apps and a `docker-compose.yml` for local PostgreSQL, with `.env.example` documenting all required environment variables,
So that the app can be built as containers and any developer can be running locally within 10 minutes of cloning (NFR-10).

**Acceptance Criteria:**

**Given** `docker-compose.yml` at the repo root defines a `postgres` service,
**When** `docker compose up -d postgres` is run,
**Then** a PostgreSQL 16 container starts on port 5432 with a named volume and a healthcheck

**Given** `apps/api/Dockerfile` uses a multi-stage build (TypeScript compile → `node:alpine`),
**When** `docker build -t bmad-api apps/api` is run,
**Then** the image builds successfully and the final image contains only the compiled `dist/` output

**Given** `apps/web/Dockerfile` uses a multi-stage build (RR build → `node:alpine`),
**When** `docker build -t bmad-web apps/web` is run,
**Then** the image builds successfully and the final image runs the Node.js SSR server

**Given** `.env.example` at the root documents `DATABASE_URL` and all other required variables,
**When** a developer copies `.env.example` to `.env` and fills in the values,
**Then** `npm run dev` starts both apps successfully without additional configuration

**Given** the complete setup instructions are documented in `README.md`,
**When** a developer follows them from a fresh clone,
**Then** the app is running locally in under 10 minutes (NFR-10)

### Story 1.6: Configure Testcontainers for API Tests

As a **developer**,
I want API tests to automatically boot an ephemeral PostgreSQL container via testcontainers so that all contract and integration tests run against a real database with zero manual setup,
So that tests are fully deterministic, require no external `docker compose up` step, and the DB layer is never mocked.

**Acceptance Criteria:**

**Given** `testcontainers` and `@testcontainers/postgresql` are installed as devDependencies in `apps/api`,
**When** the `package.json` is inspected,
**Then** both packages are listed under `devDependencies`

**Given** `vitest.config.ts` in `apps/api` references a `globalSetup` file,
**When** `npm run test -w apps/api` is executed without any running PostgreSQL container,
**Then** testcontainers boots a PostgreSQL container, Drizzle migrations run against it, `DATABASE_URL` is set in `process.env`, all tests execute against the ephemeral database, and the container is torn down after tests complete

**Given** all existing tests in `server.test.ts` remain unchanged (except removing the hardcoded `DATABASE_URL` fallback),
**When** `npm run test -w apps/api` is run,
**Then** all existing tests pass as before

**Given** the testcontainers setup is complete,
**When** `npm run test` is run from the workspace root,
**Then** API tests pass without requiring `docker compose up -d postgres` first

---

## Epic 2: View & Capture Todos

Users can open the application, immediately see a focused task input field, type a todo and submit it with Enter or the add button, and see it appear in the list instantly. The list shows all todos with their text and creation timestamps. If no todos exist, a clear empty-state prompt invites the first entry. Loading indicators appear within 200ms. Errors display inline with a retry option. All data persists across refreshes and sessions. All NFR performance, responsive layout, touch targets, and accessibility requirements are met.

### Story 2.1: GET /todos API Endpoint

As a **developer**,
I want a `GET /todos` endpoint that returns all todos in the `{ data: Todo[] }` envelope,
So that the frontend loader has a reliable, contract-tested data source to render the todo list.

**Acceptance Criteria:**

**Given** a contract test exists in `todos.routes.test.ts` describing the expected response shape (written before the route handler),
**When** the test is run before implementation,
**Then** it fails for the right reason (route not found)

**Given** the route handler is implemented and the database is empty,
**When** `GET /todos` is called,
**Then** it returns `200` with `{ data: [] }`

**Given** todos exist in the database,
**When** `GET /todos` is called,
**Then** it returns `200` with `{ data: Todo[] }` ordered by `createdAt` descending, with all fields (`id`, `text`, `isCompleted`, `createdAt`) present as camelCase

**Given** an unexpected server error occurs,
**When** `GET /todos` is called,
**Then** the global error handler returns `500` with `{ error: { code: 'INTERNAL_ERROR', message: '...' } }` and no stack trace is exposed

**Given** the route is implemented following architecture boundaries,
**When** the code is reviewed,
**Then** `todos.routes.ts` delegates to `todos.service.ts`, which delegates to `todos.queries.ts` — no Drizzle imports in service, no business logic in routes

**Given** the endpoint is under normal single-user load,
**When** the response time is measured server-side,
**Then** it responds in under 200ms at p95 (NFR-2)

### Story 2.2: Todo List Page — Loader, Layout & Empty State

As a **user**,
I want to open the app and immediately see my todos (or a clear empty-state prompt if none exist), with the page loading in under 1 second,
So that I can orient myself and start capturing tasks without any navigation or setup.

**Acceptance Criteria:**

**Given** a component test for `EmptyState` is written before the component is implemented,
**When** the test is run before implementation,
**Then** it fails for the right reason (component not found)

**Given** no todos exist in the database,
**When** the page loads,
**Then** the `EmptyState` component renders with a clear call-to-action prompt inviting the first task entry (UX-4)

**Given** todos exist in the database,
**When** the page loads,
**Then** the RR loader fetches them via `api.client.ts` calling `GET /todos`, and the list renders each todo with its text and formatted `createdAt` timestamp (FR-2, UX-10)

**Given** the page renders,
**When** measured via Largest Contentful Paint,
**Then** the page load completes in under 1 second on standard broadband (NFR-1)

**Given** the page renders on a 320px wide viewport,
**When** the layout is inspected,
**Then** all content is visible, scrollable, and fully interactive without horizontal overflow (NFR-6)

**Given** the page renders on a 1920px wide viewport,
**When** the layout is inspected,
**Then** content is constrained to a comfortable max-width container and remains centred

**Given** all text and interactive elements are rendered,
**When** colour contrast is measured,
**Then** all text meets WCAG 2.1 AA minimum contrast ratio of 4.5:1 (NFR-8)

**Given** Chakra UI tokens are used throughout,
**When** the code is reviewed,
**Then** no hardcoded hex values, font sizes, or spacing values appear — all use Chakra theme tokens

### Story 2.3: Playwright E2E — View Todos Journey

As a **developer**,
I want Playwright E2E tests covering UJ-2 (returning user views todos),
So that the view slice is backed by automated end-to-end evidence running in CI.

**Acceptance Criteria:**

**Given** E2E test stubs for UJ-2 are written in `apps/web/e2e/todos.spec.ts` before the full stack is wired,
**When** the tests are run against a clean environment,
**Then** they fail for the right reason (no content yet) — TDD applies to E2E

**Given** both apps and the database are running via Docker,
**When** the Playwright suite runs against UJ-2 (returning user),
**Then** the test navigates to the app and asserts all previously seeded todos are visible with correct text and visual styling

**Given** no todos exist in the database,
**When** the Playwright suite runs,
**Then** the test asserts the empty state is displayed with a clear call-to-action prompt

**Given** a todo exists in the database,
**When** the page is reloaded,
**Then** the E2E test asserts the todo is still present (data persistence — NFR-4)

**Given** the E2E suite runs in CI,
**When** the GitHub Actions `ci.yml` workflow executes,
**Then** all UJ-2 tests pass in Chromium with zero flakes

### Story 2.4: Reorganise API into Feature-Based Directory Structure

As a **developer**,
I want the API source code reorganised from `src/todos/` into `src/features/todos/` with individual handler files under a `handlers/` sub-directory and the `todos.` filename prefix removed,
So that each feature is self-contained, each HTTP verb has its own file for independent modification, and the codebase scales cleanly as new features are added.

**Acceptance Criteria:**

**Given** the current directory structure has `src/todos/todos.routes.ts`, `todos.service.ts`, `todos.queries.ts`, `todos.schema.ts`, and `todos.routes.test.ts`,
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

**Given** `handlers/get.route.ts` exports a single Fastify route registration function for `GET /`,
**When** `routes.ts` is inspected,
**Then** it imports the handler and registers it as a Fastify plugin — acting as a barrel/aggregator for all current and future handlers

**Given** `server.ts` currently imports `./todos/todos.routes.js`,
**When** the reorganisation is complete,
**Then** `server.ts` imports `./features/todos/routes.js` instead

**Given** all relative imports within the feature files are updated (e.g. `../db/index.js` → `../../db/index.js`),
**When** `tsc --noEmit` is run in `apps/api`,
**Then** it compiles with zero TypeScript errors

**Given** no functional changes are made (only file moves, renames, and import path updates),
**When** `npm run test -w apps/api` is run,
**Then** all existing tests pass with zero failures and zero test file modifications

**Given** `npm run lint` is run from the workspace root,
**When** the linter evaluates the reorganised files,
**Then** it reports zero errors

**Given** a new feature needs to be added in the future (e.g. `users`),
**When** a developer inspects the `src/features/` directory,
**Then** the pattern is immediately obvious: `src/features/users/handlers/`, `queries.ts`, `service.ts`, `schema.ts`, `routes.ts`

**Given** the OpenAPI spec is re-exported after the reorganisation,
**When** `openapi.json` is compared to the pre-reorganisation version,
**Then** the spec is identical — no endpoint paths, schemas, or response shapes have changed

**Note:** After this story, all subsequent API handlers (POST in story 2.5, PATCH/DELETE in Epic 3) are written directly into the `handlers/` directory — no further refactoring needed.

### Story 2.5: POST /todos API Endpoint

As a **developer**,
I want a `POST /todos` endpoint that creates a todo and returns `{ data: Todo }`,
So that the frontend create action has a validated, contract-tested write path.

**Acceptance Criteria:**

**Given** a contract test exists in `todos.routes.test.ts` for the create endpoint (written before the route handler),
**When** the test is run before implementation,
**Then** it fails for the right reason (route not found)

**Given** a valid request body `{ text: "Buy milk" }` is sent,
**When** `POST /todos` is called,
**Then** it returns `201` with `{ data: Todo }` where `id` is a UUID v4, `createdAt` is an ISO 8601 string, `isCompleted` is `false`, and `text` matches the input

**Given** a request body with `text` of 0 characters (empty string) is sent,
**When** `POST /todos` is called,
**Then** it returns `400` with `{ error: { code: 'VALIDATION_ERROR', message: 'text must be between 1 and 255 characters' } }`

**Given** a request body with `text` exceeding 255 characters is sent,
**When** `POST /todos` is called,
**Then** it returns `400` with `{ error: { code: 'VALIDATION_ERROR', message: 'text must be between 1 and 255 characters' } }`

**Given** a todo is successfully created,
**When** `GET /todos` is called immediately after,
**Then** the new todo appears in the list (data persists — NFR-4)

**Given** the route is implemented following architecture boundaries,
**When** the code is reviewed,
**Then** `todos.routes.ts` delegates to `todos.service.ts`, which delegates to `todos.queries.ts` — UUID generation happens in the service layer, not the route

### Story 2.6: Create Todo — TaskInput Component & Action

As a **user**,
I want to type a task into a focused input field and submit it with Enter or a button, seeing it appear in my list immediately,
So that I can capture a task in under 2 seconds with zero friction.

**Acceptance Criteria:**

**Given** a component test for `TaskInput` is written before the component is implemented,
**When** the test is run before implementation,
**Then** it fails for the right reason (component not found)

**Given** the page loads,
**When** the DOM is ready,
**Then** the `TaskInput` input field is auto-focused and ready to receive keyboard input without any user click (UX-1)

**Given** a user types a task and presses Enter,
**When** the submit event fires,
**Then** the RR action is triggered, `useOptimistic` adds the todo to the list immediately before the API responds, and the input field is cleared (UX-2, ARCH-9)

**Given** a user types a task and clicks the add button,
**When** the click event fires,
**Then** the same action and optimistic update behaviour occurs as with Enter

**Given** the API call succeeds,
**When** the action completes,
**Then** the RR loader revalidates and the real todo (with server-assigned `id` and `createdAt`) replaces the optimistic entry

**Given** the API call fails,
**When** the action returns an error,
**Then** the optimistic todo is automatically removed from the list and an error message is displayed in `ErrorBar`

**Given** a user submits text exceeding 255 characters,
**When** client-side pre-validation runs on submit,
**Then** the error `'text must be between 1 and 255 characters'` is displayed inline before any API call is made (FR-12)

**Given** the `TaskInput` submit button renders on a mobile viewport,
**When** its dimensions are measured,
**Then** the touch target is at least 44×44px (NFR-7)

### Story 2.7: Playwright E2E — Create Todo Journey

As a **developer**,
I want Playwright E2E tests covering UJ-1 (first-time user creates a todo),
So that the create slice is backed by automated end-to-end evidence running in CI.

**Acceptance Criteria:**

**Given** E2E test stubs for UJ-1 are written in `apps/web/e2e/todos.spec.ts` before the full stack is wired,
**When** the tests are run against a clean environment,
**Then** they fail for the right reason (no content yet) — TDD applies to E2E

**Given** both apps and the database are running via Docker,
**When** the Playwright suite runs against UJ-1 (first-time user),
**Then** the test navigates to the app, sees the empty state, types a task, presses Enter, and asserts the todo appears in the list

**Given** a todo is created,
**When** the page is reloaded,
**Then** the E2E test asserts the todo is still present (data persistence — NFR-4)

**Given** the E2E suite runs in CI,
**When** the GitHub Actions `ci.yml` workflow executes,
**Then** all UJ-1 tests pass in Chromium with zero flakes

### Story 2.8: Loading & Error States

As a **user**,
I want to see a loading indicator within 200ms when a request is in-flight and an actionable error message with a retry option when something goes wrong,
So that I always know the app is working and can recover from failures without a full page reload.

**Acceptance Criteria:**

**Given** a component test for `ErrorBar` is written before the component is implemented,
**When** the test is run before implementation,
**Then** it fails for the right reason (component not found)

**Given** a mutation action (create) is in-flight,
**When** `fetcher.state !== 'idle'`,
**Then** a loading indicator becomes visible after a CSS `animation-delay` of 200ms — no JS `setTimeout` is used (FR-9, UX-5)

**Given** a mutation action completes,
**When** `fetcher.state === 'idle'`,
**Then** the loading indicator disappears and no loading state is held in component local state

**Given** a network failure occurs during a create action,
**When** the action catches the error,
**Then** it returns `{ error: 'Network error. Please try again.' }` and the `ErrorBar` renders with the message and a retry button (FR-10, UX-6)

**Given** a server error (5xx) is returned during a create action,
**When** the action processes the response,
**Then** `ErrorBar` renders an actionable error message with a retry option

**Given** the user clicks retry,
**When** the action is resubmitted,
**Then** the same create flow executes from scratch and succeeds if the server is available

**Given** an error occurs,
**When** `ErrorBar` renders,
**Then** no full page reload is triggered — the app recovers in-place (NFR-5)

---

## Epic 3: Manage Todo Lifecycle

Users can mark any todo as complete (with immediate strikethrough + dimmed styling via optimistic UI), reactivate a completed todo if they change their mind, and permanently delete any todo — all with automatic revert and inline error messaging on failure. The full PATCH and DELETE endpoints are live and contract-tested. E2E tests cover all 6 user journeys end-to-end.

### Story 3.1: PATCH /todos/:id API Endpoint

As a **developer**,
I want a `PATCH /todos/:id` endpoint that updates a todo's `isCompleted` status (or `text`) and returns `{ data: Todo }`,
So that the frontend toggle action has a validated, contract-tested write path.

**Acceptance Criteria:**

**Given** a contract test exists in `todos.routes.test.ts` for the PATCH endpoint (written before the route handler),
**When** the test is run before implementation,
**Then** it fails for the right reason (route not found)

**Given** a valid request body `{ completed: true }` is sent for an existing todo,
**When** `PATCH /todos/:id` is called,
**Then** it returns `200` with `{ data: Todo }` where `isCompleted` is `true` and all other fields are unchanged

**Given** a valid request body `{ completed: false }` is sent for a completed todo,
**When** `PATCH /todos/:id` is called,
**Then** it returns `200` with `{ data: Todo }` where `isCompleted` is `false` (reactivation)

**Given** a request is sent for an `id` that does not exist in the database,
**When** `PATCH /todos/:id` is called,
**Then** it returns `404` with `{ error: { code: 'NOT_FOUND', message: 'Todo not found' } }`

**Given** a request body with `text` exceeding 255 characters is sent,
**When** `PATCH /todos/:id` is called,
**Then** it returns `400` with `{ error: { code: 'VALIDATION_ERROR', message: 'text must be between 1 and 255 characters' } }`

**Given** a todo is successfully updated,
**When** `GET /todos` is called immediately after,
**Then** the updated todo reflects the new `isCompleted` value (data persists — NFR-4)

**Given** the route is implemented following architecture boundaries,
**When** the code is reviewed,
**Then** `todos.routes.ts` delegates to `todos.service.ts`, which delegates to `todos.queries.ts` — no Drizzle imports in service, no business logic in routes

### Story 3.2: DELETE /todos/:id API Endpoint

As a **developer**,
I want a `DELETE /todos/:id` endpoint that permanently removes a todo and returns `204 No Content`,
So that the frontend delete action has a contract-tested, permanent-deletion path.

**Acceptance Criteria:**

**Given** a contract test exists in `todos.routes.test.ts` for the DELETE endpoint (written before the route handler),
**When** the test is run before implementation,
**Then** it fails for the right reason (route not found)

**Given** a request is sent for an existing todo,
**When** `DELETE /todos/:id` is called,
**Then** it returns `204` with no response body

**Given** a request is sent for an `id` that does not exist,
**When** `DELETE /todos/:id` is called,
**Then** it returns `404` with `{ error: { code: 'NOT_FOUND', message: 'Todo not found' } }`

**Given** a todo is successfully deleted,
**When** `GET /todos` is called immediately after,
**Then** the deleted todo no longer appears in the response (data permanently removed — NFR-4)

**Given** the route is implemented following architecture boundaries,
**When** the code is reviewed,
**Then** `todos.routes.ts` delegates to `todos.service.ts`, which delegates to `todos.queries.ts` — service/queries boundary respected

### Story 3.3: TaskItem Component — Complete & Delete Actions

As a **user**,
I want to mark a todo as complete (seeing it strike through and dim immediately), reactivate a completed todo, and delete any todo — all with instant optimistic feedback and automatic revert on failure,
So that managing my task lifecycle feels as fast and reliable as creating tasks.

**Acceptance Criteria:**

**Given** a component test for `TaskItem` is written before the component is implemented,
**When** the test is run before implementation,
**Then** it fails for the right reason (component not found)

**Given** a user clicks the checkbox on an active todo,
**When** the toggle action fires,
**Then** `useOptimistic` immediately applies strikethrough text and dimmed styling to the todo before the API responds (UX-3, UX-7)

**Given** the `PATCH /todos/:id` call succeeds,
**When** the action completes,
**Then** the RR loader revalidates and the server state confirms the optimistic update

**Given** the `PATCH /todos/:id` call fails,
**When** the action returns an error,
**Then** the optimistic style change is automatically reverted and `ErrorBar` displays an actionable error message with a retry option

**Given** a user clicks the checkbox on a completed todo,
**When** the toggle action fires,
**Then** `useOptimistic` immediately restores active styling and the PATCH action sets `completed: false` (FR-4)

**Given** a user clicks the delete button on any todo,
**When** the delete action fires,
**Then** `useOptimistic` immediately removes the todo from the list before the API responds

**Given** the `DELETE /todos/:id` call fails,
**When** the action returns an error,
**Then** the todo is automatically restored to the list and `ErrorBar` displays an actionable error message

**Given** the `TaskItem` checkbox and delete button render on a mobile viewport,
**When** their dimensions are measured,
**Then** both touch targets are at least 44×44px (NFR-7)

**Given** `fetcher.state !== 'idle'` during a mutation,
**When** the component renders,
**Then** a loading indicator is shown using CSS `animation-delay: 200ms` — no local state, no JS timer

**Given** Chakra UI tokens are used throughout `TaskItem`,
**When** the code is reviewed,
**Then** no hardcoded hex values, font sizes, or spacing values appear — completed state uses Chakra `textDecoration` and `opacity` tokens only

### Story 3.4: Playwright E2E — Full User Journey Coverage

As a **developer**,
I want Playwright E2E tests covering UJ-3 (complete a task), UJ-4 (delete a task), UJ-5 (error recovery), and UJ-6 (reactivate a completed task),
So that all 6 user journeys defined in the PRD are covered by automated end-to-end tests running in CI.

**Acceptance Criteria:**

**Given** E2E test stubs for UJ-3 through UJ-6 are written in `todos.spec.ts` before full wiring is verified (TDD),
**When** the tests are run against an incomplete implementation,
**Then** they fail for the right reason

**Given** a todo exists and the user clicks its checkbox,
**When** the Playwright UJ-3 test runs,
**Then** the test asserts strikethrough styling appears immediately, and the completed state persists after page reload

**Given** a todo exists and the user clicks its delete button,
**When** the Playwright UJ-4 test runs,
**Then** the test asserts the todo is removed from the list immediately, and is absent after page reload

**Given** a completed todo exists and the user clicks its checkbox again,
**When** the Playwright UJ-6 test runs,
**Then** the test asserts active styling is restored immediately, and the active state persists after page reload

**Given** a simulated network failure occurs during a mutation,
**When** the Playwright UJ-5 test runs,
**Then** the test asserts `ErrorBar` renders with an actionable message, the app does not fully reload, and the retry action succeeds when the network is restored

**Given** the complete E2E suite (all 6 journeys) runs in CI,
**When** the GitHub Actions `ci.yml` workflow executes,
**Then** all tests pass in Chromium against both containerised apps with zero flakes, achieving ≥ 80% overall test coverage (NFR-9)

---

## Epic 4: CI/CD Pipeline & Production Deployment

### Story 4.1: GitHub Actions CI Pipeline

As a **developer**,
I want a `ci.yml` GitHub Actions workflow that runs lint, unit tests, contract tests, build, and Playwright E2E on every branch push and pull request,
So that every code change is automatically validated before it can be merged.

**Acceptance Criteria:**

**Given** `.github/workflows/ci.yml` exists and is triggered on `push` to all branches and `pull_request`,
**When** a commit is pushed,
**Then** the workflow starts automatically

**Given** the CI workflow runs,
**When** the lint step executes,
**Then** `npm run lint` exits 0 for both `apps/web` and `apps/api`

**Given** the CI workflow runs,
**When** the unit test step executes,
**Then** `npm run test -w apps/api` runs all Vitest unit and service tests and exits 0

**Given** the CI workflow runs,
**When** the contract test step executes,
**Then** `todos.routes.test.ts` runs via `@fastify/inject` and all assertions pass

**Given** the CI workflow runs,
**When** the build step executes,
**Then** `npm run build` succeeds for both `apps/web` and `apps/api` with no TypeScript errors

**Given** the CI workflow runs,
**When** the Playwright E2E step executes,
**Then** `docker compose up --build` starts both app containers and the Postgres container, all 6 user journey tests pass in Chromium, and containers are torn down after

**Given** any single step in the CI workflow fails,
**When** the failure occurs,
**Then** subsequent steps do not run (fail-fast), and the PR/branch is marked as failing

**Given** the Playwright E2E step fails,
**When** the workflow completes,
**Then** Playwright test artifacts (trace, screenshots) are uploaded as GitHub Actions artifacts for debugging

### Story 4.2: Reusable Deploy Workflow & Staging Pipeline

As a **developer**,
I want a reusable `deploy.yml` workflow and a `staging.yml` workflow that automatically deploys to staging on every push to `main`,
So that the latest code on `main` is always running in a staging environment for validation.

**Acceptance Criteria:**

**Given** `.github/workflows/deploy.yml` exists with `on: workflow_call`,
**When** its inputs are inspected,
**Then** it accepts `web_app` (string, required) and `api_app` (string, required) inputs, and `FLY_API_TOKEN` and `DATABASE_URL` secrets

**Given** the `deploy.yml` workflow is called,
**When** it runs,
**Then** the steps execute in order: (1) `flyctl secrets set DATABASE_URL` on the API app, (2) `drizzle-kit migrate` against the target Neon branch, (3) `flyctl deploy` for `apps/api`, (4) `flyctl deploy` for `apps/web`

**Given** `.github/workflows/staging.yml` exists,
**When** its trigger is inspected,
**Then** it fires on `push: branches: [main]` and calls `deploy.yml` passing `FLY_WEB_STAGING_APP`, `FLY_API_STAGING_APP`, `FLY_API_TOKEN`, and `DATABASE_URL_STAGING` from GitHub secrets

**Given** GitHub secrets `FLY_API_TOKEN`, `FLY_WEB_STAGING_APP`, `FLY_API_STAGING_APP`, and `DATABASE_URL_STAGING` are configured in the repository,
**When** a commit is pushed to `main`,
**Then** the staging deploy workflow runs without secret-not-found errors

**Given** staging Fly.io apps (`bmad-experiment-web-staging`, `bmad-experiment-api-staging`) and a Neon staging branch are provisioned,
**When** the staging pipeline completes,
**Then** the staging API is reachable at its Fly.io URL and returns `{ data: [] }` from `GET /todos`

**Given** a code change is merged to `main`,
**When** the staging pipeline finishes,
**Then** the deployed staging build reflects the merged change

### Story 4.3: Changesets Versioning & Production Pipeline

As a **developer**,
I want Changesets configured and a `production.yml` workflow that deploys to production when a version tag is pushed,
So that production releases are gated behind an explicit versioning decision and the full staging → production promotion flow is documented and verified.

**Acceptance Criteria:**

**Given** `.changeset/config.json` is initialised in the repository root,
**When** the config is inspected,
**Then** it references the correct package(s) and the Changesets GitHub bot is configured

**Given** a feature branch containing a `.changeset/*.md` file is merged to `main`,
**When** the merge happens,
**Then** the Changesets GitHub bot opens (or updates) a "Version Packages" PR that bumps the relevant package versions and updates changelogs

**Given** `.github/workflows/production.yml` exists,
**When** its trigger is inspected,
**Then** it fires on `push: tags: ["v*"]` and calls `deploy.yml` passing `FLY_WEB_PRODUCTION_APP`, `FLY_API_PRODUCTION_APP`, `FLY_API_TOKEN`, and `DATABASE_URL_PRODUCTION` from GitHub secrets

**Given** production Fly.io apps (`bmad-experiment-web`, `bmad-experiment-api`) and a Neon production branch are provisioned,
**When** the production pipeline completes,
**Then** the production API is reachable at its Fly.io URL and returns `{ data: [] }` from `GET /todos`

**Given** GitHub secrets `FLY_WEB_PRODUCTION_APP`, `FLY_API_PRODUCTION_APP`, and `DATABASE_URL_PRODUCTION` are configured,
**When** the production deploy runs,
**Then** no secret-not-found errors occur and `flyctl deploy` exits 0 for both apps

**Given** the complete promotion flow is exercised once manually: feature branch → merge to `main` → staging deploy succeeds → "Version Packages" PR merged → Changesets tag created → production deploy triggered,
**When** the production pipeline finishes,
**Then** the production environment runs the tagged release and the end-to-end promotion flow is verified working
