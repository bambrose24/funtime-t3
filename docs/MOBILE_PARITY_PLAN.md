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
| Auth/session | `apps/web/src/app/(auth)/*`, user provider | `session`, `auth` | `IN_PROGRESS` | Session guard + grouped route migration complete; deep-link QA still pending. |
| Home/nav leagues | `apps/web/src/app/page.tsx`, `_nav` | `home.nav`, `home.summary` | `IN_PROGRESS` | Active/prior sections plus join/create entry points are implemented; IA parity polish pending. |
| Join league | `apps/web/src/app/join-league/[code]/*` | `league.fromJoinCode`, `league.register` | `IN_PROGRESS` | Join-by-code flow implemented with required Super Bowl pick support; UX parity QA pending. |
| Create league | `apps/web/src/app/league/create/*` | `league.create`, `league.createForm`, `league.canCreate` | `IN_PROGRESS` | Core create flow and policy controls implemented; form/UX parity polish pending. |
| Deep links + shared URLs | web route system + invite/share URLs | N/A (domain association + client routing) | `IN_PROGRESS` | App-link config and association endpoints implemented; production app IDs/fingerprints + device QA pending. |
| League week view | `apps/web/src/app/league/[leagueId]/page.tsx` | `league.picksSummary`, `games.getGames`, `league.weekWinners`, `picks.weeksWithPicks` | `IN_PROGRESS` | Core mobile view exists; pick-visibility behavior is API-enforced and tiebreaker-sort parity fix shipped. |
| Pick submission | `apps/web/src/app/league/[leagueId]/pick/*` | `league.weekToPick`, `member.picksForWeek`, `picks.submitPicks` | `IN_PROGRESS` | Core P1 feature. |
| Leaderboard | `apps/web/src/app/league/[leagueId]/leaderboard/*` | `leaderboard.league` | `IN_PROGRESS` | Mobile rank display now uses numeric competition ranks (`1,2,2,4`); broader UX parity QA pending. |
| Player profile | `apps/web/src/app/league/[leagueId]/player/[memberId]/*` | `playerProfile.get`, `member.updateOrCreateSuperbowlPick` | `IN_PROGRESS` | Member profile route and leaderboard navigation implemented in mobile; parity polish and edit interactions pending. |
| My profile | `apps/web/src/app/league/[leagueId]/my-profile/page.tsx` | `playerProfile.get` | `IN_PROGRESS` | League-level `My Profile` tab implemented; parity polish and edit interactions pending. |
| Super Bowl picks | `apps/web/src/app/league/[leagueId]/superbowl/*` | `league.superbowlPicks`, `postseason.getBracket`, `teams.getTeams` | `IN_PROGRESS` | Mobile Super Bowl tab + pick management flow shipped; parity polish and postseason bracket integration pending. |
| Settings/profile | `apps/web/src/app/settings/*` | `settings.get`, `settings.updateUsername` | `IN_PROGRESS` | Username update flow is shipped on mobile account screen; notifications/preferences parity still pending. |
| Notifications foundation | mobile bootstrap + account settings | `settings.registerPushToken`, `settings.setPushNotificationsEnabled`, `settings.pushNotificationStatus` | `IN_PROGRESS` | Token registration/preferences shipped with soft-fallback table checks; delivery behavior needs staging QA. |
| Messaging (persistent target) | current web messages + future redesign | `messages.*` | `DONE` | Mobile and web clients are on league-wide message endpoints; cleanup of legacy aliases is a follow-up refactor. |
| Admin members | `apps/web/src/app/league/[leagueId]/admin/members/*` | `league.admin.members`, `removeMember`, `changeMemberRole`, `setMembersPaid` | `IN_PROGRESS` | Mobile admin member management screen shipped; parity polish and additional admin workflows remain. |
| Admin pick edits | `MemberPicksEdit` | `league.admin.memberPicks`, `league.admin.setPick` | `IN_PROGRESS` | Mobile pick editor shipped; API kickoff lock + super-admin override implemented; parity polish and QA pending. |
| Admin broadcast/name | `LeagueAdminBroadcastSetting`, `LeagueAdminChangeNameSetting` | `league.admin.sendBroadcast`, `canSendLeagueBroadcast`, `changeName` | `IN_PROGRESS` | Mobile controls shipped; parity QA and UX polish pending. |
| Admin email logs | `MemberEmailLogs` | `league.admin.memberEmails` | `IN_PROGRESS` | Mobile email-log list + preview shipped; parity QA and content rendering validation pending. |
| Global admin | `apps/web/src/app/admin/page.tsx` | `generalAdmin.*` | `IN_PROGRESS` | Mobile super-admin dashboard route and account entry point shipped; metric/detail parity polish pending. |

## 6. Backend Dependencies for Mobile Parity
1. Message system redesign:
  - done: remove week-scoped message requirement across mobile/web clients
  - done: admin-delete authorization behavior
  - follow-up: remove legacy week-scoped alias endpoints after stability window
2. Notification pipeline:
  - done: mobile Expo push token registration + account preference foundation (`settings.registerPushToken`, `settings.setPushNotificationsEnabled`, `settings.pushNotificationStatus`)
  - done: near real-time message push fanout on `messages.writeMessage`/`writeWeekMessage` plus notification-tap path routing in mobile
  - done: week summary scheduler in cron with personal result pushes + overall league summary emails
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

## 9. Worklog Governance
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
  - Validation run
  - Timestamp (UTC)
- `Worklog Gate Check` before phase transitions:
  1. `In Progress` is empty or deferred with reason.
  2. `Parity Matrix Snapshot` is updated.
  3. Validation evidence is recorded.
  4. Open risks are explicitly listed.
