# Agent Instructions

## Project context

FitnessHub is a mobile fitness and nutrition tracking application.

The product vision, roadmap and broader project context are documented in `PROJECT.md`.

Read `PROJECT.md` when broader product context is relevant to the task. Do not repeatedly load it for small, self-contained code changes when the required context is already clear.

---

## Tech stack

* React Native
* Expo
* Expo Router
* TypeScript
* SQLite for local persistence
* React Native / Expo APIs

Current development environment:

* Windows
* WSL2
* Ubuntu
* VS Code / Antigravity IDE
* Expo Go for development

The current MVP is offline-first.

---

## General principles

### Keep the MVP simple

Prefer the simplest implementation that is correct, maintainable and consistent with the existing codebase.

Do not introduce abstractions, dependencies or architecture for hypothetical future requirements.

Do not implement future roadmap functionality unless explicitly requested.

### Inspect before changing

Before modifying code:

1. Inspect the relevant existing files.
2. Understand the current implementation and patterns.
3. Identify the smallest reasonable change.
4. Implement the change.
5. Verify the result.

Do not rewrite working code unnecessarily.

### Keep changes focused

Only modify files that are relevant to the requested task.

Avoid unrelated refactoring, formatting changes or dependency updates.

---

## Architecture

Keep responsibilities separated between:

* UI
* Screens/routes
* Feature logic
* Application state
* Database/persistence
* External services
* Shared utilities
* Domain types

Avoid putting database access or substantial business logic directly inside UI components.

Prefer feature-oriented organization as the application grows.

Follow the existing project structure before introducing new folders or architectural patterns.

---

## Offline-first

Offline functionality is a core MVP requirement.

Core functionality must not depend on an internet connection.

During the MVP:

* Local data is the source of truth.
* Persistent fitness data belongs in the local database.
* Network requests must not be required for core workout logging or progress tracking.
* Do not introduce a backend dependency unless explicitly requested.

Future synchronization and backend functionality should be designed as an additional layer rather than making the local application dependent on it.

---

## Data and database

SQLite is the local persistence layer for the MVP.

Keep database access separated from UI components.

Fitness data should be represented as structured domain data.

Examples include:

* Exercise
* Workout
* Workout exercise
* Set
* Repetitions
* Weight
* Duration
* Body weight
* Body measurements
* Habits

Do not store important application data only as formatted display strings.

When modifying the database:

* Preserve existing data where possible.
* Make schema changes explicit.
* Avoid destructive migrations unless explicitly requested.
* Keep database logic centralized.

---

## TypeScript

Use TypeScript throughout the project.

Prefer explicit and meaningful types for domain data.

Avoid:

* `any`
* `@ts-ignore`
* unnecessary type assertions
* suppressing TypeScript errors

If a type error appears, fix the underlying problem rather than hiding it.

---

## React Native and Expo

Use the Expo SDK version already installed in the project.

Prefer existing Expo and React Native APIs before adding dependencies.

Do not add a package when the required functionality can reasonably be implemented using the existing stack.

Consult the official Expo documentation at https://docs.expo.dev/versions/v57.0.0/ when:

* Adding or configuring an Expo package
* Using a native API
* Implementing notifications
* Working with SQLite APIs
* Working with device capabilities
* Modifying Expo configuration
* Working with development builds or native projects
* An API may have changed between Expo SDK versions
* There is uncertainty about the correct API or recommended approach

Do not consult or load large amounts of documentation for trivial changes that can be implemented confidently from the existing codebase.

When documentation is required, prefer the documentation for the Expo SDK version used by this project.

---

## Dependencies

Before adding a dependency:

1. Check whether Expo already provides the functionality.
2. Check whether React Native already provides the functionality.
3. Check whether an existing project dependency can solve the problem.
4. Only then consider adding a new dependency.

When a new dependency is necessary, keep it focused and compatible with the installed Expo SDK.

Do not upgrade unrelated dependencies as part of a feature implementation.

---

## UI and UX

Prioritize:

* Fast data entry
* Clear information hierarchy
* Simple navigation
* Mobile-friendly interactions
* Minimal friction during workouts
* Useful feedback after user actions

Do not add visual complexity solely to make the application appear more impressive.

Functionality and usability take priority over visual effects.

Follow the existing design patterns before introducing new ones.

---

## State management

Keep transient UI state separate from persistent application data.

Do not use component state as a replacement for persistent storage.

Avoid introducing a global state-management library unless the application's existing architecture demonstrates a clear need for it.

Prefer local state and simple patterns where appropriate.

---

## Testing and verification

After making a meaningful code change:

1. Check TypeScript errors.
2. Run relevant tests or checks when available.
3. Verify affected functionality in the development app when appropriate.
4. Confirm that existing functionality was not unnecessarily affected.

Do not run expensive builds or unrelated checks for trivial changes.

Never claim that something was tested if it was not actually tested.

---

## Development environment

The project is developed inside WSL2.

The Expo development server normally runs inside WSL and is exposed to the local network through the Windows host.

Current development networking uses the Windows LAN address rather than the internal WSL address.

Do not change the networking setup or introduce Expo Tunnel unless explicitly requested.

Avoid recommending `npx expo start --tunnel` as the default solution for local development.

If networking problems occur, inspect the existing setup before changing it.

---

## Security

Never expose or commit:

* API keys
* Access tokens
* Passwords
* Private credentials
* Secrets
* Personal authentication data

Use environment variables or the appropriate secret-management mechanism when required.

Do not invent credentials, configuration values or API keys.

---

## Code quality

Prefer:

* Small focused components
* Clear naming
* Simple control flow
* Explicit types
* Reusable logic when duplication is meaningful
* Existing project conventions

Avoid:

* Premature abstraction
* Over-engineering
* Large monolithic components
* Unnecessary comments
* Dead code
* Unused dependencies
* Speculative architecture

Comments should explain why something is necessary, not restate what the code obviously does.

---

## Task completion

When completing a task:

* Keep the implementation within the requested scope.
* Mention important assumptions.
* Report relevant verification performed.
* Mention any known limitations or remaining issues.

Do not claim successful verification without actually performing it.
