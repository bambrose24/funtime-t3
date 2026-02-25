# Mobile Parity Program Worklog

## Program Status
- Program: Mobile-Web Parity (player + admin parity).
- Branch: `codex/mobile-core-features`.
- Status: `IN_PROGRESS`.
- Worklog policy: mandatory update on task start/status change/commit/blocker/decision/validation.

## Current Phase
- Active phase: `Phase 3 - Admin + Ops Parity`.
- Pre-step: `0.0 Initialize and baseline WORKLOG.md`.

## Completed Tasks
- Task ID: `P0-PRISMA-001`
  - Short title: Add real Prisma migration workflow scaffolding and first SQL migration.
  - Scope touched: `packages/api/package.json`, `packages/api/prisma/migrations/20260225000000_baseline/migration.sql`, `packages/api/prisma/migrations/20260225041054_add_push_notification_tokens/migration.sql`.
  - Outcome: Added `db:migrate:*` scripts for dev/deploy/status/resolve flows, generated a full baseline migration for existing schema state, and added an incremental push-token migration for `pushNotificationTokens` (instead of relying only on `db push`).
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T04:22:01Z`.
- Task ID: `P2-NOTIFY-003`
  - Short title: Implement week-summary push/email scheduler pipeline.
  - Scope touched: `apps/web/src/cron/index.ts`, `packages/api/server/services/resend/index.ts`, `packages/api/server/services/expo-push/index.ts`, `packages/api/src/index.ts`.
  - Outcome: Added cron-driven week-summary processing with morning-after gating, per-member idempotency via `EmailLogs`, personal-result push notifications, and league summary emails containing standings.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T04:10:54Z`.
- Task ID: `P2-NOTIFY-002`
  - Short title: Add near-real-time league message push fanout and push-tap deep linking.
  - Scope touched: `packages/api/server/services/expo-push/index.ts`, `packages/api/server/api/routers/messages/index.ts`, `apps/mobile/hooks/usePushNotificationRegistration.ts`.
  - Outcome: New league messages now trigger best-effort Expo push sends to enabled recipient tokens (excluding the author), and mobile notification taps now route into league message views using payload deep-link paths.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T04:07:02Z`.
- Task ID: `P2-NOTIFY-001`
  - Short title: Ship push-token registration and notification preference foundation.
  - Scope touched: `apps/mobile/package.json`, `pnpm-lock.yaml`, `apps/mobile/app.json`, `apps/mobile/hooks/usePushNotificationRegistration.ts`, `apps/mobile/app/_layout.tsx`, `apps/mobile/app/(tabs)/account.tsx`, `packages/api/prisma/schema.prisma`, `packages/api/server/api/routers/settings.ts`, `packages/api/src/generated/prisma-client/*`.
  - Outcome: Installed `expo-notifications`, added mobile token registration flow, added account-level enable/disable controls, and introduced API + Prisma push-token persistence with graceful fallback when the new table is not yet deployed.
  - Validation run: `pnpm --filter @funtime/api db:generate`, `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T04:04:26Z`.
- Task ID: `P1-SETTINGS-QA-002`
  - Short title: Prevent username draft resets during account-screen refetches.
  - Scope touched: `apps/mobile/app/(tabs)/account.tsx`.
  - Outcome: Added loaded-username tracking so in-progress username edits are not clobbered by routine session/query refreshes unless the canonical server username actually changes.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`.
  - Timestamp (UTC): `2026-02-25T03:59:04Z`.
- Task ID: `P1-SETTINGS-QA-001`
  - Short title: Harden mobile username-settings refresh and validation behavior.
  - Scope touched: `apps/mobile/app/(tabs)/account.tsx`.
  - Outcome: Synced username draft with server username updates and tightened submit-disable behavior to compare trimmed values, reducing stale-draft and no-op update edge cases.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`.
  - Timestamp (UTC): `2026-02-25T03:57:54Z`.
- Task ID: `P4-GLOBALADMIN-QA-001`
  - Short title: Improve mobile global-admin metric parity with web dashboard.
  - Scope touched: `apps/mobile/app/admin.tsx`.
  - Outcome: Added this-season player totals and picks-by-season breakdown to align mobile global-admin metrics more closely with web admin data.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`.
  - Timestamp (UTC): `2026-02-25T03:57:20Z`.
- Task ID: `P1-LEAGUEVIEW-QA-001`
  - Short title: Fix mobile week-summary tiebreaker sorting parity.
  - Scope touched: `apps/mobile/app/league/[id]/index.tsx`.
  - Outcome: Corrected mobile picks-summary sort logic to use API-provided `tiebreakerScore` for tie resolution instead of a missing per-pick score field.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`.
  - Timestamp (UTC): `2026-02-25T03:56:23Z`.
- Task ID: `P1-LEADERBOARD-QA-001`
  - Short title: Align mobile leaderboard rank display with competition-ranking parity.
  - Scope touched: `apps/mobile/components/leaderboard/MobileLeaderboardTable.tsx`, `packages/api/server/api/routers/leaderboard.ts` (verification).
  - Outcome: Mobile leaderboard now renders raw numeric ranks to match web/table parity, preserving tie behavior (`1,2,2,4`) from API ranking logic.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`.
  - Timestamp (UTC): `2026-02-25T03:55:38Z`.
- Task ID: `P1-SETTINGS-001`
  - Short title: Add mobile account settings parity for username updates.
  - Scope touched: `apps/mobile/app/(tabs)/account.tsx`.
  - Outcome: Added username edit/update flow with client-side validation, API mutation wiring, cache invalidation, and conflict/error handling feedback.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T03:53:32Z`.
- Task ID: `P4-GLOBALADMIN-001`
  - Short title: Add first mobile global-admin dashboard and entry point.
  - Scope touched: `apps/mobile/app/admin.tsx`, `apps/mobile/app/(tabs)/account.tsx`, `apps/mobile/hooks/useAuthHandler.ts`.
  - Outcome: Added super-admin-only dashboard route with high-level metrics and league admin shortcuts, plus account-screen entry point and deep-link route support.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T03:53:32Z`.
- Task ID: `P3-ADMIN-004`
  - Short title: Add mobile member email-log surface and super-admin access parity.
  - Scope touched: `apps/mobile/app/league/[id]/admin.tsx`, `apps/mobile/app/league/[id]/admin-picks.tsx`, `apps/mobile/app/league/[id]/admin-emails.tsx`, `apps/mobile/app/league/[id]/index.tsx`, `packages/api/server/api/routers/league/admin.ts`, `packages/api/server/api/routers/league/index.ts`.
  - Outcome: Added member email-log screen with email preview, wired per-member navigation from admin roster, and aligned UI/API authorization to allow league-admin or super-admin access for admin surfaces.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T03:53:32Z`.
- Task ID: `P3-ADMIN-003`
  - Short title: Add mobile admin broadcast and league-name management surface.
  - Scope touched: `apps/mobile/app/league/[id]/admin.tsx`, `packages/api/server/api/routers/league/admin.ts`.
  - Outcome: Completed admin rename and broadcast controls in mobile, including weekly broadcast-limit status messaging and super-admin-compatible broadcast permission checks.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T03:53:32Z`.
- Task ID: `P1-PLAYERPROFILE-001`
  - Short title: Add member-to-member profile navigation from leaderboard.
  - Scope touched: `apps/mobile/app/league/[id]/player/[memberId].tsx`, `apps/mobile/components/profile/LeagueMemberProfile.tsx`, `apps/mobile/components/leaderboard/MobileLeaderboardTable.tsx`, `apps/mobile/components/leaderboard/ClientLeaderboardPage.tsx`.
  - Outcome: Added player profile route and screen, plus leaderboard row navigation to member profiles using shared `playerProfile.get` data.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T03:43:37Z`.
- Task ID: `P1-SUPERBOWL-001`
  - Short title: Add mobile Super Bowl picks management surface.
  - Scope touched: `apps/mobile/components/superbowl/LeagueSuperbowlBoard.tsx`, `apps/mobile/app/league/[id]/index.tsx`.
  - Outcome: Added Super Bowl tab for leagues with competition enabled, including viewer pick create/update flow and league board rendering with hidden-pick handling before season start.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T03:41:32Z`.
- Task ID: `P3-ADMIN-002`
  - Short title: Add mobile admin pick-edit workflow and kickoff lock guardrails.
  - Scope touched: `apps/mobile/app/league/[id]/admin-picks.tsx`, `apps/mobile/app/league/[id]/admin.tsx`, `packages/api/server/api/routers/league/admin.ts`.
  - Outcome: Added member pick-edit screen in mobile admin flow, wired pick updates/tiebreaker edits, enforced no-edit-after-kickoff for league admins, and preserved super-admin override for `bambrose24@gmail.com`.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T03:38:38Z`.
- Task ID: `P3-ADMIN-001`
  - Short title: Add mobile league-admin member management surface.
  - Scope touched: `apps/mobile/app/league/[id]/admin.tsx`, `apps/mobile/app/league/[id]/index.tsx`.
  - Outcome: Added admin-only league management screen with member role changes, paid tracking updates, and remove-member actions, plus admin entry point from league header.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T03:35:32Z`.
- Task ID: `P1-PROFILE-001`
  - Short title: Expand mobile my-profile parity surface in league context.
  - Scope touched: `apps/mobile/components/profile/LeagueMyProfile.tsx`, `apps/mobile/app/league/[id]/index.tsx`.
  - Outcome: Added a `My Profile` league tab backed by `playerProfile.get`, including season stats, role/email details, and Super Bowl pick summary.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T03:33:04Z`.
- Task ID: `P2-MSG-001`
  - Short title: Migrate clients to persistent league message board endpoints.
  - Scope touched: `apps/mobile/components/messages/LeagueMessageBoard.tsx`, `apps/mobile/app/league/[id]/index.tsx`, `apps/web/src/components/messages/LeagueWeekMessageSheetContent.tsx`, `apps/web/src/app/league/[leagueId]/client-league-page.tsx`.
  - Outcome: Both mobile and web clients now read/write/delete against league-wide message APIs (no week partition), with admin-or-author delete behavior retained.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T03:30:58Z`.
- Task ID: `P2-MSG-001A`
  - Short title: Add mobile persistent league message board UI and league tab integration.
  - Scope touched: `apps/mobile/components/messages/LeagueMessageBoard.tsx`, `apps/mobile/app/league/[id]/index.tsx`.
  - Outcome: Added a `Messages` tab in league detail, wired persistent league message read/send/delete flows, and enforced admin-or-author delete behavior in the mobile client.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T03:29:36Z`.
- Task ID: `P1-LEAGUE-001`
  - Short title: Implement mobile join/create league parity flows.
  - Scope touched: `apps/mobile/app/(tabs)/home.tsx`, `apps/mobile/app/league/create.tsx`, `apps/mobile/app/join-league/index.tsx`, `apps/mobile/app/join-league/[code].tsx`.
  - Outcome: Added home entry points for Join/Create, built join-by-code flow with required Super Bowl registration support, and added mobile league creation form with policy controls.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T03:27:05Z`.
- Task ID: `P0-DEEPLINK-001`
  - Short title: Implement `play-funtime.com` app deep-link handling.
  - Scope touched: `apps/mobile/app.json`, `apps/mobile/hooks/useAuthHandler.ts`, `apps/mobile/app/settings.tsx`, `apps/mobile/app/login.tsx`, `apps/mobile/app/join-league/[code].tsx`, `apps/mobile/app/join-league/index.tsx`, `apps/web/src/app/apple-app-site-association/route.ts`, `apps/web/src/app/.well-known/assetlinks.json/route.ts`.
  - Outcome: Added iOS/Android app-link config, runtime deep-link routing/redirect handling, and web association endpoints required for domain-verified deep links.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T03:23:29Z`.
- Task ID: `P0-PLAN-003`
  - Short title: Add deep-link parity track for `play-funtime.com` URLs.
  - Scope touched: `docs/MOBILE_PARITY_PLAN.md`.
  - Outcome: Added deep-link infrastructure requirements, URL routing spec, and domain association dependencies for Universal Links/App Links.
  - Validation run: Docs-only planning update; no runtime validation required.
  - Timestamp (UTC): `2026-02-25T03:10:57Z`.
- Task ID: `P0-ARCH-001`
  - Short title: Route-group refactor for auth/tabs/bootstrap shell.
  - Scope touched: `apps/mobile/app/_layout.tsx`, `apps/mobile/app/index.tsx`, `apps/mobile/app/(auth)/auth.tsx`, `apps/mobile/app/(auth)/signup.tsx`, `apps/mobile/app/(auth)/confirm-signup.tsx`, `apps/mobile/app/(tabs)/_layout.tsx`, `apps/mobile/app/(tabs)/home.tsx`, `apps/mobile/app/(tabs)/account.tsx`, `apps/mobile/hooks/useAuthHandler.ts`.
  - Outcome: Migrated mobile routing to grouped auth/tabs layouts, introduced bootstrap redirect route, preserved auth callback flow, and aligned post-onboarding navigation to tab home.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`.
  - Timestamp (UTC): `2026-02-25T03:01:52Z`.
- Task ID: `P0-WORKLOG-001`
  - Short title: Initialize `WORKLOG.md` governance and integrate with parity plan.
  - Scope touched: `WORKLOG.md`, `docs/MOBILE_PARITY_PLAN.md`.
  - Outcome: Added canonical root worklog with required sections, task schema, parity snapshot, and governance enforcement in parity plan (including Phase 0 pre-step and Worklog Gate Check).
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`.
  - Timestamp (UTC): `2026-02-25T02:53:24Z`.
- Task ID: `P0-MOB-INFRA-001`
  - Short title: Harden mobile auth, routing, and query hydration infrastructure.
  - Scope touched: `apps/mobile/hooks/useAuthHandler.ts`, `apps/mobile/lib/trpc/react.tsx`, `apps/mobile/utils/getBaseUrl.ts`, `apps/mobile/hooks/useColdStartPrefetch.ts`, `apps/mobile/app/index.tsx`, `apps/mobile/app/league/[id]/index.tsx`.
  - Outcome: Auth/onboarding routing stabilized, cache restore fixed, API base URL made env/device aware, hardcoded season logic removed, tab routing made URL-driven.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T02:52:26Z`.
- Task ID: `P0-MSG-001`
  - Short title: Add league-wide messages API groundwork and admin delete behavior.
  - Scope touched: `packages/api/server/api/routers/messages/index.ts`.
  - Outcome: Introduced league-wide read/write endpoints, kept backward-compatible aliases, and enforced author-or-admin delete.
  - Validation run: `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T02:52:26Z`.

## In Progress
- None.

## Next Up
1. `P5-PARITY-QA-001`: End-to-end parity QA pass and regression fixes.
2. `P3-ADMIN-QA-001`: Validate mobile admin message/email/pick workflows under league-admin and super-admin identities.
3. `P0-DEEPLINK-QA-001`: Validate `play-funtime.com` deep links for `/join-league`, `/league/:id`, `/settings`, and `/admin`.
4. `P2-NOTIFY-QA-001`: Validate push/email delivery behavior in staging (token registration, message pushes, and week summary schedule).
5. `P0-PRISMA-002`: Validate `prisma migrate status/deploy` against target DB and baseline strategy for existing environments.

## Decisions & Rationale
- Full parity target includes player + admin (including global admin) to avoid permanent web-only operational gaps.
- Foundational refactor first to avoid repeated rewrites while adding parity features.
- Native-first UX parity to keep mobile ergonomics while preserving behavior parity.
- Dual-compat API window for messages to de-risk web/mobile migration sequencing.
- Notification strategy: Expo Push, contextual permission prompts, default core notifications enabled.
- Route IA decision: move auth pages under `(auth)` and primary app navigation under `(tabs)` to make parity expansion predictable.
- Deep-link strategy: shared `play-funtime.com` links are canonical and must resolve to equivalent app routes when installed, with web fallback otherwise.
- Deep-link hosting decision: web serves iOS/Android association payloads from route handlers so app ownership config can be environment-driven.
- Super-admin parity decision: critical admin paths must be authorized by role OR super-admin email at both API and mobile UI layers to avoid unreachable override workflows.
- Leaderboard parity decision: rank labels in mobile should be raw numeric values to match web and make tie rankings explicit.
- Week-summary parity decision: tie-resolution sorting in mobile must use server summary fields (`tiebreakerScore`) instead of inferring from truncated pick rows.
- Settings parity decision: local username drafts should only auto-sync when the server username changes, not on every refetch.
- Notification foundation decision: token registration should fail soft when the push-token table is not yet deployed, so app auth/settings flows remain stable.
- Message-push decision: notification delivery is best-effort and must not block message writes; failures are logged and writes still succeed.
- Week-summary scheduling decision: summaries are sent once per member per league/week, no earlier than 12:00 UTC the day after the final game timestamp for that week.
- Prisma migration decision: `db push` remains for quick local sync only; environment rollout should use checked-in SQL migrations via `prisma migrate deploy`.
- Prisma baseline decision: existing environments should mark baseline migration as applied, then run deploy for incremental migrations.

## Risks / Blockers
- Risk: Route refactor can cause regressions in deep links and auth redirects.
  - Owner: Implementer.
  - Mitigation: Add explicit bootstrap route tests and manual real-device smoke validation.
- Risk: Persistent message migration requires careful client cutover ordering.
  - Owner: Implementer.
  - Mitigation: Keep legacy endpoints until both clients are fully migrated and validated.
- Risk: Deep-link association can fail if iOS/Android domain files or signing fingerprints are out of sync.
  - Owner: Implementer.
  - Mitigation: verify association files in production and add real-device open-link smoke tests per platform.
- Risk: Push-token persistence depends on deploying the new `pushNotificationTokens` table in the target database.
  - Owner: Implementer.
  - Mitigation: added soft-fallback behavior and explicit warning logs; run `pnpm --filter @funtime/api db:push` in deployment pipeline before enabling push sends.
- Risk: Expo push endpoint/network failures can cause dropped message notifications without retries.
  - Owner: Implementer.
  - Mitigation: keep write-path non-blocking, add logging for failures, and schedule retry/backoff enhancements in later notification pipeline phase.
- Risk: Week-summary "morning after" timing currently uses a fixed UTC threshold and may need timezone/business-rule tuning.
  - Owner: Implementer.
  - Mitigation: validate behavior against expected league timing and adjust scheduling window or timezone basis in a follow-up iteration.
- Risk: `prisma migrate status` currently errors in this environment (`Schema engine error`), so DB migration state is not yet verified end-to-end.
  - Owner: Implementer.
  - Mitigation: rerun migrate status/deploy in target runtime with confirmed DB connectivity/credentials and resolve baseline if needed.

## Validation Evidence
- `2026-02-25T02:52:26Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T02:52:26Z`: `pnpm --filter @funtime/api typecheck` passed.
- `2026-02-25T02:52:26Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T02:53:24Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T02:53:24Z`: `pnpm --filter @funtime/api typecheck` passed.
- `2026-02-25T03:01:52Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:23:29Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:23:29Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T03:27:05Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:27:05Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T03:29:36Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:29:36Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T03:30:58Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:30:58Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T03:33:04Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:33:04Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T03:33:44Z`: `pnpm --filter @funtime/mobile add expo-notifications@~0.29.14` failed (`ENOTFOUND registry.npmjs.org`, pnpm store mismatch).
- `2026-02-25T03:35:32Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:35:32Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T03:38:38Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:38:38Z`: `pnpm --filter @funtime/api typecheck` passed.
- `2026-02-25T03:38:38Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T03:41:32Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:41:32Z`: `pnpm --filter @funtime/api typecheck` passed.
- `2026-02-25T03:41:32Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T03:43:37Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:43:37Z`: `pnpm --filter @funtime/api typecheck` passed.
- `2026-02-25T03:43:37Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T03:53:32Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:53:32Z`: `pnpm --filter @funtime/api typecheck` passed.
- `2026-02-25T03:53:32Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T03:55:38Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:56:23Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:57:20Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:57:54Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:58:24Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T03:58:24Z`: `pnpm --filter @funtime/api typecheck` passed.
- `2026-02-25T03:58:24Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T03:59:04Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T04:01:37Z`: `pnpm --filter @funtime/mobile add expo-notifications@~0.29.14` passed.
- `2026-02-25T04:04:26Z`: `pnpm --filter @funtime/api db:generate` passed.
- `2026-02-25T04:04:26Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T04:04:26Z`: `pnpm --filter @funtime/api typecheck` passed.
- `2026-02-25T04:04:26Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T04:07:02Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T04:07:02Z`: `pnpm --filter @funtime/api typecheck` passed.
- `2026-02-25T04:07:02Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T04:10:54Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T04:10:54Z`: `pnpm --filter @funtime/api typecheck` passed.
- `2026-02-25T04:10:54Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T04:22:01Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T04:22:01Z`: `pnpm --filter @funtime/api typecheck` passed.
- `2026-02-25T04:22:01Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T04:22:01Z`: `pnpm --filter @funtime/api db:migrate:status` failed (`Schema engine error`; DB connectivity/runtime issue to resolve outside sandbox).
- `2026-02-25T04:23:32Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T04:23:32Z`: `pnpm --filter @funtime/api typecheck` passed.
- `2026-02-25T04:23:32Z`: `pnpm --filter @funtime/web typecheck` passed.

## Parity Matrix Snapshot
| Area | Status | Notes |
|---|---|---|
| Auth/session | `in_progress` | Guard/bootstrap improvements done, route-group migration complete; deep-link QA remains. |
| Deep links | `in_progress` | Domain association endpoints and mobile route handling are in place; production app-id/cert values and device verification remain. |
| Home/nav leagues | `in_progress` | Functional baseline exists with join/create entry points; parity polish and IA refactor pending. |
| Join league | `in_progress` | Join-by-code flow implemented; deeper UX parity and on-device QA pending. |
| Create league | `in_progress` | Core create flow and policies implemented; parity polish and QA pending. |
| League week view | `in_progress` | Existing implementation with tiebreaker sort parity fix; broader parity behavior and UX consistency QA pending. |
| Pick submission | `in_progress` | Core flow exists; full parity and QA pending. |
| Leaderboard | `in_progress` | Present but parity verification/tie ranking QA pending. |
| Player/my profile | `in_progress` | Added league-scoped my profile tab plus leaderboard-to-player profile navigation; edit flows still pending. |
| Super Bowl picks | `in_progress` | Super Bowl tab + pick management shipped; parity polish and member-profile linking still pending. |
| Settings/profile | `in_progress` | Username update flow plus draft-sync edge-case fixes are shipped; notifications/preferences parity still pending. |
| Messaging persistent board | `done` | Mobile + web clients moved to league-wide message APIs with admin delete controls. |
| Notifications | `in_progress` | Token registration, preferences, message fanout, and week-summary scheduler are implemented; deployment + staging QA validation remain. |
| League admin | `in_progress` | Member management, pick editing, rename/broadcast, and email logs are shipped; remaining work is parity QA and polish. |
| Global admin | `in_progress` | Super-admin dashboard route, entry point, and key metric sections are shipped; final QA/polish remains. |
