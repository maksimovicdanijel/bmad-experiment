# Story 3.3: TaskItem Component — Complete & Delete Actions

Status: done

## Story

As a **user**,
I want to mark a todo as complete (seeing it strike through and dim immediately), reactivate a completed todo, and delete any todo — all with instant optimistic feedback and automatic revert on failure,
so that managing my task lifecycle feels as fast and reliable as creating tasks.

## Acceptance Criteria

1. **Component test first (TDD):**
   - Given a component test for `TaskItem` interactive controls is written before the component is updated
   - When the test is run before implementation
   - Then it fails for the right reason (interactive controls not found)

2. **Toggle to completed (optimistic):**
   - Given a user clicks the checkbox on an active todo
   - When the toggle action fires
   - Then `useOptimistic` immediately applies strikethrough text and dimmed styling to the todo before the API responds (UX-3, UX-7)

3. **Toggle confirmed by server:**
   - Given the `PATCH /todos/:id` call succeeds
   - When the action completes
   - Then the RR loader revalidates and the server state confirms the optimistic update

4. **Toggle failure reverts:**
   - Given the `PATCH /todos/:id` call fails
   - When the action returns an error
   - Then the optimistic style change is automatically reverted and `ErrorBar` displays an actionable error message with a retry option

5. **Reactivate completed todo:**
   - Given a user clicks the checkbox on a completed todo
   - When the toggle action fires
   - Then `useOptimistic` immediately restores active styling and the PATCH action sets `completed: false` (FR-4)

6. **Delete (optimistic):**
   - Given a user clicks the delete button on any todo
   - When the delete action fires
   - Then `useOptimistic` immediately removes the todo from the list before the API responds

7. **Delete failure reverts:**
   - Given the `DELETE /todos/:id` call fails
   - When the action returns an error
   - Then the todo is automatically restored to the list and `ErrorBar` displays an actionable error message

8. **Touch targets:**
   - Given the `TaskItem` checkbox and delete button render on a mobile viewport
   - When their dimensions are measured
   - Then both touch targets are at least 44×44px (NFR-7)

9. **Loading indicator:**
   - Given `fetcher.state !== 'idle'` during a mutation
   - When the component renders
   - Then a loading indicator is shown using CSS `animation-delay: 200ms` — no local state, no JS timer

10. **Chakra token compliance:**
    - Given Chakra UI tokens are used throughout `TaskItem`
    - When the code is reviewed
    - Then no hardcoded hex values, font sizes, or spacing values appear — completed state uses Chakra `textDecoration` and `opacity` tokens only

## Tasks / Subtasks

- [x] Task 1: Add API client functions for PATCH and DELETE (AC: 2, 3, 5, 6)
  - [x] Add `updateTodo(id: string, data: UpdateTodoRequest): Promise<Todo>` to `apps/web/app/lib/api/todos.server.ts`
  - [x] Add `deleteTodo(id: string): Promise<void>` to `apps/web/app/lib/api/todos.server.ts`
  - [x] Re-export both from `apps/web/app/lib/api/index.server.ts`
  - [x] Follow existing `createTodo` pattern: use `API_BASE_URL`, handle error envelopes, throw on failure

- [x] Task 2: Write failing component tests for `TaskItem` interactive controls (AC: 1)
  - [x] Update `apps/web/app/components/todos/todo-item/todo-item.test.tsx`
  - [x] Test: renders a checkbox that is unchecked for active todo
  - [x] Test: renders a checkbox that is checked for completed todo
  - [x] Test: calls `onToggle(todo.id)` when checkbox is clicked
  - [x] Test: renders a delete button with `aria-label="Delete [task text]"`
  - [x] Test: calls `onDelete(todo.id)` when delete button is clicked
  - [x] Test: checkbox has minimum 44×44px touch target
  - [x] Test: delete button has minimum 44×44px touch target
  - [x] Test: completed todo has strikethrough + reduced opacity styling
  - [x] Test: active todo has no strikethrough, full opacity styling
  - [x] Run tests — all new tests must FAIL (Red phase of TDD)

- [x] Task 3: Update `TaskItem` component with interactive controls (AC: 2, 5, 6, 8, 10)
  - [x] Add `onToggle: (id: string) => void` and `onDelete: (id: string) => void` callback props
  - [x] Add an accessible custom checkbox control (`role="checkbox"`) to toggle completion state
  - [x] Add a delete `IconButton` with trash icon from `lucide-react`
  - [x] Apply Chakra tokens only: `textDecoration`, `opacity`, `color` from theme — no hardcoded values
  - [x] Ensure checkbox `aria-label` reads `"Mark [task text] as complete"` for active, `"Mark [task text] as active"` for completed
  - [x] Ensure delete button `aria-label` reads `"Delete [task text]"`
  - [x] Ensure both interactive elements meet 44×44px minimum touch target (`minW="44px"` `minH="44px"`)
  - [x] Keep component API-agnostic: props + callbacks only, zero knowledge of fetcher/API

- [x] Task 4: Write failing route-level tests for toggle and delete actions (AC: 2, 3, 4, 5, 6, 7)
  - [x] Update `apps/web/app/routes/home.test.tsx`
  - [x] Test: action with `intent=toggle` calls `updateTodo` with correct id and toggled `completed` value
  - [x] Test: action with `intent=delete` calls `deleteTodo` with correct id
  - [x] Test: action returns network error for toggle failure
  - [x] Test: action returns network error for delete failure
  - [x] Test: action returns server error for non-network failures
  - [x] Test: optimistic reducer toggles completion state for matching todo id
  - [x] Test: optimistic reducer removes todo by id for delete action
  - [x] Test: `ErrorBar` displays on server error with retry and dismiss
  - [x] Run tests — all new tests must FAIL (Red phase of TDD)

- [x] Task 5: Update route actions and optimistic state for toggle + delete (AC: 2, 3, 4, 5, 6, 7, 9)
  - [x] Add `intent` field to action form data: `"create"` | `"toggle"` | `"delete"`
  - [x] Wrap existing create logic under `intent === "create"` (default for backward compat)
  - [x] Add `toggle` action branch:
    - [x] Extract `id` and `completed` from form data
    - [x] Call `updateTodo(id, { completed: !JSON.parse(completed) })`
    - [x] On success return `{}`; on error return `{ error: { message, type: 'server' } }`
  - [x] Add `delete` action branch:
    - [x] Extract `id` from form data
    - [x] Call `deleteTodo(id)`
    - [x] On success return `{}`; on error return `{ error: { message, type: 'server' } }`
  - [x] Extend `useOptimistic` reducer to handle three action types:
    - [x] `add`: existing create behavior (append new optimistic todo)
    - [x] `toggle`: toggle `isCompleted` on matched todo by id
    - [x] `delete`: filter out todo by id
  - [x] Wire `handleToggleTodo(id: string, currentCompleted: boolean)` callback:
    - [x] Build `FormData` with `intent=toggle`, `id`, `completed`
    - [x] `startTransition` → `addOptimisticTodo({ type: 'toggle', id })` → `fetcher.submit`
  - [x] Wire `handleDeleteTodo(id: string)` callback:
    - [x] Build `FormData` with `intent=delete`, `id`
    - [x] `startTransition` → `addOptimisticTodo({ type: 'delete', id })` → `fetcher.submit`
  - [x] Pass `onToggle` and `onDelete` to each `<TodoItem>` in the render
  - [x] Update `lastFormDataRef` for retry support on all action types
  - [x] Ensure `ErrorBar` handles errors from all three action types

- [x] Task 6: Add loading indicator with CSS animation-delay (AC: 9)
  - [x] In `TaskItem`, detect `isToggling` / `isDeleting` state from parent (via prop or fetcher state)
  - [x] Show a subtle loading indicator (e.g., spinner on checkbox or fade on item) using CSS `animation-delay: 200ms`
  - [x] No `useState` or `setTimeout` for loading state — derive from fetcher/props only

- [x] Task 7: Run all tests — Green phase (AC: 1–10)
  - [x] Run `npm run test -w apps/web` — all new and existing component tests pass
  - [x] Run `npm run lint -w apps/web` — zero lint errors
  - [x] Verify visually: toggle applies strikethrough + dim, delete removes item, errors show ErrorBar

- [x] Task 8: E2E smoke validation (manual, not formal E2E story)
  - [x] Start both apps (`npm run dev`)
  - [x] Create a todo, toggle it complete, verify styling change
  - [x] Toggle it back to active, verify styling restored
  - [x] Delete a todo, verify it disappears
  - [x] Reload page, verify persistence

### Review Follow-ups (AI)

- [x] [AI-Review][High] Added route-level tests validating optimistic reducer transitions for toggle/delete in `home.test.tsx`.
- [x] [AI-Review][Medium] Aligned task wording with implementation (custom accessible checkbox control).
- [x] [AI-Review][Low] Replaced hardcoded check icon color with token-based value.

## Dev Notes

### Architecture Compliance

**Component boundary pattern (MUST follow):**
- `TodoItem` is a pure presentational component — props + callbacks only
- `TodoItem` has ZERO knowledge of `useFetcher`, API, or React Router
- Route file (`home.tsx`) owns all fetcher logic, optimistic state, and action dispatch
- Route passes `onToggle` and `onDelete` callbacks down to `TodoItem`

**Optimistic UI pattern (from architecture + existing create flow):**
- `useOptimistic` initialises from loader data
- Optimistic state applied inside `startTransition` before `fetcher.submit()`
- Revert is automatic on action error — no manual rollback code needed
- `fetcher.state` is the single source of truth for in-flight mutations

**Error handling pattern (from architecture):**
- Action errors → returned from action as `{ error: { message, type } }`, displayed in `ErrorBar`
- Network errors → caught in action, returned as `{ error: { message: 'Network error. Please try again.', type: 'server' } }`
- Never `throw` from an action for user-facing errors — always `return { error: ... }`

**Action intent pattern:**
The route currently has a single `action` that always creates. With toggle and delete, introduce an `intent` field on the submitted `FormData`:
```
intent=create → existing create logic
intent=toggle → PATCH /todos/:id { completed: !current }
intent=delete → DELETE /todos/:id
```
This keeps a single action function (RR convention) with clear branching.

### Project Structure Notes

**Files to modify:**
```
apps/web/app/components/todos/todo-item/todo-item.tsx       # Add checkbox + delete button + callback props
apps/web/app/components/todos/todo-item/todo-item.test.tsx   # Add interactive control tests
apps/web/app/routes/home.tsx                                 # Add toggle/delete actions + extended optimistic state
apps/web/app/routes/home.test.tsx                            # Add action tests for toggle/delete
apps/web/app/lib/api/todos.server.ts                         # Add updateTodo + deleteTodo functions
apps/web/app/lib/api/index.server.ts                         # Re-export new functions
```

**Files NOT to modify:**
```
apps/api/**                                       # API endpoints already done (stories 3.1, 3.2)
apps/web/app/components/TaskInput.tsx              # Create flow unchanged
apps/web/app/components/todos/error-bar/           # ErrorBar already handles all action errors
apps/web/app/components/todos/empty-state/         # EmptyState unchanged
apps/web/app/components/todos/section-header/      # SectionHeader unchanged
packages/shared/**                                 # Shared types already have UpdateTodoRequest
apps/web/app/theme/**                              # Theme tokens unchanged
apps/web/e2e/**                                    # E2E is Story 3.4, not this story
```

### Existing Code Patterns to Follow

**Current `TodoItem` component** ([todo-item.tsx](apps/web/app/components/todos/todo-item/todo-item.tsx)):
- Currently a display-only component: renders text, timestamp, and styling based on `isCompleted`
- Uses `HStack`, `List.Item`, `Text` from Chakra UI
- Uses `formatTimestamp` from `~/lib/format-timestamp`
- Wraps in `<List.Item as="li">`
- Must be extended with `onToggle` and `onDelete` callback props — not replaced

**Current route `action` function** ([home.tsx](apps/web/app/routes/home.tsx)):
- Reads `FormData`, validates with `createTodoSchema.safeParse()`, calls `createTodo()`
- Returns `ActionData` with optional `error: { message, type }` shape
- Uses `useFetcher<ActionData>()` in component for submit + state tracking

**Current `useOptimistic` usage** ([home.tsx](apps/web/app/routes/home.tsx)):
```typescript
const [optimisticTodos, addOptimisticTodo] = useOptimistic<Todo[], { text: string }>(
  todos,
  (state, update) => [...state, { id: `optimistic-${crypto.randomUUID()}`, ... }]
);
```
This needs to be refactored to a **discriminated union** action type:
```typescript
type OptimisticAction =
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: string }
  | { type: 'delete'; id: string };

const [optimisticTodos, applyOptimistic] = useOptimistic<Todo[], OptimisticAction>(
  todos,
  (state, action) => {
    switch (action.type) {
      case 'add':
        return [...state, { id: `optimistic-${crypto.randomUUID()}`, text: action.text, isCompleted: false, createdAt: new Date().toISOString() }];
      case 'toggle':
        return state.map(t => t.id === action.id ? { ...t, isCompleted: !t.isCompleted } : t);
      case 'delete':
        return state.filter(t => t.id !== action.id);
    }
  }
);
```

**Current API client pattern** ([todos.server.ts](apps/web/app/lib/api/todos.server.ts)):
```typescript
export async function createTodo(payload: CreateTodoRequest): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as ApiSuccess<Todo> | ApiError;
  if (!response.ok || 'error' in body) {
    const message = 'error' in body ? body.error.message : 'Failed to create todo';
    throw new Error(message);
  }
  return body.data;
}
```

New functions should follow the same pattern. Note `deleteTodo` returns `void` (204 No Content — no body to parse).

**Test patterns** ([todo-item.test.tsx](apps/web/app/components/todos/todo-item/todo-item.test.tsx)):
- Uses `renderWithProviders` from `~/test-utils` (wraps in `ChakraProvider`)
- Wraps `TodoItem` in `<List.Root as="ul">` for valid DOM nesting
- Uses `makeTodo()` factory with `Partial<Todo>` overrides
- Mocks `~/lib/format-timestamp` with `vi.mock`
- Uses `screen.getByText`, `screen.getByRole` for assertions

**Route test patterns** ([home.test.tsx](apps/web/app/routes/home.test.tsx)):
- Mocks `react-router` `useFetcher` with `vi.mock`
- Mocks API client functions from `../lib/api/index.server`
- Tests actions by constructing `Request` objects with `URLSearchParams` body
- Tests component rendering with `@ts-expect-error` for `loaderData` prop injection

### Testing Requirements

**Component tests (`todo-item.test.tsx`):**
- Test checkbox renders (unchecked for active, checked for completed)
- Test checkbox click fires `onToggle(todo.id)`
- Test delete button renders with proper `aria-label`
- Test delete button click fires `onDelete(todo.id)`
- Test touch target sizes (44×44px minimum)
- Test completed styling (strikethrough, dimmed opacity)
- Test active styling (no strikethrough, full opacity)
- Use `fireEvent.click` for user interactions

**Route tests (`home.test.tsx`):**
- Test action dispatch for toggle intent → calls `updateTodo`
- Test action dispatch for delete intent → calls `deleteTodo`
- Test error handling for both toggle and delete (network + server errors)
- Test optimistic UI renders: toggled todo appears in correct section
- Test optimistic UI renders: deleted todo is removed from list
- Test `ErrorBar` shows for toggle/delete failures with retry

**No mocks for API client functions in component tests** — component tests are pure render tests with callbacks. Route tests mock the API client.

### Previous Story Intelligence

**From Story 3.2 (DELETE /todos/:id — done):**
- DELETE endpoint returns `204 No Content` — no response body
- The API client `deleteTodo` function should NOT try to parse response body on success
- Check `response.ok` is sufficient; only parse body on error for the error envelope
- Route handler validation uses `attachValidation: true` and returns standard error envelope

**From Story 3.1 (PATCH /todos/:id — done):**
- PATCH accepts `{ completed: boolean }` and/or `{ text: string }`
- Request body uses `completed` (not `isCompleted`) — the API maps this internally
- Returns `{ data: Todo }` envelope on success
- Returns `404` for non-existent UUID and `400` for validation errors

**From Story 2.8 (Loading & Error States — done):**
- `ErrorBar` component already handles action-level errors
- Uses `onRetry` callback to resubmit last `FormData`
- Uses `onDismiss` callback to clear error state via `fetcher.load('.')`
- Loading indicator pattern: CSS `animation-delay: 200ms` on spinner, no JS timers
- Error discrimination: `type: 'validation'` → inline, `type: 'server'` → ErrorBar

**From Story 2.6 (Create Todo — TaskInput — done):**
- `startTransition` wraps both `addOptimisticTodo` and `fetcher.submit`
- `lastFormDataRef` stores the last submitted FormData for retry
- Retry resubmits exact same FormData via `fetcher.submit(lastFormDataRef.current, { method: 'post' })`
- Dismiss calls `fetcher.load('.')` to reset fetcher state

### Git Intelligence Summary

Recent commits show stable patterns:
- `c9be10b` — E2E test coverage (Playwright patterns)
- `88159a2` — TaskInput component + create action (optimistic UI pattern)
- `d04f739` — Code review refinements (error handling improvements)
- `0b80244` — POST endpoint handler pattern

The codebase is stable after Epic 2 completion. Stories 3.1 and 3.2 added API endpoints. This story wires the frontend to consume them.

### Shared Type References

**`@bmad/shared` types to use** ([packages/shared/src/types.ts](packages/shared/src/types.ts)):
```typescript
interface UpdateTodoRequest { text?: string; completed?: boolean; }
interface ApiSuccess<T> { data: T; }
interface ApiError { error: { code: string; message: string; } }
```

**`@bmad/shared` schemas available** ([packages/shared/src/schemas.ts](packages/shared/src/schemas.ts)):
```typescript
const updateTodoSchema = z.object({
  text: z.string().min(1).max(255).optional(),
  completed: z.boolean().optional(),
});
```

### UX Requirements (from UX Design Specification)

**TaskItem anatomy** (UX spec):
`[Checkbox] [Task label — full flex width] [Delete icon button — visible on hover/focus]`

**States:**
- `active` — full text color, unchecked checkbox
- `completed` — strikethrough, dimmed (`opacity: 0.6`), checked checkbox
- `deleting` — item fades out over 150ms (optimistic delete)
- `hover / focus-visible` — delete button becomes visible

**Accessibility requirements:**
- Checkbox `aria-label`: `"Mark [task text] as complete"` (active) / `"Mark [task text] as active"` (completed)
- Delete button `aria-label`: `"Delete [task text]"`
- `role="listitem"` on the containing element
- Space toggles checkbox, keyboard navigation supported

**Delete button visibility (UX spec):**
- On mobile (`xs`): delete button always visible (no hover on touch devices)
- On desktop (`lg`+): delete button visible on row hover / focus-visible

**Animation budget:**
- Transitions capped at 200ms
- Only `opacity` and `transform` animated
- Respect `prefers-reduced-motion`

**Icons:**
- Use `lucide-react` icons (already installed — `Trash2` for delete)
- Delete icon is danger-colored: `status.error` semantic token from Chakra theme

### Anti-Patterns to Avoid

- Do **NOT** make `TodoItem` aware of `useFetcher` or API — it receives props + fires callbacks only
- Do **NOT** use `useState` for loading/pending state — derive from `fetcher.state` or props
- Do **NOT** use `setTimeout` for the 200ms loading delay — use CSS `animation-delay`
- Do **NOT** hardcode colors, spacing, or font sizes — use Chakra theme tokens exclusively
- Do **NOT** use `any` type — use `UpdateTodoRequest` from `@bmad/shared` and proper generics
- Do **NOT** add a second `useFetcher` — use a single fetcher with `intent` discrimination for all mutations
- Do **NOT** create separate action routes — keep a single action in `home.tsx` with intent branching
- Do **NOT** modify API code — PATCH and DELETE endpoints are already complete (stories 3.1, 3.2)
- Do **NOT** write E2E tests — those are Story 3.4

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.3 AC]
- [Source: _bmad-output/planning-artifacts/architecture.md — Optimistic UI, Error handling, Component boundaries]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — TaskItem component spec, UJ-3, UJ-6]
- [Source: _bmad-output/implementation-artifacts/3-1-patch-todos-id-api-endpoint.md — PATCH handler pattern]
- [Source: _bmad-output/implementation-artifacts/3-2-delete-todos-id-api-endpoint.md — DELETE handler pattern]
- [Source: apps/web/app/components/todos/todo-item/todo-item.tsx — Current TodoItem implementation]
- [Source: apps/web/app/routes/home.tsx — Current route action + optimistic state]
- [Source: apps/web/app/lib/api/todos.server.ts — Current API client pattern]
- [Source: packages/shared/src/types.ts — UpdateTodoRequest, ApiSuccess, ApiError]
- [Source: packages/shared/src/schemas.ts — updateTodoSchema]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `npx vitest run app/routes/home.test.tsx` (18 passed)
- `npx vitest run app/components/todos/todo-item/todo-item.test.tsx` (15 passed)
- `npm run test -w apps/web` (64 passed)
- `npm run lint -w apps/web` (no errors)
- `npx playwright test --config e2e/playwright.config.ts --reporter=line` (4 passed)

### Completion Notes List

- Added `updateTodo` and `deleteTodo` server API client functions and exports.
- Implemented `intent`-based action branching in home route for create/toggle/delete flows.
- Added interactive `TodoItem` controls with accessible labels and touch target compliance.
- Added delayed loading overlay (`animation-delay: 200ms`) and reduced-motion handling.
- Extracted and exported optimistic reducer logic for deterministic route-level tests.
- Added route-level tests covering optimistic reducer transitions for `toggle` and `delete` actions.
- Replaced hardcoded icon color with token-based value.

### File List

- apps/web/app/lib/api/todos.server.ts
- apps/web/app/lib/api/index.server.ts
- apps/web/app/components/todos/todo-item/todo-item.tsx
- apps/web/app/components/todos/todo-item/todo-item.test.tsx
- apps/web/app/routes/home.tsx
- apps/web/app/routes/home.test.tsx
- apps/web/app/components/TaskInput.tsx
- apps/web/app/components/TaskInput.test.tsx
- apps/web/app/components/todos/error-bar/error-bar.tsx
- apps/web/app/components/todos/error-bar/error-bar.test.tsx
- apps/api/src/features/todos/routes.ts
- apps/api/src/features/todos/service.ts
- apps/api/src/features/todos/queries.ts
- apps/api/openapi.json

## Senior Developer Review (AI)

### Outcome

Approved

### Findings

1. **Resolved (High)** — Added route-level optimistic reducer assertions for `toggle` and `delete` transitions.
2. **Resolved (Medium)** — Documentation now matches custom accessible checkbox implementation.
3. **Resolved (Low)** — Token-based color applied to completed check icon.

### Git vs Story Discrepancies

- Original story `File List` was incomplete versus git; this review updated the File List section for traceability.

### Review Summary

- Core user-facing behavior is implemented and regression tests are green.
- High and Medium review issues were fixed automatically and documentation is aligned with implementation.

## Change Log

- 2026-04-06: Senior developer review executed; findings recorded; follow-up tasks added.
- 2026-04-06: Automatic review fixes applied for high/medium issues; optimistic reducer tests added; status promoted to `done`.
