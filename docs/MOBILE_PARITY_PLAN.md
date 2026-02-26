# Mobile Parity Plan (Web -> Mobile)

## 1. Purpose
This document tracks feature parity work from the web app to the mobile companion.

Guiding rule:
- End-state is full feature parity.
- Delivery order is player core loop first, then admin tooling.
- `WORKLOG.md` is the mandatory implementation companion and source of execution truth.

## 2. Status Legend
- `DONE`: shipped in mobile with acceptable parity.
- `IN_PROGRESS`: actively being built.
- `PLANNED`: approved and sequenced, not started.
- `BLOCKED`: blocked by backend/product/UX dependencies.

## 3. Product Constraints (Current Decisions)
- Pick visibility:
  - No weekly picks submitted -> cannot view others' picks.
  - Weekly picks submitted -> can view others for started games.
- Super Bowl pick is required at join time when enabled for the league.
- Messaging target:
  - Persistent league board (no week partitioning).
  - League admins can delete any message in their league.
- Notifications:
  - Pick reminders
  - Week summary push (personal result only, deep-link to week page)
  - Week summary email (overall league state)
  - Near real-time league message notifications
- Deep-link behavior:
  - `https://play-funtime.com/*` links should open the installed mobile app to the matching route when possible.
  - If the app is not installed, links must continue to work in web as normal.
  - Shared URLs must resolve consistently across web and mobile.
- Leaderboard ranking must support competition ties (example: `1, 2, 2, 4`).
- Workspace dependency consistency:
  - Keep a single monorepo `@types/react` strategy across web/mobile to avoid cross-app type collisions.
  - Expo mobile advisories about `@types/react` are informational unless workspace typechecks fail.
- Mobile UX quality bar:
  - In-screen context switches (tabs/filters/segments) should prefer local state swaps over route-level remount navigation.
  - Interactions should feel immediate (subtle transitions, stable headers, preserved context, no avoidable full-screen flashes).
  - Each parity task should include a brief UX critique pass and ship at least one concrete polish improvement where reasonable.
- Mobile testing quality bar:
  - Follow `docs/TESTING_STRATEGY.md` as the canonical test strategy for mobile flow coverage and tooling choices.
  - Any behavior change to a flow/screen requires test updates in the same PR (or an explicitly logged/scheduled exception).

## 4. Phase Plan

### Phase 0: Foundation + Worklog Governance
0. `0.0` Initialize and baseline `WORKLOG.md` at repo root.
1. Refactor route/layout architecture (`(auth)`, `(tabs)`, bootstrap shell).
2. Standardize provider/bootstrap sequence and auth gating.
3. Standardize loading state and shared card/skeleton conventions.
4. Establish prefetch and offline policy conventions.
5. Implement deep-link infrastructure:
  - Expo linking configuration (`scheme`, prefixes, route patterns)
  - iOS Universal Links (`apple-app-site-association`)
  - Android App Links (`.well-known/assetlinks.json`)
  - Runtime URL parsing + guarded navigation for auth-required routes
6. Stabilize mobile runtime/toolchain compatibility:
  - keep Expo SDK package set aligned with bundled native modules
  - keep Babel config compatible with NativeWind + Reanimated without implicit `react-native-worklets/plugin` requirement
  - preserve monorepo React type compatibility while upgrading Expo-facing dependencies
  - harden auth bootstrap recovery for stale/invalid refresh tokens
  - require cache-cleared on-device smoke validation after dependency/plugin changes
  - completed gate (`P0-MOBILE-FOUNDATION-QA-005`): invalid-refresh-token fail-closed handling is implemented in auth bootstrap + tRPC header session lookup, and latest on-device smoke reported stable startup with no push `projectId` runtime error after env fallback setup
  - active execution focus: `P5-PARITY-QA-001` (end-to-end parity QA and highest-severity regression cleanup)
  - current execution slice: testing expansion (`P6-TEST-E2E-001`, `P6-TEST-COVERAGE-002`, `P6-TEST-GOVERNANCE-001`) -> device-gated QA (`P0-DEEPLINK-QA-001`, `P2-NOTIFY-QA-001`) -> `P0-PRISMA-002` (migration status/deploy validation); targeted in-app UX sweep (`P5-UX-SWEEP-001`) is now closed
7. Establish mobile testing foundation and governance:
  - adopt Expo-aligned unit/integration/E2E strategy from `docs/TESTING_STRATEGY.md`
  - baseline Jest + `jest-expo` + RNTL foundation is now shipped (`P6-TEST-FOUNDATION-001`) with initial auth/picks/leaderboard coverage
  - enforce "flow change -> test change" policy in worklog/plan updates and PR execution

### Phase 1: Core Player Loop
1. Auth and session
2. Home/leagues list
3. Join league by code
4. Create league
5. Weekly pick flow
6. League week page (standings + game cards)
7. Season leaderboard
8. Player profile/my profile
9. Super Bowl pick flow
10. Basic settings/profile updates

### Phase 2: Engagement + Messaging
1. Persistent league message board
2. Message creation/deletion (author + admin delete permissions)
3. Message notification plumbing
4. Week summary deep-link and result context UX

### Phase 3: Admin + Ops Parity
1. Member management
2. Role management
3. Pick editing with kickoff restrictions
4. Super-admin override workflows
5. League rename/broadcast
6. Email logs and paid tracking

## 5. Feature Mapping
| Area | Web Source | Backend Domain | Mobile Status | Notes |
|---|---|---|---|---|
| Auth/session | `apps/web/src/app/(auth)/*`, user provider | `session`, `auth` | `IN_PROGRESS` | Session guard + grouped route migration complete; stale-refresh-token fail-closed recovery is implemented in startup bootstrap + tRPC headers, and latest on-device smoke reported stable startup. Deep-link replay regression from repeated initial URL handling is fixed; remaining follow-up is broader parity QA + deep-link device validation. |
| Home/nav leagues | `apps/web/src/app/page.tsx`, `_nav` | `home.nav`, `home.summary` | `IN_PROGRESS` | Active/prior sections plus join/create entry points are implemented; pull-to-refresh/haptics and server-aggregated home-card viewer stats are shipped, and mobile now adds compact active/prior/season summary metrics, collapsible prior-league history controls, and denser card metadata (season, member count, accuracy) for faster scanability, with broader IA parity QA still pending. |
| Join league | `apps/web/src/app/join-league/[code]/*` | `league.fromJoinCode`, `league.register` | `IN_PROGRESS` | Join-by-code flow implemented with required Super Bowl pick support and persistent header back navigation; mobile Super Bowl registration now uses compact tap-to-open AFC/NFC selectors with inline score validation and completion-aware CTA copy, while broader UX parity QA remains pending. |
| Create league | `apps/web/src/app/league/create/*` | `league.create`, `league.createForm`, `league.canCreate` | `IN_PROGRESS` | Core create flow and policy controls implemented with persistent header back navigation; mobile now uses a collapsed prior-league picker, inline league-name validation with completion-aware CTA state, and clearer policy guidance copy, with broader form/UX parity polish still pending. |
| Deep links + shared URLs | web route system + invite/share URLs | N/A (domain association + client routing) | `IN_PROGRESS` | App-link config and association endpoints are implemented, and mobile now handles launch deep links once per app boot (no stale replay on route/session changes); production app IDs/fingerprints + device QA remain pending. |
| League week view | `apps/web/src/app/league/[leagueId]/page.tsx` | `league.picksSummary`, `games.getGames`, `league.weekWinners`, `picks.weeksWithPicks` | `IN_PROGRESS` | Core mobile view exists; tab switching now happens in-screen (no route remount), tab chrome is now lean compact text + underline (no heavy pills), league-tab loading now uses shared skeleton styling, pick-visibility behavior is API-enforced, tiebreaker-sort parity fix shipped, and overview now adds week snapshot context (open/locked counts, personal + league submission progress, refresh recency), completion-aware pick CTA state/copy, compact game-state counters, a clearer picks table (tie-aware rank column, zebra rows, state legend, explicit pending/missed/correct/wrong cells), and a richer pick-summary modal (outcome rollups, kickoff context, explicit selected-team labels, and one-tap "Edit Open Picks" navigation). |
| Pick submission | `apps/web/src/app/league/[leagueId]/pick/*` | `league.weekToPick`, `member.picksForWeek`, `picks.submitPicks` | `IN_PROGRESS` | Core flow shipped; tab-level pick entry supports in-screen multi-league switching, and mobile now adds open/locked pick-progress summary, completion-aware submit/randomize CTA copy, locked tiebreaker guidance, and per-game open/locked status pills, with broader QA/parity validation still pending. |
| Leaderboard | `apps/web/src/app/league/[leagueId]/leaderboard/*` | `leaderboard.league` | `IN_PROGRESS` | Mobile rank display now uses numeric competition ranks (`1,2,2,4`), shared league-tab skeleton loading, blue row/name current-user highlighting (without inline `You` badge), pull-to-refresh + retry affordances, compact standing-summary metrics, and improved row scanability with subtle zebra/press states; broader end-to-end QA remains pending. |
| Player profile | `apps/web/src/app/league/[leagueId]/player/[memberId]/*` | `playerProfile.get`, `member.updateOrCreateSuperbowlPick` | `IN_PROGRESS` | Member profile route now includes persistent header-level back navigation, pull-to-refresh, denser summary readability (accuracy + week-win chips), and clearer logo-backed Super Bowl rows; remaining polish is minor. |
| My profile | `apps/web/src/app/league/[leagueId]/my-profile/page.tsx` | `playerProfile.get` | `IN_PROGRESS` | League-level `My Profile` tab now includes pull-to-refresh, denser summary readability (accuracy + week-win chips), and in-place pre-season Super Bowl edit interactions (winner/loser/score with explicit save/cancel and season lock), with broader parity polish still pending. |
| Super Bowl picks | `apps/web/src/app/league/[leagueId]/superbowl/*` | `league.superbowlPicks`, `postseason.getBracket`, `teams.getTeams` | `IN_PROGRESS` | Mobile Super Bowl tab now uses a compact pre-season form card (`Your Super Bowl pick`: winner/loser/score with explicit save), becomes read-only after season start, renders a denser member/winner/loser/score board, and now includes postseason snapshot context plus conference-filtered picker controls; remaining work is primarily end-to-end QA and deeper postseason-link parity checks. |
| Settings/profile | `apps/web/src/app/settings/*` | `settings.get`, `settings.updateUsername` | `IN_PROGRESS` | Mobile account settings now use a cleaner compact "My Account" IA (reduced card chrome, denser row groups, inline username edit controls, safer sign-out confirmation), and notifications now include explicit status state, token/preference chips, guidance copy, inline switch controls, refresh status action, and last-sync context; broader delivery QA parity remains pending. |
| Notifications foundation | mobile bootstrap + account settings | `settings.registerPushToken`, `settings.setPushNotificationsEnabled`, `settings.pushNotificationStatus` | `IN_PROGRESS` | Token registration/preferences shipped with soft-fallback table checks and graceful missing-`projectId` handling (`EXPO_PUBLIC_EAS_PROJECT_ID` fallback); account settings now surface push registration vs preference state more clearly, notification-tap routing de-duplicates/clears stale last responses, and delivery behavior still needs staging QA. |
| Messaging (persistent target) | current web messages + future redesign | `messages.*` | `DONE` | Mobile and web clients are on league-wide message endpoints; mobile now uses virtualized + incremental message rendering, explicit sync metadata with pull-to-refresh, history-safe auto-scroll behavior, and quick "new messages/jump to latest" affordances for long-thread responsiveness, while cleanup of legacy aliases remains a follow-up refactor. |
| Admin members | `apps/web/src/app/league/[leagueId]/admin/members/*` | `league.admin.members`, `removeMember`, `changeMemberRole`, `setMembersPaid` | `IN_PROGRESS` | Mobile admin member management now uses a compact actionable table with per-member edit bottom sheet and header back navigation; member-sheet nested actions now close before routing (avoiding stale overlay return), role/paid/remove updates explicitly refetch members post-mutation for reliable table state, and API guardrails now block non-super-admin self-demotion/self-removal direct calls; broader parity workflow QA is substantially closed with residual full-app QA still pending. |
| Admin pick edits | `MemberPicksEdit` | `league.admin.memberPicks`, `league.admin.setPick` | `IN_PROGRESS` | Mobile pick editor shipped with pull-to-refresh UX and persistent header back navigation; API kickoff lock + super-admin override implemented, `setPick` now preserves existing tiebreaker score unless an explicit score update is submitted, and mobile UI now surfaces per-game kickoff lock/override state with new editor snapshot/lock-live-final context cues while disabling non-super-admin post-kickoff edits; remaining work is end-to-end QA. |
| Admin broadcast/name | `LeagueAdminBroadcastSetting`, `LeagueAdminChangeNameSetting` | `league.admin.sendBroadcast`, `canSendLeagueBroadcast`, `changeName` | `IN_PROGRESS` | Mobile controls shipped and now include clearer operation context (admin snapshot), league-name validity/dirty-state guidance, and broadcast character guidance; remaining work is parity QA validation. |
| Admin email logs | `MemberEmailLogs` | `league.admin.memberEmails` | `IN_PROGRESS` | Mobile/web email logs now render resilient send dates via `resend_data.created_at ?? sent_at` and enforce newest-first ordering; mobile additionally uses a compact row/table list with persistent header back navigation, compact `M/D/YY h:mma` row dates, HTML-or-text preview fallback, and explicit unavailable-preview messaging when provider content is missing. |
| Global admin | `apps/web/src/app/admin/page.tsx` | `generalAdmin.*` | `IN_PROGRESS` | Mobile super-admin dashboard route and account entry point shipped; header-level back navigation plus dense KPI/table-style metric sections (including picks-by-season and season league rows) are in place with pull-to-refresh, and dashboard now includes system snapshot + refresh-recency cues; remaining work is end-to-end parity QA validation. |

## 6. Backend Dependencies for Mobile Parity
1. Message system redesign:
  - done: remove week-scoped message requirement across mobile/web clients
  - done: admin-delete authorization behavior
  - follow-up: remove legacy week-scoped alias endpoints after stability window
2. Notification pipeline:
  - done: mobile Expo push token registration + account preference foundation (`settings.registerPushToken`, `settings.setPushNotificationsEnabled`, `settings.pushNotificationStatus`)
  - done: near real-time message push fanout on `messages.writeMessage`/`writeWeekMessage` plus notification-tap path routing in mobile
  - done: week summary scheduler in cron with personal result pushes + overall league summary emails
  - runtime config dependency: Expo token registration requires an EAS `projectId` at runtime; in local/dev where manifest metadata is missing, provide `EXPO_PUBLIC_EAS_PROJECT_ID`
  - dependency: deploy `pushNotificationTokens` database table before enabling production push sends
  - follow-up: validate timezone/timing semantics for "morning after completion" behavior in staging
3. Admin pick edit guardrails:
  - done: kickoff lock enforced at API layer for league admins
  - done: super-admin override preserved (`bambrose24@gmail.com`)
  - done: super-admin access aligned for `league.get`, `league.weekToPick`, and broadcast permission checks used by mobile admin flows
4. Deep-link domain files and app ownership:
  - host `apple-app-site-association` for iOS Universal Links
  - host `/.well-known/assetlinks.json` for Android App Links
  - ensure bundle IDs/package names and signing fingerprints are current in production
  - configure runtime values:
    - iOS: `IOS_DEEPLINK_APP_IDS` (comma-separated `TEAM_ID.BUNDLE_ID`)
    - Android: either `ANDROID_DEEPLINK_TARGETS_JSON` or `ANDROID_DEEPLINK_PACKAGE_NAME` + `ANDROID_DEEPLINK_SHA256_CERT_FINGERPRINTS`
5. Prisma migration rollout:
  - migration workflow scripts are available in `packages/api/package.json` (`db:migrate:dev`, `db:migrate:create`, `db:migrate:deploy`, `db:migrate:status`, `db:migrate:resolve`)
  - baseline migration for existing schema: `packages/api/prisma/migrations/20260225000000_baseline/migration.sql`
  - incremental migration for notification tokens: `packages/api/prisma/migrations/20260225041054_add_push_notification_tokens/migration.sql`
  - deploy environments should use `prisma migrate deploy` (not `db push`) for deterministic schema changes

## 7. Deep-Link Routing Spec
| Shared URL | Mobile Target Route | Auth Requirement | Fallback |
|---|---|---|---|
| `https://play-funtime.com/join-league/:code` | `/join-league/:code` | user must be authenticated to complete join | web join page |
| `https://play-funtime.com/league/:leagueId` | `/league/:leagueId` | authenticated + league membership | web league page |
| `https://play-funtime.com/league/:leagueId?tab=picks` | `/league/:leagueId?tab=picks` | authenticated + league membership | web league picks tab |
| `https://play-funtime.com/league/:leagueId?tab=leaderboard` | `/league/:leagueId?tab=leaderboard` | authenticated + league membership | web league leaderboard tab |
| `https://play-funtime.com/settings` | `/account` (or future mobile settings route) | authenticated | web settings page |
| `https://play-funtime.com/admin` | `/admin` | authenticated + super-admin | web admin page |
| `https://play-funtime.com/auth/callback?...` | `/auth/callback?...` | public callback route | web auth callback |

## 8. Update Process
When parity work changes:
1. Update `Mobile Status` for affected rows.
2. Add short notes for behavior differences.
3. If backend changes are required, add/update `Backend Dependencies`.
4. Keep this file aligned with `docs/PRD.md` decisions.
5. Update `WORKLOG.md` for task start/status/commit/decision/validation events.
6. Include a UX quality note for touched screens (what felt off, what was improved, what remains).
7. Include a test-impact note for touched flows/screens (tests updated, or explicit deferred follow-up ticket).

## 9. Testing Governance
- Canonical mobile testing policy lives in `docs/TESTING_STRATEGY.md`.
- Current baseline status: `P6-TEST-FOUNDATION-001` is complete (test harness + initial flow coverage); next testing slice is E2E + additional flow coverage + CI governance enforcement.
- Required rule: any behavior change to user-visible flow/screen must include test updates in the same PR whenever feasible.
- Allowed exception path:
  1. Document reason for deferral in `WORKLOG.md`.
  2. Add a dated follow-up testing ticket to `In Progress` or `Next Up`.
  3. Keep parity/task status as `IN_PROGRESS` until the coverage gap is closed.
- Minimum required automation trajectory:
  1. Jest + `jest-expo` + React Native Testing Library coverage for critical flows.
  2. Expo Router route-behavior tests for navigation/deep-link semantics.
  3. Maestro critical-flow smoke coverage executed in EAS workflows.

## 10. Worklog Governance
- Canonical execution log: `WORKLOG.md` in repo root.
- Required sections:
  - Program Status
  - Current Phase
  - Completed Tasks
  - In Progress
  - Next Up
  - Decisions & Rationale
  - Risks / Blockers
  - Validation Evidence
  - Parity Matrix Snapshot
- Task entries must include:
  - Task ID
  - Short title
  - Scope touched
  - Outcome
  - Test impact (tests added/updated, or deferred with linked follow-up ticket)
  - Validation run
  - Timestamp (UTC)
- `Worklog Gate Check` before phase transitions:
  1. `In Progress` is empty or deferred with reason.
  2. `Parity Matrix Snapshot` is updated.
  3. Validation evidence is recorded.
  4. Open risks are explicitly listed.
