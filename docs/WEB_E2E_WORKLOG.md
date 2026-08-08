# Web E2E Worklog

## Objective

Build a Playwright suite for the Next.js web app that runs only against the
project's local Supabase stack, covers the critical PRD journeys, and fails on
uncaught browser errors.

## Living Coverage Contract

This document is the source of truth for the web application's current E2E
coverage—not a one-time project log. Keep it aligned with the codebase on every
user-facing behavior change.

- A checked item means a deterministic Playwright path exists, runs against
  local Supabase, and passed in the most recent full-suite baseline.
- An unchecked item means coverage is missing or incomplete, even if the
  feature works manually or has unit tests.
- New or changed functionality must add or update its checklist item and E2E
  spec in the same change. Add the checklist item before implementation so a
  missing test remains visible.
- If browser E2E is genuinely the wrong layer, record the behavior in the
  explicit gaps register below with the test layer that owns it and a concrete
  follow-up. Do not silently omit it.
- Update the execution log only with runs that actually completed. The
  canonical acceptance command is `pnpm e2e:web`.
- Do not mark PRD functionality complete until its test impact is represented
  here and the relevant automated suite passes.

Current validated baseline: **21 Playwright tests in 18 files, all passing on a
fresh local-Supabase reset (2026-08-08).**

## Safety Contract

- [x] Refuse to run unless the Supabase API is local (`127.0.0.1:55421`).
- [x] Refuse to reset unless PostgreSQL is local (`127.0.0.1:55422`).
- [x] Always run the web process with `E2E_MODE=1` and
      `NEXT_PUBLIC_E2E_MODE=1`.
- [x] Disable outbound email, push, telemetry, cron, and sports-data effects.
- [x] Reset and seed the local database before a full suite run.
- [x] Use deterministic fixture users and leagues; never production data.

## Implementation Checklist

- [x] Add Playwright dependency, configuration, scripts, and artifact ignores.
- [x] Add a local-Supabase/Next.js orchestration script.
- [x] Add shared browser-error assertions and accessible test helpers.
- [x] Prove a single public-page test on a freshly reset local stack.
- [x] Add deterministic local auth users and application fixtures.
- [x] Use reusable authenticated-login helpers for admin and player roles.
- [x] Add required PR smoke suite.
- [x] Add broader PRD regression suite.
- [x] Add a GitHub Actions web E2E job and artifact upload.
- [x] Document local and CI runbooks.

## Coverage Index

| Product area            | Covered browser flows                                                                                    | Owning specs                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Authentication          | Anonymous access, signup/onboarding, login, logout, protected-route redirects                            | `auth/session.spec.ts`, `auth/signup.spec.ts`                                                                         |
| Account settings        | Client validation, duplicate username rejection, successful persistence                                  | `profile/settings.spec.ts`                                                                                            |
| League lifecycle        | Create with policies, join by code, duplicate prevention, waiting/completed states, renewal and invites  | `league/create-and-duplicate.spec.ts`, `league/join.spec.ts`, `league/renewal.spec.ts`, `smoke/admin-renewal.spec.ts` |
| Weekly picks            | Validation, submission, apply-to-all, update, player kickoff lock, admin lock, super-admin override      | `picks/submit.spec.ts`, `picks/integrity.spec.ts`, `league/admin-member-workflows.spec.ts`                            |
| Competitive integrity   | Membership authorization and opponent-pick redaction before submission and before each kickoff           | `picks/integrity.spec.ts`, `platform/access-and-responsive.spec.ts`                                                   |
| Standings and profiles  | Weekly co-winners, competition ranking, cumulative chart, result totals, player profile                  | `standings/results.spec.ts`, `profile/superbowl.spec.ts`                                                              |
| Super Bowl contest      | Required join prediction, edit, preseason privacy, in-progress visibility, completed bracket and ranking | `league/join.spec.ts`, `profile/superbowl.spec.ts`, `superbowl/visibility.spec.ts`, `superbowl/results.spec.ts`       |
| Messaging               | Post, own-message deletion, admin moderation, non-member denial                                          | `league/messages.spec.ts`, `platform/access-and-responsive.spec.ts`                                                   |
| League administration   | Rename, role, paid status, pick correction, email history, rate limiting, member removal, role denial    | `league/admin-controls.spec.ts`, `league/admin-member-workflows.spec.ts`                                              |
| Platform and resilience | Super-admin dashboard, ordinary-user denial, mobile viewport smoke, uncaught browser-error guard         | `platform/access-and-responsive.spec.ts`, all specs through the automatic error fixture                               |
| Regression smoke        | Public landing and completed-admin crash regression                                                      | `smoke/landing.spec.ts`, `smoke/admin-renewal.spec.ts`                                                                |

## PRD Coverage Checklist

### Authentication and account

- [x] Anonymous visitor can open login and signup pages without page errors.
- [x] New user can sign up and complete the application profile.
- [x] Existing user can sign in and sign out.
- [x] Protected journeys redirect or fail closed for anonymous users.
- [x] Profile username validation and update work.

### League lifecycle

- [x] Admin can create a league with supported policy settings.
- [x] Player can join by share code.
- [x] Duplicate membership is prevented.
- [x] Not-started league state renders correctly.
- [x] Completed-league admin page renders renewal controls without page errors.
- [x] Admin can create one linked renewal league and invite eligible members.

### Weekly picks and integrity

- [x] Player can submit a complete week and the picks persist in PostgreSQL.
- [x] Tiebreaker validation rejects missing or invalid scores.
- [x] Existing picks can be updated idempotently.
- [x] Started games cannot be changed by a player.
- [x] Started games cannot be changed by a league admin.
- [x] Super admin can override a started pick for a correction.
- [x] Apply-to-all-season-leagues submits to each eligible membership.
- [x] A player without submitted picks cannot see other players' picks.
- [x] A submitted player sees only started-game picks from other players.

### Standings and profiles

- [x] Weekly standings and winner state render from completed games.
- [x] Season leaderboard uses competition ranking for ties.
- [x] Cumulative leaderboard/chart data render without browser errors.
- [x] Player profile shows expected picks and results.

### Super Bowl competition

- [x] Join requires winner, loser, and score when competition is enabled.
- [x] A member can submit and update a Super Bowl prediction.
- [x] Other predictions stay hidden before league start.
- [x] Bracket/contest result state renders after completion.

### League messaging

- [x] Member can post and delete their own message.
- [x] League admin can delete another member's message.
- [x] Non-members cannot access the league message board.

### League administration

- [x] Admin can rename the league.
- [x] Admin can change a member role.
- [x] Admin can toggle donated/paid status.
- [x] Admin can remove a member.
- [x] Admin can edit a member's unstarted picks.
- [x] Admin can view member email logs.
- [x] Broadcast UI enforces its weekly rate-limit state without sending email.
- [x] Non-admin members cannot access league admin routes.

### Platform administration and resilience

- [x] Authorized super admin can open aggregate admin dashboard.
- [x] Ordinary users cannot open the aggregate admin dashboard.
- [x] Critical pages fail the test on `pageerror` or unexpected console errors.
- [x] Responsive smoke checks cover desktop and mobile browser viewports.

## Explicit Gaps and Suite Boundaries

| Not covered by this web E2E suite                                                         | Current reason/owner                                                                                              | Required follow-up when it changes                                                                                                        |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Real Resend email, push notification, analytics, ESPN, cron, and postseason-sync delivery | External side effects are intentionally disabled in E2E mode; browser tests verify UI and local database outcomes | Cover provider adapters and scheduled jobs with isolated integration/contract tests; keep one no-send browser assertion for triggering UI |
| Planned week-summary and near-real-time message notifications                             | PRD functionality is not implemented                                                                              | Add checklist rows, deterministic fixtures, and E2E/integration coverage with the implementation                                          |
| Target persistent league-wide message thread                                              | Current product remains week-scoped                                                                               | Replace/extend the current messaging spec when the target model ships                                                                     |
| Firefox, WebKit, and device-browser matrices                                              | CI currently gates Chromium only                                                                                  | Add projects and document any browser-specific exclusions before claiming cross-browser support                                           |
| Full visual-regression, accessibility, and performance auditing                           | The suite uses semantic locators and fails on runtime errors but is not a comprehensive non-functional audit      | Add dedicated visual, axe/accessibility, and performance budgets if these become release gates                                            |
| Hosted Supabase or production data                                                        | Intentionally prohibited to avoid pollution and unsafe resets                                                     | Keep local-stack guards; validate hosted infrastructure through non-destructive deployment checks                                         |
| Mobile application journeys                                                               | Owned by the mobile Jest/Maestro strategy                                                                         | Maintain the mobile coverage sections in `docs/TESTING_STRATEGY.md`                                                                       |

## Execution Log

- 2026-08-08: Audited PRD, web routes, existing mobile E2E infrastructure, and
  local Supabase bootstrap. Confirmed no existing web E2E runner or specs.
- 2026-08-08: Began Playwright foundation. The first required milestone is one
  passing browser test against a freshly reset local Supabase stack before any
  additional coverage is added.
- 2026-08-08: First bootstrap reached local migrations and deterministic seed,
  then exposed an existing `verify-seed.ts` bug: a multi-command `psql -c`
  invocation returned the final `ROLLBACK` output instead of the JSON query
  result. Updated the read-only verifier to execute its SELECT directly.
- 2026-08-08: First Playwright launch reached the landing page and correctly
  failed on a React hydration warning. The custom theme wrapper rendered a
  client-only `dark` class even though `next-themes` already owns the document
  class. Removed the redundant wrapper to make server/client markup stable.
- 2026-08-08: Fresh-stack proof passed: local reset, three Prisma migrations,
  deterministic 2027 schedule verification, Next.js startup, and Chromium test
  all completed successfully (`1 passed`).
- 2026-08-08: Added guarded local fixture-user/league seeding. Initial fixture
  run exposed that Prisma's `cuid()` default for `leaguemessages.message_id` is
  client-side rather than a PostgreSQL default; assigned a deterministic ID.
- 2026-08-08: Deterministic fixture seeding passed together with the original
  landing smoke test. Added the first authenticated regression: a completed
  league admin must render the renewal panel and its next-season setup link with
  no uncaught browser or console errors.
- 2026-08-08: First authenticated run caught an uncontrolled-to-controlled
  React warning in the login form and an ambiguous password label locator.
  Initialized both login fields and made the test selector exact.
- 2026-08-08: The exact selector then showed the password input was not actually
  associated with its visible label: a nested label targeted a wrapper `div`.
  Replaced the nested label and explicitly associated `label[for=password]`
  with the password input.
- 2026-08-08: The admin page assertions rendered, but the global error guard
  caught a hidden HTTP 500 from server rendering: `LeagueAdminClientPage` read
  `window.location` during SSR. Moved share-link origin resolution to an effect
  so the server and first client render are stable.
- 2026-08-08: Two-test full-suite baseline passed after the SSR fix. Began the
  signup/profile journey and made password fields explicitly label-addressable.
  Fixture setup now also removes prior generated `web.e2e.*` auth accounts so
  repeated runs with or without a database reset remain deterministic.
- 2026-08-08: Signup/profile completion passed against the local auth service
  and PostgreSQL (`3 passed`). Began share-code registration coverage with the
  required Super Bowl winner, loser, and total-score fields.
- 2026-08-08: The first four-test run failed because both Radix team selectors
  exposed unnamed comboboxes. Added explicit accessible names to the AFC and
  NFC triggers; the test intentionally remains role-and-name driven.
- 2026-08-08: Registration and its PostgreSQL writes succeeded on the next run,
  but the default five-second URL assertion expired while Next dev mode cold
  compiled the destination route (about six seconds). Raised only the assertion
  timeout to 15 seconds; the per-test timeout and database proof remain intact.
- 2026-08-08: Share-code registration passed in the full suite (`4 passed`),
  including role/name-driven controls and exact winner/loser/score verification.
  Began weekly-pick coverage with apply-to-all and idempotent update checks.
- 2026-08-08: The first pick run proved the submit mutation and all eight rows
  across both eligible 2027 memberships. It stopped on an ambiguous dialog
  `Close` locator (footer action plus icon); scoped the action within the dialog.
- 2026-08-08: The next run exposed a product defect: `league.weekToPick`
  advanced to Week 2 as soon as any Week 1 picks existed, even though every
  Week 1 game remained open. Removed submission state as an advancement signal;
  the picker now advances only when the next scheduled game is in the next week.
- 2026-08-08: Weekly submit/apply/update passed with exact PostgreSQL assertions
  (`5 passed`). Began session-boundary coverage for anonymous redirects and UI
  sign-out followed by a second protected-route check.
- 2026-08-08: The first session-boundary run found the avatar dropdown was not a
  stable freshly hydrated interaction. Switched the sign-out assertion to the
  picker page's direct, visible `Log out` action, which invokes the same hook.
- 2026-08-08: The direct sign-out path exposed an application bug: `useLogout`
  invalidated session queries before navigation, re-rendering the protected pick
  component without a user and causing a render-time redirect/throw. Removed the
  unnecessary invalidation so the successful auth sign-out navigates directly.
- 2026-08-08: Session redirect/sign-out coverage passed (`6 passed`). Seeded an
  admin Week 1 card for the in-progress league and began message-board coverage;
  icon-only delete controls now expose the author in their accessible name.
- 2026-08-08: The first message-board run exposed a sheet lifecycle bug: its
  content returned `null` while duplicate client queries loaded, leaving an open
  modal with no dialog. Kept `SheetContent` mounted with a loading state so it
  can reliably hydrate into the board.
- 2026-08-08: Visual failure evidence confirmed the loaded board was present;
  Chromium does not expose this Radix sheet title with a heading role. Scoped
  that assertion to exact visible title text and retained semantic locators for
  the composer and message actions.
- 2026-08-08: The exact title assertion then exposed two simultaneous dialogs:
  desktop and mobile sheets were both mounted against one `chatSheetOpen` state.
  Split their open state so only the triggered viewport-specific sheet mounts.
- 2026-08-08: Message posting, member deletion, and admin deletion passed with
  exact database counts (`7 passed`). Began league-admin mutation and denial
  coverage; labeled the name, paid-status, action, and role controls.
- 2026-08-08: Admin mutations reached PostgreSQL on the first run. The browser
  guard caught generated form IDs changing across the rename hard reload; the
  IDs were attached to a non-labelable wrapper despite the new stable input ID.
  Removed that generated wrapper/description wiring and scoped the footer Close.
- 2026-08-08: The stabilized run visually and directly confirmed the promoted
  role, but the combined rename/paid/two-role-change/denial workflow exhausted
  the default 30-second test budget. Assigned this one long journey 60 seconds.
- 2026-08-08: With the larger budget, accessibility state revealed the member
  dropdown stayed open behind the edit dialog, leaving the table aria-hidden
  after the dialog closed. Made the menu controlled: Edit Player now closes the
  menu and explicitly opens the dialog.
- 2026-08-08: The controlled-state run revealed the dialog itself was nested
  inside `DropdownMenuContent`; closing the menu therefore detached the role
  form. Moved `DialogContent` beside the menu under their shared Dialog root.
- 2026-08-08: All admin UI/database assertions then passed; browser navigation
  to the intentional non-admin 404 produced the expected resource console error.
  Moved that denial check to the authenticated browser context's HTTP client so
  it asserts status 404 without weakening the global console-error guard.
- 2026-08-08: Fresh-stack eight-test baseline passed (`8 passed`). Added a
  path-filtered GitHub Actions job that installs Node 22, Bun, pnpm, Supabase,
  and Chromium; runs the same guarded local-stack command; and uploads browser
  artifacts plus the Next.js log on every outcome. Documented the canonical and
  fast local runbooks and the required test-governance rule.
- 2026-08-08: The first role/responsive expansion correctly failed because its
  not-started assertion reused a league mutated by the earlier apply-to-all
  picks test. Added a dedicated waiting-league fixture and ordinary member so
  the state is independent of test order. The fresh-stack suite passed (`9
passed`) with global-admin allow, ordinary-user deny, non-member deny, and a
  mobile-viewport render.
- 2026-08-08: The profile/Super Bowl test first failed because the edit dialog's
  visual labels were not programmatically associated with its Radix selects.
  Added accessible trigger names and explicit score input association; the full
  suite passed with the prediction updated and verified in PostgreSQL (`10
passed`).
- 2026-08-08: Browser league creation, exact policy persistence, creator admin
  membership, and the duplicate-registration screen passed with the complete
  regression suite (`11 passed`). Began the linked-renewal and isolated invite
  workflow.
- 2026-08-08: The first renewal run showed disabled email delivery is counted as
  a skipped invite and also revealed another cross-test fixture dependency.
  Corrected the no-send assertion and assigned the original completed-admin
  render regression its own immutable league. The full lifecycle and regression
  suite passed together (`12 passed`).
- 2026-08-08: The pick-integrity test first exposed duplicate radio IDs and
  unnamed team controls, then exposed a confidentiality bug where submitting any
  pick revealed opponents' future selections. Added unique accessible controls
  and changed the server summary to reveal each opponent pick only after that
  individual game starts. Missing/invalid tiebreakers, the started-game lock,
  database persistence, and both visibility states passed in the full suite
  (`13 passed`).
- 2026-08-08: The completed-results fixture initially used a Boolean for the
  legacy integer `picks.done` flag; the guarded seed failed before the browser
  started. Corrected the fixture, scoped a duplicated winner-link assertion to
  its alert, and passed weekly co-winners, tied rank `1`, chart rendering, and
  profile totals in the full suite (`14 passed`).
- 2026-08-08: The first Super Bowl privacy run reused a prediction updated by
  the earlier profile journey. Replaced the order-sensitive exact value with
  direct redaction assertions. Own preseason data, three-field opponent
  redaction, and in-progress opponent visibility passed in the full suite (`15
passed`).
- 2026-08-08: Added the commissioner workflow for pre-kickoff edits,
  post-kickoff rejection, email history, broadcast throttling, and member
  removal. The browser guard exposed a missing accessible title in the nested
  confirmation dialog; fixed it and added an explicit per-test allowance for
  the expected rejected mutation. A fresh-stack run passed (`16 passed`).
- 2026-08-08: Began the remaining account-settings coverage with client-side
  username validation, server uniqueness handling, a successful update, and a
  direct PostgreSQL assertion.
- 2026-08-08: The first account-settings run exposed that the form configured
  only `reValidateMode`, so its validation message and disabled state did not
  appear until after a submit attempt. Enabled on-change validation to match the
  intended interaction; the complete suite is the acceptance gate.
- 2026-08-08: The next settings run reached the uniqueness conflict and showed
  the expected toast, while the global guard caught the rejected `mutateAsync`
  promise escaping the form handler as a page error. Contained that rejection;
  the mutation's existing error callback remains the single presentation path.
- 2026-08-08: Account validation, uniqueness rejection, successful update, and
  database persistence passed in the complete suite (`17 passed`). The route
  audit then found `playerProfile.get` accepted membership in any league rather
  than the requested league. Corrected the comparison and added a direct tRPC
  denial check that cannot be masked by the containing page's league guard.
- 2026-08-08: Cross-league profile access now fails closed and the complete
  suite passed (`17 passed`). Expanded the same deterministic started game to
  exercise the PRD's super-admin correction override after the ordinary league
  admin rejection.
- 2026-08-08: The first override run exposed a policy mismatch: the tRPC admin
  procedure allowed the designated super admin, while the route layout returned
  404 unless that user also held a league membership. Aligned the layout with
  the API override and increased the timeout for this three-session workflow.
- 2026-08-08: The super-admin override then passed, and the full-suite gate
  caught that its new pick changed the later privacy test's precondition. Added
  a dedicated override league so correction and visibility fixtures are fully
  independent of execution order.
- 2026-08-08: The isolated override and all existing integrity paths passed
  together (`17 passed`). Added a dedicated completed postseason fixture for
  final-bracket rendering and Super Bowl contest ranking without changing any
  preseason/in-progress visibility preconditions.
- 2026-08-08: Completed postseason matchup, final score, contest winner,
  ranking, and losing-prediction coverage passed with the full suite (`18
passed`). All planned web PRD coverage paths are now checked.
- 2026-08-08: Final verification passed after formatting: web and API
  typechecks, shell syntax, Playwright discovery (`18 tests in 18 files`),
  whitespace validation, and a final fresh local-Supabase run (`18 passed`).
- 2026-08-08: Audited the GitHub Actions path against current official
  Supabase, Playwright, and GitHub-hosted runner guidance. Upgraded to the
  Supabase setup action v2, pinned the CLI and Ubuntu image, explicitly installed
  runner prerequisites, separated backend bootstrap from browser execution,
  added PR/merge-queue/main triggers, captured diagnostics, and added ephemeral
  teardown. The `chromium-e2e` job is the required CI signal; repository branch
  protection must require it to block merges.
- 2026-08-08: Executed the workflow's exact split locally with `CI=true`:
  backend startup/reset/migrations/seed verification passed, the second stage
  recreated web fixtures and passed all 18 browser tests, and `supabase stop
--no-backup` removed the temporary stack. A read-only GitHub API audit found
  no ruleset and confirmed `main` is currently unprotected; requiring the new
  check remains an external repository-setting step after the workflow is
  pushed and produces its first check run.
- 2026-08-08: The first GitHub-hosted run passed tool setup and the complete
  Supabase bootstrap, then failed readiness because Resend validates its API key
  during module import before the E2E no-send guard runs. Added a fake E2E-only
  key to the isolated Next.js process; outbound email remains disabled and no
  repository secret is required.
- 2026-08-08: The second hosted run cleared readiness and exercised the complete
  suite: 15 passed, the results journey recovered on retry, and two failed.
  Hosted timing exposed a cross-session race in the combined admin workflow and
  retries exposed a non-unique league-creation fixture. Split the role changes
  into isolated tests, made retry-created leagues unique, and assigned explicit
  cold-compilation budgets to the affected journeys.
- 2026-08-08: The isolated 21-test suite passed locally on a fresh Supabase
  reset in 2.7 minutes after the hosted reliability fixes. This run re-proved
  startup, all three migrations, deterministic seed verification, role-isolated
  browser contexts, retry-safe fixture naming, persistence assertions, and all
  previously covered journeys.
- 2026-08-08: The third GitHub-hosted run completed 19 tests and isolated two
  admin failures. Artifacts showed every cached request retrying a nonexistent
  Redis service, which is intentionally outside this self-contained test stack.
  E2E mode now bypasses cache I/O entirely, login waits for the Supabase auth
  cookie before protected navigation, and the removal check polls PostgreSQL
  until the mutation commits. These changes keep the suite independent of Redis
  and make the affected workflows safe under Playwright retries.
- 2026-08-08: A deliberately Redis-less local run then cleanly isolated the
  remaining super-admin failure. The protected admin route allowed the global
  override, but its shared league layout also called `league.nextLeague`, which
  still required ordinary membership and failed the whole React server render.
  Aligned that query with the existing super-admin policy; the browser test
  continues to require an error-free render and a persisted post-kickoff pick.
- 2026-08-08: The final Redis-less local gate passed all 21 tests on the first
  attempt in 2.7 minutes. This revalidated the entire coverage matrix after the
  cache isolation and authorization fix, including both previously failing
  admin workflows, with `REDIS_URL` deliberately pointed at a dead local port.
- 2026-08-08: The fourth hosted run proved the Redis and super-admin fixes, then
  finished with 18 passed, two flaky recoveries, and one renewal failure. The
  Next.js log showed successful create mutations followed by first-time route
  compilations of 12.9-13.9 seconds; completed navigations landed 0.6 seconds
  beyond the 15-second assertion budget. Added CI-specific cold-run budgets and
  made renewal retries restore their own isolated database precondition before
  exercising the browser creation flow again.
- 2026-08-08: The resulting exact-CI-mode local gate passed 21/21 on the first
  attempt in 2.7 minutes against another fresh Supabase reset, with Redis still
  unreachable. Session, browser league creation, and linked renewal all passed
  without retries before the rest of the regression matrix completed cleanly.
