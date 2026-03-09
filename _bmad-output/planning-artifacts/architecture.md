---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: "architecture"
lastStep: 8
status: "complete"
completedAt: "2026-03-09"
project_name: "bmad-experiment"
user_name: "Danijel"
date: "2026-03-09"
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (12):**

| Category         | FRs           | Architectural Implication                                                           |
| ---------------- | ------------- | ----------------------------------------------------------------------------------- |
| Task Management  | FR-1 to FR-5  | Standard CRUD — 4 REST endpoints (POST, GET, PATCH, DELETE)                         |
| Data Persistence | FR-6, FR-7    | Server-side storage with generated unique IDs; survives server restarts             |
| UI States        | FR-8 to FR-10 | Frontend state machine covering empty / loading / error; loading threshold at 200ms |
| API              | FR-11, FR-12  | REST API with input validation; descriptive error responses                         |

**Non-Functional Requirements (critical for architecture):**

- **NFR-1/2/3 (Performance):** Sub-second page load, 200ms API p95, 100ms UI response — favours a lightweight frontend bundle and simple, indexed database queries
- **NFR-4 (Reliability):** Zero data loss across restarts — database must durably persist writes before acknowledging them
- **NFR-5 (Resilience):** Network error recovery without full page reload — requires frontend error boundaries and retry logic
- **NFR-6/7/8 (Usability):** Responsive 320–1920px, 44×44px touch targets, WCAG 2.1 AA — drives component design and CSS token strategy
- **NFR-9 (Test Coverage):** ≥ 80% across unit, API contract, E2E — requires testable architecture with clear separation of concerns
- **NFR-11 (Extensibility):** Auth-ready separation of concerns — backend must layer routing, business logic, and data access independently

**Scale & Complexity:**

- Primary domain: Full-stack web application (SPA + REST API)
- Complexity level: Low — standard CRUD, single user, no real-time, no compliance requirements
- Data model: Single entity (`Todo`: id, text, completed, createdAt)
- Estimated architectural components: ~8 (API router, service layer, data access layer, DB, frontend state store, UI component library, E2E test suite, API contract tests)

### Technical Constraints & Dependencies

- **Frontend:** Optimistic UI mandatory for all mutations; components must be API-agnostic (state/callback props only)
- **Design system:** MUI or Chakra UI with Charcoal Focus dark theme tokens (CSS custom properties)
- **Animation budget:** Max 200ms transitions; `opacity` and `transform` only; `prefers-reduced-motion` respected
- **Backend:** Single deployable unit; single-command container deployment (Docker)
- **Storage:** Durable persistence required — in-memory storage explicitly excluded
- **API contracts:** Endpoint signatures must remain stable to support future auth layer (NFR-11)

### Cross-Cutting Concerns Identified

1. **Optimistic state management** — All mutations speculate immediately; API confirms or triggers revert + ErrorBar
2. **Error handling strategy** — Network/5xx → global ErrorBar with Retry; 4xx validation → inline field error; both must preserve user context
3. **Performance budget** — API response time, bundle size, and rendering pipeline all constrained by NFR-1/2/3
4. **Accessibility** — WCAG 2.1 AA across all components; keyboard nav, ARIA live regions, focus management
5. **Test architecture** — Three test layers (unit, contract, E2E) must be independently runnable and collectively reach 80% coverage
6. **Deployability** — Single-command build + run; documented setup completable in < 10 minutes

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application — React SPA (React Router v7 framework mode) + REST API (Fastify) in a TypeScript monorepo using npm workspaces, containerised for Fly.io deployment.

### Starter Options Considered

| Option             | Rationale                                                                   | Decision                             |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------------ |
| Turborepo monorepo | Build caching + task orchestration — overkill for 2 apps                    | ❌ Rejected — unnecessary complexity |
| npm workspaces     | Native to npm, zero extra tooling, sufficient for 2 apps + 1 shared package | ✅ Selected                          |
| Nx monorepo        | More opinionated, heavier overhead                                          | ❌ Rejected — over-engineered        |

### Selected Approach: npm Workspaces Monorepo

**Rationale:** npm workspaces is built into npm v7+, requires no additional tooling, and handles everything this project needs — workspace symlinking, hoisted `node_modules`, and cross-package imports.

**Initialization Commands:**

```bash
# 1. Create monorepo root
mkdir bmad-experiment && cd bmad-experiment
npm init -y
# Add to package.json: "workspaces": ["apps/*", "packages/*"]

# 2. Scaffold React Router v7 app (framework mode)
npx create-react-router@latest apps/web

# 3. Scaffold Fastify API
mkdir -p apps/api && cd apps/api && npm init -y
npm install fastify @fastify/cors @fastify/sensible
npm install drizzle-orm @neondatabase/serverless
npm install -D typescript tsx vitest @types/node drizzle-kit

# 4. Create shared types package
mkdir -p packages/shared && cd packages/shared && npm init -y
```

**Monorepo Structure:**

```
bmad-experiment/
├── apps/
│   ├── web/                        # React Router v7 (framework mode, SPA)
│   │   ├── app/
│   │   │   ├── routes/             # File-based routing
│   │   │   ├── components/         # TaskInput, TaskItem, SectionHeader, etc.
│   │   │   ├── lib/                # API client, optimistic state hooks
│   │   │   └── root.tsx
│   │   ├── Dockerfile
│   │   ├── fly.toml
│   │   └── vite.config.ts
│   └── api/
│       ├── src/
│       │   ├── routes/             # Fastify route declarations
│       │   ├── services/           # Business logic layer
│       │   ├── db/
│       │   │   ├── schema.ts       # Drizzle schema definition
│       │   │   ├── index.ts        # Drizzle client + Neon connection
│       │   │   └── migrations/     # Generated SQL migrations
│       │   └── server.ts
│       ├── drizzle.config.ts
│       ├── Dockerfile
│       └── fly.toml
├── packages/
│   └── shared/
│       └── src/
│           └── types.ts            # Todo type, API request/response contracts
├── docker-compose.yml              # PostgreSQL only (local dev DB)
├── package.json                    # Workspace root + root scripts
└── .env.example
```

### Architectural Decisions Provided by Scaffold

**Language & Runtime:**

- TypeScript strict mode throughout — all apps and shared packages
- Node.js runtime for both web (React Router v7 Vite dev server) and API (Fastify)
- `packages/shared` owns the `Todo` type and API contract types — imported as `@bmad/shared` in both apps

**Frontend Build Tooling:**

- Vite (bundled inside React Router v7 framework mode) — fast HMR in dev, optimised static bundle for production
- React Router v7 configured with the static SPA adapter — produces a static build served by nginx in the web container; all data fetched client-side from the API

**Backend Build Tooling:**

- `tsx` for development (no compile step, native TS execution with watch mode)
- `tsc` for production build to `dist/`
- Fastify v5 — plugin-based architecture maps cleanly to routing / service / db separation required by NFR-11

**Database & ORM:**

- **Drizzle ORM** — type-safe SQL, schema-first, zero magic; `schema.ts` is the single source of truth for the `todos` table
- **Local dev:** PostgreSQL via `docker-compose.yml` — standard `pg` driver via Drizzle's `drizzle-orm/node-postgres` adapter
- **Production:** Neon Postgres (serverless) — `@neondatabase/serverless` driver via Drizzle's `drizzle-orm/neon-http` adapter; connection string injected via `DATABASE_URL` env var
- Migrations generated by `drizzle-kit generate` and applied by `drizzle-kit migrate` — plain SQL, version controlled in `src/db/migrations/`

**Testing Framework:**

- **Unit:** Vitest — unified across FE and BE
- **API Contract:** Vitest + `@fastify/inject` — Fastify's injection mechanism enables full contract tests without a running server
- **E2E:** Playwright — Chromium/Firefox/WebKit; CI-ready

**Styling:**

- **Chakra UI v3** — `ChakraProvider` wrapping the app root; component primitives map directly to UX spec components
- Charcoal Focus theme defined as a Chakra `defineConfig` theme extension — CSS custom properties surfaced via Chakra's token system
- `colorMode` forced to `dark` (no toggle in MVP)
- `prefers-reduced-motion` respected via Chakra's built-in animation handling

**Root Scripts (`package.json`):**

```json
{
  "scripts": {
    "dev": "npm run db:up && concurrently \"npm run dev -w apps/web\" \"npm run dev -w apps/api\"",
    "db:up": "docker compose up -d postgres",
    "db:down": "docker compose down",
    "db:migrate": "npm run db:migrate -w apps/api",
    "test": "npm run test -ws --if-present",
    "build": "npm run build -ws --if-present",
    "lint": "npm run lint -ws --if-present"
  }
}
```

**Containerisation:**

- `apps/web/Dockerfile` — multi-stage: Vite build → nginx static server
- `apps/api/Dockerfile` — multi-stage: tsc build → node:alpine production image
- `docker-compose.yml` — PostgreSQL only (port 5432, named volume, healthcheck); no app containers in docker-compose

**Deployment (Fly.io + Neon):**

- Two Fly.io apps deployed independently: `bmad-experiment-web` and `bmad-experiment-api`
- Each has its own `fly.toml`; deployed via `flyctl deploy` from respective app directory
- `DATABASE_URL` set as a Fly.io secret on `bmad-experiment-api` pointing to Neon connection string
- Neon provides serverless PostgreSQL — no DB infrastructure to manage on Fly.io

**Note:** Project initialisation using the commands above should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- REST API design pattern and response shape
- Frontend data loading strategy (RR loaders/actions + SSR)
- API client generation strategy (Massimo + OpenAPI)
- CI/CD pipeline and environment topology

**Important Decisions (Shape Architecture):**

- Linting and formatting configuration
- Deployment branching strategy (Changesets)

**Deferred Decisions (Post-MVP):**

- Authentication strategy (JWT vs session — deferred per NFR-11, must not require breaking API contract changes)
- Rate limiting (relevant once multi-user is introduced)
- Caching strategy (no caching needed at current scale)

---

### Data Architecture

**Already decided via starter:** Drizzle ORM + Neon (prod) + PostgreSQL docker-compose (local). No further decisions required.

---

### API & Communication Patterns

**REST Design: Minimal REST**

| Method   | Path         | Request                                  | Response           |
| -------- | ------------ | ---------------------------------------- | ------------------ |
| `GET`    | `/todos`     | —                                        | `{ data: Todo[] }` |
| `POST`   | `/todos`     | `{ text: string }`                       | `{ data: Todo }`   |
| `PATCH`  | `/todos/:id` | `{ text?: string, completed?: boolean }` | `{ data: Todo }`   |
| `DELETE` | `/todos/:id` | —                                        | `204 No Content`   |

Error envelope (all errors): `{ error: { code: string, message: string } }`

**OpenAPI Spec (required by API client generation):**

- `@fastify/swagger` + `@fastify/swagger-ui` added to API
- OpenAPI spec auto-generated from Fastify route schemas at `/documentation/json`
- Spec exported as `openapi.json` at build time for Massimo client generation
- Contract tests validate routes against the schema using Fastify's built-in schema validation

---

### Frontend Architecture

**Data Loading: React Router v7 SSR Framework Mode**

- RR v7 with `@react-router/node` adapter — web container runs a Node.js process
- Server-side loaders call Fastify API via internal network (server-to-server, no CORS on loader calls)
- Mutations via RR actions — form submissions and programmatic `fetcher.submit()` calls
- Optimistic UI pattern: `useFetcher` + React 19's `useOptimistic` hook for instant state updates with automatic revert on action error
- Web container Dockerfile: multi-stage `build → node:alpine` running the RR Node server

**API Client: Massimo (OpenAPI-generated)**

- `@fastify/swagger` exposes `/documentation/json` on the Fastify API
- Massimo generates a fully-typed client from the OpenAPI spec at build time
- Generated client lives in `apps/web/app/lib/api.client.ts` (gitignored, regenerated on `npm run generate:client`)
- Root `package.json` adds `"generate:client": "massimo generate --spec apps/api/openapi.json --output apps/web/app/lib/api.client.ts"`
- `packages/shared` still owns the canonical `Todo` type; Massimo output imports from it

**No TanStack Query** — RR loaders/actions + `useFetcher` handle all data fetching, caching, and revalidation natively.

---

### Infrastructure & Deployment

**Environment Topology:**

| Environment | Trigger                             | Fly.io Apps                                                  |
| ----------- | ----------------------------------- | ------------------------------------------------------------ |
| Staging     | Every push to `main`                | `bmad-experiment-web-staging`, `bmad-experiment-api-staging` |
| Production  | New tag created by Changesets merge | `bmad-experiment-web`, `bmad-experiment-api`                 |

**Changesets Release Flow:**

1. Feature branches merged to `main` → CI runs → staging deploy
2. Changesets bot opens "Version Packages" PR on `main`
3. Merging "Version Packages" PR → Changesets creates a git tag (e.g. `v1.0.0`)
4. Tag on `main` → production deploy workflow triggers

**GitHub Secrets (all secrets stored in GitHub):**

| Secret                    | Used by          | Purpose                                  |
| ------------------------- | ---------------- | ---------------------------------------- |
| `FLY_API_TOKEN`           | Deploy workflows | Fly.io authentication for `flyctl`       |
| `FLY_WEB_STAGING_APP`     | Deploy workflows | Fly.io app name for staging web          |
| `FLY_API_STAGING_APP`     | Deploy workflows | Fly.io app name for staging API          |
| `FLY_WEB_PRODUCTION_APP`  | Deploy workflows | Fly.io app name for production web       |
| `FLY_API_PRODUCTION_APP`  | Deploy workflows | Fly.io app name for production API       |
| `DATABASE_URL_STAGING`    | Deploy workflows | Neon staging branch connection string    |
| `DATABASE_URL_PRODUCTION` | Deploy workflows | Neon production branch connection string |

**GitHub Actions Workflow Structure:**

```
.github/workflows/
├── ci.yml                  # Runs on all branches + PRs
├── deploy.yml              # Reusable deploy workflow (called by staging + production)
├── staging.yml             # Calls deploy.yml with staging inputs, triggers on push to main
└── production.yml          # Calls deploy.yml with production inputs, triggers on tag push
```

**Reusable Deploy Workflow (`.github/workflows/deploy.yml`):**

```yaml
on:
  workflow_call:
    inputs:
      web_app: { type: string, required: true }
      api_app: { type: string, required: true }
    secrets:
      FLY_API_TOKEN: { required: true }
      DATABASE_URL: { required: true }

jobs:
  deploy:
    steps:
      - flyctl secrets set DATABASE_URL=${{ secrets.DATABASE_URL }} --app ${{ inputs.api_app }}
      - drizzle-kit migrate (against target Neon branch via DATABASE_URL)
      - flyctl deploy apps/api → ${{ inputs.api_app }}
      - flyctl deploy apps/web → ${{ inputs.web_app }}
```

**Staging Workflow (`.github/workflows/staging.yml`):**

```yaml
on: { push: { branches: [main] } }
jobs:
  deploy:
    uses: ./.github/workflows/deploy.yml
    with:
      web_app: ${{ secrets.FLY_WEB_STAGING_APP }}
      api_app: ${{ secrets.FLY_API_STAGING_APP }}
    secrets:
      FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
      DATABASE_URL: ${{ secrets.DATABASE_URL_STAGING }}
```

**Production Workflow (`.github/workflows/production.yml`):**

```yaml
on: { push: { tags: ["v*"] } }
jobs:
  deploy:
    uses: ./.github/workflows/deploy.yml
    with:
      web_app: ${{ secrets.FLY_WEB_PRODUCTION_APP }}
      api_app: ${{ secrets.FLY_API_PRODUCTION_APP }}
    secrets:
      FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
      DATABASE_URL: ${{ secrets.DATABASE_URL_PRODUCTION }}
```

**CI Workflow (`.github/workflows/ci.yml`) — all branches + PRs:**

```
→ lint
→ unit tests (Vitest, FE + BE)
→ API contract tests (@fastify/inject)
→ build (both apps)
→ Playwright E2E (docker compose up both containers + postgres)
```

**Neon Branching:**

- Production: Neon main branch (`DATABASE_URL_PRODUCTION`)
- Staging: Neon staging branch (`DATABASE_URL_STAGING`)
- Local dev: `docker-compose.yml` PostgreSQL

---

### Code Quality

**ESLint v9 (flat config) + Prettier:**

- `eslint.config.js` at monorepo root with `@typescript-eslint/recommended`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`
- `.prettierrc` at root: single quotes, semi, 2-space indent, trailing commas
- Both apps inherit root config, can extend per-workspace
- `lint-staged` + `husky` for pre-commit hooks (lint + format staged files only)

---

### Decision Impact Analysis

**Implementation Sequence (order matters):**

1. Monorepo scaffold (npm workspaces, shared package, root scripts)
2. Fastify API with OpenAPI spec (`@fastify/swagger`) and Drizzle schema
3. Massimo client generation wired to API spec
4. React Router v7 SSR app with loaders/actions consuming generated client
5. Chakra UI theme with Charcoal Focus tokens
6. Test infrastructure (Vitest, Playwright)
7. Docker multi-stage builds + docker-compose
8. GitHub Actions pipelines + Changesets config
9. Fly.io staging + production app setup

**Cross-Component Dependencies:**

- `packages/shared` must be built before `apps/web` or `apps/api` can import from it
- Massimo client generation requires Fastify API to export `openapi.json` — API must be buildable before FE client is generated
- Playwright E2E requires both containers running — CI must build both images before E2E runs
- Staging Neon branch must exist before staging deploy pipeline runs migrations

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database (Drizzle schema):**

- Tables: `snake_case` plural — `todos`
- Columns: `snake_case` — `created_at`, `is_completed`
- Primary key: always `id` (UUID v4, not serial integer)
- Drizzle table variable: `camelCase` matching table name — `const todos = pgTable('todos', ...)`

**API endpoints:**

- Plural nouns, `kebab-case` — `/todos`, `/todo-items` (not `/getTodos`)
- Path params: `:id` (not `{id}` or `:todoId`)
- Query params: `camelCase` — `?completedOnly=true`

**Code (TypeScript):**

- Files: `kebab-case` — `todo-service.ts`, `task-input.tsx`
- Components: `PascalCase` — `TaskInput`, `SectionHeader`
- Functions/variables: `camelCase` — `getTodos`, `isCompleted`
- Types/interfaces: `PascalCase` — `Todo`, `CreateTodoRequest`
- Constants: `SCREAMING_SNAKE_CASE` — `MAX_TODO_LENGTH`
- Zod schemas: `camelCase` suffixed with `Schema` — `createTodoSchema`

### Structure Patterns

**Test co-location:**

- Unit tests co-located with source: `todo-service.ts` → `todo-service.test.ts` (same directory)
- E2E tests in `apps/web/e2e/` — never co-located with components
- Contract tests co-located with routes: `todos.routes.ts` → `todos.routes.test.ts`

**Frontend component organisation — by feature:**

- `app/components/todos/TaskInput.tsx`, not `app/inputs/TaskInput.tsx`
- One component per file, filename matches component name
- Co-locate component tests with the component file

**Backend organisation — by feature:**

```
src/
└── todos/
    ├── todos.routes.ts      # Fastify plugin, route declarations only
    ├── todos.service.ts     # Business logic, pure functions, no Fastify types
    ├── todos.queries.ts     # Drizzle queries only, no business logic
    ├── todos.schema.ts      # Zod schemas + JSON schema for Fastify validation
    └── todos.routes.test.ts # Contract tests (@fastify/inject)
```

- One directory per resource/feature — `src/todos/`, `src/users/` (future)
- No top-level `routes/`, `services/`, or `db/queries/` folders
- `server.ts` at `src/` root registers all feature plugins: `app.register(todosRoutes, { prefix: '/todos' })`
- `src/db/` for Drizzle client instance (`src/db/index.ts`) and migrations only — infrastructure, not features

### Format Patterns

**API response shape:**

```ts
// Success (with body)
{ data: Todo }
{ data: Todo[] }

// Success (no body)
HTTP 204 — no response body

// Error (all errors)
{ error: { code: string, message: string } }
// e.g. { error: { code: 'VALIDATION_ERROR', message: 'text must be between 1 and 255 characters' } }
```

**Error codes:** `SCREAMING_SNAKE_CASE` — `NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_ERROR`

**Dates:** Always ISO 8601 strings in JSON — `"2026-03-09T12:00:00.000Z"` (never Unix timestamps)

**JSON field naming:** `camelCase` in all API request/response bodies — `createdAt`, `isCompleted` (Drizzle maps from `snake_case` DB columns)

**Boolean fields:** `true`/`false` only — never `0`/`1` or `"yes"`/`"no"`

### Process Patterns

**Test-Driven Development (mandatory — both `apps/web` and `apps/api`):**

- TDD is the required development cycle for all new code in both apps: **Red → Green → Refactor**
- Write a failing test first that describes the intended behaviour — no implementation code before a test exists
- Tests must fail for the right reason before any implementation is written
- Write the minimum implementation to make the test pass — no speculative code
- Refactor only after green — clean up without changing behaviour
- Applies to all layers: service functions, Drizzle query wrappers, React components, and RR actions
- Contract tests (`todos.routes.test.ts`) are written before the route handler is implemented
- Component tests (`task-input.test.tsx`) are written before the component renders
- E2E tests in `e2e/todos.spec.ts` are written per user journey before the full feature is wired up
- Exceptions: Drizzle migration files and generated files (`api.client.ts`) are exempt from TDD

**Optimistic UI (RR actions + `useOptimistic`):**

- `useOptimistic` always initialises from loader data
- Optimistic state applied before `fetcher.submit()` call
- Revert is automatic on action error — no manual rollback code needed
- `fetcher.state === 'submitting'` drives loading indicators, not local state

**Error handling — frontend:**

- Loader errors → RR `ErrorBoundary` at route level
- Action errors → returned from action as `{ error: string }`, displayed inline
- Network errors → caught in action, returned as `{ error: 'Network error. Please try again.' }`
- Never `throw` from an action for user-facing errors — always `return { error: ... }`

**Error handling — backend:**

- Validation errors: Fastify schema validation auto-returns 400 with error envelope
- Not found: `reply.code(404).send({ error: { code: 'NOT_FOUND', message: '...' } })`
- Unexpected errors: global `setErrorHandler` returns 500 with `INTERNAL_ERROR` code; full error logged server-side only
- Never expose stack traces or internal error details in API responses

**Loading states:**

- `fetcher.state !== 'idle'` is the single source of truth for in-flight mutations
- Loading indicators appear after 200ms delay (CSS `animation-delay` on spinner, not JS timer)
- Never duplicate loading state in component local state — always derived from fetcher/loader

**Validation:**

- All API input validated with Zod schemas defined in `packages/shared`
- Same schema used for Fastify route validation (via `zod-to-json-schema`) and client-side pre-validation
- Validation on submit only — never on blur or keystroke

### Enforcement Guidelines

**All AI agents MUST:**

- Follow the TDD cycle (Red → Green → Refactor) for all new code in `apps/web` and `apps/api` — no implementation without a failing test first
- Use `kebab-case` for all filenames — no exceptions
- Use the `{ data: T }` / `{ error: { code, message } }` envelope — never return raw objects from API routes
- Co-locate unit tests with source files
- Never put business logic in Fastify route handlers — always delegate to service layer
- Never put Drizzle queries in service files — always delegate to `*.queries.ts`
- Never hard-code colours, font sizes, or spacing — always use Chakra theme tokens
- Never use `any` in TypeScript — use `unknown` and narrow, or define a proper type
- Import shared types from `@bmad/shared` — never redefine `Todo` locally in an app

**Anti-patterns (never do these):**

- Writing implementation code before a failing test exists — TDD is non-negotiable
- Writing tests after the fact to hit coverage targets — tests must drive design, not document it
- `camelCase` or `PascalCase` filenames
- Raw `fetch()` calls in components — always go through the Massimo-generated client
- `console.log` in production code — use Fastify's built-in `request.log`
- Inline styles or hardcoded hex values in components
- Returning `HTTP 200` for errors with an error body — use correct HTTP status codes

## Project Structure & Boundaries

### Complete Project Directory Structure

```
bmad-experiment/
├── .github/
│   └── workflows/
│       ├── ci.yml                        # Lint, test, build, E2E — all branches + PRs
│       ├── deploy.yml                    # Reusable deploy workflow
│       ├── staging.yml                   # Calls deploy.yml — triggers on push to main
│       └── production.yml               # Calls deploy.yml — triggers on tag push
├── apps/
│   ├── web/                              # React Router v7 SSR app
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   └── todos/
│   │   │   │       ├── task-input/
│   │   │   │       │   ├── task-input.tsx
│   │   │   │       │   └── task-input.test.tsx
│   │   │   │       ├── task-item/
│   │   │   │       │   ├── task-item.tsx
│   │   │   │       │   └── task-item.test.tsx
│   │   │   │       ├── section-header/
│   │   │   │       │   ├── section-header.tsx
│   │   │   │       │   └── section-header.test.tsx
│   │   │   │       ├── empty-state/
│   │   │   │       │   ├── empty-state.tsx
│   │   │   │       │   └── empty-state.test.tsx
│   │   │   │       └── error-bar/
│   │   │   │           ├── error-bar.tsx
│   │   │   │           └── error-bar.test.tsx
│   │   │   ├── lib/
│   │   │   │   └── api.client.ts         # Massimo-generated client (committed to git)
│   │   │   ├── routes/
│   │   │   │   └── _index.tsx            # Root route: loader + actions + page render
│   │   │   ├── theme.ts                  # Chakra UI Charcoal Focus theme definition
│   │   │   └── root.tsx                  # App root: ChakraProvider, ErrorBoundary
│   │   ├── e2e/
│   │   │   ├── todos.spec.ts             # Playwright E2E — all 6 user journeys
│   │   │   └── playwright.config.ts
│   │   ├── public/
│   │   ├── Dockerfile
│   │   ├── fly.toml
│   │   ├── react-router.config.ts
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── api/                              # Fastify REST API
│       ├── src/
│       │   ├── domains/
│       │   │   └── todos/
│       │   │       ├── todos.routes.ts       # Fastify plugin, route declarations only
│       │   │       ├── todos.routes.test.ts  # Contract tests (@fastify/inject)
│       │   │       ├── todos.service.ts      # Business logic, pure functions
│       │   │       ├── todos.service.test.ts # Unit tests for service logic
│       │   │       ├── todos.queries.ts      # Drizzle queries only
│       │   │       └── todos.schema.ts       # Zod schemas + JSON schema for Fastify
│       │   ├── db/
│       │   │   ├── index.ts              # Drizzle client + Neon/pg connection
│       │   │   ├── schema.ts             # Drizzle table definitions
│       │   │   └── migrations/           # drizzle-kit generated SQL migrations
│       │   │       └── 0001_init.sql
│       │   ├── plugins/
│       │   │   └── cors.ts               # @fastify/cors configuration
│       │   └── server.ts                 # Fastify instance, plugin registration, entry point
│       ├── Dockerfile
│       ├── fly.toml
│       ├── drizzle.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── types.ts                  # Todo type, CreateTodoRequest, UpdateTodoRequest
│       │   └── schemas.ts                # Zod schemas shared across FE + BE
│       ├── tsconfig.json
│       └── package.json                  # name: "@bmad/shared"
├── docker-compose.yml                    # PostgreSQL only — local dev DB
├── .changeset/
│   └── config.json                       # Changesets configuration
├── .env.example                          # Template for local env vars
├── eslint.config.js                      # ESLint v9 flat config — monorepo root
├── .prettierrc                           # Prettier config — monorepo root
├── .husky/
│   └── pre-commit                        # lint-staged hook
├── lint-staged.config.js
├── package.json                          # Workspace root + root scripts
└── tsconfig.base.json                    # Shared TS config extended by all apps
```

### Architectural Boundaries

**API Boundaries:**

- All external API traffic enters at Fastify — no direct DB access from web container
- Web container (RR SSR) calls Fastify API server-to-server on internal Fly.io network (no public CORS needed for loader calls)
- Browser-initiated mutations (fetcher actions) call Fastify via public URL — `@fastify/cors` permits web app origin only
- OpenAPI spec exposed at `GET /documentation/json` — consumed by Massimo at build time only, not at runtime

**Component Boundaries:**

- UI components (`apps/web/app/components/`) accept only props + callbacks — zero knowledge of API or loaders
- Route file (`_index.tsx`) owns all loader/action logic and passes data down as props
- `api.client.ts` is the only file that may construct HTTP requests — no raw `fetch()` anywhere else in web app

**Service Boundaries:**

- `todos.routes.ts` — Fastify types only; delegates everything to service
- `todos.service.ts` — pure TypeScript functions; no Fastify types, no Drizzle imports
- `todos.queries.ts` — Drizzle calls only; no business logic, returns raw DB rows
- `todos.schema.ts` — Zod + JSON Schema only; imported by both routes (validation) and shared package (types)

**Data Boundaries:**

- `packages/shared` is the single source of truth for `Todo`, `CreateTodoRequest`, `UpdateTodoRequest`
- Drizzle schema (`src/db/schema.ts`) is the single source of truth for DB column names and types
- Drizzle handles `snake_case` → `camelCase` mapping — no manual mapping in service or routes

### Requirements to Structure Mapping

| Requirement              | Location                                                                      |
| ------------------------ | ----------------------------------------------------------------------------- |
| FR-1: Create todo        | `todos.routes.ts` POST, `todos.service.ts`, `todos.queries.ts`, `task-input/` |
| FR-2: View all todos     | `todos.routes.ts` GET, `_index.tsx` loader, `task-item/`, `section-header/`   |
| FR-3/4: Toggle complete  | `todos.routes.ts` PATCH, `todos.service.ts`, `task-item/` checkbox            |
| FR-5: Delete todo        | `todos.routes.ts` DELETE, `todos.service.ts`, `task-item/` delete button      |
| FR-6/7: Persistence + ID | `todos.queries.ts`, `db/schema.ts` (UUID primary key, durable Neon writes)    |
| FR-8: Empty state        | `empty-state/` (first-use + all-done variants)                                |
| FR-9: Loading state      | `task-input/` submitting state, `task-item/` pending state                    |
| FR-10: Error state       | `error-bar/`, action error returns in `_index.tsx`                            |
| FR-11: REST API          | `todos.routes.ts` + `server.ts`                                               |
| FR-12: Input validation  | `todos.schema.ts` Zod schema, applied in route + client pre-validation        |

### Integration Points

**Internal Communication (server-to-server):**

- RR loader (Node.js) → Fastify API via `http://api.internal:3000` (Fly.io private networking)
- No CORS headers needed for loader-to-API calls

**Browser-to-API (fetcher actions):**

- RR fetcher actions call Fastify via `https://bmad-experiment-api.fly.dev`
- `@fastify/cors` configured to allow `https://bmad-experiment-web.fly.dev` origin

**Build-time integration:**

- `npm run generate:client` calls Massimo against exported `openapi.json` from API build
- Generated `api.client.ts` is committed to git — simplifies CI

**Data Flow (happy path — create todo):**

```
User types + submits
→ RR fetcher action fires
→ useOptimistic adds todo to local state immediately
→ api.client.ts POST /todos
→ todos.routes.ts validates body via todos.schema.ts
→ todos.service.ts calls todos.queries.ts
→ todos.queries.ts Drizzle INSERT → Neon PostgreSQL
→ 201 { data: Todo } returned
→ RR revalidates loader → fresh list from DB
→ Optimistic state replaced with confirmed server state
```

### Development Workflow Integration

**Local dev startup:**

```bash
npm run dev
# → docker compose up -d postgres (waits for healthcheck)
# → apps/api dev server on :3000 (tsx watch)
# → apps/web dev server on :5173 (Vite HMR)
```

**Environment files:**

- `apps/api/.env` — `DATABASE_URL` (local docker-compose postgres), `PORT=3000`
- `apps/web/.env` — `VITE_API_URL=http://localhost:3000`
- `.env.example` at root documents all required vars

**Build process:**

```bash
npm run build -ws
# → packages/shared builds first (tsc)
# → apps/api builds (tsc → dist/) + exports openapi.json
# → npm run generate:client regenerates api.client.ts
# → apps/web builds (react-router build → build/)
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** All technology choices are compatible. React Router v7 SSR + Fastify + Drizzle + Neon is a well-established production stack. Chakra UI v3 integrates cleanly with React 19. Vitest works across both apps. No version conflicts identified.

**Pattern Consistency:** Naming conventions (`kebab-case` files, `camelCase` JSON, `snake_case` DB), by-feature organisation (both FE and BE), and the `{ data } / { error }` envelope are consistent and mutually reinforcing. No contradictions.

**Structure Alignment:** The `domains/` separation in Fastify and the per-component folder pattern in React both directly implement the by-feature pattern decision. The `packages/shared` boundary cleanly supports both the Massimo client generation flow and the Zod shared validation pattern.

### Requirements Coverage Validation ✅

**Functional Requirements:** All 12 FRs mapped to specific files in the structure. No gaps.

**Non-Functional Requirements:**

| NFR                           | Addressed by                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| NFR-1: Page load < 1s         | RR SSR — HTML delivered on first response; Vite-optimised bundle                     |
| NFR-2: API < 200ms p95        | Fastify (fastest Node.js HTTP framework), Drizzle (no ORM overhead), Neon serverless |
| NFR-3: UI response < 100ms    | `useOptimistic` — state updates before API call, zero perceived latency              |
| NFR-4: Zero data loss         | Neon durable writes; Drizzle awaits INSERT before responding                         |
| NFR-5: Network error recovery | `error-bar/` + action error returns + `useFetcher` retry pattern                     |
| NFR-6/7: Responsive + touch   | Chakra UI responsive props + 44px touch targets in component specs                   |
| NFR-8: WCAG 2.1 AA            | Chakra UI accessibility primitives + `eslint-plugin-jsx-a11y` in CI                  |
| NFR-9: 80% test coverage      | Vitest (unit + contract) + Playwright (E2E) across both apps                         |
| NFR-10: Setup < 10 minutes    | `npm install && npm run dev` — single command after env file setup                   |
| NFR-11: Auth-extensible       | `domains/` layer separation — routes/service/queries never coupled                   |

### Implementation Readiness Validation ✅

**Decision completeness:** All critical decisions documented with specific tool choices. Massimo + OpenAPI client generation, Changesets + GitHub Actions reusable workflows, Drizzle + Neon — all concrete and actionable.

**Structure completeness:** Every file an AI agent needs to create is named and located in the tree. No ambiguous placeholders.

**Pattern completeness:** Naming, structure, error handling, optimistic UI, loading states, validation timing, and enforcement rules all specified. Anti-patterns explicitly listed to prevent common drift.

### Gap Analysis Results

**No critical gaps identified.**

**Minor items noted (non-blocking):**

1. `openapi.json` export mechanism to be defined in the first implementation story (API scaffold).
2. Neon staging branch creation is a one-time manual setup step — should be documented in `README.md` during implementation.

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**

- [x] Critical decisions documented with specific tool versions
- [x] Technology stack fully specified (React Router v7, Fastify v5, Drizzle, Neon, Chakra UI v3, Vitest, Playwright)
- [x] Integration patterns defined (Massimo, OpenAPI, RR loaders/actions)
- [x] Performance considerations addressed per NFR

**✅ Implementation Patterns**

- [x] Naming conventions established (files, DB, API, code)
- [x] Structure patterns defined (by-feature FE + BE)
- [x] Error handling patterns fully specified (FE + BE)
- [x] Process patterns documented (optimistic UI, loading states, validation)
- [x] Enforcement guidelines and anti-patterns listed

**✅ Project Structure**

- [x] Complete directory structure defined with all files named
- [x] Component boundaries established
- [x] Integration points mapped (server-to-server, browser-to-API, build-time)
- [x] All 12 FRs mapped to specific structure locations

### Architecture Readiness Assessment

**Overall Status: ✅ READY FOR IMPLEMENTATION**

**Confidence Level: High**

**Key Strengths:**

- Feature-first organisation (both FE and BE) eliminates ambiguity about where new code goes
- Massimo + OpenAPI creates a hard contract boundary between FE and BE — type drift is structurally impossible
- RR loaders/actions + `useOptimistic` maps precisely to the UX spec's optimistic UI requirement
- Reusable GitHub Actions deploy workflow eliminates staging/production config duplication
- Neon branching mirrors the environment topology cleanly

**Areas for Future Enhancement (post-MVP):**

- Auth layer — defined deferral strategy; NFR-11 ensures zero contract breakage when added
- Rate limiting — straightforward Fastify plugin addition
- Neon branch-per-PR for isolated E2E test environments
