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
- Leaderboard ranking must support competition ties (example: `1, 2, 2, 4`).

## 4. Phase Plan

### Phase 0: Foundation + Worklog Governance
0. `0.0` Initialize and baseline `WORKLOG.md` at repo root.
1. Refactor route/layout architecture (`(auth)`, `(tabs)`, bootstrap shell).
2. Standardize provider/bootstrap sequence and auth gating.
3. Standardize loading state and shared card/skeleton conventions.
4. Establish prefetch and offline policy conventions.

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
| Auth/session | `apps/web/src/app/(auth)/*`, user provider | `session`, `auth` | `PLANNED` | Must match Supabase token flow used in RN context. |
| Home/nav leagues | `apps/web/src/app/page.tsx`, `_nav` | `home.nav`, `home.summary` | `PLANNED` | Include active/prior league grouping. |
| Join league | `apps/web/src/app/join-league/[code]/*` | `league.fromJoinCode`, `league.register` | `PLANNED` | Must enforce required Super Bowl pick if enabled. |
| Create league | `apps/web/src/app/league/create/*` | `league.create`, `league.createForm`, `league.canCreate` | `PLANNED` | Keep league policy options visible. |
| League week view | `apps/web/src/app/league/[leagueId]/page.tsx` | `league.picksSummary`, `games.getGames`, `league.weekWinners`, `picks.weeksWithPicks` | `PLANNED` | Must preserve pick-visibility policy. |
| Pick submission | `apps/web/src/app/league/[leagueId]/pick/*` | `league.weekToPick`, `member.picksForWeek`, `picks.submitPicks` | `IN_PROGRESS` | Core P1 feature. |
| Leaderboard | `apps/web/src/app/league/[leagueId]/leaderboard/*` | `leaderboard.league` | `PLANNED` | Include competition-rank ties. |
| Player profile | `apps/web/src/app/league/[leagueId]/player/[memberId]/*` | `playerProfile.get`, `member.updateOrCreateSuperbowlPick` | `PLANNED` | Show pick record + Super Bowl data. |
| My profile | `apps/web/src/app/league/[leagueId]/my-profile/page.tsx` | `playerProfile.get` | `PLANNED` | Same profile model as player profile. |
| Super Bowl picks | `apps/web/src/app/league/[leagueId]/superbowl/*` | `league.superbowlPicks`, `postseason.getBracket`, `teams.getTeams` | `PLANNED` | Required for leagues that enable competition. |
| Settings/profile | `apps/web/src/app/settings/*` | `settings.get`, `settings.updateUsername` | `PLANNED` | Username conflict UX needed. |
| Messaging (persistent target) | current web messages + future redesign | `messages.*` (to be redesigned) | `BLOCKED` | Blocked until backend migrates off week-scoped model. |
| Admin members | `apps/web/src/app/league/[leagueId]/admin/members/*` | `league.admin.members`, `removeMember`, `changeMemberRole`, `setMembersPaid` | `PLANNED` | Phase 3. |
| Admin pick edits | `MemberPicksEdit` | `league.admin.memberPicks`, `league.admin.setPick` | `PLANNED` | Enforce no-edit-after-kickoff except super admin. |
| Admin broadcast/name | `LeagueAdminBroadcastSetting`, `LeagueAdminChangeNameSetting` | `league.admin.sendBroadcast`, `canSendLeagueBroadcast`, `changeName` | `PLANNED` | Respect weekly send limits. |
| Admin email logs | `MemberEmailLogs` | `league.admin.memberEmails` | `PLANNED` | Phase 3. |
| Global admin | `apps/web/src/app/admin/page.tsx` | `generalAdmin.*` | `PLANNED` | Optional mobile scope; likely web-only first. |

## 6. Backend Dependencies for Mobile Parity
1. Message system redesign:
  - remove week-scoped message requirement
  - add admin-delete authorization behavior
2. Notification pipeline:
  - week summary push payload + deep-link target
  - week summary email template + data aggregation
  - "morning after completion" scheduler/trigger rules
  - near real-time message push fanout
3. Admin pick edit guardrails:
  - enforce kickoff lock at API layer for league admins
  - preserve super-admin override

## 7. Update Process
When parity work changes:
1. Update `Mobile Status` for affected rows.
2. Add short notes for behavior differences.
3. If backend changes are required, add/update `Backend Dependencies`.
4. Keep this file aligned with `docs/PRD.md` decisions.
5. Update `WORKLOG.md` for task start/status/commit/decision/validation events.

## 8. Worklog Governance
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
