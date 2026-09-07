# Testing Strategy

## Web E2E (Next.js + local Supabase)

The canonical web E2E command is:

```bash
pnpm e2e:web
```

It starts and resets the repository's local Supabase stack, applies Prisma
migrations and the deterministic schedule seed, creates isolated browser-test
users and leagues, starts Next.js on `127.0.0.1:3100`, and runs Playwright in
Chromium. Docker, the Supabase CLI, PostgreSQL's `psql`, pnpm, Bun, and the
Playwright Chromium browser must be installed. Install the browser once with:

```bash
pnpm exec playwright install chromium
```

For a faster local rerun against an already-running, correctly seeded Supabase
stack, use `pnpm e2e:web -- --skip-backend-up`. Fixture users and leagues are
still recreated. The full command is the release and CI source of truth because
it also proves database startup, migration, seed, and verification.

The runner refuses any database URL other than
`postgresql://postgres:postgres@127.0.0.1:55422/postgres` and any Supabase API
URL other than `http://127.0.0.1:55421`. It sets `E2E_MODE=1`,
`NEXT_PUBLIC_E2E_MODE=1`, and `FUNTIME_DISABLE_EMAILS=1`, which suppress outbound
email, push, analytics, cron, and sports-data side effects. E2E fixture data must
remain under the `web.e2e.*@example.com` accounts and `E2E*` share-code namespace.

Playwright fails every test on an uncaught page error or unexpected browser
`console.error`. Failure traces, screenshots, videos, browser-error attachments,
and the Next.js log are uploaded by `.github/workflows/web-e2e-supabase.yml`.
View a local HTML report with:

```bash
pnpm exec playwright show-report
```

### GitHub Actions gate

`.github/workflows/web-e2e-supabase.yml` runs on every pull request, merge-queue
group, push to `main`, and manual dispatch. It uses a fresh `ubuntu-24.04`
runner and requires no hosted Supabase project or repository secrets.

The CI job performs these gates in order:

1. Installs pinned Node, pnpm, Bun, Supabase CLI, PostgreSQL client, and the
   Playwright Chromium browser plus Linux dependencies.
2. Starts the Docker-backed Supabase stack on the ephemeral runner.
3. Resets the local database, applies Prisma migrations, loads the deterministic
   schedule seed, and runs the read-only seed verification.
4. Creates deterministic local Auth users and web fixtures.
5. Starts Next.js against that local database and runs all Playwright specs.
6. Uploads the Playwright report, traces/screenshots/videos, Next.js log,
   Supabase status, and Docker container state on success or failure.
7. Stops the temporary Supabase stack without retaining its data.

Any bootstrap, migration, seed, readiness, browser, assertion, or uncaught-page
error exits nonzero and fails the `chromium-e2e` job. To prevent merging on a
failure, configure the repository's `main` ruleset/branch protection to require
the **Web E2E (Supabase Local) / chromium-e2e** status check. Repository branch
protection is GitHub configuration and cannot be guaranteed by workflow YAML
alone.

Current repository audit (2026-08-08): `main` has no branch protection or
repository ruleset configured. The workflow will report its CI result after it
is pushed, but it will not block merging until the check above is marked
required in GitHub.

### Living web coverage governance

`docs/WEB_E2E_WORKLOG.md` is the living source of truth for what the web suite
does and does not cover. Its coverage index maps product areas to specs, its PRD
checklist records behavioral coverage, and its gaps register records intentional
boundaries. It must describe the current repository state, not an aspirational
future state.

### Choosing the test layer (agreed September 6, 2026)

Validate flows, not every feature with a new browser test. Choose the lowest
layer that can catch the actual regression; preserve representative end-to-end
coverage for the player and commissioner journeys.

| Change                                                                                                     | Coverage expected                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| New critical journey, or changed multi-step auth/navigation/submission flow                                | Add or update a representative browser/native E2E journey.                                                                                     |
| UI-to-API wiring, session handoff, persistence shown after navigation/reload, or a browser-only regression | Add/update E2E at that integration boundary.                                                                                                   |
| API authorization, kickoff/scoring rules, retry/concurrency or database constraints                        | Direct API/database integration tests for the rule matrix; reuse existing E2E for the surrounding flow unless its behavior changes.            |
| Pure transformation, validation boundary, formatting or isolated component state                           | Unit/component tests when behavior warrants them; no duplicate E2E cases.                                                                      |
| Copy, spacing, styling, documentation, or behavior-preserving refactor                                     | Relevant existing checks and targeted inspection; no mandatory new E2E or redundant implementation-mirroring tests.                            |
| Email/push provider or scheduler behavior                                                                  | Isolated integration/contract tests with fake providers/clock; device tests for OS delivery/tap behavior. Browser E2E does not prove delivery. |

Add E2E when failure would only be visible across layers, when a core journey
has no representative coverage, or when the regression escaped because the
existing journey omitted the affected step. Extend an existing journey before
adding a near-duplicate one. Test exhaustive roles, times and payloads below
the browser layer when possible.

Each behavior PR records the affected journey, existing owning spec, selected
test layer, new/changed assertions and actual run results. Explain why existing
E2E is sufficient when no new E2E is added; this is a normal coverage decision,
not a deferral requiring an artificial follow-up ticket. If meaningful coverage
is genuinely missing, name the gap, owner and follow-up explicitly.

Update the PRD only when product expectations change, and the coverage worklog
when coverage or behavior changes. A unit/API test does not turn an untested
browser-flow checkbox into a covered journey. For auth, membership, picks,
standings, messaging, authorization or shared persistence changes, run the
relevant tests and full local web E2E suite before calling validation complete
(or record an explicit environment blocker and obtain the CI result). The
existing full-suite CI gate remains in place. Do not require a full local E2E
run solely for documentation/cosmetic changes unrelated to flow behavior.

These criteria also apply to mobile: use native E2E for core journeys and OS
integration, and focused unit/component/API tests for their underlying rules.

### Direct pick API/database regression gate

After the isolated local schema and schedule seed are ready, run
`pnpm --filter @funtime/api test:integration`. The script fixes its database URL
to `127.0.0.1:55422`, enables E2E mode, and disables outbound delivery. Tests
call the real routers with authenticated-actor contexts and real PostgreSQL
queries; each fixture is rolled back. Confirmation delivery is stubbed at the
service boundary. A controlled clock exercises exact kickoff semantics.
This validates API rules, not Supabase authentication or browser interactions.
The web CI workflow runs this gate before its existing browser journeys.

## Mobile Testing Strategy (Expo)

## 1. Purpose

This document defines the required testing strategy for `@funtime/mobile`.

Goals:

- Prevent regressions in critical player/admin flows while parity work continues.
- Keep tests aligned with modern Expo + React Native guidance.
- Make test maintenance a required part of flow and screen changes.

Execution snapshot (UTC `2026-02-27T21:36:04Z`):

- Testing-plan execution is paused for later pickup.
- Current validated baseline: mobile Jest suite passing (`3/3`, `7/7`) and API/web typechecks passing.
- Outstanding closure item: definitive full Android E2E (`pnpm e2e:mobile:maestro`) pass/fail capture on a non-sandboxed host terminal.

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
- Runtime target: Expo dev build (`com.funtime.mobile`) rather than Expo Go for stable startup behavior.
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
- League Chat badge, read-cursor, and new-message behavior across tab entry and notification entry.

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
- Add initial baseline tests for highest-risk behavior slices (auth refresh recovery, picks lock-state behavior, leaderboard interaction).
- Status: complete (`2026-02-26`) with baseline auth/picks/leaderboard suites; home/join/create/deep-link expansions move to `P6-TEST-COVERAGE-002`.

2. `P6-TEST-E2E-001`:

- Add Maestro critical-flow smoke suite and wire it to EAS workflow execution.

3. `P6-TEST-COVERAGE-002`:

- Expand Jest/RNTL coverage to home/nav, join/create validation, and deep-link path behavior.

4. `P6-TEST-GOVERNANCE-001`:

- Enforce CI test checks and PR checklist language requiring test updates for changed flows/screens.

## 7. References

- Expo unit testing: https://docs.expo.dev/develop/unit-testing/
- Expo Router testing: https://docs.expo.dev/router/reference/testing/
- Expo E2E in EAS workflows: https://docs.expo.dev/eas/workflows/examples/e2e-tests/
- React Native testing overview: https://reactnative.dev/docs/testing-overview
- React Native Testing Library docs: https://callstack.github.io/react-native-testing-library/docs/start/intro

## 8. Local Supabase E2E Infrastructure

- Canonical infra plan: `docs/E2E_INFRA_PLAN.md`.
- Execution/work tracking log: `E2E_INFRA_WORKLOG.md`.
- Deterministic seeded E2E baseline:
  - committed fixture: `supabase/fixtures/season-2026.json`
  - generated seed SQL: `supabase/seed.sql`
  - dev-build install command: `pnpm e2e:mobile:install-dev-client`
  - bootstrap command: `pnpm e2e:backend:up`
  - seed verification command: `pnpm e2e:seed:verify`
- E2E side-effect isolation:
  - `E2E_MODE=1` must be enabled for E2E runs.
  - External side-effect providers are mocked/short-circuited in this mode (Resend, Expo Push, ESPN/MySportsFeeds pulls, Axiom transports, web PostHog, cron/postseason runners).
- Mandatory governance extension:
  - Any change affecting auth/signup, league creation/join, season/week selection, or picks persistence must update:
    1. Jest/RNTL coverage where applicable,
    2. Maestro flow coverage where user-visible E2E behavior changes, and
    3. `pnpm e2e:seed:verify` logic when backend season/pickability rules change.

### WEB-02a late-policy coverage (September 6, 2026)

- `packages/api/tests/integration/late-policy.test.ts`: 23 direct-router/PostgreSQL cases for first-kickoff cutoff, admin/super-admin, existing policies, mixed-request preflight, rescheduled schedule, and week metadata. Combined integration suite: 45 passing; pre-fix baseline: 35 passing / 10 failing.
- `apps/web/e2e/picks/late-policy.spec.ts`: dedicated player and isolated leagues validate closed-state UI and the original mixed-policy rejection/retry journey. WEB-02b updates that owner spec to validate partial success instead.
- All three platform typechecks pass. Full browser CI is required before this PR is ready. Local API validation uses an isolated PostgreSQL container; local Supabase auth startup is blocked. Device UI behavior remains outside this web slice.

### WEB-02b partial-outcome coverage (September 6, 2026)

- The existing real-router/PostgreSQL mixed-policy case now asserts that an open league saves, a first-kickoff-closed league is skipped with a stable reason, no skipped pick exists, and confirmation scope contains only the saved league.
- The existing web policy E2E now exercises closed state plus apply-to-all partial success and named confirmation. It does not duplicate the API role/time matrix.
- The additive response shape keeps old mobile callers functional. Native success wording is a subsequent client adoption slice, not evidence of native outcome UX.

### WEB-02c native outcome-confirmation coverage (September 7, 2026)

- `apps/mobile/tests/picks/getPickSubmissionConfirmation.test.ts` covers full and partial-save alert copy, including named saved and skipped leagues.
- This is a pure presentation transform of an already-tested server response, so focused unit tests and mobile typecheck are sufficient. Device E2E is reserved for a changed native flow, navigation, provider handoff, or persisted behavior.
