# Story 3.2: DELETE /todos/:id API Endpoint

Status: done

## Story

As a **developer**,
I want a `DELETE /todos/:id` endpoint that permanently removes a todo and returns `204 No Content`,
so that the frontend delete action has a contract-tested, permanent-deletion path.

## Acceptance Criteria

1. **Contract test first (TDD):**
   - Given a contract test exists in `delete.route.test.ts` (inside `handlers/`) for the DELETE endpoint (written before the route handler)
   - When the test is run before implementation
   - Then it fails for the right reason (route not found / 404)

2. **Delete existing todo:**
   - Given a request is sent for an existing todo
   - When `DELETE /todos/:id` is called
   - Then it returns `204` with no response body

3. **Not found:**
   - Given a request is sent for an `id` that does not exist
   - When `DELETE /todos/:id` is called
   - Then it returns `404` with `{ error: { code: 'NOT_FOUND', message: 'Todo not found' } }`

4. **Persistence verified:**
   - Given a todo is successfully deleted
   - When `GET /todos` is called immediately after
   - Then the deleted todo no longer appears in the response (data permanently removed — NFR-4)

5. **Architecture boundaries respected:**
   - Given the route is implemented following architecture boundaries
   - When the code is reviewed
   - Then `routes.ts` delegates to `service.ts`, which delegates to `queries.ts` — service/queries boundary respected

## Tasks / Subtasks

- [x] Task 1: Create contract tests for `DELETE /todos/:id` (AC: 1, 2, 3, 4)
  - [x] Create `apps/api/src/features/todos/handlers/delete.route.test.ts`
  - [x] Test: returns `204` and empty body for existing todo
  - [x] Test: row is removed from DB (verify with follow-up `GET /todos` and/or direct DB query)
  - [x] Test: returns `404` with `{ error: { code: 'NOT_FOUND', message: 'Todo not found' } }` for non-existent UUID
  - [x] Test: returns `400` with `VALIDATION_ERROR` for invalid UUID format in `:id`
  - [x] Test: deleting already-deleted id returns `404`
  - [x] Run tests in Red phase (expected failing before implementation)

- [x] Task 2: Add delete query in `queries.ts` (AC: 5)
  - [x] Add `deleteTodoById(id: string): Promise<boolean>` in `apps/api/src/features/todos/queries.ts`
  - [x] Use Drizzle delete with `where(eq(todos.id, id))`
  - [x] Return `true` only when at least one row was deleted
  - [x] Keep DB logic in `queries.ts` only

- [x] Task 3: Add delete service function in `service.ts` (AC: 5)
  - [x] Add `deleteTodo(id: string): Promise<boolean>` in `apps/api/src/features/todos/service.ts`
  - [x] Delegate directly to `deleteTodoById`
  - [x] Keep service layer free of Fastify request/response concerns

- [x] Task 4: Create DELETE schema + route handler (AC: 2, 3)
  - [x] Create `apps/api/src/features/todos/handlers/delete.schema.ts`
    - [x] Export `deleteTodoParamsSchema` with UUID `id`
  - [x] Create `apps/api/src/features/todos/handlers/delete.route.ts`
    - [x] Register `DELETE /:id`
    - [x] Use `attachValidation: true`
    - [x] On validation error, return 400 with application error envelope
    - [x] On `deleteTodo(id) === false`, return 404 not found envelope
    - [x] On success, return status `204` and no body
  - [x] Include response schemas for `204`, `4xx`, `5xx`

- [x] Task 5: Register handler in `routes.ts` (AC: 5)
  - [x] Import `deleteHandler` from `./handlers/delete.route.js`
  - [x] Register with `fastify.register(deleteHandler)`

- [x] Task 6: Run full API tests and regressions (AC: 1–5)
  - [x] Run `npm run test -w apps/api`
  - [x] Confirm no regressions in `GET`, `POST`, and `PATCH` route tests

- [x] Task 7: Regenerate OpenAPI spec and verify contract
  - [x] Run `npm run openapi:export -w apps/api`
  - [x] Verify `DELETE /todos/{id}` appears in `apps/api/openapi.json`
  - [x] Verify response codes and envelope contract are correct

## Dev Notes

### Story Foundation & Business Context

- This story completes the API write-path for permanent deletion and unblocks Story 3.3 (`TaskItem` delete action) and Story 3.4 (full lifecycle E2E).
- Deletion must be **permanent** and verifiable via subsequent `GET /todos`.
- Keep response and error envelopes consistent with existing API conventions.

### Technical Requirements (Must Follow)

- Endpoint contract:
  - `DELETE /todos/:id` → `204 No Content` on success
  - `DELETE /todos/:id` → `404` with `{ error: { code: 'NOT_FOUND', message: 'Todo not found' } }` when id does not exist
- Validation:
  - UUID param validation via Fastify schema (`format: 'uuid'`)
  - Invalid UUID must return 400 with the standard error envelope
- Layering:
  - Route handler owns HTTP semantics and response codes
  - Service owns operation orchestration
  - Queries own Drizzle calls
- No changes to data model are required for this story.

### Architecture Compliance Guardrails

- Preserve `routes.ts` as aggregator plugin registering per-verb handlers from `handlers/`.
- Follow existing handler style from `post.route.ts` and `patch.route.ts`:
  - `FastifyPluginAsync`
  - `attachValidation: true`
  - app-level error envelope conventions (`errorResponseSchema`)
- Keep all Drizzle imports in `queries.ts`; none in `service.ts` or route handlers.
- Keep 204 response body empty (do not send `{ data: ... }` on delete success).

### Library & Framework Requirements

Use currently installed project stack and patterns (no version upgrades in this story):

- `fastify@^5.8.2`
- `drizzle-orm@^0.45.1`
- `vitest@^3.2.4`
- `@fastify/swagger@^9.7.0` + `@fastify/swagger-ui@^5.2.5`

### File Structure Requirements

Create:

- `apps/api/src/features/todos/handlers/delete.route.ts`
- `apps/api/src/features/todos/handlers/delete.route.test.ts`
- `apps/api/src/features/todos/handlers/delete.schema.ts`

Modify:

- `apps/api/src/features/todos/routes.ts` (register delete handler)
- `apps/api/src/features/todos/service.ts` (add `deleteTodo` service function)
- `apps/api/src/features/todos/queries.ts` (add `deleteTodoById` query function)
- `apps/api/openapi.json` (regenerated)

Do not modify unrelated frontend files in this story.

### Testing Requirements

- Write failing contract tests first (Red phase).
- Contract tests must use `buildApp()` + `app.inject()` (no external server process).
- Use existing DB setup pattern (`beforeEach` clears `todos` table).
- Add explicit assertions for:
  - 204 success with empty response body
  - 404 not found behavior
  - persistence (todo absent after delete)
  - invalid UUID validation failure
- Run full API test suite after Green phase.

### Previous Story Intelligence (3.1)

- Reuse validation handling pattern from PATCH handler (`attachValidation`, shaped `VALIDATION_ERROR`).
- Reuse file organization pattern: each HTTP verb has dedicated `handlers/*.route.ts`, `handlers/*.schema.ts`, and `handlers/*.route.test.ts`.
- Keep existing API envelopes and boundary separation unchanged.
- Previous story introduced strict checks for semantic validation errors; keep this consistency for delete route params.

### Git Intelligence Summary

Recent commits indicate stable conventions to follow:

- `c9be10b` — e2e coverage updates
- `88159a2` — web create flow implementation
- `d04f739` and `0b80244` — API endpoint patterns (POST + review-driven hardening)
- `eb52b98` — story artifact/workflow updates

Actionable takeaway: continue endpoint implementation in the same pattern used for POST/PATCH (contract tests first, plugin registration in `routes.ts`, strict envelope consistency, and OpenAPI regeneration).

### Latest Technical Information

No external upgrades are required for this story. The codebase already uses current project-pinned versions for Fastify, Drizzle, and Vitest. For implementation safety:

- Keep Fastify schema-driven validation behavior (`attachValidation`) unchanged.
- Keep Drizzle mutation semantics explicit and deterministic.
- Keep OpenAPI regeneration part of done criteria.

### Project Context Reference

No `project-context.md` file was discovered in workspace using pattern `**/project-context.md`. Use planning artifacts and existing implementation artifacts as canonical context.

### Anti-Patterns to Avoid

- Do **not** return `200` or body payload on successful delete; must be `204` with no body.
- Do **not** place Drizzle logic in route or service layer.
- Do **not** skip contract tests for invalid UUID and not-found behavior.
- Do **not** modify `GET`, `POST`, or `PATCH` behavior while implementing delete.
- Do **not** change shared schema contracts unless a failing test proves necessity.

### References

- `_bmad-output/planning-artifacts/epics.md` — Story 3.2 requirements and AC
- `_bmad-output/planning-artifacts/architecture.md` — REST patterns, response envelopes, layering boundaries
- `_bmad-output/implementation-artifacts/3-1-patch-todos-id-api-endpoint.md` — prior story patterns and lessons
- `apps/api/src/features/todos/handlers/post.route.ts` — handler conventions
- `apps/api/src/features/todos/handlers/patch.route.ts` — validation + not-found conventions
- `apps/api/src/features/todos/handlers/post.route.test.ts` and `patch.route.test.ts` — contract test conventions
- `apps/api/src/features/todos/routes.ts`, `service.ts`, `queries.ts` — integration points for this story

---

## Story Completion Status

- Story implementation completed with acceptance criteria satisfied.
- Status set to `done`.
- Completion note: **DELETE endpoint implemented, tested, validated, reviewed, and approved**.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Red phase: `npm run test -w apps/api -- src/features/todos/handlers/delete.route.test.ts` failed before route implementation
- Green phase: `TESTCONTAINERS_RYUK_DISABLED=true npx vitest run src/features/todos/handlers/delete.route.test.ts` passed (5/5)
- Regression suite: `TESTCONTAINERS_RYUK_DISABLED=true npm run test -w apps/api` passed (40/40)
- Lint: `npm run lint -w apps/api` passed
- OpenAPI export: `npm run openapi:export -w apps/api` completed successfully

### Completion Notes List

- Implemented `DELETE /todos/:id` with 204 success and 404 not-found envelope
- Added route contract tests covering success, persistence, invalid UUID, non-existent UUID, and repeated delete behavior
- Added `deleteTodoById()` in query layer and `deleteTodo()` in service layer preserving route → service → queries boundaries
- Added `delete.schema.ts` and registered `deleteHandler` in feature routes aggregator
- Regenerated OpenAPI and verified `/todos/{id}` now includes `delete`
- Verified no regressions across API test suite and lint checks

### File List

- `_bmad-output/implementation-artifacts/3-2-delete-todos-id-api-endpoint.md` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `apps/api/src/features/todos/handlers/delete.route.test.ts` (new)
- `apps/api/src/features/todos/handlers/delete.route.ts` (new)
- `apps/api/src/features/todos/handlers/delete.schema.ts` (new)
- `apps/api/src/features/todos/queries.ts` (modified)
- `apps/api/src/features/todos/service.ts` (modified)
- `apps/api/src/features/todos/routes.ts` (modified)
- `apps/api/openapi.json` (modified)

### Change Log

- 2026-04-06: Implemented Story 3.2 DELETE endpoint with full contract tests, route/service/query wiring, OpenAPI regeneration, and full API regression validation.
- 2026-04-06: Senior Developer Review (AI) — 0 HIGH, 2 MEDIUM, 2 LOW findings. All fixed automatically. Status set to done.

## Senior Developer Review (AI)

### Outcome

Approved (after fixes)

### Findings

1. **MEDIUM — Validation error for invalid UUID exposes raw Ajv message to API consumers.**
   The handler forwarded `request.validationError.message` verbatim, leaking internal Ajv text like `params/id must match format "uuid"`. Fixed by replacing with domain-specific `"id must be a valid UUID"` message.
   Evidence: `apps/api/src/features/todos/handlers/delete.route.ts` line 34.

2. **MEDIUM — Persistence test uses weak `.toBeFalsy()` assertion.**
   `Array.find()` returns `undefined` when no match is found; `.toBeFalsy()` also passes for `null`, `0`, `''`, `false`. Fixed by replacing with `.toBeUndefined()` which precisely expresses intent.
   Evidence: `apps/api/src/features/todos/handlers/delete.route.test.ts` line 57.

3. **LOW — Missing trailing newline in `openapi.json`.** Fixed.

4. **LOW — `seedTodo` helper duplicated across test files.** No action — inline helpers are simpler for self-contained test files.

### Acceptance Criteria Verification Summary

- AC1 (TDD): **Implemented** — test file exists, RED phase confirmed in dev log.
- AC2 (204 success): **Implemented** — test verifies 204 + empty body.
- AC3 (404 not found): **Implemented** — test verifies 404 + error envelope.
- AC4 (Persistence): **Implemented** — test verifies GET after DELETE returns empty list.
- AC5 (Architecture): **Implemented** — handler → service → queries; no Drizzle in service.

### Resolution Summary

- MEDIUM issues fixed: 2/2
- LOW issues fixed: 1/1 (1 deferred as informational)
- All 40/40 API tests pass after fixes, lint clean.
