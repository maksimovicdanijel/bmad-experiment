---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-e-01-discovery
  - step-e-02-review
  - step-e-03-edit
inputDocuments:
  - prd.md
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 1
workflowType: "prd"
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
lastEdited: "2026-03-05"
editHistory:
  - date: "2026-03-05"
    changes: "Added User Journeys (6 journeys), Functional Requirements (12 FRs), Non-Functional Requirements (11 NFRs). Fixed subjective adjectives in Success Criteria. Removed implementation leakage (tool names). Fixed Project Classification."
  - date: "2026-03-05"
    changes: "Removed conversational filler in Executive Summary (2 instances). Replaced subjective adjectives with measurable targets matching NFRs. Changed Project Classification type to capability-focused language."
---

# Product Requirements Document - bmad-experiment

**Author:** Danijel
**Date:** 2026-03-05

## Executive Summary

This product is a full-stack personal task management application designed for individual users who need a fast, frictionless way to track daily tasks. Existing todo tools have grown bloated with features — project hierarchies, team collaboration, integrations, calendars — burying the core action of simply capturing and completing a task under layers of unnecessary complexity.

The application provides four essential operations: create a task, view all tasks, mark a task complete, and delete a task. Each todo carries a text description, a completion status, and a creation timestamp. The interface loads in under one second, responds to every interaction within 100ms, and renders correctly on viewports from 320px to 1920px. No signup, no onboarding, no configuration — open the app and start working.

The backend exposes a focused REST API responsible for persisting todo data across sessions. The architecture is intentionally simple but structurally sound, designed so that capabilities like authentication or multi-user support can be layered on without rearchitecting the system.

### What Makes This Special

Radical simplicity is the product strategy, not a limitation. In a category where competitors compete by adding features, this app competes by removing friction. A user can go from "I need to remember something" to "it's captured" in under two seconds, with zero cognitive overhead.

The core insight: most people don't need project management — they need a reliable, instant place to track what needs to get done today. The best todo app is the one that gets out of your way entirely.

## Project Classification

- **Type:** Web-based productivity tool
- **Domain:** General productivity / task management
- **Complexity:** Low — well-understood problem space, standard CRUD operations, no regulatory or compliance requirements
- **Context:** Greenfield — new product built from scratch

## Success Criteria

### User Success

- Page loads in under 1 second on standard broadband connections — users see their todo list immediately
- A new user can create their first todo within 3 interactions (zero onboarding screens)
- All core actions (create, view, complete, delete) completable without guidance or documentation
- Completed tasks visually distinguished from active tasks via distinct styling (e.g., strikethrough, dimmed color)
- UI renders correctly and is fully interactive on viewports from 320px (mobile) to 1920px (desktop)
- Empty state shows clear call-to-action, loading state shows indicator within 200ms, error state displays actionable message with retry option

### Business Success

- Application deployable with a single command (e.g., container build + run)
- All MVP features implemented and tested — no placeholder UI or stubbed endpoints
- Codebase follows consistent conventions with documented setup instructions completable in under 10 minutes
- Architecture uses separation of concerns enabling auth and multi-user features without modifying existing API contracts

### Technical Success

- Test coverage at minimum 80% across the codebase
- End-to-end tests covering all core user flows (create, view, complete, delete)
- API contract tests validating all endpoints against documented schema
- Unit tests for both frontend and backend logic
- API response time under 200ms at 95th percentile for all CRUD operations under normal load
- Data persists reliably across page refreshes and browser sessions with zero data loss

### Measurable Outcomes

| Metric                                    | Target                                |
| ----------------------------------------- | ------------------------------------- |
| Page load time                            | < 1 second                            |
| Task capture time (open app → todo saved) | < 2 seconds                           |
| API response time (95th percentile)       | < 200ms                               |
| Test coverage                             | ≥ 80%                                 |
| Core actions completable without guidance | 100% (create, view, complete, delete) |
| Data persistence across sessions          | 100% reliability                      |
| Supported viewport range                  | 320px – 1920px                        |

## Product Scope

### MVP - Minimum Viable Product

- Create a todo with a text description
- View all todos in a list
- Mark a todo as complete/incomplete
- Delete a todo
- Each todo stores: text description, completion status, creation timestamp
- Responsive UI across desktop and mobile
- Visual distinction between active and completed tasks
- Empty state, loading state, and error state handling
- REST API with full CRUD operations
- Persistent data storage across sessions
- Test suite: unit tests, API contract tests, end-to-end tests

### Growth Features (Post-MVP)

- User authentication and accounts
- Multi-user support with personal task lists
- Task prioritization or ordering
- Due dates and reminders

### Vision (Future)

- Collaboration and shared lists
- Notifications and alerts
- Integrations with external tools (calendars, email)
- Offline-first with sync capabilities

## User Journeys

### UJ-1: First-Time User Creates a Todo

**Actor:** New user visiting the app for the first time
**Trigger:** User opens the application URL
**Flow:**

1. Page loads and displays an empty todo list with a clear call-to-action (e.g., input field with placeholder text)
2. User types a task description into the input field
3. User submits the todo (press Enter or click an add button)
4. New todo appears in the list immediately with active styling
5. Todo persists — refreshing the page shows the same todo

**Success Criteria Traced:** Page load < 1s, task capture < 2s, zero onboarding, data persistence

### UJ-2: Returning User Views and Manages Tasks

**Actor:** User with existing todos
**Trigger:** User opens the application
**Flow:**

1. Page loads and displays all existing todos (active and completed)
2. Active todos are visually distinct from completed todos
3. User scans the list to identify what needs to be done
4. User can see creation timestamps to understand task age

**Success Criteria Traced:** Page load < 1s, visual distinction between active/completed, data persistence

### UJ-3: User Completes a Task

**Actor:** User with active todos
**Trigger:** User finishes a real-world task
**Flow:**

1. User locates the todo in the list
2. User marks it as complete (e.g., clicks a checkbox or toggle)
3. Todo immediately updates to completed styling (e.g., strikethrough, dimmed)
4. Completion status persists across sessions

**Success Criteria Traced:** Core actions without guidance, visual distinction, API < 200ms, data persistence

### UJ-4: User Deletes a Task

**Actor:** User wanting to remove a todo
**Trigger:** User decides a task is no longer relevant
**Flow:**

1. User locates the todo in the list
2. User triggers delete action (e.g., clicks a delete button)
3. Todo is removed from the list immediately
4. Deletion persists — refreshing the page confirms removal

**Success Criteria Traced:** Core actions without guidance, API < 200ms, data persistence

### UJ-5: User Encounters an Error

**Actor:** Any user
**Trigger:** Network failure, server error, or invalid input
**Flow:**

1. User attempts an action (create, complete, delete)
2. Action fails due to network or server issue
3. UI displays an actionable error message (e.g., "Could not save. Please try again.")
4. User retries the action
5. On success, UI updates normally

**Success Criteria Traced:** Error state handling, no broken UI moments

### UJ-6: User Toggles a Completed Task Back to Active

**Actor:** User who completed a todo prematurely
**Trigger:** User realizes a task is not actually done
**Flow:**

1. User locates the completed todo
2. User toggles it back to active (same mechanism as completing)
3. Todo immediately returns to active styling
4. Status change persists across sessions

**Success Criteria Traced:** Core actions without guidance, API < 200ms, data persistence

## Functional Requirements

### Task Management

- **FR-1:** Users can create a todo by entering a text description (1–255 characters) and submitting it
- **FR-2:** Users can view all todos in a single list displaying text, completion status, and creation timestamp
- **FR-3:** Users can mark any active todo as complete, triggering an immediate visual change
- **FR-4:** Users can mark any completed todo as active, restoring it to active styling
- **FR-5:** Users can delete any todo (active or completed), removing it permanently from the list

### Data Persistence

- **FR-6:** All todo data (text, completion status, creation timestamp) persists across page refreshes and browser sessions
- **FR-7:** Each todo is assigned a unique identifier upon creation

### User Interface States

- **FR-8:** When no todos exist, the UI displays an empty state with a clear prompt to create the first todo
- **FR-9:** While data is loading, the UI displays a loading indicator within 200ms of request initiation
- **FR-10:** When an operation fails, the UI displays an actionable error message with a retry option

### API

- **FR-11:** The backend exposes a REST API supporting create, read, update, and delete operations for todos
- **FR-12:** API validates that todo text is between 1 and 255 characters, returning a descriptive error for invalid input

## Non-Functional Requirements

### Performance

- **NFR-1:** Page initial load completes in under 1 second on a standard broadband connection (10 Mbps+), as measured by Largest Contentful Paint (LCP)
- **NFR-2:** API responds to all CRUD requests in under 200ms at 95th percentile under normal load (single user), as measured by server-side request timing
- **NFR-3:** UI updates reflect user actions (create, complete, delete) within 100ms of API response, as perceived by the user

### Reliability

- **NFR-4:** Zero data loss — all successfully acknowledged writes persist across server restarts and page refreshes, verified by persistence tests
- **NFR-5:** Application recovers from transient network errors without requiring a full page reload

### Usability

- **NFR-6:** UI renders correctly and is fully interactive on viewports from 320px to 1920px wide, verified by responsive layout tests
- **NFR-7:** All interactive elements meet minimum touch target size of 44×44px on mobile viewports
- **NFR-8:** Color contrast ratios meet WCAG 2.1 AA standards (minimum 4.5:1 for text) for all UI elements

### Maintainability

- **NFR-9:** Codebase achieves minimum 80% test coverage across unit, API contract, and end-to-end tests
- **NFR-10:** Project setup from clone to running application completes in under 10 minutes following documented instructions

### Extensibility

- **NFR-11:** Backend architecture uses separation of concerns (routing, business logic, data access) enabling addition of authentication without modifying existing endpoint contracts
