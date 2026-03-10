# Story 2.2: Todo List Page — Loader, Layout & Empty State

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to open the app and immediately see my todos (or a clear empty-state prompt if none exist), with the page loading in under 1 second,
so that I can orient myself and start capturing tasks without any navigation or setup.

## Acceptance Criteria

1. **Given** a component test for `EmptyState` is written before the component is implemented,
   **When** the test is run before implementation,
   **Then** it fails for the right reason (component not found).

2. **Given** no todos exist in the database,
   **When** the page loads,
   **Then** the `EmptyState` component renders with a clear call-to-action prompt inviting the first task entry (UX-4).

3. **Given** todos exist in the database,
   **When** the page loads,
   **Then** the RR loader fetches them via `api.client` calling `GET /todos`, and the list renders each todo with its text and formatted `createdAt` timestamp (FR-2, UX-10).

4. **Given** the page renders,
   **When** measured via Largest Contentful Paint,
   **Then** the page load completes in under 1 second on standard broadband (NFR-1).

5. **Given** the page renders on a 320px wide viewport,
   **When** the layout is inspected,
   **Then** all content is visible, scrollable, and fully interactive without horizontal overflow (NFR-6).

6. **Given** the page renders on a 1920px wide viewport,
   **When** the layout is inspected,
   **Then** content is constrained to a comfortable max-width container and remains centred.

7. **Given** all text and interactive elements are rendered,
   **When** colour contrast is measured,
   **Then** all text meets WCAG 2.1 AA minimum contrast ratio of 4.5:1 (NFR-8).

8. **Given** Chakra UI tokens are used throughout,
   **When** the code is reviewed,
   **Then** no hardcoded hex values, font sizes, or spacing values appear — all use Chakra theme tokens.

## Tasks / Subtasks

- [x] Task 1: Regenerate the Massimo API client (prerequisite)
  - [x] Run `npm run generate:client` from the workspace root to regenerate `apps/web/app/lib/api-client/` with the `GET /todos` endpoint from `apps/api/openapi.json`
  - [x] Verify the generated client exports a method for `GET /todos` that returns `{ data: Todo[] }`
  - [x] Create a thin wrapper `apps/web/app/lib/api.server.ts` that imports and configures the generated client with `VITE_API_URL` base URL, exports typed helper functions for use in RR loaders (server-only module)
  - [x] **Note:** If Massimo output is unusable or doesn't expose typed methods for the `GET /todos` endpoint, create a manual fetch wrapper in `api.server.ts` — see Dev Notes for the pattern

- [x] Task 2: Write failing component tests for `EmptyState` (AC: 1, 2)
  - [x] Create `apps/web/app/components/todos/empty-state/empty-state.test.tsx`
  - [x] Write test: `first-use` variant renders clipboard icon, headline `"Nothing here yet."`, and copy `"Type above to capture your first task."`
  - [x] Write test: `all-done` variant renders checkmark icon, headline `"All done!"`, and copy `"Your active list is clear."`
  - [x] Write test: component has `role="status"` and `aria-live="polite"`
  - [x] Run tests — all must fail for the right reason (component not found / cannot import)

- [x] Task 3: Implement `EmptyState` component (AC: 2, 7, 8)
  - [x] Create `apps/web/app/components/todos/empty-state/empty-state.tsx`
  - [x] Accept prop `variant: 'first-use' | 'all-done'`
  - [x] `first-use` variant: clipboard outline icon, headline `"Nothing here yet."`, copy `"Type above to capture your first task."`
  - [x] `all-done` variant: checkmark circle icon (`status.success` token), headline `"All done!"`, copy `"Your active list is clear."`
  - [x] Use Chakra `VStack`, `Icon`, `Heading`, `Text` — all styled with theme tokens only
  - [x] Add `role="status"` and `aria-live="polite"` on the container
  - [x] Add fade-in transition via `opacity` (200ms), respecting `prefers-reduced-motion`
  - [x] Run tests — all must pass (GREEN)

- [x] Task 4: Write failing component tests for `SectionHeader` (AC: 3, 8)
  - [x] Create `apps/web/app/components/todos/section-header/section-header.test.tsx`
  - [x] Write test: renders label text and count (e.g., `"ACTIVE — 3"`)
  - [x] Write test: shows `— 0` when count is 0 (preserves layout stability)
  - [x] Write test: has `role="heading"` and `aria-level="2"`
  - [x] Write test: count is wrapped in `aria-live="polite"`
  - [x] Run tests — all must fail

- [x] Task 5: Implement `SectionHeader` component (AC: 3, 7, 8)
  - [x] Create `apps/web/app/components/todos/section-header/section-header.tsx`
  - [x] Accept props: `label: string`, `count: number`
  - [x] Render label uppercase with `--text-xs` sizing, `letter-spacing: 0.08em`, `fg.muted` color
  - [x] Render count using `aria-live="polite"` span
  - [x] Use `role="heading"` `aria-level={2}` on container
  - [x] Style with Chakra tokens only — no hardcoded values
  - [x] Run tests — all must pass (GREEN)

- [x] Task 6: Write failing tests for the todo list page route (AC: 2, 3, 5, 6)
  - [x] Create `apps/web/app/routes/home.test.tsx`
  - [x] Write test: when loader returns empty array, `EmptyState` `first-use` variant is rendered
  - [x] Write test: when loader returns todos, each todo's `text` and formatted `createdAt` is rendered
  - [x] Write test: todos render within a max-width container (responsive constraint)
  - [x] Run tests — all must fail

- [x] Task 7: Implement the todo list page route with loader and D4 layout (AC: 2, 3, 4, 5, 6, 7, 8)
  - [x] Replace the existing scaffold content in `apps/web/app/routes/home.tsx` with the todo list page
  - [x] Implement the RR `loader` function: call `GET /todos` via the API client/wrapper, return `{ todos: Todo[] }`
  - [x] Implement the D4 layout: single-column, `max-width: 640px`, centred
  - [x] Render `SectionHeader` for "ACTIVE" section with active todo count
  - [x] Render todo items: each shows `text` and formatted `createdAt` (relative or formatted timestamp — UX-10)
  - [x] Active todos styled with full `fg.default` color; completed todos with `textDecoration: line-through` and `fg.muted`/`color-text-disabled` opacity
  - [x] Render `SectionHeader` for "COMPLETED" section with completed todo count
  - [x] When active list is empty and no todos exist at all → render `EmptyState` `first-use` variant
  - [x] When active list is empty but completed todos exist → render `EmptyState` `all-done` variant
  - [x] When completed section is empty → show `SectionHeader` with `— 0` count, no empty state message
  - [x] Use semantic HTML: `<ul>` / `<li>` for todo lists
  - [x] Responsive: full-width on mobile (320px+), `max-width: 640px` centred on md+ (768px+)
  - [x] `padding-inline: 16px` at `xs`, `24px` at `md`, `32px` at `lg`
  - [x] All styling via Chakra tokens — zero hardcoded hex values, font sizes, or spacing
  - [x] Update `meta` function: title `"bmad-experiment"`, description updated for todo app
  - [x] Run tests — all must pass (GREEN)

- [x] Task 8: Run full validation (AC: 1–8)
  - [x] Run `npm run test -w apps/web` — all component and route tests pass (14/14)
  - [x] Run `npm run lint -w apps/web` — zero new lint errors (pre-existing generated client lint error only)
  - [x] Run `npm run build -w apps/web` — TypeScript compiles and RR build succeeds
  - [x] Run `npm run test` from workspace root — web (14 pass) and shared (1 pass) tests pass; API tests skipped (Docker/testcontainers unavailable — pre-existing)
  - [ ] Visual inspection: `npm run dev` → open browser at `localhost:5173` → verify:
    - Empty state renders when no todos (or after `DELETE` from all todos via API)
    - Todos render with text and timestamps when seeded (run `npm run db:seed` first)
    - Responsive layout at 320px, 768px, 1920px viewports
    - Dark theme applied, no light-mode flash

## Dev Notes

### Architecture Compliance

This story implements the first frontend feature page following the architecture's frontend patterns:

```
routes/home.tsx (RR route — loader + page render)
  → api.server.ts (API client wrapper — server-only)
    → lib/api-client/ (Massimo-generated client)
  → components/todos/empty-state/ (EmptyState component)
  → components/todos/section-header/ (SectionHeader component)
```

**Boundary enforcement:**
- `routes/home.tsx` — owns the loader and page composition; passes data as props to child components
- Components (`EmptyState`, `SectionHeader`) — accept props and callbacks only; zero knowledge of API or loaders
- `api.server.ts` — server-only module; the ONLY file allowed to make HTTP requests to the API
- No raw `fetch()` calls in route files or components — always go through the API wrapper

### ⚠️ CRITICAL: API Client Regeneration Required

The Massimo-generated API client at `apps/web/app/lib/api-client/` was **NOT regenerated** after Story 2.1 added the `GET /todos` endpoint. The current `api.client.openapi.json` in that folder has **empty `paths: {}`**.

**Before starting any other task:**
1. Run `npm run generate:client` from the workspace root
2. This will regenerate `apps/web/app/lib/api-client/` from `apps/api/openapi.json` (which has the GET endpoint)
3. Verify the generated client has a method for `GET /todos`

**If Massimo does not produce usable typed methods**, create a manual wrapper. See "API Client Wrapper Pattern" below.

### Existing Code Context

**Files to modify:**
- `apps/web/app/routes/home.tsx` — currently a scaffold placeholder; replace with todo list page, loader, and D4 layout

**Files to create:**
- `apps/web/app/lib/api.server.ts` — API client wrapper for RR loaders (server-only)
- `apps/web/app/components/todos/empty-state/empty-state.tsx` — EmptyState component
- `apps/web/app/components/todos/empty-state/empty-state.test.tsx` — EmptyState tests
- `apps/web/app/components/todos/section-header/section-header.tsx` — SectionHeader component
- `apps/web/app/components/todos/section-header/section-header.test.tsx` — SectionHeader tests
- `apps/web/app/routes/home.test.tsx` — route tests

**Files to NOT modify:**
- `apps/web/app/root.tsx` — already has `ChakraProvider`, `ErrorBoundary`, Inter font loading
- `apps/web/app/routes.ts` — already maps index to `routes/home.tsx`
- `apps/web/app/theme/system.ts` — Charcoal Focus theme already configured
- `apps/web/app/theme/tokens.ts` — theme tokens already defined
- `apps/web/vite.config.ts` — already configured correctly
- `apps/web/vitest.config.ts` — already configured with jsdom for `app/**/*.test.{ts,tsx}`
- `apps/web/app/root.test.tsx` — existing tests for `ErrorBoundary`
- `packages/shared/src/types.ts` — `Todo`, `ApiSuccess` types already defined

### Route Configuration

The current routing setup in `apps/web/app/routes.ts`:
```typescript
import { type RouteConfig, index } from '@react-router/dev/routes';
export default [index('routes/home.tsx')] satisfies RouteConfig;
```

This maps the root `/` URL to `routes/home.tsx`. **Do NOT change this** — modify `home.tsx` in place. The architecture specifies `_index.tsx`, but the current project uses `home.tsx` mapped via `routes.ts`. Maintain consistency with the existing convention.

### Implementation Patterns

**API Client Wrapper Pattern (`api.server.ts`):**

If Massimo generates typed methods, wrap them:
```typescript
import type { Todo, ApiSuccess } from '@bmad/shared';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(`${API_BASE_URL}/todos`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const body: ApiSuccess<Todo[]> = await response.json();
  return body.data;
}
```

If Massimo provides methods, use them instead:
```typescript
import { setBaseUrl } from './api-client/api.client.mts';
// ... use generated methods
```

**Important env var note:** `VITE_API_URL` is defined in `.env.example` as `http://localhost:3000`. This is a Vite env var — in SSR loaders it's available via `process.env.VITE_API_URL` (Vite exposes `VITE_`-prefixed env vars).

**RR Loader Pattern:**
```typescript
import type { Route } from './+types/home';
import { fetchTodos } from '../lib/api.server';

export async function loader({}: Route.LoaderArgs) {
  const todos = await fetchTodos();
  return { todos };
}
```

**EmptyState Component Pattern:**
```typescript
import { VStack, Heading, Text, Icon } from '@chakra-ui/react';

interface EmptyStateProps {
  variant: 'first-use' | 'all-done';
}

export function EmptyState({ variant }: EmptyStateProps) {
  const isFirstUse = variant === 'first-use';
  return (
    <VStack role="status" aria-live="polite" gap="3" py="10" textAlign="center">
      {/* Icon */}
      <Heading size="md">{isFirstUse ? 'Nothing here yet.' : 'All done!'}</Heading>
      <Text color="fg.muted">
        {isFirstUse
          ? 'Type above to capture your first task.'
          : 'Your active list is clear.'}
      </Text>
    </VStack>
  );
}
```

**SectionHeader Component Pattern:**
```typescript
import { HStack, Text } from '@chakra-ui/react';

interface SectionHeaderProps {
  label: string;
  count: number;
}

export function SectionHeader({ label, count }: SectionHeaderProps) {
  return (
    <HStack role="heading" aria-level={2} gap="2" py="2">
      <Text
        fontSize="xs"
        fontWeight="bold"
        textTransform="uppercase"
        letterSpacing="0.08em"
        color="fg.muted"
      >
        {label}
      </Text>
      <Text fontSize="xs" color="fg.muted" aria-live="polite">
        — {count}
      </Text>
    </HStack>
  );
}
```

**D4 Layout Pattern (home.tsx):**
```tsx
<Container maxW="640px" px={{ base: '4', md: '6', lg: '8' }}>
  {/* TaskInput will go here in Story 2.5 */}
  <SectionHeader label="ACTIVE" count={activeTodos.length} />
  {activeTodos.length === 0 ? (
    <EmptyState variant={allTodos.length === 0 ? 'first-use' : 'all-done'} />
  ) : (
    <List.Root as="ul" listStyle="none" gap="0">
      {activeTodos.map((todo) => (
        <List.Item as="li" key={todo.id}>
          {/* Render todo text + createdAt */}
        </List.Item>
      ))}
    </List.Root>
  )}
  <SectionHeader label="COMPLETED" count={completedTodos.length} />
  {completedTodos.length > 0 && (
    <List.Root as="ul" listStyle="none" gap="0">
      {completedTodos.map((todo) => (
        <List.Item as="li" key={todo.id}>
          {/* Render completed todo */}
        </List.Item>
      ))}
    </List.Root>
  )}
</Container>
```

**Todo item rendering:** For this story, render todo items as simple list items showing `text` and `createdAt`. Full `TaskItem` component (with checkbox, delete button, optimistic UI) comes in Story 3.3. Use a simple inline render here — avoid building a full TaskItem component prematurely. The developer should:
- Show `todo.text` with `fg.default` color for active, `textDecoration: line-through` + reduced opacity for completed
- Show `todo.createdAt` formatted as a readable timestamp (e.g., using `new Date(todo.createdAt).toLocaleDateString()` or a relative time format) in `fg.muted` / smaller text
- Use semantic `<ul>` / `<li>` structure (via Chakra `List.Root` / `List.Item`)

### Testing Patterns

**Component test setup (Vitest + jsdom):**
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react'; // If @testing-library/react is available
// OR use basic React render-to-string for simpler tests
```

**⚠️ IMPORTANT: Check if `@testing-library/react` is installed.** It is NOT currently in `apps/web/package.json` devDependencies. The developer may need to:
1. Install it: `npm install -D @testing-library/react @testing-library/jest-dom -w apps/web`
2. OR use an alternative approach (e.g., `react-dom/test-utils` or snapshot tests)

**Route test pattern:** Testing RR loaders in isolation requires mocking the API call. Mock `api.server.ts` in route tests:
```tsx
import { vi, describe, it, expect } from 'vitest';
vi.mock('../lib/api.server', () => ({
  fetchTodos: vi.fn(),
}));
```

### Timestamp Formatting

For `createdAt` display (UX-10), use a simple formatted date. Do NOT install a date library (moment, date-fns, dayjs) — the `Intl.DateTimeFormat` API is sufficient:
```typescript
function formatTimestamp(isoString: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoString));
}
// Example: "Mar 10, 3:45 PM"
```

### Theme Token Reference

Current Chakra theme tokens from `apps/web/app/theme/`:

| Semantic Token     | Resolves To            | Usage in This Story                      |
|--------------------|------------------------|------------------------------------------|
| `bg.canvas`        | `charcoal.950` #0b0f14 | Page background                          |
| `bg.panel`         | `charcoal.900` #12161c | Surface/card background (if needed)      |
| `fg.default`       | `charcoal.50` #f5f7fa  | Active todo text                         |
| `fg.muted`         | `charcoal.100` #e4e9f0 | Timestamps, section header labels        |
| `border.subtle`    | `charcoal.700` #2b313d | Dividers between sections                |
| `status.success`   | `green.400` #48bb78    | All-done EmptyState icon color           |
| `status.error`     | `red.400` #fc8181      | (Not used in this story)                 |
| `accent.emphasis`  | `cyan.400` #38b2ac     | (Not used in this story — future focus)  |

**Note on UX spec colors vs current theme:** The UX spec defines Charcoal Focus with specific hex values (e.g., `--color-bg: #18181b`, `--color-text-primary: #fafafa`). The implemented theme in `tokens.ts` uses slightly different values (e.g., `charcoal.950: #0b0f14`, `charcoal.50: #f5f7fa`). **Use the implemented theme tokens** — do not try to match the UX spec hex values exactly. The theme was already validated during Story 1.3.

**Completed todo styling:** Use `textDecoration: line-through` and reduced opacity (e.g., `opacity: 0.6`) or `fg.muted` color token for completed task text. This aligns with UX-3.

### Responsive Breakpoints

Chakra UI v3 responsive props use the `base` / `md` / `lg` pattern:

| Breakpoint | Viewport    | Changes                                                     |
|------------|-------------|-------------------------------------------------------------|
| `base`     | 0–767px     | Full-width, `px="4"` (16px padding), mobile layout          |
| `md`       | 768px+      | Content centred, `maxW="640px"`, `px="6"` (24px padding)    |
| `lg`       | 1024px+     | `px="8"` (32px padding), hover states available             |

### Project Structure Notes

All new files follow the established by-feature component organisation:
```
apps/web/app/
├── components/
│   └── todos/
│       ├── empty-state/
│       │   ├── empty-state.tsx
│       │   └── empty-state.test.tsx
│       └── section-header/
│           ├── section-header.tsx
│           └── section-header.test.tsx
├── lib/
│   ├── api.server.ts          # NEW — server-only API wrapper
│   └── api-client/            # Massimo-generated (regenerated)
└── routes/
    ├── home.tsx               # MODIFIED — todo list page with loader
    └── home.test.tsx          # NEW — route tests
```

- File naming: `kebab-case` — always
- One component per file, filename matches component name (kebab-case)
- Tests co-located with source files in the same directory
- Components in `app/components/todos/` by feature

### Previous Story Intelligence

**From Story 2.1 (done — GET /todos API endpoint):**
- `GET /todos` returns `{ data: Todo[] }` ordered by `createdAt` descending
- All fields are camelCase in the JSON response: `id`, `text`, `isCompleted`, `createdAt`
- `createdAt` is returned as ISO 8601 string (e.g., `"2026-03-10T15:58:29.000Z"`) — fixed during code review (was returning PostgreSQL format)
- Global error handler returns `{ error: { code: 'INTERNAL_ERROR', message: '...' } }` for 500s
- Seed script exists: `npm run db:seed` populates 5 sample todos — use this for visual testing
- The OpenAPI spec (`apps/api/openapi.json`) was regenerated but the **Massimo client was NOT** — must regenerate before using

**From Story 1.3 (done — React Router scaffold):**
- `ChakraProvider` wraps the app root in `root.tsx` with the `system` (Charcoal Focus theme)
- `colorMode` is forced to dark via `globalCss` `colorScheme: 'dark'`
- Inter font loaded via Google Fonts `<link>` in `root.tsx` `links` function
- Root `ErrorBoundary` is SSR-safe and accessible — catches unhandled route errors
- `root.test.tsx` has existing tests for `resolveErrorBoundaryContent` — do NOT break these

**From Story 1.5 (review — containerise):**
- `@bmad/shared` uses workspace resolution (`"*"`) — import as `@bmad/shared` works correctly
- Import `Todo`, `ApiSuccess` types from `@bmad/shared` — never redefine locally

### Git Intelligence Summary

Recent commit history:
```
02cccd1 reorder stories in epic
541b3d9 fix pool and env issue
f7a28f1 feat: todos endpoint
bba3b8c containerise applications
```

**Actionable patterns:**
- Code review is actively enforced — ensure clean architecture boundaries from the start
- Keep changes scoped: this story is Loader + Layout + EmptyState only — do NOT build TaskInput (Story 2.5), full TaskItem interaction (Story 3.3), or ErrorBar (Story 2.7)
- Previous stories established patterns for test co-location, Chakra token usage, and import paths

### Library / Framework Requirements

**Already installed (no new dependencies for this story — verify `@testing-library/react`):**
- `react` ^19.2.4, `react-dom` ^19.2.4
- `react-router` 7.12.0, `@react-router/node` 7.12.0, `@react-router/serve` 7.12.0
- `@chakra-ui/react` ^3.34.0
- `@emotion/react` ^11.14.0
- `@bmad/shared` (workspace) — `Todo`, `ApiSuccess`, `ApiError` types
- `zod` ^3.25.76 — available but not needed for this story
- `vitest` ^3.2.4 — test runner
- `jsdom` ^28.1.0 — test environment

**May need to install:**
- `@testing-library/react` — for component rendering in tests
- `@testing-library/jest-dom` — for DOM assertion matchers

**No other new packages should be installed for this story.**

### Scope Boundaries — What NOT to Build

| Feature | Why NOT in this story | Which story |
|---|---|---|
| TaskInput component | Separate component story | Story 2.5 |
| TaskItem component (checkbox, delete) | Separate interaction story | Story 3.3 |
| ErrorBar component | Error state story | Story 2.7 |
| POST /todos action | Create todo story | Story 2.4/2.5 |
| Optimistic UI | Requires mutations | Story 2.5 / 3.3 |
| Loading indicators | Loading & error states story | Story 2.7 |
| Playwright E2E tests | View todos E2E story | Story 2.3 |

This story renders todos as **read-only list items** with text and timestamp. The full interactive `TaskItem` component with checkbox toggle and delete button is built in Story 3.3.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2 Story 2.2 acceptance criteria, BDD scenarios]
- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend component org, route patterns, responsive breakpoints, D4 layout, naming conventions, TDD mandate, API client generation]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — D4 Split Active/Done layout, EmptyState variants, SectionHeader anatomy, Charcoal Focus tokens, responsive strategy, accessibility]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-2, FR-8, NFR-1, NFR-6, NFR-7, NFR-8, UX-4, UX-10]
- [Source: apps/web/app/routes/home.tsx — current scaffold to replace]
- [Source: apps/web/app/routes.ts — route mapping (index → routes/home.tsx)]
- [Source: apps/web/app/root.tsx — ChakraProvider, ErrorBoundary, Inter font, Layout]
- [Source: apps/web/app/theme/system.ts — Chakra system config, semantic tokens]
- [Source: apps/web/app/theme/tokens.ts — charcoalFocusTokens color definitions]
- [Source: apps/web/app/lib/api-client/ — Massimo-generated client (needs regeneration)]
- [Source: apps/api/openapi.json — GET /todos OpenAPI spec with response schema]
- [Source: packages/shared/src/types.ts — Todo, ApiSuccess, ApiError type definitions]
- [Source: apps/web/vitest.config.ts — jsdom environment, test include pattern]
- [Source: apps/web/package.json — current dependencies, scripts]
- [Source: .env.example — VITE_API_URL=http://localhost:3000]
- [Source: _bmad-output/implementation-artifacts/2-1-get-todos-api-endpoint.md — previous story learnings, API patterns, test data management]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (GitHub Copilot)

### Debug Log References

- Massimo-generated client had `StatusCode4xx`/`StatusCode5xx` undefined types — manually patched into `api.client-types.d.ts`
- Massimo-generated client had broken status code matching (`[200, 4, 5]` instead of proper range check) — patched `api.client.mts` to use `response.status >= 400`
- `fetchTodos()` uses Massimo-generated `getTodos` method (not raw fetch) via domain-based API modules
- Chakra components require `ChakraProvider` wrapper in tests — created shared `test-utils.tsx` with `renderWithProviders` helper
- `vitest.config.ts` needed `vite-tsconfig-paths` plugin to resolve `~/` path alias in tests
- jsdom does not auto-cleanup between tests — added explicit `afterEach(cleanup)` in test files
- `lucide-react` installed for icons per user preference (instead of `react-icons` or inline SVGs)
- `TodoItem` component uses `List.Item` which requires `List.Root` wrapper in tests
- `formatTimestamp` tests must use timezone-safe UTC timestamps to avoid CI failures

### Completion Notes List

- ✅ Massimo API client regenerated with `GET /todos` endpoint
- ✅ API wrapper uses Massimo-generated `getTodos` method with domain-based folder structure (`lib/api/`)
- ✅ `EmptyState` component: two variants (`first-use`, `all-done`), accessible (`role=status`, `aria-live=polite`), fade-in with `prefers-reduced-motion` respect, uses `lucide-react` icons
- ✅ `SectionHeader` component: uppercase label with count, accessible headings, `aria-live` count region
- ✅ `TodoItem` component: extracted to own file with `formatTimestamp` utility, full test coverage
- ✅ `home.tsx` route: RR loader calling `fetchTodos()`, D4 layout (640px max-width, responsive padding), active/completed sections, empty state logic, semantic `<ul>`/`<li>` lists, React meta tags
- ✅ All 22 web tests pass (3 EmptyState + 4 SectionHeader + 4 TodoItem + 3 formatTimestamp + 5 route + 2 root + 1 format-timestamp)
- ✅ Zero hardcoded hex/font/spacing values — all Chakra tokens
- ✅ Build succeeds (client + SSR), TypeScript compiles cleanly
- ✅ Added `@testing-library/react`, `@testing-library/jest-dom`, `lucide-react` as dependencies
- ✅ Added `vitest.setup.ts` for jest-dom matchers and `tsconfigPaths` plugin to vitest config

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-10 | Story created | create-story workflow |
| 2026-03-10 | Implemented todo list page with loader, EmptyState, SectionHeader, D4 layout, and full test coverage | dev-story workflow (Claude Opus 4.6) |
| 2026-03-10 | Refactored API wrapper to use Massimo-generated getTodos, domain-based api/ folder, extracted TodoItem + formatTimestamp, added tests, patched Massimo client bugs, fixed TS errors | code-review workflow (Claude Opus 4.6) |

### File List

**New files:**
- `apps/web/app/lib/api/setup.server.ts` — configures Massimo API client base URL
- `apps/web/app/lib/api/todos.server.ts` — todos domain API functions using Massimo `getTodos`
- `apps/web/app/lib/api/index.server.ts` — barrel re-export for API domain modules
- `apps/web/app/lib/format-timestamp.ts` — `formatTimestamp` utility using `Intl.DateTimeFormat`
- `apps/web/app/lib/format-timestamp.test.ts` — formatTimestamp tests (3 tests)
- `apps/web/app/components/todos/empty-state/empty-state.tsx` — EmptyState component
- `apps/web/app/components/todos/empty-state/empty-state.test.tsx` — EmptyState tests (3 tests)
- `apps/web/app/components/todos/section-header/section-header.tsx` — SectionHeader component
- `apps/web/app/components/todos/section-header/section-header.test.tsx` — SectionHeader tests (4 tests)
- `apps/web/app/components/todos/todo-item/todo-item.tsx` — TodoItem component
- `apps/web/app/components/todos/todo-item/todo-item.test.tsx` — TodoItem tests (4 tests)
- `apps/web/app/routes/home.test.tsx` — Home route tests (5 tests)
- `apps/web/app/test-utils.tsx` — Shared test utility with `renderWithProviders` helper
- `apps/web/vitest.setup.ts` — Vitest setup file for @testing-library/jest-dom matchers

**Modified files:**
- `apps/web/app/routes/home.tsx` — Replaced scaffold with todo list page, loader, D4 layout
- `apps/web/vitest.config.ts` — Added `setupFiles` and `tsconfigPaths` plugin
- `apps/web/package.json` — Added `@testing-library/react`, `@testing-library/jest-dom`, `lucide-react`
- `apps/web/app/lib/api-client/api.client.mts` — Regenerated with `GET /todos` method, patched status code handling
- `apps/web/app/lib/api-client/api.client-types.d.ts` — Regenerated with `GetTodos` types, added `StatusCode4xx`/`StatusCode5xx`
- `apps/web/app/lib/api-client/api.client.openapi.json` — Regenerated with `/todos/` path
