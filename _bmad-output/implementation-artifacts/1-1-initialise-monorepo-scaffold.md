# Story 1.1: Initialise Monorepo Scaffold

Status: done

## Story

As a **developer**,
I want a fully configured npm workspaces monorepo with shared types package, TypeScript strict mode, ESLint v9, Prettier, and Husky pre-commit hooks,
so that all subsequent development follows consistent conventions from the very first commit.

## Acceptance Criteria

1. **Given** the repo is cloned, **When** `npm install` is run from the root, **Then** all workspace dependencies install without errors and `node_modules` is correctly hoisted.

2. **Given** the monorepo is set up, **When** `npm run lint` is run from the root, **Then** ESLint v9 flat config (`eslint.config.js`) runs across all workspaces with zero errors.

3. **Given** a file is staged for commit, **When** `git commit` is executed, **Then** Husky pre-commit hook runs `lint-staged`, linting and formatting only the staged files, and blocks the commit on any errors.

4. **Given** `packages/shared` is configured with `name: "@bmad/shared"`, **When** imported as `@bmad/shared` in `apps/web` or `apps/api`, **Then** TypeScript resolves the module correctly with full type information.

5. **Given** `tsconfig.base.json` exists at root with `strict: true`, **When** `apps/web`, `apps/api`, and `packages/shared` each extend it, **Then** `tsc --noEmit` passes across all workspaces with strict mode enforced.

6. **Given** `.prettierrc` is configured at root (single quotes, semi, 2-space indent, trailing commas), **When** `prettier --check .` is run, **Then** all files in the repo conform to the format rules.

## Tasks / Subtasks

- [x] **Task 1: Create monorepo root** (AC: 1, 5)
  - [x] `mkdir bmad-experiment && cd bmad-experiment && git init`
  - [x] Create root `package.json` with `"workspaces": ["apps/*", "packages/*"]` and root scripts
  - [x] Create `tsconfig.base.json` with `strict: true`, `moduleResolution: bundler`, `target: ES2022`, `lib: ["ES2022"]`
  - [x] Add `engines: { "node": ">=20" }` to root `package.json`

- [x] **Task 2: Configure `packages/shared`** (AC: 4, 5)
  - [x] `mkdir -p packages/shared/src && cd packages/shared && npm init -y`
  - [x] Set `name: "@bmad/shared"` in `packages/shared/package.json`
  - [x] Add `"main": "./src/index.ts"` and `"exports"` field pointing to `./src/index.ts`
  - [x] Create `packages/shared/tsconfig.json` extending `../../tsconfig.base.json`
  - [x] Create `packages/shared/src/types.ts` with the `Todo` type and request/response contracts
  - [x] Create `packages/shared/src/schemas.ts` with Zod schemas (`createTodoSchema`, `updateTodoSchema`)
  - [x] Create `packages/shared/src/index.ts` re-exporting everything
  - [x] Install `zod` as a dependency in `packages/shared`

- [x] **Task 3: Scaffold `apps/api` skeleton** (AC: 1, 4, 5)
  - [x] `mkdir -p apps/api/src && cd apps/api && npm init -y`
  - [x] Install minimal deps: `fastify`, `@fastify/cors`, `@fastify/env`, `@fastify/helmet`, `@fastify/sensible`
  - [x] Install dev deps: `typescript`, `tsx`, `vitest`, `@types/node`
  - [x] Add `@bmad/shared` as workspace dependency: `"@bmad/shared": "*"`
  - [x] Create `apps/api/tsconfig.json` extending `../../tsconfig.base.json` with `paths: { "@bmad/shared": ["../../packages/shared/src/index.ts"] }`
  - [x] Create minimal `apps/api/src/server.ts` (Fastify instance, no routes yet)

- [x] **Task 4: Scaffold `apps/web` skeleton** (AC: 1, 4, 5)
  - [x] `npx create-react-router@latest apps/web` — select TypeScript, framework mode
  - [x] Add `@bmad/shared` as workspace dependency: `"@bmad/shared": "*"`
  - [x] Update `apps/web/tsconfig.json` to extend `../../tsconfig.base.json` and add paths for `@bmad/shared`
  - [x] Verify `react-router.config.ts` is present and configured with `@react-router/node` SSR adapter

- [x] **Task 5: Configure ESLint v9 flat config** (AC: 2)
  - [x] Install at root: `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`
  - [x] Create `eslint.config.js` at monorepo root covering all workspaces
  - [x] Add `"lint": "eslint ."` script to each workspace's `package.json`
  - [x] Add `"lint": "npm run lint -ws --if-present"` to root `package.json`
  - [x] Run `npm run lint` from root and confirm zero errors

- [x] **Task 6: Configure Prettier** (AC: 6)
  - [x] Install `prettier` at root devDependencies
  - [x] Create `.prettierrc` at root: `{ "singleQuote": true, "semi": true, "tabWidth": 2, "trailingComma": "all" }`
  - [x] Create `.prettierignore` at root (node_modules, dist, .react-router, coverage)
  - [x] Add `"format": "prettier --write ."` and `"format:check": "prettier --check ."` to root scripts

- [x] **Task 7: Configure Husky + lint-staged** (AC: 3)
  - [x] Install `husky` and `lint-staged` at root devDependencies
  - [x] Run `npx husky init` to create `.husky/pre-commit`
  - [x] Configure `.husky/pre-commit` to run `npx lint-staged`
  - [x] Create `lint-staged.config.js` at root:
    ```js
    export default {
      '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
      '*.{js,json,md,yaml,yml}': ['prettier --write'],
    };
    ```
  - [x] Verify hook fires on `git commit` with a staged `.ts` file

- [x] **Task 8: Add root package.json scripts** (AC: 1)
  - [x] Add all root scripts per architecture spec:
    ```json
    {
      "dev": "npm run db:up && concurrently \"npm run dev -w apps/web\" \"npm run dev -w apps/api\"",
      "db:up": "docker compose up -d postgres",
      "db:down": "docker compose down",
      "db:migrate": "npm run db:migrate -w apps/api",
      "test": "npm run test -ws --if-present",
      "build": "npm run build -ws --if-present",
      "lint": "npm run lint -ws --if-present",
      "format": "prettier --write .",
      "format:check": "prettier --check ."
    }
    ```
  - [x] Install `concurrently` at root devDependencies

- [x] **Task 9: Verify full integration** (AC: 1–6)
  - [x] Run `npm install` from root — confirms hoisting, no errors
  - [x] Run `npm run lint` — zero errors
  - [x] Run `tsc --noEmit` in each workspace — strict mode, zero errors
  - [x] Run `prettier --check .` — all files conform
  - [x] Stage a file and run `git commit` — pre-commit hook fires correctly

## Dev Notes

### Project Structure to Create

This story produces the following file tree (no app code yet, only scaffold):

```
bmad-experiment/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   └── server.ts          # Minimal Fastify instance only
│   │   ├── tsconfig.json          # Extends ../../tsconfig.base.json
│   │   └── package.json           # name: "api", deps: fastify, tsx, vitest, @bmad/shared: "*"
│   └── web/                       # Output of create-react-router scaffold
│       ├── app/
│       │   └── root.tsx           # Leave as scaffolded — Story 1.3 will update
│       ├── react-router.config.ts
│       ├── vite.config.ts
│       ├── tsconfig.json          # Must extend ../../tsconfig.base.json
│       └── package.json           # Add @bmad/shared: "*"
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── types.ts           # Todo, CreateTodoRequest, UpdateTodoRequest
│       │   ├── schemas.ts         # Zod schemas: createTodoSchema, updateTodoSchema
│       │   └── index.ts           # Re-exports everything
│       ├── tsconfig.json          # Extends ../../tsconfig.base.json
│       └── package.json           # name: "@bmad/shared", main: "./src/index.ts"
├── .changeset/
│   └── config.json                # Initialize Changesets (Story 4.3 configures fully)
├── .env.example                   # DATABASE_URL=postgresql://... (template only)
├── .husky/
│   └── pre-commit                 # npx lint-staged
├── .prettierignore
├── .prettierrc
├── eslint.config.js               # ESLint v9 flat config
├── lint-staged.config.js
├── package.json                   # Workspace root with scripts
└── tsconfig.base.json             # strict: true, base for all workspaces
```

### Critical Types to Define in `packages/shared/src/types.ts`

```typescript
export interface Todo {
  id: string;           // UUID v4
  text: string;         // 1–255 characters
  isCompleted: boolean;
  createdAt: string;    // ISO 8601 — "2026-03-09T12:00:00.000Z"
}

export interface CreateTodoRequest {
  text: string;
}

export interface UpdateTodoRequest {
  text?: string;
  completed?: boolean;  // Note: request uses 'completed', response uses 'isCompleted'
}

// API envelope types
export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;   // SCREAMING_SNAKE_CASE: NOT_FOUND, VALIDATION_ERROR, INTERNAL_ERROR
    message: string;
  };
}
```

### Critical Zod Schemas in `packages/shared/src/schemas.ts`

```typescript
import { z } from 'zod';

export const createTodoSchema = z.object({
  text: z.string().min(1).max(255),
});

export const updateTodoSchema = z.object({
  text: z.string().min(1).max(255).optional(),
  completed: z.boolean().optional(),
});
```

### `tsconfig.base.json` (root)

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### `eslint.config.js` (root) — ESLint v9 Flat Config

```javascript
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.react-router/**', '**/coverage/**'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: true },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
```

### Root `package.json` Structure

```json
{
  "name": "bmad-experiment",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "engines": { "node": ">=20" },
  "type": "module",
  "scripts": {
    "dev": "npm run db:up && concurrently \"npm run dev -w apps/web\" \"npm run dev -w apps/api\"",
    "db:up": "docker compose up -d postgres",
    "db:down": "docker compose down",
    "db:migrate": "npm run db:migrate -w apps/api",
    "test": "npm run test -ws --if-present",
    "build": "npm run build -ws --if-present",
    "lint": "npm run lint -ws --if-present",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "generate:client": "massimo generate --spec apps/api/openapi.json --output apps/web/app/lib/api.client.ts"
  },
  "devDependencies": {
    "concurrently": "^9.x",
    "husky": "^9.x",
    "lint-staged": "^15.x",
    "prettier": "^3.x",
    "eslint": "^9.x",
    "@typescript-eslint/eslint-plugin": "^8.x",
    "@typescript-eslint/parser": "^8.x",
    "eslint-plugin-react": "^7.x",
    "eslint-plugin-react-hooks": "^5.x",
    "eslint-plugin-jsx-a11y": "^6.x"
  }
}
```

### `packages/shared/package.json`

```json
{
  "name": "@bmad/shared",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "zod": "^3.x"
  }
}
```

### Architecture Boundary Reminders

- **NO business logic, NO routes in this story** — this story is scaffold only
- `packages/shared` must export types AND Zod schemas — both are consumed in later stories
- `apps/api/src/server.ts` in this story should be minimal: create Fastify instance, add a health-check route (`GET /health → 200`), export the `app`. Nothing else. Routes/plugins are Story 1.2.
- `apps/web` from `create-react-router` scaffold is fine as-is for this story. Do not add Chakra UI yet (Story 1.3).
- **TDD exemption**: This story creates scaffold/config files — no TDD cycle required. Test infrastructure (Vitest) is installed but no tests are written until Story 1.4.

### Naming Conventions (Architecture Mandate)

- All files: `kebab-case` — `todo-service.ts`, `task-input.tsx`
- TypeScript types/interfaces: `PascalCase` — `Todo`, `CreateTodoRequest`
- Zod schemas: `camelCase` + `Schema` suffix — `createTodoSchema`
- No `any` in TypeScript — use `unknown` and narrow

### `apps/api` Path Alias Setup

`apps/api/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": {
      "@bmad/shared": ["../../packages/shared/src/index.ts"]
    }
  },
  "include": ["src/**/*"]
}
```

`apps/web/tsconfig.json` — after `create-react-router` scaffold, add extends and paths:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "paths": {
      "@bmad/shared": ["../../packages/shared/src/index.ts"]
    }
  }
}
```

### No Previous Story Intelligence

This is Story 1.1 — first story in the project. No previous story learnings to apply.

### References

- Monorepo structure: [architecture.md — Monorepo Structure section](../planning-artifacts/architecture.md)
- Root scripts: [architecture.md — Root Scripts section](../planning-artifacts/architecture.md)
- Shared types: [architecture.md — `packages/shared`](../planning-artifacts/architecture.md)
- ESLint/Prettier config: [architecture.md — Code Quality section](../planning-artifacts/architecture.md)
- Naming conventions: [architecture.md — Naming Patterns](../planning-artifacts/architecture.md)
- Enforcement guidelines: [architecture.md — Enforcement Guidelines](../planning-artifacts/architecture.md)
- Todo type definition: [epics.md — Story 1.1 Acceptance Criteria](../planning-artifacts/epics.md)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-09 | Story implemented — full monorepo scaffold with npm workspaces, TypeScript strict mode, ESLint v9, Prettier, Husky pre-commit, `packages/shared` types+schemas, `apps/api` Fastify skeleton, `apps/web` React Router v7 SSR scaffold. All 6 ACs verified. | dev agent |
| 2026-03-09 | Code review fixes: H1 cleaned `apps/web/tsconfig.json` (removed redundant/conflicting options); H2 fixed all invalid `^x.x` semver ranges to pinned versions; M2 removed `.js` extensions from `packages/shared/src/index.ts`; M4 scoped React ESLint plugins to `apps/web/**` only; L2 updated `engines.node` to `>=24`. | code reviewer |

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (GitHub Copilot)

### Debug Log References

- React Router typegen must run before `tsc --noEmit` on `apps/web` (generates `+types/root` and `+types/home` — ran via `npx react-router typegen`)
- `create-react-router` creates a nested `.git` directory — removed immediately after scaffold
- `.prettierignore` extended to exclude `_bmad/`, `_bmad-output/`, `.github/prompts/`, `docs/`, `prd.md` (BMAD framework files are not project source)
- Engine warnings for `eslint-visitor-keys` and `vite` on Node 20.9.0 — benign; `.nvmrc` specifies Node 24 which satisfies requirements

### Completion Notes List

- ✅ Root `package.json` created: npm workspaces `["apps/*", "packages/*"]`, `type: "module"`, all architecture-spec scripts, `engines: { node: ">=20" }`
- ✅ `tsconfig.base.json`: `strict: true`, `ES2022`, `moduleResolution: bundler` — all workspaces extend it
- ✅ `packages/shared`: `@bmad/shared` name, Zod schemas (`createTodoSchema`, `updateTodoSchema`), full type contracts (`Todo`, `CreateTodoRequest`, `UpdateTodoRequest`, `ApiSuccess<T>`, `ApiError`)
- ✅ `apps/api`: Fastify v5 skeleton, `GET /health → { status: 'ok' }`, path alias `@bmad/shared` configured, server only starts when `NODE_ENV !== 'test'`
- ✅ `apps/web`: Scaffolded via `create-react-router@7.13.1` (SSR mode, `ssr: true`), `@bmad/shared` dep added, tsconfig extends base and adds `@bmad/shared` path alias alongside `~/*`
- ✅ ESLint v9 flat config: covers all `.ts/.tsx` files, `no-explicit-any: error`, react-hooks rules, `_bmad/`/`build/` ignored
- ✅ Prettier: single quotes, semi, 2-space, trailing commas — `prettier --check .` passes with zero warnings on source files
- ✅ Husky `pre-commit`: runs `npx lint-staged`; lint-staged config fixes `*.{ts,tsx}` and formats all other file types
- ✅ Changesets initialised (`.changeset/config.json`) — Story 4.3 will configure fully
- ✅ TDD exemption applied: scaffold story — no tests written (Vitest installed, tests start from Story 1.4)
- ✅ `npm install` from root: clean hoist, 0 vulnerabilities
- ✅ `npm run lint`: zero errors across all workspaces
- ✅ `tsc --noEmit` on all three tsconfigs: zero errors
- ✅ `prettier --check .`: all source files conform

### File List

- `.changeset/config.json`
- `.changeset/README.md`
- `.env.example`
- `.gitignore`
- `.husky/pre-commit`
- `.prettierignore`
- `.prettierrc`
- `apps/api/package.json`
- `apps/api/src/server.ts`
- `apps/api/tsconfig.json`
- `apps/web/.dockerignore`
- `apps/web/.gitignore`
- `apps/web/Dockerfile`
- `apps/web/README.md`
- `apps/web/app/app.css`
- `apps/web/app/root.tsx`
- `apps/web/app/routes.ts`
- `apps/web/app/routes/home.tsx`
- `apps/web/app/welcome/logo-dark.png`
- `apps/web/app/welcome/logo-light.png`
- `apps/web/app/welcome/welcome.tsx`
- `apps/web/package.json`
- `apps/web/public/favicon.ico`
- `apps/web/react-router.config.ts`
- `apps/web/tsconfig.json`
- `apps/web/vite.config.ts`
- `eslint.config.js`
- `lint-staged.config.js`
- `package.json`
- `packages/shared/package.json`
- `packages/shared/src/index.ts`
- `packages/shared/src/schemas.ts`
- `packages/shared/src/types.ts`
- `packages/shared/tsconfig.json`
- `tsconfig.base.json`
