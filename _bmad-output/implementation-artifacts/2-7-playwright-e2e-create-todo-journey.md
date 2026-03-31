# Story 2.7: Playwright E2E — Create Todo Journey

**Status:** ready-for-dev

**Story ID:** 2.7  
**Epic:** 2 (View & Capture Todos)  
**Story Key:** 2-7-playwright-e2e-create-todo-journey

---

## User Story

As a **developer**,  
I want Playwright E2E tests covering UJ-1 (first-time user creates a todo),  
so that the create slice is backed by automated end-to-end evidence running in CI.

---

## Acceptance Criteria

1. **Given** E2E test stubs for UJ-1 are written in `apps/web/e2e/todos.spec.ts` before the full stack is wired,  
   **When** the tests are run against a clean environment,  
   **Then** they fail for the right reason (no content yet) — TDD applies to E2E.

2. **Given** both apps and the database are running via Docker,  
   **When** the Playwright suite runs against UJ-1 (first-time user),  
   **Then** the test navigates to the app, sees the empty state, types a task, presses Enter, and asserts the todo appears in the list.

3. **Given** a todo is created,  
   **When** the page is reloaded,  
   **Then** the E2E test asserts the todo is still present (data persistence — NFR-4).

4. **Given** the E2E suite runs in CI,  
   **When** the GitHub Actions `ci.yml` workflow executes,  
   **Then** all UJ-1 tests pass in Chromium with zero flakes.

---

## Tasks / Subtasks

- [ ] Task 1: Extend the existing Playwright todo journey spec with UJ-1 create coverage (AC: 1, 2, 3)
  - [ ] Add a new `test.describe('UJ-1: Create Todo')` block in `apps/web/e2e/todos.spec.ts`
  - [ ] Start each UJ-1 test from a clean DB by reusing `truncateTodos()` from `apps/web/e2e/helpers/db.ts`
  - [ ] Write the failing test first before changing any app code or test helpers
  - [ ] Assert the first-use empty state is visible before creation begins
  - [ ] Fill the `TaskInput` with a realistic todo string and submit via Enter, not button click
  - [ ] Assert the new todo appears in the active list without using arbitrary timeouts
  - [ ] Assert the empty state disappears after successful creation
  - [ ] Reload the page and assert the created todo remains visible

- [ ] Task 2: Reuse the existing E2E infrastructure rather than introducing parallel patterns (AC: 1, 4)
  - [ ] Keep the create journey in `apps/web/e2e/todos.spec.ts` alongside the existing UJ-2 coverage unless a config constraint forces a split
  - [ ] Reuse `apps/web/e2e/playwright.config.ts` and the existing `view-todos` Chromium project
  - [ ] Reuse `apps/web/e2e/global-teardown.ts` for database pool cleanup
  - [ ] Reuse `apps/web/e2e/helpers/db.ts` for setup only; do not use direct DB writes for the actual create action under test
  - [ ] Leave `apps/web/e2e/error-state.spec.ts` and `apps/web/e2e/playwright.error.config.ts` unchanged unless test orchestration genuinely requires it

- [ ] Task 3: Validate the real create flow end-to-end against the current implementation (AC: 2, 3)
  - [ ] Exercise the real `home` route, real RR action, real web server, real API, and real Postgres database
  - [ ] Use stable locators already supported by the UI, such as the input placeholder, visible button text, empty-state copy, and section headings
  - [ ] Prefer assertions that wait on the final user-visible state, not internal implementation details
  - [ ] If a real defect is exposed in the create flow, apply the smallest product-code fix needed in the existing create path rather than adding test-only workarounds

- [ ] Task 4: Verify local and CI readiness (AC: 4)
  - [ ] Run the focused Playwright suite for `apps/web/e2e/todos.spec.ts`
  - [ ] Confirm the UJ-1 tests pass in Chromium with zero flakes in the local dev setup
  - [ ] Ensure the story does not require new dependencies, new CI jobs, or alternative web servers
  - [ ] Keep the create journey compatible with the current `apps/web/package.json` E2E scripts

---

## Dev Notes

### Story Foundation

This story adds automated evidence for the create flow that was introduced in Story 2.6 and depends on the API write path delivered in Story 2.5.

The story should verify the **real user journey**:
- first-use empty state renders
- user types a task
- user submits with Enter
- todo appears in the active list
- todo survives reload because it was persisted through the API into Postgres

### Current Implementation Snapshot

The create flow already exists in the current workspace and should be treated as the system under test, not re-implemented:

- `apps/web/app/routes/home.tsx`
  - exports the route `loader` and `action`
  - uses `useFetcher()` and React 19 `useOptimistic()`
  - renders `TaskInput`
  - submits create requests through the route action
- `apps/web/app/components/TaskInput.tsx`
  - focuses the input on mount
  - validates against `createTodoSchema` from `@bmad/shared`
  - clears the field on successful submit
  - renders inline error text when needed
- `apps/web/app/lib/api/todos.server.ts`
  - wraps `GET /todos` and `POST /todos`
- `apps/api/src/features/todos/**`
  - contains the feature-based API route/service/query implementation for todos

This means Story 2.7 is primarily a **test story**, but it may require small fixes in the current create flow if the E2E test exposes a legitimate defect.

### Architecture Compliance

Follow the existing architecture and repo conventions already present in the project:

- E2E tests live in `apps/web/e2e/` and are never co-located with components
- Use Playwright against the running web app at port `5173`
- Use the real API at port `3000`
- Use direct DB access only for setup/cleanup (`truncateTodos()`), not for the actual creation being asserted
- Keep test coverage Chromium-focused for MVP because the story acceptance criteria only require Chromium CI reliability
- Do not add test-only middleware, API shortcuts, or environment-specific branches in application code
- Do not add arbitrary waits like `waitForTimeout`; rely on Playwright’s retrying assertions

### Technical Requirements

- Reuse the existing `apps/web/e2e/helpers/db.ts` helper for test isolation
- Keep the create-journey test in the existing `apps/web/e2e/todos.spec.ts` file to match the epic requirement
- Start from an empty table for UJ-1; unlike Story 2.3, do **not** seed the DB before the action under test
- Submit via Enter to satisfy the exact story acceptance criteria
- Assert user-visible outcomes only:
  - empty state visible initially
  - created todo text becomes visible after submit
  - active section reflects the created item
  - created todo still visible after reload
- If the optimistic item appears before the server round-trip completes, ensure the final assertion still proves the persisted state after reload

### Library / Framework Requirements

Use the versions and tooling already pinned in this repository rather than introducing new libraries:

- Node.js `>=24` from the workspace root `package.json`
- Playwright `^1.58.2` in `apps/web/package.json`
- React Router `7.12.0`
- React `^19.2.4`
- Chakra UI `^3.34.0`
- Fastify `^5.8.2`
- Vitest `^3.2.4`
- `pg` `^8.20.0` already present in `apps/web` for the E2E DB helper

No external web research was available in this execution context, so the story should follow the repository’s locked dependency versions and current local patterns.

### File Structure Requirements

**Primary file to modify:**
- `apps/web/e2e/todos.spec.ts`

**Files to reuse as-is unless a real need emerges:**
- `apps/web/e2e/helpers/db.ts`
- `apps/web/e2e/global-teardown.ts`
- `apps/web/e2e/playwright.config.ts`
- `apps/web/e2e/error-state.spec.ts`
- `apps/web/e2e/playwright.error.config.ts`

**Product code that may only be touched if the E2E test reveals a real bug:**
- `apps/web/app/routes/home.tsx`
- `apps/web/app/components/TaskInput.tsx`
- `apps/web/app/lib/api/index.server.ts`
- `apps/web/app/lib/api/todos.server.ts`

**Do not create:**
- a second database helper
- a second create-journey spec file unless required by Playwright configuration constraints
- test-only API endpoints or seed routes
- mock-based E2E shortcuts

### Testing Requirements

#### Required E2E flow

1. Truncate the `todos` table in `beforeEach`
2. Navigate to `/`
3. Assert first-use empty state is visible
4. Fill the task input with a deterministic string such as `Buy milk`
5. Submit via Enter
6. Assert the todo appears in the active list
7. Reload the page
8. Assert the same todo still appears

#### Assertion guidance

- Prefer `page.getByPlaceholder('Add a task...')` or equivalent stable input locator
- Prefer role/text-based assertions over CSS selectors where possible
- If asserting list placement, target the list item containing the created text rather than relying on array order alone
- Avoid asserting transient optimistic IDs or implementation-only details
- If an action-level error path appears instead of success, treat it as a real regression to fix, not a flaky exception to suppress

#### Local execution prerequisites

Before running the E2E suite:

1. Start PostgreSQL with Docker
2. Ensure the API server is running on `http://localhost:3000`
3. Let Playwright start or reuse the web dev server on `http://localhost:5173`
4. Run the existing `apps/web` E2E command for the Chromium config

### Previous Story Intelligence

#### From Story 2.3 (View Todos E2E)

Story 2.3 already established the project’s approved E2E patterns:

- `apps/web/e2e/todos.spec.ts` is the canonical todo journey spec
- `apps/web/e2e/helpers/db.ts` is the approved direct-DB helper
- `apps/web/e2e/global-teardown.ts` closes the pooled DB connection
- `apps/web/e2e/playwright.config.ts` already targets the Chromium-based `view-todos` project
- `apps/web/e2e/error-state.spec.ts` is deliberately separate because it requires a different web server config

Reuse these patterns instead of creating new infrastructure.

#### From Story 2.6 (Create Todo UI + Action)

The current create implementation introduces a few important considerations for E2E:

- The route action lives in `apps/web/app/routes/home.tsx`, not a dedicated `todos` route
- `TaskInput` currently lives in `apps/web/app/components/TaskInput.tsx`, not in `app/components/todos/`
- Client-side validation is shared from `@bmad/shared`
- The UI uses optimistic rendering before server reconciliation
- Error UI is currently inline text, while the dedicated `ErrorBar` is deferred to Story 2.8

The E2E test should validate the successful path and avoid assuming the older planned file layout from the architecture draft.

#### Important project-state note

`sprint-status.yaml` still marks Story 2.6 as `in-progress`, but the corresponding implementation files are already present in the workspace. Treat Story 2.7 as validation of that work, and call out any uncovered gaps rather than rewriting the create flow from scratch.

### Git Intelligence Summary

Recent git history shows the exact patterns this story should align with:

- `99ecf2d e2e tests` — established the current Playwright structure
- `a1e87bc refactor todos into features` — confirmed feature-based API structure
- `0b80244 feat: create todo endpoint` — added the API write path this story depends on
- `d04f739 code review` and `eb52b98 chore: review` — indicate iterative refinement is already part of the team workflow

Actionable takeaway: keep Story 2.7 narrowly focused on extending the existing E2E suite and fixing only defects exposed by the create journey.

### Anti-Patterns to Avoid

- Do **not** seed the todo directly for the act/assert part of UJ-1; the create path itself must be exercised
- Do **not** create a second Playwright config for the happy path
- Do **not** add `waitForTimeout` or other hard sleeps to chase flakiness
- Do **not** change UI copy just to make selectors easier unless the product intentionally wants that change
- Do **not** bypass the route action by posting directly to the API from the test
- Do **not** add test-only application code to force persistence or skip revalidation

---

## References

- Epic source: `_bmad-output/planning-artifacts/epics.md`
- Architecture source: `_bmad-output/planning-artifacts/architecture.md`
- Previous E2E story: `_bmad-output/implementation-artifacts/2-3-playwright-e2e-view-todos-journey.md`
- Previous create-flow story: `_bmad-output/implementation-artifacts/2-6-create-todo-taskinput-component-and-action.md`
- Current E2E spec: `apps/web/e2e/todos.spec.ts`
- Current Playwright config: `apps/web/e2e/playwright.config.ts`
- Current route under test: `apps/web/app/routes/home.tsx`
- Current input component: `apps/web/app/components/TaskInput.tsx`
- Current API wrapper: `apps/web/app/lib/api/todos.server.ts`

---

## Story Completion Status

**Status:** ready-for-dev  
**Context Prepared:** yes  
**Checklist Outcome:** story context includes epic requirements, architecture constraints, previous-story learnings, repo-specific file paths, git intelligence, and implementation guardrails.

**Outstanding dependency note:** Story 2.6 remains marked `in-progress` in sprint tracking, so Story 2.7 should be treated as the end-to-end validation layer for the current create implementation rather than a greenfield test story.

---

## Dev Agent Record

### Agent Model Used

GPT-5.4

### Debug Log References

- To be completed during implementation

### Completion Notes List

- Story context created automatically from BMAD workflow inputs on 2026-03-31
- No `project-context.md` file was found in the workspace
- External web research was not available; guidance is based on repository-pinned versions and current codebase state

### File List

- `_bmad-output/implementation-artifacts/2-7-playwright-e2e-create-todo-journey.md`
