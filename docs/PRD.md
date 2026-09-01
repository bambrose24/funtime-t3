# Funtime NFL Pick-Em - Product Requirements Document (PRD)

## 1. Product Summary

Funtime is an NFL pick-em league manager where players join private leagues, submit weekly game picks, and compete for week and season standings. Leagues can optionally include a preseason Super Bowl prediction that keeps engagement active all season. Completed leagues can be renewed into a linked next-season league so commissioners can preserve their setup, bring players back, and maintain continuity from one season to the next.

This PRD is focused on the **Next.js web app** as the current source of truth and defines the target feature set the mobile companion should align to.

## 2. Problem Statement

Most casual NFL pick-em experiences are either too generic or too transactional. Commissioners need league controls, players need a fast weekly picking flow, and everyone needs enough social/season-long context to stay engaged after a single week.

Funtime solves this by combining:

- Weekly picks and results
- Season leaderboard progression
- League social messaging
- Admin controls for commissioner workflows
- Long-tail engagement via Super Bowl picks
- Season-to-season continuity through linked league renewal

## 3. Product Goals

- Make weekly pick submission fast and low-friction.
- Keep leagues active from preseason through Super Bowl.
- Support commissioners with practical controls (members, roles, edits, broadcast).
- Preserve competitive integrity while still allowing configured late-pick behavior.
- Make offseason league renewal clear, safe, and easy to resume if invitations are not sent during setup.
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
9. Admin renews a completed league, reviews returning players, and manages next-season invites
10. Player follows a renewal invite, joins the linked league, and receives the intended next-season role

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
- Messaging direction: use a persistent league message board.
- Messaging scope: messages are league-wide and are not partitioned by week.
- Messaging moderation: league admins can delete any message in their league.
- Week summary push behavior: personal results only; deep-link to that week's page with standings and game cards.
- Message push behavior: near real-time delivery per message event.
- Week summary delivery should be dual-channel:
  - Push to each member with their personal results
  - Email to members with overall league state
- Week summary send time target: morning after the week is fully completed.
- Renewal invitations are optional during league creation; a commissioner can create the renewed league first and send or manage invitations later.
- A renewal invite can carry an intended next-season admin role that is applied when the invited player joins.

Unless a requirement is explicitly labeled **Target** or **Planned**, it describes current expected product behavior. Platform-specific parity gaps are tracked in `docs/MOBILE_PARITY_PLAN.md`.

## 7. Functional Requirements

### 7.1 Authentication and Account

- Email/password auth via Supabase.
- Email confirmation is required for signup, followed by app-profile onboarding.
- Password recovery supports requesting a reset email and setting a new password from the recovery session.
- User profile stored in app DB (`people`) with username and identity mapping.
- Session-aware routes and protected actions.
- Auth flows preserve the intended destination when a protected link requires sign-in first.
- Settings page supports username updates with uniqueness validation.
- Mobile account settings support push-token registration, notification enable/disable, and current registration-status feedback.
- Mobile account settings show app/build/OTA-source diagnostics, support copying diagnostic details, and allow a manual over-the-air update check when updates are enabled.

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
- Shared join URLs work on the web and can deep-link into the installed mobile app.
- Prevent duplicate membership.
- Detect not-started league state and render appropriate experience.
- Link prior/next season leagues for continuity and upsell.
- Show current-season leagues before renewal opportunities and prior-season history on the home screen.
- Surface a linked, not-started next-season league to prior members with a direct join action.
- When a signed-in user has exactly one current-season league and no pending renewal choices, the home flow can open that league directly.
- Mobile home supports league search/filter and keeps long prior-season history collapsible.

### 7.2.1 League Renewal and Season Continuity

#### Eligibility and discovery

- Self-service renewal is controlled by the shared season gate. It is open when
  `CURRENT_SEASON >= FIRST_SELF_SERVICE_RENEWAL_SEASON` (currently `2026`).
- A renewal source must be a `completed` league from a season earlier than the configured target season.
- Only an admin of the prior league can preview or create its renewal.
- Eligible admins can enter the flow from:
  - The home-screen **Next Season** section
  - The completed-league page
  - The prior league's admin settings
- Once a target-season renewal exists, entry points switch from **Set Up Next Season** to actions for opening the renewed league, managing invites, or copying its join link.
- The system enforces at most one renewed league for a given prior league and target season, including protection against concurrent duplicate creation.

#### Setup

- Renewal setup suggests a target-season name by removing a trailing season year from the old name and appending the target year.
- The prior league is fixed as the renewal source and the new league keeps an explicit `priorLeagueId` link.
- Supported league settings are prefilled from the prior league, including late-pick, pick, reminder, scoring, and Super Bowl competition policies. User-editable settings can be changed before creation.
- The creating admin is added to the renewed league automatically as an admin.
- Before committing on web, the admin reviews returning players and can either:
  - Create the league and send the selected invitations, or
  - Create the league without sending invitations and continue from invite management later.
- An invitation failure must not roll back a successfully created league. The admin is directed to invite management to retry or share the join link.

#### Returning-player review and invitations

- Returning players with an email address are selected by default; the initiating admin is excluded because they already join automatically.
- The review identifies returning admins. They retain admin access when they join the renewed league.
- The admin can grant next-season admin access to another selected player before sending that player's invitation.
- Invite management is available from both the prior league and the renewed league's admin settings.
- The invite manager provides:
  - The renewed league's shareable join link
  - Eligible-player selection and select-all/clear controls
  - Intended next-season role controls
  - Last-season missed-pick context to help the admin decide whom to invite
  - Counts for players who already joined, were already invited, or cannot be emailed because their address is missing
- Players who already joined or already received a successfully logged renewal invitation are excluded from subsequent eligible-recipient lists.
- Sending invitations records renewal email logs, avoids duplicate sends, and sends the initiating admin a confirmation copy when applicable.
- The send result reports sent, skipped, and failed recipients. Successful recipients disappear from the eligible list; failed or unsent players remain manageable.

#### Join and role handoff

- Renewal invitations use the renewed league's normal share-code join flow, including any required Super Bowl prediction.
- When an invited player joins, the stored renewal role is applied. Returning prior-league admins also retain admin access even if no explicit role record was created.
- All other returning players join as players.

#### End-to-end renewal flow

1. The product identifies an eligible completed league and offers **Set Up Next Season**.
2. The admin reviews the suggested name and inherited settings.
3. The admin reviews returning players and next-season roles, or elects to send invitations later.
4. The product creates exactly one linked target-season league and adds the creator as admin.
5. The admin sends renewal emails and a confirmation copy, or shares the join link directly.
6. Invite management tracks joined, invited, missing-email, skipped, and failed states without duplicating successful sends.
7. A returning player joins through the normal registration flow and receives the correct player/admin role.
8. Prior-league surfaces link members and admins forward to the renewed league for season continuity.

### 7.2.2 Content Design Principles

- Lead with the action and its outcome. Buttons should say what will happen
  next, such as **Set Up Next Season**, not use insider phrasing.
- Use familiar, age-inclusive language. Write for every football fan, not a
  particular generation or group chat.
- Keep the energy warm and game-day friendly, but let clarity do the work.
  A little personality belongs in supporting copy, never in place of meaning.
- Set expectations before a commitment. When an action opens a setup step,
  say so; when it sends invitations, make the recipients and timing clear.
- Be consistent about the nouns that matter: use **league**, **season**,
  **players**, and **invites** throughout the renewal journey.

### 7.3 Weekly Picks

- Determine the current target week for picks (`weekToPick`) from the game schedule and kickoff state. Existing picks alone must not advance a player past a week that still has open games.
- Show games for target week ordered for usable entry.
- Allow a player to randomize open-game selections while preserving locked games.
- Submit picks for one or more leagues with validation:
  - Membership required
  - Admin-only override for editing another member
  - Tiebreaker score only for tiebreaker game
  - Non-admin submissions filter out already-started games
- Let a player apply the same picks to all eligible same-season league memberships.
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
- League-member-only player profiles show correct/wrong totals, accuracy, week wins, message count, and Super Bowl prediction context.

### 7.6 Super Bowl Competition

- League-level optional feature.
- Capture winner, loser, and total score prediction per member.
- Join flow can require Super Bowl pick if enabled.
- Members can update their own prediction before the season starts; predictions lock after the season starts.
- Hide other members’ Super Bowl picks while league is not started.
- Display playoff bracket context for engagement.

### 7.7 League Messaging

- Persistent league-wide message board (Sleeper-style continuous thread).
- No week-based partitioning. Legacy week-named API aliases return the same league-wide thread while clients migrate.
- Messages accept 1-500 characters and are ordered ascending by creation time.
- Players can post and delete own messages.
- League admins can delete any message in their league.
- League-member-only access.
- A successful post triggers best-effort near-real-time push fanout to other opted-in league members; notification failure does not fail the message write.

### 7.8 Admin Controls (League Admin)

- View members with stats:
  - Correct picks
  - Wrong picks
  - Missed picks
  - Week wins
- Change member role (player/admin).
- Remove member.
- A league admin cannot demote or remove their own membership; the super-admin override remains available for recovery.
- Edit member picks for specific games **before kickoff only**.
- Toggle paid/donated tracking.
- View member email logs/content.
- Export member performance, role, and paid-status data as CSV on supported clients.
- Rename league.
- Send league broadcast email with weekly rate limiting.
- Super-admin override can edit any picks (including after kickoff).

### 7.9 Notifications and Email

- Pick confirmation email.
- League registration/welcome email.
- League broadcast email.
- Automated reminder email before first unstarted game (policy-driven, current policy: three hours before).
- Renewal invitation email and initiating-admin confirmation copy.
- Week summary notifications use dual-channel push + email delivery:
  - Personal-result push with week rank and correct-pick count
  - League recap email with standings, winners, season movement, tiebreaker context, and the recipient's picks
- Week summaries run only after every game in the week is complete and no earlier than 12:00 UTC on the day after the latest scheduled game start. Existing email logs prevent repeat email delivery for the same member/league/week.
- League message pushes are sent near real-time to enabled devices for members other than the author.
- Push payloads deep-link to the relevant league message thread or week view.
- Mobile users can register devices, enable or disable push delivery, and inspect whether notification tokens are active.
- Email logs retain provider IDs and user-visible content/history for admin review.
- Signed Resend webhooks track delivery lifecycle (`queued`, `delivered`, `delayed`, `failed`, `bounced`, `complained`, or `suppressed`) and ignore duplicate or older events.

### 7.10 Data Sync and Scoring Automation

- Cron syncs regular-season games from ESPN.
- Updates scores, winners, pick correctness.
- Creates week winner records after full-week completion.
- Updates game metadata (records, tiebreaker assignment, future start times).
- Syncs postseason seeds/games for bracket views.
- Runs policy-based pick reminders and completed-week notification fanout.

### 7.11 Global Admin

- Super-admin-only aggregate dashboard data:
  - Leagues, picks by season, members by league, email/message counts.

### 7.12 Cross-Platform Links and Navigation

- Canonical `play-funtime.com` URLs remain valid web fallbacks and map to equivalent mobile routes when the app is installed.
- Supported shared destinations include join links, league views (including week/tab context), settings, global admin, and auth callbacks.
- Protected deep links preserve destination intent through authentication and enforce the same membership/role authorization as direct navigation.

## 8. Success Metrics (Proposed)

- Weekly pick completion rate by league/week
- % of active members returning week-over-week
- # of active leagues per season
- Super Bowl pick participation rate in enabled leagues
- Broadcast/reminder open rate (if tracked)
- Admin tasks completed without support intervention
- % of eligible completed leagues renewed
- Renewal invite send success rate and invite-to-join conversion
- % of renewed leagues with at least two returning players

## 9. Mobile Companion Requirements (Target Parity)

- End-state goal: all major web features available in mobile.
- Phase 1 must support core player loop end-to-end:
  - Auth
  - Signup confirmation and password recovery
  - Join/create league
  - Weekly picks
  - League view + leaderboard
  - Super Bowl pick flow
  - Basic profile/settings
- Phase 2 should add messaging and core social engagement.
- Phase 2 also includes push-token preferences, message alerts, week-summary deep links, and week-summary result context.
- Phase 3 adds full admin tooling parity, including completed-league renewal discovery, inherited setup, invite management, next-season role assignment, and prior/next league navigation.

## 10. Release Phasing (Proposed)

- `Phase 1`: Core play loop (auth, league entry, pick submission, standings, profile). Implemented on web and substantially implemented on mobile; parity QA remains active.
- `Phase 2`: Messaging + richer engagement features. Persistent messaging and notification plumbing are implemented; production/device delivery QA remains.
- `Phase 3`: Admin workflows + operational tooling parity. Core mobile admin workflows and renewal management exist, with richer web renewal review/role controls still requiring complete mobile parity.

## 11. Remaining Open Questions

1. Should week summaries continue using the current 12:00 UTC threshold after the latest scheduled game start, or use a league/admin timezone and actual completion timestamp?
2. Should message moderation include additional features beyond admin delete (reporting, rate limit, blocked users)?
3. Should first-time league creation remain open to any authenticated user
   year-round, or be season-gated separately from renewals?
4. What offseason experience should non-admin members see before their admin
   opens a completed league for renewal?
5. Should the renewal availability gate remain season-configuration based, or become a calendar window with explicit open/close dates?

## 12. Test Coverage Governance

The product requirements and automated coverage must evolve together.
`docs/WEB_E2E_WORKLOG.md` is the living source of truth for current web E2E
coverage, owning specs, the latest validated baseline, and explicit gaps.
`docs/TESTING_STRATEGY.md` defines how the suite runs locally and in CI.

A user-facing feature or behavior change is not complete until the same change:

1. Updates this PRD when product behavior changes.
2. Adds or updates the corresponding row/checklist item in the web E2E worklog.
3. Adds or updates deterministic E2E coverage against local Supabase.
4. Runs the relevant tests and records the full-suite result.

Add new coverage items as unchecked before or during implementation so missing
coverage remains visible. If browser E2E is not the correct test layer, record
the behavior in the worklog's explicit gaps register, name the owning test
layer, and track the follow-up. Manual verification alone is not sufficient to
mark a behavior covered.

This policy applies to new features, behavior changes, bug fixes, authorization
rules, persistence changes, and regressions discovered in production. Every
production regression should receive an automated test that fails without the
fix whenever the behavior can be reproduced safely and deterministically.
