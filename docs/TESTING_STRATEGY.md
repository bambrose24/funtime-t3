# Mobile Testing Strategy (Expo)

## 1. Purpose
This document defines the required testing strategy for `@funtime/mobile`.

Goals:
- Prevent regressions in critical player/admin flows while parity work continues.
- Keep tests aligned with modern Expo + React Native guidance.
- Make test maintenance a required part of flow and screen changes.

Mandatory policy:
- Any PR that changes behavior for a user flow or screen must update tests in the same PR.
- If a test cannot be added/updated immediately, the PR must include:
  1. a clear reason in `WORKLOG.md`, and
  2. a linked follow-up test ticket scheduled in `WORKLOG.md`/`docs/MOBILE_PARITY_PLAN.md`.

## 2. Test Pyramid (Expo App)
1. Unit/component tests (largest layer):
  - Tooling: Jest with `jest-expo` + React Native Testing Library (RNTL).
  - Scope: rendering states, validation rules, CTA enable/disable logic, mutation success/error UI.
2. Integration tests (middle layer):
  - Tooling: Jest + RNTL + Expo Router test utilities.
  - Scope: route entry, tab/screen transitions, deep-link parsing behavior, auth-gated navigation outcomes.
3. End-to-end tests (smallest layer):
  - Tooling: Maestro flows executed in EAS Workflows/device cloud.
  - Scope: mission-critical happy paths and highest-risk failures across real app runtime boundaries.

## 3. Tooling Standards
- Unit/integration runtime:
  - Use `jest-expo` preset for Expo-managed compatibility.
  - Use RNTL user-centric assertions (`getByRole`, `getByText`, visible behavior), not implementation-detail assertions.
  - Keep snapshots minimal and focused on stable primitives; avoid broad snapshot-only coverage.
- Router coverage:
  - Use Expo Router testing utilities to validate route behavior in isolation.
  - Keep test files outside route `app/` directories to avoid routing side effects.
- E2E coverage:
  - Use Maestro for core mobile journeys (join/create/pick/leaderboard/profile/admin basics).
  - Keep selectors stable with explicit `testID` on controls that E2E must target.

## 4. Flow Coverage Requirements
Minimum required coverage set:
1. Auth/session bootstrap:
  - Signed-in and signed-out bootstrap outcomes.
  - Invalid refresh token recovery path.
2. Home + league navigation:
  - Home league list and pull-to-refresh state.
  - League tab switching and screen persistence expectations.
3. Join/Create league:
  - Required-field validation and submit gating.
  - Super Bowl registration validation (winner/loser/score constraints).
4. Picks + leaderboard:
  - Pick card lock/open state, submit gating, and tiebreaker rules.
  - Leaderboard tie-rank rendering behavior.
5. Notifications + deep links:
  - Notification-tap de-dup behavior.
  - Deep-link parse and route resolution for supported paths.
6. Admin critical paths:
  - Member role/paid/remove flows.
  - Admin pick edit lock and override state behavior.

## 5. Quality Gates
- Pull requests touching mobile flows/screens:
  - Must include updated/added tests for behavior changes.
  - Must run mobile test command(s) in CI before merge.
- Release gate:
  - Maestro smoke suite for critical end-to-end flows passes on target build.
- Worklog gate:
  - Each task entry that touches flows/screens must record test impact:
    - tests added/updated, or
    - explicit reason deferred + linked follow-up ticket.

## 6. Rollout Plan
1. `P6-TEST-FOUNDATION-001`:
  - Add Jest + `jest-expo` + RNTL configuration and scripts for `@funtime/mobile`.
  - Add baseline tests for auth bootstrap, home, join/create validation, and picks lock-state behavior.
2. `P6-TEST-E2E-001`:
  - Add Maestro critical-flow smoke suite and wire it to EAS workflow execution.
3. `P6-TEST-GOVERNANCE-001`:
  - Enforce CI test checks and PR checklist language requiring test updates for changed flows/screens.

## 7. References
- Expo unit testing: https://docs.expo.dev/develop/unit-testing/
- Expo Router testing: https://docs.expo.dev/router/reference/testing/
- Expo E2E in EAS workflows: https://docs.expo.dev/eas/workflows/examples/e2e-tests/
- React Native testing overview: https://reactnative.dev/docs/testing-overview
- React Native Testing Library docs: https://callstack.github.io/react-native-testing-library/docs/start/intro
