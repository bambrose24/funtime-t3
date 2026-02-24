# Funtime NFL Pick-Em - Product Requirements Document (PRD)

## 1. Product Summary
Funtime is an NFL pick-em league manager where players join private leagues, submit weekly game picks, and compete for week and season standings. Leagues can optionally include a preseason Super Bowl prediction that keeps engagement active all season.

This PRD is focused on the **Next.js web app** as the current source of truth and defines the target feature set the mobile companion should align to.

## 2. Problem Statement
Most casual NFL pick-em experiences are either too generic or too transactional. Commissioners need league controls, players need a fast weekly picking flow, and everyone needs enough social/season-long context to stay engaged after a single week.

Funtime solves this by combining:
- Weekly picks and results
- Season leaderboard progression
- League social messaging
- Admin controls for commissioner workflows
- Long-tail engagement via Super Bowl picks

## 3. Product Goals
- Make weekly pick submission fast and low-friction.
- Keep leagues active from preseason through Super Bowl.
- Support commissioners with practical controls (members, roles, edits, broadcast).
- Preserve competitive integrity while still allowing configured late-pick behavior.
- Provide a stable platform contract that mobile can consume.

## 4. Non-Goals (Current)
- DFS/betting integrations
- Public/discoverable leagues
- Real-money payment processing
- Complex scoring systems beyond current winner-based picks + tiebreaker score

## 5. User Roles
- `Player`: joins leagues, submits picks, tracks standings, participates in messages.
- `League Admin`: all player capabilities plus member/league management and communication.
- `Super Admin`: platform-level admin visibility and override capabilities (single operator email: `bambrose24@gmail.com`).

## 6. Core User Journeys
1. Signup + onboarding
2. Join existing league by invite code OR create new league
3. Submit picks for current/upcoming week
4. Follow week-by-week standings and winners
5. Track season leaderboard and player profiles
6. Participate in league message board
7. (Optional) Submit/update Super Bowl pick
8. Admin manages membership, communications, and corrections

## 6.1 Product Decisions (Confirmed)
- Mobile direction: full feature parity with web is the end goal.
- Mobile release order: player-first core loop, then admin capabilities.
- Pick visibility:
  - If a member has not submitted picks for that week, they cannot see other members' picks.
  - If a member has submitted picks, they can see picks for games that have started.
- Late policy: league-configurable; no single mandated league default requirement.
- Leaderboard ties must use shared ranking (example: scores `10, 8, 8, 4` => ranks `1, 2, 2, 4`).
- League admins cannot edit picks after kickoff.
- Super admin can edit picks regardless of kickoff lock.
- Donated/paid status is informational tracking only (no access gating).
- Super Bowl pick is required at join time when league has Super Bowl competition enabled.
- Notification priorities:
  - Pick reminders
  - Week summaries
  - League message notifications
- Messaging direction: migrate from week-scoped board to a persistent league message board.
- Messaging scope: remove week partitioning entirely.
- Messaging moderation: league admins can delete any message in their league.
- Week summary push behavior: personal results only; deep-link to that week's page with standings and game cards.
- Message push behavior: near real-time delivery per message event.
- Week summary delivery should be dual-channel:
  - Push to each member with their personal results
  - Email to members with overall league state
- Week summary send time target: morning after the week is fully completed.

## 7. Functional Requirements

### 7.1 Authentication and Account
- Email/password auth via Supabase.
- User profile stored in app DB (`people`) with username and identity mapping.
- Session-aware routes and protected actions.
- Settings page supports username updates with uniqueness validation.

### 7.2 League Lifecycle
- Create league with:
  - Name
  - Late policy
  - Pick policy
  - Scoring type
  - Reminder policy
  - Super Bowl competition toggle
  - Optional `priorLeagueId` linkage
- Join league by share code.
- Prevent duplicate membership.
- Detect not-started league state and render appropriate experience.
- Link prior/next season leagues for continuity and upsell.

### 7.3 Weekly Picks
- Determine current target week for picks (`weekToPick`) based on schedule and prior picks.
- Show games for target week ordered for usable entry.
- Submit picks for one or more leagues with validation:
  - Membership required
  - Admin-only override for editing another member
  - Tiebreaker score only for tiebreaker game
  - Non-admin submissions filter out already-started games
- Update existing picks or create new picks idempotently by member/game.
- Trigger picks confirmation emails after submit.

### 7.4 Pick Visibility and Integrity
- Weekly picks summary is league-member-only.
- Visibility rules:
  - Viewer with no picks submitted for the week cannot view others' picks.
  - Viewer with picks submitted can view others' picks for started games.
- Expose week winners after results are finalized.

### 7.5 Standings and Leaderboard
- Weekly winners tracked per league/week, including ties via tiebreaker diff.
- Season leaderboard ranks by total correct picks.
- Ranking model must support tied ranks with gaps (competition ranking).
- Provide chartable cumulative weekly totals.
- Mark season-complete context when all games are done.
- Expose top finishers for season winner announcements.

### 7.6 Super Bowl Competition
- League-level optional feature.
- Capture winner, loser, and total score prediction per member.
- Join flow can require Super Bowl pick if enabled.
- Hide other members’ Super Bowl picks while league is not started.
- Display playoff bracket context for engagement.

### 7.7 League Messaging
- Current state: week-specific league message board.
- Target state: persistent league-wide message board (Sleeper-style continuous thread).
- No week-based partitioning in the target state.
- Players can post and delete own messages.
- League admins can delete any message in their league.
- League-member-only access.
- Ordered threaded feed (currently ascending by creation time).

### 7.8 Admin Controls (League Admin)
- View members with stats:
  - Correct picks
  - Wrong picks
  - Missed picks
  - Week wins
- Change member role (player/admin).
- Remove member.
- Edit member picks for specific games **before kickoff only**.
- Toggle paid/donated tracking.
- View member email logs/content.
- Rename league.
- Send league broadcast email with weekly rate limiting.
- Super-admin override can edit any picks (including after kickoff).

### 7.9 Notifications and Email
- Pick confirmation email.
- League registration/welcome email.
- League broadcast email.
- Automated reminder email before first unstarted game (policy-driven, current policy: three hours before).
- Planned: week summary notifications (dual-channel push + email).
- Planned: message board notifications.
- Week summary push should show personal result and link to week page context.
- Week summary email should contain overall league state/recap.
- Week summary should trigger morning after a week is complete.
- Message notifications should be sent near real-time.

### 7.10 Data Sync and Scoring Automation
- Cron syncs regular-season games from ESPN.
- Updates scores, winners, pick correctness.
- Creates week winner records after full-week completion.
- Updates game metadata (records, tiebreaker assignment, future start times).
- Syncs postseason seeds/games for bracket views.

### 7.11 Global Admin
- Super-admin-only aggregate dashboard data:
  - Leagues, picks by season, members by league, email/message counts.

## 8. Success Metrics (Proposed)
- Weekly pick completion rate by league/week
- % of active members returning week-over-week
- # of active leagues per season
- Super Bowl pick participation rate in enabled leagues
- Broadcast/reminder open rate (if tracked)
- Admin tasks completed without support intervention

## 9. Mobile Companion Requirements (Target Parity)
- End-state goal: all major web features available in mobile.
- Phase 1 must support core player loop end-to-end:
  - Auth
  - Join/create league
  - Weekly picks
  - League view + leaderboard
  - Super Bowl pick flow
  - Basic profile/settings
- Phase 2 should add messaging and core social engagement.
- Phase 3 adds full admin tooling parity.

## 10. Release Phasing (Proposed)
- `Phase 1`: Core play loop (auth, league entry, pick submission, standings, profile)
- `Phase 2`: Messaging + richer engagement features
- `Phase 3`: Admin workflows + operational tooling parity

## 11. Remaining Open Questions
1. Week summary trigger logic: what exact completion criteria and timezone should define "morning after week is over"?
2. Should message moderation include additional features beyond admin delete (reporting, rate limit, blocked users)?
3. Should league creation remain open to any authenticated user year-round, or be season-gated?
4. Offseason UX: what should users see/do between season completion and next season start?
