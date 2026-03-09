# Story 1.4: Configure Test Infrastructure

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want Vitest configured for both apps/api and apps/web, and Playwright configured in apps/web/e2e/, with root-level npm run test working across all workspaces,
so that TDD (Red → Green → Refactor) can be practised from the first story of Epic 2.

## Acceptance Criteria

1. Given Vitest is configured in apps/api,
   When npm run test -w apps/api is run,
   Then it discovers and runs all *.test.ts files in src/ and reports results without errors.

2. Given Vitest is configured in apps/web,
   When npm run test -w apps/web is run,
   Then it discovers and runs all *.test.tsx files in app/ and reports results without errors.

3. Given npm run test is run from the workspace root,
   When tests exist in any workspace,
   Then all workspace test suites run and results are aggregated.

4. Given apps/web/e2e/playwright.config.ts is configured pointing at the local web server,
   When npx playwright test --list is run,
   Then it lists any discovered spec files without configuration errors.

5. Given a stub contract test exists at apps/api/src/todos/todos.routes.test.ts,
   When the API test suite runs,
   Then the stub test file is discovered and passes (even if it contains only a placeholder it.todo()).

## Tasks / Subtasks

- [x] Task 1: Configure Vitest for apps/api (AC: 1, 5)
  - [x] Add Vitest config file for API workspace (ESM-safe, Node environment)
  - [x] Ensure include pattern discovers src/**/*.test.ts
  - [x] Add/update setup file only if needed (keep minimal)
  - [x] Create apps/api/src/todos/todos.routes.test.ts with placeholder coverage target
  - [x] Verify existing tests (src/server.test.ts, src/db/schema.test.ts) still pass

- [x] Task 2: Configure Vitest for apps/web (AC: 2)
  - [x] Add Vitest config file for web workspace (jsdom environment for component tests)
  - [x] Ensure include pattern discovers app/**/*.test.tsx and app/**/*.test.ts
  - [x] Add minimal test setup for React DOM matchers only if required by current tests
  - [x] Verify existing app/root.test.tsx passes without route/runtime regressions

- [x] Task 3: Configure Playwright scaffold under apps/web/e2e (AC: 4)
  - [x] Add apps/web/e2e/playwright.config.ts targeting local web server URL
  - [x] Set testDir to apps/web/e2e and define baseline projects (Chromium/Firefox/WebKit)
  - [x] Add a minimal placeholder spec in apps/web/e2e/ (e.g., smoke/listing spec)
  - [x] Ensure npx playwright test --list runs without config errors

- [x] Task 4: Align workspace scripts and root aggregation (AC: 3, 4)
  - [x] Confirm root test script remains npm run test -ws --if-present
  - [x] Add web script for e2e execution if missing (e.g., test:e2e)
  - [x] Add any missing devDependencies in apps/web (e.g., @playwright/test, optional Vitest jsdom peers)
  - [x] Keep script naming consistent with existing repository conventions

- [x] Task 5: Validate end-to-end testing readiness for Epic 2 entry (AC: 1-5)
  - [x] Run npm run test -w apps/api
  - [x] Run npm run test -w apps/web
  - [x] Run npm run test at root
  - [x] Run npx playwright test --list -w apps/web or equivalent from apps/web
  - [x] Capture outcomes in Completion Notes and keep scope strictly infra (no feature logic)

## Dev Notes

- This story is an infrastructure gate before feature delivery in Epic 2.
- TDD is mandatory in architecture: no implementation in Epic 2 should proceed without red-green-refactor workflow enabled in both apps.
- Keep this story focused on test tooling and runnable scaffolds; do not implement todo business features here.

### Technical Requirements

- Use Vitest in both workspaces:
  - apps/api: Node runtime, TypeScript/ESM compatibility.
  - apps/web: jsdom runtime for React component tests.
- Keep root aggregation behaviour using npm workspaces script execution.
- Playwright config location must be exactly apps/web/e2e/playwright.config.ts.
- Placeholder API contract test file must exist at apps/api/src/todos/todos.routes.test.ts.
- Keep Node baseline compatible with repository engines requirement (>=24).

### Architecture Compliance

- Follow backend feature organization already established in apps/api/src/todos/.
- Preserve API layering guardrails from prior stories:
  - routes -> service -> queries
  - no Drizzle in service layer
  - API envelope conventions remain unchanged.
- Keep frontend stack unchanged:
  - React Router v7 SSR shell
  - Chakra UI v3 dark theme
  - no additional UI framework introduction.
- Keep lint/test/build scripts aligned with monorepo root orchestration.

### Library / Framework Requirements

- Current workspace versions (do not opportunistically upgrade in this story):
  - vitest: ^3.2.4 (workspace currently installed)
  - react-router family: 7.12.0 in web
  - React: ^19.2.4
- Latest ecosystem references checked during story creation:
  - vitest latest: 4.0.18
  - @playwright/test latest: 1.58.2
  - jsdom latest: 28.1.0
  - @vitest/coverage-v8 latest: 4.0.18
- Guidance: prefer project consistency over upgrades; introduce version bumps only in dedicated dependency-upgrade stories.

### File Structure Requirements

Expected additions/updates for this story:

- apps/api/
  - vitest.config.ts (new, if absent)
  - src/todos/todos.routes.test.ts (new placeholder contract test)
  - package.json (update scripts/deps only if required)
- apps/web/
  - vitest.config.ts (new, if absent)
  - app/test/setup.ts (optional, only if required)
  - e2e/playwright.config.ts (new)
  - e2e/*.spec.ts (new placeholder spec)
  - package.json (update scripts/deps for Playwright execution)
- root
  - package.json (only if root script refinement is needed)

### Testing Requirements

- API workspace:
  - Discover and run src/**/*.test.ts
  - Include todos.routes.test.ts placeholder without breaking suite health
- Web workspace:
  - Discover and run app/**/*.test.tsx (and app/**/*.test.ts if present)
  - Ensure root.test.tsx stays green
- Monorepo:
  - npm run test must execute all workspace suites
- E2E:
  - npx playwright test --list resolves config and specs without errors

### Previous Story Intelligence

From Story 1.2 (Fastify scaffold + review cycle):

- AC compliance must be verifiable via executable checks, not assumptions.
- Maintain ESM import discipline for Node-executed TS modules.
- Keep documented file lists accurate with tracked artifacts.
- Avoid environment-dependent behaviour that can hide failures.

From Story 1.3 (Web scaffold + review remediation):

- Keep generated/derived artifact locations explicit and consistent.
- Prefer minimal, deterministic tooling setup over custom wrappers.
- Preserve SSR shell stability while extending infra.

### Git Intelligence Summary

Recent commit trend (last 5 commits):

- chore: rr7 bootstrap code review
- feat: rr7 bootstrap
- chore: RR scaffold story
- chore: code review fastify scaffold
- chore: fastify scaffold

Actionable pattern guidance:

- Story artifacts and sprint status are updated alongside implementation changes.
- Infrastructure stories are implemented with explicit validation and then code-reviewed.
- Keep this story narrow: add test infrastructure only, no product feature logic.

### Latest Tech Information

- Playwright should be configured with three-browser projects for architecture alignment (Chromium, Firefox, WebKit).
- For stable CI and local parity, keep deterministic test command paths and avoid implicit global tooling assumptions.
- For Vitest in mixed Node/browser contexts, isolate workspace configs rather than one root config to avoid environment leakage.

### Project Context Reference

- No project-context.md was found via configured pattern **/project-context.md.
- Story context therefore relies on:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/implementation-artifacts/1-2-scaffold-fastify-api-with-drizzle-orm.md
  - _bmad-output/implementation-artifacts/1-3-scaffold-react-router-v7-ssr-web-app-with-chakra-ui.md

### References

- Source: _bmad-output/planning-artifacts/epics.md (Epic 1, Story 1.4)
- Source: _bmad-output/planning-artifacts/architecture.md (testing standards, TDD mandate, structure patterns)
- Source: _bmad-output/planning-artifacts/ux-design-specification.md (UX constraints carried into test expectations)
- Source: _bmad-output/implementation-artifacts/1-2-scaffold-fastify-api-with-drizzle-orm.md (backend patterns)
- Source: _bmad-output/implementation-artifacts/1-3-scaffold-react-router-v7-ssr-web-app-with-chakra-ui.md (web patterns)

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `npm install`
- `npx -y node@24 /Users/danijelmaksimovic/.nvm/versions/node/v20.9.0/lib/node_modules/npm/bin/npm-cli.js run test -w apps/api`
- `npx -y node@24 /Users/danijelmaksimovic/.nvm/versions/node/v20.9.0/lib/node_modules/npm/bin/npm-cli.js run test -w apps/web`
- `npx -y node@24 /Users/danijelmaksimovic/.nvm/versions/node/v20.9.0/lib/node_modules/npm/bin/npm-cli.js run test`
- `npx -y node@24 /Users/danijelmaksimovic/.nvm/versions/node/v20.9.0/lib/node_modules/npm/bin/npm-cli.js run test:e2e:list -w apps/web`
- `npx -y node@24 /Users/danijelmaksimovic/.nvm/versions/node/v20.9.0/lib/node_modules/npm/bin/npm-cli.js run lint`

### Completion Notes List

- Added `apps/api/vitest.config.ts` with Node environment and `src/**/*.test.ts` include pattern.
- Added placeholder contract test at `apps/api/src/todos/todos.routes.test.ts` using `it.todo(...)`.
- Added `apps/web/vitest.config.ts` with jsdom environment and `app/**/*.test.ts(x)` include patterns.
- Added Playwright scaffold under `apps/web/e2e/` with `playwright.config.ts` and `smoke.spec.ts`.
- Updated `apps/web/package.json` with `test:e2e` and `test:e2e:list` scripts.
- Added web test dependencies: `@playwright/test`, `jsdom`, and `vitest`.
- Updated `packages/shared/package.json` test script to `vitest run --passWithNoTests` so root workspace aggregation succeeds.
- Validation results:
  - `apps/api`: 2 files passed, 1 skipped (`todo`) and existing suites green.
  - `apps/web`: existing `app/root.test.tsx` passed in jsdom.
  - Root `npm run test`: all workspaces complete without failures.
  - Playwright list: placeholder test discovered for chromium/firefox/webkit.
  - Root lint: passed across workspaces.
- Code review follow-up fixes applied:
  - Replaced `it.todo(...)` in API contract stub with a real passing assertion.
  - Added a real `packages/shared/src/index.test.ts` so root test aggregation passes without `--passWithNoTests` bypassing quality checks.
  - Strengthened Playwright smoke spec to open `/` and assert the scaffold heading is visible.

### File List

- _bmad-output/implementation-artifacts/1-4-configure-test-infrastructure.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- apps/api/src/todos/todos.routes.test.ts
- apps/api/vitest.config.ts
- apps/web/e2e/playwright.config.ts
- apps/web/e2e/smoke.spec.ts
- apps/web/package.json
- apps/web/vitest.config.ts
- package-lock.json
- packages/shared/src/index.test.ts

## Change Log

- 2026-03-09: Implemented Story 1.4 test infrastructure baseline (Vitest configs for API/web, Playwright scaffold, workspace test script alignment, and validation run completion).

## Senior Developer Review (AI)

### Review Date

2026-03-09

### Reviewer

Danijel (AI Code Review)

### Outcome

Approve

### Findings Summary

- High: 1
- Medium: 2
- Low: 0

### Action Items

- [x] [HIGH] AC-5 compliance gap: `apps/api/src/todos/todos.routes.test.ts` used `it.todo(...)`, which reports as todo/skipped rather than an executed passing test.
- [x] [MEDIUM] Root test aggregation quality bypass: `packages/shared` was switched to `--passWithNoTests`; this hides missing test coverage instead of exercising the workspace.
- [x] [MEDIUM] E2E smoke test quality gap: Playwright spec asserted `true` only and did not validate that the web app shell actually renders.

### Validation Evidence

- `npm run test -w apps/api` → 3 files passed, 5 tests passed.
- `npm run test -w apps/web` → 1 file passed, 2 tests passed.
- `npm run test -w packages/shared` → 1 file passed, 1 test passed.
- `npm run test` (root) → all workspaces pass.
- `npm run test:e2e:list -w apps/web` → smoke test discovered for chromium/firefox/webkit.
- `npm run lint` (root) → passes across workspaces.

- 2026-03-09: Code review completed; 3 findings fixed automatically (1 High, 2 Medium). Story approved and marked done.

## Story Completion Status

✅ Test infrastructure implemented and validated against AC 1-5.
✅ Code review findings resolved.
✅ Status set to done.
