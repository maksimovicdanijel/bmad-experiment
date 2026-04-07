# Story 3.4: Accessibility Audit — Lighthouse WCAG AA Compatibility

Status: done

## Story

As a **developer**,
I want an accessibility verification story using the Lighthouse CLI tool plus targeted manual checks,
so that the Todo app meets WCAG 2.1 AA requirements before release and has automated, repeatable evidence of compliance.

## Acceptance Criteria

1. **Lighthouse CLI setup:**
   - Given `lighthouse` is installed as a devDependency in `apps/web`
   - When `npx lighthouse --version` is run in `apps/web`
   - Then it prints the current Lighthouse CLI version without errors

2. **Lighthouse audit script (desktop):**
   - Given the app is running with representative todo data (seeded via E2E helpers)
   - When `npm run lighthouse:desktop -w apps/web` is run
   - Then Lighthouse CLI runs against `http://localhost:5173` in desktop emulation, producing a JSON report file at `apps/web/lighthouse-reports/desktop-report.json` and an HTML report at `apps/web/lighthouse-reports/desktop-report.html`

3. **Lighthouse audit script (mobile):**
   - Given the app is running with representative todo data
   - When `npm run lighthouse:mobile -w apps/web` is run
   - Then Lighthouse CLI runs against `http://localhost:5173` in mobile emulation (Moto G Power preset), producing a JSON report file at `apps/web/lighthouse-reports/mobile-report.json` and an HTML report at `apps/web/lighthouse-reports/mobile-report.html`

4. **Lighthouse score threshold assertion:**
   - Given the JSON report files exist
   - When a Node.js assertion script (`apps/web/scripts/assert-lighthouse-scores.ts`) parses the JSON reports
   - Then it asserts that the Accessibility category score is ≥ 0.90 (90%) for both desktop and mobile profiles, and exits with code 0 on success or code 1 with a descriptive failure message

5. **No critical accessibility failures:**
   - Given Lighthouse runs against the main todo page in desktop and mobile profiles
   - When the Accessibility category results are reviewed
   - Then there are zero critical accessibility failures (any `scoreDisplayMode: 'binary'` audits must pass)

6. **Lighthouse issues resolved:**
   - Given Lighthouse reports issues related to labels, names, roles, contrast, focus visibility, or semantic structure
   - When those issues are addressed in the codebase
   - Then a follow-up Lighthouse run confirms the issues are resolved

7. **Contrast ratio compliance (NFR-8):**
   - Given NFR-8 requires WCAG 2.1 AA contrast compliance
   - When key UI states are reviewed (default, hover, focus, completed, error, empty state)
   - Then all text/background pairs meet at least 4.5:1 contrast ratio for normal text (verified by Lighthouse `color-contrast` audit passing)

8. **Keyboard navigation:**
   - Given keyboard-only navigation is used
   - When tabbing through input, add button, task checkbox, and delete button
   - Then focus order is logical, focus is visible, and all interactive controls are operable without a mouse

9. **Evidence recorded:**
   - Given accessibility verification is complete
   - When evidence is recorded
   - Then the story includes Lighthouse CLI output summary (scores per category) and a short WCAG AA checklist summary for auditability in the Dev Agent Record section

## Tasks / Subtasks

- [x] Task 1: Install Lighthouse CLI and create report directory (AC: 1)
  - [x] Add `lighthouse` as a devDependency in `apps/web/package.json`
  - [x] Add `apps/web/lighthouse-reports/` to `.gitignore`
  - [x] Create `apps/web/lighthouse-reports/.gitkeep` for directory structure

- [x] Task 2: Create Lighthouse CLI runner scripts (AC: 2, 3)
  - [x] Create `apps/web/scripts/run-lighthouse.ts` — a Node.js script that:
    - Accepts a `--preset` argument: `desktop` or `mobile`
    - Launches Lighthouse CLI via `child_process.execSync` or the `lighthouse` Node API against `http://localhost:5173`
    - Desktop preset: uses `--preset=desktop --screenEmulation.disabled`
    - Mobile preset: uses `--screenEmulation.mobile --throttling-method=provided` (Moto G Power defaults)
    - Runs only the `accessibility` and `best-practices` categories (`--only-categories=accessibility,best-practices`)
    - Outputs JSON to `apps/web/lighthouse-reports/{preset}-report.json`
    - Outputs HTML to `apps/web/lighthouse-reports/{preset}-report.html`
    - Uses `--chrome-flags="--headless=new --no-sandbox"` for headless execution
  - [x] Add npm scripts to `apps/web/package.json`:
    - `"lighthouse:desktop": "tsx scripts/run-lighthouse.ts --preset=desktop"`
    - `"lighthouse:mobile": "tsx scripts/run-lighthouse.ts --preset=mobile"`
    - `"lighthouse": "npm run lighthouse:desktop && npm run lighthouse:mobile"`

- [x] Task 3: Create Lighthouse score assertion script (AC: 4, 5)
  - [x] Create `apps/web/scripts/assert-lighthouse-scores.ts` — a Node.js script that:
    - Reads `apps/web/lighthouse-reports/desktop-report.json` and `apps/web/lighthouse-reports/mobile-report.json`
    - Parses the JSON and extracts `categories.accessibility.score`
    - Asserts score ≥ 0.90 for both profiles
    - Checks for any audits with `scoreDisplayMode: 'binary'` that have `score === 0` (critical failures)
    - Prints a summary table (category, desktop score, mobile score, pass/fail)
    - Exits with code 0 if all pass, code 1 with descriptive messages if any fail
  - [x] Add npm script to `apps/web/package.json`:
    - `"lighthouse:assert": "tsx scripts/assert-lighthouse-scores.ts"`
    - `"lighthouse:audit": "npm run lighthouse && npm run lighthouse:assert"` (full pipeline)

- [x] Task 4: Run initial Lighthouse audit and identify issues (AC: 5, 6, 7)
  - [x] Ensure the app is running with seeded todo data (use E2E seed helpers or manual seeding)
  - [x] Run `npm run lighthouse:audit -w apps/web`
  - [x] Review the generated HTML reports for any accessibility failures
  - [x] Document all Lighthouse accessibility audit findings in Dev Notes

- [x] Task 5: Fix any Lighthouse-reported accessibility issues (AC: 6, 7)
  - [x] Address `color-contrast` failures if any — update Chakra theme tokens, NOT hardcoded values
  - [x] Address missing `aria-label`, `aria-labelledby`, or `role` attributes
  - [x] Address missing or incorrect heading hierarchy
  - [x] Address `image-alt`, `link-name`, or `button-name` violations
  - [x] Address `html-has-lang` if missing on the `<html>` element
  - [x] Address any `target-size` audit failures (44×44px touch targets — NFR-7)
  - [x] Follow Chakra token-only pattern — no hardcoded hex values, font sizes, or spacing

- [x] Task 6: Verify keyboard navigation (AC: 8)
  - [x] Manually verify Tab order: input → add button → first task checkbox → first task delete → second task checkbox → second task delete → …
  - [x] Verify `focus-visible` ring is displayed on all interactive elements using Chakra's built-in focus styling
  - [x] Verify Enter key triggers submit on input field
  - [x] Verify Space key toggles checkbox controls
  - [x] Verify Escape key or appropriate key dismisses error bar if visible
  - [x] Document any keyboard navigation issues found and fixed

- [x] Task 7: Re-run Lighthouse after fixes and assert scores (AC: 4, 5, 6, 9)
  - [x] Run `npm run lighthouse:audit -w apps/web`
  - [x] Verify all scores meet the ≥ 90% threshold
  - [x] Verify zero critical accessibility failures
  - [x] Save final Lighthouse score summary in Dev Agent Record section

- [x] Task 8: Run existing test suites — no regressions (AC: all)
  - [x] Run `npm run test -w apps/web` — all existing unit/component tests pass
  - [x] Run `npm run lint -w apps/web` — zero lint errors
  - [x] Run E2E tests (`npx playwright test --config e2e/playwright.config.ts`) — all pass

## Dev Notes

### Architecture Compliance

**This is a non-functional quality story — no new features, no API changes, no new routes.**

Key constraints:
- **No new components** — this story audits and fixes existing components only
- **No API changes** — all endpoints are complete (Stories 3.1, 3.2)
- **Chakra token-only** — any style fixes must use Chakra theme tokens, never hardcoded values
- **No test mocking for Lighthouse** — Lighthouse must run against the real app, not mocked pages

### Lighthouse CLI Usage Pattern

The Lighthouse CLI tool is used directly (not Playwright's built-in accessibility testing or `@axe-core/playwright`). This provides:
- Industry-standard Lighthouse scores comparable to Chrome DevTools audits
- Comprehensive WCAG 2.1 AA checks including contrast, ARIA, keyboard, semantics
- JSON output for CI/CD score assertions
- HTML reports for human review and auditability

**Lighthouse CLI invocation pattern:**
```bash
# Desktop audit
npx lighthouse http://localhost:5173 \
  --preset=desktop \
  --only-categories=accessibility,best-practices \
  --output=json,html \
  --output-path=./lighthouse-reports/desktop-report \
  --chrome-flags="--headless=new --no-sandbox"

# Mobile audit (default Lighthouse emulation)
npx lighthouse http://localhost:5173 \
  --only-categories=accessibility,best-practices \
  --output=json,html \
  --output-path=./lighthouse-reports/mobile-report \
  --chrome-flags="--headless=new --no-sandbox"
```

**JSON report structure (relevant fields for assertion script):**
```json
{
  "categories": {
    "accessibility": {
      "score": 0.95,
      "auditRefs": [...]
    },
    "best-practices": {
      "score": 0.92,
      "auditRefs": [...]
    }
  },
  "audits": {
    "color-contrast": { "score": 1, "scoreDisplayMode": "binary" },
    "html-has-lang": { "score": 1, "scoreDisplayMode": "binary" },
    ...
  }
}
```

### Project Structure Notes

**Files to create:**
```
apps/web/scripts/run-lighthouse.ts           # Lighthouse CLI runner script
apps/web/scripts/assert-lighthouse-scores.ts  # Score threshold assertion script
apps/web/lighthouse-reports/.gitkeep          # Report output directory
```

**Files to modify:**
```
apps/web/package.json                         # Add lighthouse devDep + scripts
.gitignore                                    # Add lighthouse-reports/*.json, *.html
```

**Files that MAY need fixes (only if Lighthouse reports issues):**
```
apps/web/app/root.tsx                         # html lang attribute, meta viewport
apps/web/app/routes/home.tsx                  # ARIA attributes, heading hierarchy
apps/web/app/components/todos/todo-item/todo-item.tsx      # ARIA labels, contrast
apps/web/app/components/todos/empty-state/    # Heading level, contrast
apps/web/app/components/todos/error-bar/      # ARIA live region, role
apps/web/app/components/todos/section-header/ # Heading level semantics
apps/web/app/components/TaskInput.tsx          # Input label, button name
apps/web/app/theme/                           # Token values if contrast fails
```

**Files NOT to modify:**
```
apps/api/**                           # No API changes in this story
apps/web/e2e/**                       # No E2E test changes (existing tests must pass)
packages/shared/**                    # No shared type changes
```

### Existing Code Patterns to Follow

**Chakra UI theme tokens** (from [apps/web/app/theme/](apps/web/app/theme/)):
- All colors, spacing, font sizes come from Chakra's token system
- Dark mode forced via `colorMode: 'dark'` in `ChakraProvider`
- Any contrast fixes should update the theme extension config, not individual components
- Use semantic tokens (e.g., `colorPalette.fg`, `bg.subtle`) not raw hex values

**Current component ARIA patterns** (from Story 3.3 implementation):
- `TodoItem` checkbox: `aria-label="Mark [text] as complete"` / `"Mark [text] as active"`
- `TodoItem` delete: `aria-label="Delete [text]"`
- `TaskInput`: placeholder text `"Add a task..."`, submit button exists
- `ErrorBar`: displays error messages with retry/dismiss actions
- `EmptyState`: heading "Nothing here yet." with descriptive text

**Script execution** (from [apps/web/package.json](apps/web/package.json)):
- Uses `tsx` for TypeScript script execution (already a devDep via `@react-router/dev`)
- Scripts in `apps/web/scripts/` directory

### Testing Requirements

**No new unit tests are needed for this story.** The story is purely about:
1. Setting up Lighthouse CLI tooling
2. Running accessibility audits
3. Fixing any issues found
4. Verifying existing tests still pass

All existing test suites must pass without modification:
- `npm run test -w apps/web` (64+ unit/component tests)
- `npm run lint -w apps/web` (zero lint errors)
- Playwright E2E tests (all existing specs pass)

### Previous Story Intelligence

**From Story 3.3 (TaskItem — Complete & Delete — done):**
- All interactive elements have ARIA labels
- Touch targets are 44×44px minimum (tested in component tests)
- Completed state uses `textDecoration` and `opacity` tokens
- Loading indicator uses CSS `animation-delay: 200ms`
- No hardcoded colors/spacing — Chakra tokens only
- Custom accessible checkbox with `role="checkbox"`, `aria-checked`, keyboard support

**From Story 2.8 (Loading & Error States — done):**
- `ErrorBar` component exists with actionable messages
- Uses `onRetry` and `onDismiss` callbacks
- Loading indicator via CSS `animation-delay`

**From Story 2.2 (Todo List Page — done):**
- EmptyState with heading and descriptive text
- Section headers for Active/Completed groups
- Responsive layout: single-column mobile, max-width desktop
- WCAG 2.1 AA contrast requirement (NFR-8)

### Lighthouse-Specific Notes

**Common Lighthouse accessibility audits to watch:**

| Audit ID | What it checks | Likely status |
|---|---|---|
| `color-contrast` | WCAG AA 4.5:1 ratio | Check dark theme tokens |
| `html-has-lang` | `<html lang="en">` | Verify in root.tsx |
| `meta-viewport` | No `user-scalable=no` | Verify in root.tsx |
| `heading-order` | h1 → h2 → h3 sequential | Check section headers |
| `label` | Form inputs have labels | Check TaskInput |
| `button-name` | Buttons have accessible names | Check add button, delete button |
| `aria-allowed-attr` | Valid ARIA attributes | Check custom checkbox |
| `target-size` | 44×44px touch targets | Already enforced (NFR-7) |
| `focus-visible` | Visible focus indicator | Chakra provides this |

**Lighthouse CLI important flags:**
- `--only-categories=accessibility,best-practices` — skip performance/SEO (not in scope)
- `--chrome-flags="--headless=new --no-sandbox"` — headless Chrome for CI/script use
- `--output=json,html` — produce both machine-parseable and human-readable reports
- `--preset=desktop` — desktop emulation (mobile is default)

### Anti-Patterns to Avoid

- Do **NOT** use `@axe-core/playwright` or Playwright accessibility testing — use Lighthouse CLI as specified
- Do **NOT** add Lighthouse audits to the E2E test suite — keep them as separate npm scripts
- Do **NOT** hardcode CSS color values to fix contrast — update Chakra theme tokens instead
- Do **NOT** suppress or skip Lighthouse audits — fix the underlying issues
- Do **NOT** modify API code — this is a frontend-only quality story
- Do **NOT** add `aria-hidden="true"` as a band-aid — fix the underlying semantic issues
- Do **NOT** run Lighthouse in the Playwright test runner — use the standalone Lighthouse CLI

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.4 AC]
- [Source: _bmad-output/planning-artifacts/architecture.md — NFR-8, WCAG 2.1 AA, Chakra UI tokens]
- [Source: _bmad-output/planning-artifacts/epics.md — NFR-6, NFR-7, NFR-8 requirements]
- [Source: _bmad-output/implementation-artifacts/3-3-taskitem-component-complete-and-delete-actions.md — ARIA patterns, touch targets]
- [Source: apps/web/package.json — Current devDependencies, scripts]
- [Source: apps/web/e2e/playwright.config.ts — Existing Playwright config (do not modify)]
- [Source: apps/web/app/root.tsx — HTML root element, meta tags]
- [Lighthouse CLI docs: https://github.com/GoogleChrome/lighthouse#using-the-node-cli]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Initial Lighthouse CLI (v13.1.0) hit `Protocol error (Page.navigate): Target closed` with Chrome 146. Switched from CLI-based `child_process.execSync` to the Lighthouse Node API with Playwright's bundled Chromium (chrome-launcher) for reliable headless execution.
- Initial audit (94% accessibility) revealed 2 critical failures: `color-contrast` and `landmark-one-main`.
- Root cause of `color-contrast`: Chakra v3 dark mode tokens (`--chakra-colors-fg-muted`) resolved to light-mode values (gray-600 `#52525b`) because the `.dark` CSS class was absent from `<html>` before JS hydration. Lighthouse evaluates pre-hydration HTML.
- Root cause of completed text contrast: `opacity: 0.6` on `fg.muted` text reduced effective contrast below 4.5:1. Replaced with a dedicated `fg.completed` semantic token (`charcoal.400` = `#7a8594`, 5.13:1 contrast ratio).

### Completion Notes List

- ✅ Installed Lighthouse v13.1.0 as devDependency
- ✅ Created `run-lighthouse.ts` using Lighthouse Node API + Playwright's Chromium for reliable headless automation
- ✅ Created `assert-lighthouse-scores.ts` with score threshold (≥90%) and critical binary audit checking
- ✅ Added 5 npm scripts: `lighthouse`, `lighthouse:desktop`, `lighthouse:mobile`, `lighthouse:assert`, `lighthouse:audit`
- ✅ Fixed `landmark-one-main`: Added `as="main"` to Container in home.tsx
- ✅ Fixed `color-contrast` (dark mode token resolution): Added `className="dark"` to `<html>` in root.tsx
- ✅ Fixed `color-contrast` (completed text opacity): Replaced `opacity: 0.6` with new `fg.completed` semantic token (`charcoal.400` = `#7a8594`, 5.13:1 contrast)
- ✅ Updated `charcoal.400` from `#6f7a8c` (4.43:1) to `#7a8594` (5.13:1) to meet WCAG AA threshold
- ✅ Added eslint override for `scripts/**` to allow `console` in CLI scripts
- ✅ Final Lighthouse scores: Accessibility 100%, Best Practices 100% (both desktop & mobile)
- ✅ Zero critical accessibility failures
- ✅ All 66 unit tests pass, zero lint errors, all E2E tests pass (4 normal + 1 error state)
- ✅ Keyboard navigation verified: logical tab order, focus-visible rings, Enter submit, Space checkbox toggle

**Final Lighthouse Score Summary:**

| Category       | Desktop | Mobile | Status |
|----------------|---------|--------|--------|
| Accessibility  | 100%    | 100%   | ✅ PASS |
| Best Practices | 100%    | 100%   | ✅ PASS |

**WCAG AA Checklist Summary:**
- ✅ `color-contrast`: All text/background pairs ≥ 4.5:1 contrast ratio
- ✅ `html-has-lang`: `<html lang="en">` present
- ✅ `meta-viewport`: No `user-scalable=no`
- ✅ `heading-order`: Proper h2 section headers
- ✅ `label`: All form inputs labeled (`aria-label="Task text"`)
- ✅ `button-name`: All buttons have accessible names
- ✅ `aria-allowed-attr`: Valid ARIA on custom checkbox
- ✅ `target-size`: 44×44px touch targets enforced
- ✅ `focus-visible`: Chakra focus rings on all interactive elements
- ✅ `landmark-one-main`: `<main>` landmark present

### File List

**New files:**
- `apps/web/scripts/run-lighthouse.ts` — Lighthouse Node API runner script
- `apps/web/scripts/assert-lighthouse-scores.ts` — Score threshold assertion script
- `apps/web/lighthouse-reports/.gitkeep` — Report output directory placeholder

**Modified files:**
- `apps/web/package.json` — Added `lighthouse` devDependency + 7 lighthouse npm scripts
- `.gitignore` — Added `apps/web/lighthouse-reports/*.json` and `*.html`
- `apps/web/app/root.tsx` — Added `className="dark"` to `<html>` for dark mode token resolution
- `apps/web/app/routes/home.tsx` — Added `as="main"` to Container for landmark
- `apps/web/app/components/todos/todo-item/todo-item.tsx` — Replaced `opacity: 0.6` with `fg.completed` token
- `apps/web/app/components/todos/todo-item/todo-item.test.tsx` — Updated test name (opacity → muted color)
- `apps/web/app/theme/system.ts` — Added `fg.completed` semantic token
- `apps/web/app/theme/tokens.ts` — Updated `charcoal.400` from `#6f7a8c` to `#7a8594` for WCAG AA compliance
- `eslint.config.js` — Added `scripts/**` override to allow console in CLI scripts

### Change Log

- **2026-04-07**: Story 3.4 implementation — Lighthouse WCAG AA accessibility audit
  - Installed Lighthouse v13.1.0 with Node API runner using Playwright's Chromium
  - Created assertion script enforcing ≥90% scores and zero critical failures
  - Fixed `landmark-one-main` — Container now renders as `<main>`
  - Fixed `color-contrast` — Added `.dark` class to `<html>` for pre-hydration dark mode token resolution
  - Fixed completed text contrast — New `fg.completed` semantic token replaces `opacity: 0.6` approach
  - Adjusted `charcoal.400` to `#7a8594` (5.13:1 contrast vs bg.canvas) for WCAG AA compliance
  - Final scores: Accessibility 100%, Best Practices 100% (desktop & mobile)
- **2026-04-07**: Senior Developer Review (AI) — all issues fixed automatically. Status set to done.

## Senior Developer Review (AI)

### Outcome

Approved (after fixes)

### Findings

1. **MEDIUM — `chrome-launcher` is an undeclared dependency.**
   `run-lighthouse.ts` imports `chrome-launcher` which resolved only via transitive hoisting from `lighthouse`. Added as an explicit devDependency in `apps/web/package.json`.
   Evidence: `apps/web/scripts/run-lighthouse.ts` line 5, `apps/web/package.json` devDependencies.

2. **MEDIUM — Documentation claims "7 npm scripts" but only 5 exist.**
   Completion Notes stated "Added 7 npm scripts" but `package.json` only has 5 lighthouse scripts. Corrected to "5 npm scripts".
   Evidence: `apps/web/package.json` scripts section.

3. **MEDIUM — No pre-flight check for running dev server in `run-lighthouse.ts`.**
   Script assumed `http://localhost:5173` is reachable with no helpful error on failure. Added a `fetch` pre-check with a descriptive error message.
   Evidence: `apps/web/scripts/run-lighthouse.ts`.

4. **LOW — Mobile preset zeroes all throttling, diverging from "Moto G Power" claim.**
   AC3 specifies Moto G Power preset; screen emulation is retained (Lighthouse default), but network throttling is zeroed. Updated code comment to clarify this distinction.
   Evidence: `apps/web/scripts/run-lighthouse.ts` throttling config.

5. **LOW — Test name doesn't match implementation token.**
   Test named "muted color" but implementation uses `fg.completed` token. Renamed to "completed color token".
   Evidence: `apps/web/app/components/todos/todo-item/todo-item.test.tsx`.

6. **LOW — Loose typing in Lighthouse config.**
   Config was typed as `Record<string, unknown>` with multiple casts. Replaced with `LighthouseConfig` and `LighthouseSettings` interfaces for compile-time safety.
   Evidence: `apps/web/scripts/run-lighthouse.ts`.

### Acceptance Criteria Verification Summary

- AC1 (Lighthouse CLI setup): **Implemented** — `lighthouse@^13.1.0` + `chrome-launcher@^1.2.1` in devDependencies.
- AC2 (Desktop audit script): **Implemented** — `lighthouse:desktop` npm script generates JSON + HTML reports.
- AC3 (Mobile audit script): **Implemented** — `lighthouse:mobile` with Moto G Power screen emulation.
- AC4 (Score threshold assertion): **Implemented** — `assert-lighthouse-scores.ts` enforces ≥90%.
- AC5 (No critical failures): **Implemented** — Binary audit check in assertion script.
- AC6 (Issues resolved): **Implemented** — landmark-one-main, color-contrast, completed text token.
- AC7 (Contrast ratio / NFR-8): **Implemented** — `fg.completed` = `charcoal.400` = `#7a8594` (5.13:1).
- AC8 (Keyboard navigation): **Implemented** — Documented manual verification in Dev Agent Record.
- AC9 (Evidence recorded): **Implemented** — Lighthouse Score Summary + WCAG AA Checklist in Dev Agent Record.

### Resolution Summary

- MEDIUM issues fixed: 3/3
- LOW issues fixed: 3/3
- All 66/66 unit tests pass, lint clean, 5/5 E2E tests pass.

