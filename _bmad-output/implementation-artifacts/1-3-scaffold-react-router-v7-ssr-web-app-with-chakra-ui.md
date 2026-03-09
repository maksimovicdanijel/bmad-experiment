# Story 1.3: Scaffold React Router v7 SSR Web App with Chakra UI

Status: review

## Story

As a **developer**,
I want a runnable React Router v7 SSR app with Chakra UI v3 dark theme, the Massimo client generation script wired up, and a root error boundary,
so that frontend component implementation can begin immediately in Epic 2 without further tooling setup.

## Acceptance Criteria

1. **Given** the API is running, **When** `npm run dev -w apps/web` is executed, **Then** the RR v7 Node dev server starts and the app loads in a browser at `localhost:5173` with no console errors.
2. **Given** Chakra UI v3 is installed and `ChakraProvider` wraps the app root in `root.tsx`, **When** the app renders, **Then** the Charcoal Focus dark theme is applied, `colorMode` is forced to `dark`, and `prefers-reduced-motion` is respected via Chakra's built-in handling.
3. **Given** `apps/api/openapi.json` has been exported from the API build, **When** `npm run generate:client` is run from the root, **Then** Massimo-generated client artifacts are produced in `apps/web/app/lib` without errors and the output type-checks cleanly.
4. **Given** `root.tsx` exports an `ErrorBoundary` component, **When** a route throws an unhandled error, **Then** the `ErrorBoundary` renders an error message instead of a blank screen or crash.
5. **Given** `react-router.config.ts` is configured with the `@react-router/node` adapter, **When** `npm run build -w apps/web` is run, **Then** it produces a Node.js server bundle without TypeScript or build errors.

## Tasks / Subtasks

- [x] **Task 1: Add Chakra UI v3 dependencies and keep SSR compatibility** (AC: 2, 5)
  - [x] Install Chakra stack in `apps/web` (`@chakra-ui/react` and required peers) pinned to project-compatible versions.
  - [x] Keep existing React Router SSR setup unchanged (`react-router.config.ts` already has `ssr: true`).
  - [x] Ensure no dependency conflicts with React 19 and RR 7.

- [x] **Task 2: Implement theme foundation (Charcoal Focus, dark-only)** (AC: 2)
  - [x] Create `apps/web/app/theme/` with Chakra theme configuration using `defineConfig` + `createSystem`.
  - [x] Define minimal Charcoal Focus tokens for background, text, accent, borders, and status colors.
  - [x] Enforce dark-only mode (no UI toggle and no light theme branch).
  - [x] Verify reduced-motion behavior aligns with Chakra defaults and does not add custom motion overrides that break UX requirements.

- [x] **Task 3: Wire ChakraProvider into `root.tsx` while preserving RR shell** (AC: 2, 4)
  - [x] Refactor `root.tsx` layout to wrap routed content in Chakra `Provider`/`ChakraProvider` composition.
  - [x] Keep current `Meta`, `Links`, `Scripts`, and `ScrollRestoration` behavior intact.
  - [x] Retain and improve the existing `ErrorBoundary` so it remains SSR-safe and accessible.

- [x] **Task 4: Prepare generated API client integration path** (AC: 3)
  - [x] Create `apps/web/app/lib/` directory if missing.
  - [x] Add or confirm ignore rule strategy for generated output artifacts.
  - [x] Run `npm run generate:client` from repo root and verify Massimo output files at `apps/web/app/lib/`.
  - [x] Confirm generated client compiles with `npm run typecheck -w apps/web`.

- [x] **Task 5: Validate dev/build/runtime behavior** (AC: 1, 5)
  - [x] Run `npm run dev -w apps/web` and verify startup and rendering on `localhost:5173`.
  - [x] Run `npm run build -w apps/web` and verify successful server bundle output.
  - [x] Run `npm run lint -w apps/web` and `npm run test -w apps/web` to confirm no regressions in scaffold quality gates.

## Dev Notes

### Story Foundation

- This story transitions the web app from default React Router + Tailwind starter output to the architecture-defined Chakra UI v3 dark-themed SSR shell.
- The purpose is **infrastructure readiness**, not feature delivery: avoid implementing Todo UX features from Epic 2 in this story.
- Existing root scripts already include `generate:client`; this story must make that flow usable for frontend work.

### Technical Requirements

- Keep **React Router v7 SSR mode** as-is (`ssr: true`) and do not switch to SPA-only mode.
- Keep existing package/module style (`type: module`) and TS strict settings inherited from root.
- Keep shared types import path strategy (`@bmad/shared`) intact.
- Avoid introducing alternate UI libraries (MUI, styled-components, etc.) or dual-framework styling complexity.

### Architecture Compliance

- Follow monorepo conventions established in Stories 1.1 and 1.2.
- Do not break root CI script assumptions (`lint`, `test`, `build`, `generate:client`).
- Keep API contract generation path aligned with architecture: API OpenAPI source -> Massimo generation -> web typed client.
- Preserve separation of responsibilities:
  - `apps/api` owns contract schema and OpenAPI output.
  - `apps/web` consumes generated client and shared types.

### Library / Framework Requirements

- React Router family should remain aligned (workspace currently uses `7.12.0`; latest npm publishes `7.13.1`). Prefer staying pinned to current workspace versions unless upgrade is explicitly scoped.
- React remains `19.2.4` (already latest in npm check); do not downgrade.
- Chakra UI latest observed stable is `3.34.0`; use a stable v3 release compatible with React 19 and SSR.
- Keep Vite and RR plugin flow unchanged unless needed for Chakra SSR correctness.

### File Structure Requirements

Expected files to add/update in this story:

- `apps/web/app/root.tsx` (update)
- `apps/web/app/theme/` (new folder)
  - `apps/web/app/theme/system.ts` (new)
  - `apps/web/app/theme/tokens.ts` (new, optional if split preferred)
- `apps/web/app/lib/` (new folder; generated artifacts destination)
  - `apps/web/app/lib/api.client.mts` (generated)
  - `apps/web/app/lib/api.client-types.d.ts` (generated)
  - `apps/web/app/lib/api.client.openapi.json` (generated)
- `apps/web/package.json` (update dependencies/scripts only if required)
- `apps/web/README.md` (optional update to replace Tailwind-first messaging with Chakra usage)

### Testing Requirements

- Follow TDD intent from architecture: if behavior changes materially (provider wiring, error boundary rendering), add or update targeted tests before final implementation.
- Minimum validation for this story:
  - `npm run typecheck -w apps/web`
  - `npm run build -w apps/web`
  - `npm run lint -w apps/web`
- If tests are added, keep them in app-local conventions (`app/**/*.test.tsx`).

### Previous Story Intelligence (Story 1.2)

- Story 1.2 showed strong adherence to explicit plugin ordering and environment validation; apply same discipline to provider ordering and root composition in web app.
- Prior work used clear architecture boundaries (`routes -> service -> queries`) and concrete acceptance checks; keep the same explicitness for frontend shell boundaries.
- Sprint status management is already active; ensure this story remains implementation-ready before dev starts (status `ready-for-dev`).

### Git Intelligence Summary

Recent commit patterns indicate:

- Story docs and sprint status are updated together.
- Infrastructure-first commits were used before feature implementation.
- API scaffold created stable foundation files (`server.ts`, db, todos stubs) without premature feature logic.

Implication for this story:

- Keep scope on scaffold and contracts only.
- Avoid feature creep into Todo interaction logic from Epic 2.

### Latest Tech Information

- npm checks during story creation indicate:
  - `react-router`: 7.13.1 latest
  - `@react-router/node`: 7.13.1 latest
  - `@chakra-ui/react`: 3.34.0 latest
  - `react`: 19.2.4 latest
- Guardrail: prioritize **workspace consistency** over opportunistic upgrades. Upgrade RR packages only in a dedicated compatibility story to avoid introducing unplanned breakages.

### Project Context Reference

- No `project-context.md` file was discovered via configured pattern `**/project-context.md`.
- Story guidance therefore relies on:
  - `_bmad-output/planning-artifacts/epics.md`
  - `_bmad-output/planning-artifacts/architecture.md`
  - `_bmad-output/planning-artifacts/ux-design-specification.md`
  - `_bmad-output/implementation-artifacts/1-2-scaffold-fastify-api-with-drizzle-orm.md`

### References

- Source: `_bmad-output/planning-artifacts/epics.md` (Epic 1, Story 1.3 acceptance criteria)
- Source: `_bmad-output/planning-artifacts/architecture.md` (Frontend architecture, naming/structure, SSR decisions)
- Source: `_bmad-output/planning-artifacts/ux-design-specification.md` (Dark-mode, reduced-motion, accessibility and feedback expectations)
- Source: `_bmad-output/implementation-artifacts/1-2-scaffold-fastify-api-with-drizzle-orm.md` (Implementation pattern and quality guardrails)
- Source: repository state in `apps/web/*`, `package.json`, and recent git history

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `npm run openapi:export -w apps/api`
- `npm run generate:client`
- `npx -y node@24 ... npm-cli.js run typecheck -w apps/web`
- `npx -y node@24 ... npm-cli.js run lint -w apps/web`
- `npx -y node@24 ... npm-cli.js run test -w apps/web`
- `npx -y node@24 ... npm-cli.js run build -w apps/web`
- `npx -y node@24 ... npm-cli.js run dev -w apps/web` (verified localhost:5173 startup)

### Completion Notes List

- Implemented Chakra UI v3 scaffold in `apps/web` with Charcoal Focus dark-only token system and semantic tokens.
- Integrated `ChakraProvider` with custom system in root layout while preserving SSR shell behavior.
- Replaced starter route UI with Chakra-based scaffold page and updated route metadata.
- Hardened root error handling with accessible Chakra-based `ErrorBoundary` and extracted pure resolver function.
- Added unit tests for error-boundary content resolution logic.
- Added OpenAPI export script in API app and wired robust root `generate:client` flow.
- Switched client generation to pure Massimo output artifacts (no custom fallback script).
- Validated typecheck, lint, tests, build, and dev startup using Node 24 runtime.

### File List

- _bmad-output/implementation-artifacts/1-3-scaffold-react-router-v7-ssr-web-app-with-chakra-ui.md
- apps/api/openapi.json
- apps/api/package.json
- apps/api/src/export-openapi.ts
- apps/web/.gitignore
- apps/web/app/app.css
- apps/web/app/root.test.tsx
- apps/web/app/root.tsx
- apps/web/app/routes/home.tsx
- apps/web/app/theme/system.ts
- apps/web/app/theme/tokens.ts
- apps/web/package.json
- package.json
- package-lock.json

### Change Log

- 2026-03-09: Implemented Story 1.3 web scaffold (Chakra dark theme, SSR shell integration, ErrorBoundary hardening, OpenAPI export + client generation flow, and validation gates).

## Story Completion Status

✅ Story implementation completed for all defined tasks/subtasks.
✅ Acceptance criteria validated through build/test/typecheck/lint/dev-start checks.
✅ Story status set to `review`.
