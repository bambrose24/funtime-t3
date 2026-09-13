# Engineering priority list: website first, mobile release next

Updated September 12, 2026. Original audit: `aaa5f89c01aa46c0ea807b9daef2119d54839319`; latest execution starts from merged `main` at `5efc01a`.

This is the implementation backlog. The agreed delivery approach is **one focused PR at a time, strictly serial**, with behavior validation before advancing. Per-ticket status below records completed slices and remaining work; unmarked tickets remain **OPEN**. No automatic merge or deployment is authorized.

Evidence sources, and the finding-ID ranges each one owns:

- [Cross-platform audit, September 5](PRD_CROSS_PLATFORM_AUDIT_2026-09-05.md) — owns **F01–F25**, including the September 6 follow-up findings F22–F25.
- [Mobile audit, September 12](MOBILE_AUDIT_2026-09-12.md) — owns **F26–F35**, covering app initialization, the query/cache layer, launch experience, observability and mobile PRD parity. Its serial implementation queue is [below](#mobile-remediation-queue-september-12-audit).

## Recommendation

Fix the website's shared competitive rules before adding features. A polished pick screen cannot compensate for a commissioner bypassing kickoff, a league ignoring its selected deadline, duplicate picks affecting scores, or hidden predictions leaking through another endpoint. **WEB-01** and the WEB-02 implementation slices have merged. WEB-03a and WEB-04 have merged; continue **WEB-05** in focused slices while WEB-03 awaits the duplicate inventory/canonical-row decision. Keep the remaining WEB-02 policy inventory separate. These backend changes also make mobile safer to release.

For mobile, aim for a reliable player release, with basic commissioner workflows and a working web fallback for deferred tools. Do not wait for every chart, export and renewal-review detail to match web. Do require account isolation, dependable picks and auth, working invite links, deliberate notification behavior, a reproducible signed build, and the account/moderation flows needed for distribution.

Priority definitions: **P0** = fix first because existing integrity/privacy is at risk; **P1** = core reliability or public-mobile-release prerequisite; **P2** = worthwhile follow-up that should not hold the player release by itself. These are recommended priorities, not claims of an active production incident. Ordering within each table is intentional.

## Website queue

| Order | Ticket | Priority | Deliverable                                                          | Mobile dependency                             |
| ----- | ------ | -------- | -------------------------------------------------------------------- | --------------------------------------------- |
| 1     | WEB-01 | P0       | One enforced kickoff/override policy for every pick writer           | Required                                      |
| 2     | WEB-02 | P0       | Actual late-policy enforcement and honest apply-to-all outcomes      | Required                                      |
| 3     | WEB-03 | P0       | Valid, unique, retry-safe picks                                      | Required                                      |
| 4     | WEB-04 | P0       | API-level preseason prediction privacy                               | Required                                      |
| 5     | WEB-05 | P1       | Atomic league join and explicit late-join contest eligibility        | Required                                      |
| 6     | WEB-06 | P1       | Correct finalized winners after admin corrections                    | Required if correction tools remain available |
| 7     | WEB-07 | P1       | “No reminders” persists and is honored                               | Required                                      |
| 8     | WEB-08 | P1       | Cross-platform-safe renewal role updates                             | Required while renewal sending is exposed     |
| 9     | WEB-09 | P1       | Deterministic auth recovery and protected-link journeys              | Shared release validation                     |
| 10    | WEB-10 | P1       | Documented and verified season lifecycle                             | Shared release validation                     |
| 11    | WEB-11 | P1       | Independent email/push delivery tracking and explicit UTC scheduling | Required before enabling summary push         |
| 12    | WEB-12 | P2       | Consistent validation and username uniqueness                        | Shared improvement                            |
| 13    | WEB-13 | P2       | Useful notification settings and email-delivery history              | Shared preference API needed by mobile        |
| 14    | WEB-14 | P2       | Bounded chat history and accurate unread validation                  | Shared improvement; size-based release gate   |

### WEB-01 — Close the alternate admin kickoff bypass

**Status: DONE.** Merged as `40148de` / [PR #34](https://github.com/bambrose24/funtime-t3/pull/34); full browser/API CI passed on `9ce3f94`.

**Why / evidence:** F01. `picks.submitPicks` treats any admin override as exempt from kickoff filtering, unlike `league.admin.setPick`.

**Change:** extract shared authorization/lock evaluation used by both mutations. Validate actor, target member and league before writing. Ordinary admins cannot alter a game at or after its kickoff; only the existing super-admin identity gets that exemption. Preserve the supported super-admin correction path. Do not rely on disabling form controls, or remove an API input without checking older mobile callers.

**Start in:** `packages/api/server/api/routers/picks.ts`; `packages/api/server/api/routers/league/admin.ts`. Add a shared policy helper under `packages/api` rather than duplicating checks in web/native components.

**Done when:** direct router integration tests cover both writers for player/admin/super-admin, someone else's league, and before/equal/after kickoff with an injected clock. A started-game ordinary-admin request is rejected and the stored pick is unchanged. Extend web integrity/admin E2E to cover the user-facing denial.

### WEB-02 — Make league deadlines match selected policy

**Status: IN PROGRESS — implementation slices merged; policy inventory remains.** WEB-02a merged as `f5ba79a` / [PR #35](https://github.com/bambrose24/funtime-t3/pull/35), WEB-02b as `fd8a37f` / [PR #36](https://github.com/bambrose24/funtime-t3/pull/36), and WEB-02c as `1780d21` / [PR #37](https://github.com/bambrose24/funtime-t3/pull/37). Both clients consume named saved/skipped outcomes; PR #37 also fixes shared-fixture name and retry isolation in the web submit journey. Merge state verified September 7; this does not assert a newly checked CI result.

**Remaining decision task:** inventory legacy/null policy usage with read-only production evidence and decide compatibility/migration before treating WEB-02 as complete. Do not silently reinterpret existing leagues.

**Why / evidence:** F02. Clients expose a first-kickoff deadline, but submission only checks each game's timestamp.

**Change:** evaluate each target league's policy on the server. Recommended behavior: `close_at_first_game_start` freezes ordinary submissions/edits for that league/week at its earliest game kickoff; `allow_late_and_lock_after_start` leaves only unstarted games editable. Use the same eligibility response to display lock reasons on web and mobile. For apply-to-all, return explicit saved/skipped/failed outcomes per league and do not claim all leagues saved when some were excluded. Preserve draft selections when targets fail.

**Start in:** shared pick router; `league.weekToPick`; web `src/app/league/[leagueId]/pick/client-pick-page.tsx`; native `components/picks/ClientPickPage.tsx`.

**Decision needed:** define legacy `allow_late_whole_week`; do not silently reinterpret existing leagues. Recommended path is to stop offering it for new leagues, inventory affected leagues, and agree on explicit migration/compatibility behavior. Do not let it accidentally override the confirmed post-kickoff integrity rule.

**Done when:** a Thursday-start fixture proves Sunday games remain editable in one policy and locked in the other; mixed-policy apply-to-all reports exact outcomes; equal-to-kickoff and rescheduled game cases are tested. Depends on WEB-01.

### WEB-03 — Validate and deduplicate pick writes

**Status: IN PROGRESS — WEB-03a merged as `e238b42` / [PR #38](https://github.com/bambrose24/funtime-t3/pull/38).** Both writers validate matchup, season and tiebreaker score before writes. Bulk requests require every requested membership, nonempty picks/destinations and unique payload game IDs; unknown games reject the entire request. Scores use the existing 1–200 integer contract. Direct router/database cases cover invalid requests without writes or confirmation emails, and valid creates/edits.

**Remaining:** read-only duplicate inventory and canonical-row decision, uniqueness migration, concurrent/retry-safe writers, and explicit partial-week/multi-league failure contracts. This slice preserves partial-week submissions and does not claim database uniqueness or historical cleanup.

**Why / evidence:** F08. Invalid team/season combinations and duplicate member/game rows are possible.

**Change:** require every requested league membership; reject duplicate game IDs, missing games, winners outside home/away, cross-season games, invalid scores and scores on non-tiebreaker games. Enforce one pick per `(member_id, gid)` with a migration and an atomic upsert/write strategy used by both writers. Decide and document whether partial-week submission is supported; client completeness rules must not be the only enforcement. Keep single-member writes atomic and explicitly report multi-league partial outcomes.

**Start in:** shared pick routers; `packages/api/prisma/schema.prisma`; new reviewed migration. Integration tests need an isolated local database; pure schema tests are insufficient for races.

**Migration requirement:** first produce a read-only duplicate inventory, including null membership rows, conflicting winners/scores and affected standings. Agree on which rows are canonical before deleting or merging any historical data; do not choose one arbitrarily. Recompute affected results after cleanup. Roll out constraints/writers with compatibility for released clients.

**Done when:** two simultaneous submissions and two identical payload game entries cannot create extra rows; repeated updates keep one row; invalid payloads make no unintended writes; counts/standings do not inflate. Depends on WEB-01/02 for policy integration.

### WEB-04 — Enforce prediction privacy in the response

**Status: DONE — merged as `ce4e023` / [PR #39](https://github.com/bambrose24/funtime-t3/pull/39).** The profile and public board share the scheduled-first-kickoff reveal rule used by owner editing. Before kickoff (or without a schedule), profiles return an empty opponent prediction array plus an explicit hidden flag; the board keeps its null-field redaction. Owners retain their own prediction, and the separately authorized commissioner review retains full access. Stale league status cannot reveal preseason opponents. Profile responses project only fields used by current clients; mobile distinguishes hidden from missing predictions.

**Validation:** 94 API/database tests, 7 API unit tests, 3 native component tests, all platform typechecks and all 25 browser E2E tests passed locally.

**Scope boundary:** no season-state migration or account-cache purge. Previously downloaded data is outside server response redaction; native tests verify a refreshed redacted response replaces displayed prediction details. Broader account/cache isolation remains MOB-01.

**Why / evidence:** F03. The profile endpoint returns hidden Super Bowl fields even when web hides its section.

**Change:** use an explicit profile response projection and one preseason visibility helper across profile and board endpoints. Return no opponent winner/loser/score before the agreed reveal time. Preserve own prediction visibility and the separately authorized commissioner review. Update mobile's profile renderer to understand redacted data. Avoid serializing unnecessary member/person fields alongside the fix.

**Start in:** `playerProfileRouter.ts`; `league/index.ts` (`superbowlPicks`); both member-profile components. Coordinate reveal-time definition with WEB-10 without delaying the privacy fix.

**Done when:** player A cannot retrieve player B's prediction from either endpoint before kickoff, including server-rendered page data; A can still edit/view their own prediction; authorized commissioner review works. Verify the same state after a mobile cache refresh. Can proceed independently of WEB-01–03.

### WEB-05 — Make joining atomic and settle late-join Super Bowl eligibility

**Status: IN PROGRESS — WEB-05a implemented, awaiting review on `codex/web-05-atomic-registration`.** Membership and any supplied Super Bowl prediction are written in one database transaction. A prediction insertion failure rolls back the membership, allowing a corrected retry. Welcome email runs after commit; delivery exceptions are logged and do not turn a successful join into an API failure. Existing renewal-role selection is preserved.

**Validation:** 104 API/database tests (10 new cases; 3 reproduced pre-fix failures), 7 API unit tests, all platform typechecks and all 25 full local browser tests passed.

**Remaining:** duplicate inventories and reviewed membership/prediction uniqueness migrations; concurrency-safe/idempotent retries after a successful join; shared team/score validation; explicit late-join and historical-league eligibility decisions and client messaging. Current duplicate-member rejection and eligibility rules remain. Welcome retry/delivery tracking is separate WEB-11 work. WEB-05a does not claim to prevent concurrent duplicate memberships.

**Why / evidence:** F09/F10. Registration writes membership before the prediction; registration has no season-start prediction lock and no membership unique constraint.

**Change:** add reviewed league/user uniqueness after a duplicate inventory, create membership plus required prediction in one transaction, and separate welcome-email delivery from successful registration. Make retry return the existing successful membership rather than an ambiguous failure. Validate distinct legitimate teams and a shared score range. Add a unique membership constraint for Super Bowl predictions after checking existing rows.

**Recommended product decision:** allow joining an active league for upcoming weekly games, but mark the member ineligible to submit a preseason Super Bowl prediction after the deadline. Explain this before joining. Closed historical leagues should not accept ordinary new registrations. This changes the PRD's unconditional join-time requirement and needs an explicit product decision before implementation; do not silently implement it as settled behavior.

**Start in:** `league.register`, `member.updateOrCreateSuperbowlPick`, Prisma schema/migrations, both join screens. Consider creator onboarding: a league creator is auto-added without going through join-time prediction capture.

**Done when:** failure inserting a prediction leaves no partial membership; concurrent joins yield one membership; email failure does not make joining fail; accepted late-join policy works at the exact boundary on both clients. Preserve renewal roles. Depends on WEB-04 and agreed eligibility policy.

### WEB-06 — Recompute results after corrections

**Why / evidence:** F07. Existing weekly winner records are skipped by cron even after pick totals change.

**Change:** extract an idempotent league/week recalculation service that updates correctness and replaces the authoritative winner set transactionally. Invoke it after a final-game super-admin correction and from scoring automation. Support the affected league's actual season, not only `DEFAULT_SEASON`; invalidate relevant leaderboard/profile caches. Record who corrected what and when. Do not automatically resend old summaries until a correction-notification policy exists.

**Start in:** `league.admin.setPick`; `apps/web/src/cron/index.ts`; new shared scoring service. Verify upstream score-correction handling too: finalized games currently skip score sync.

**Done when:** changing a finalized result moves all weekly banners, profile wins and leaderboard totals to the same outcome; ties and prior seasons work; two recalculations yield identical results; failed recalculation does not leave a partial winner set. Depends on WEB-03's uniqueness assumptions.

### WEB-07 — Persist “No reminders” rather than restoring the default

**Why / evidence:** new F22. Both create screens omit `reminderPolicy` when “none” is selected. The API defaults omission to `three_hours_before`; the Prisma enum contains only that value and the field is nullable. Renewing a no-reminder league is affected too.

**Change:** represent “no reminder” explicitly in the API and database contract. A reasonable compatible design is an API `none` value mapped to database null, while omission retains the default for older clients. Send the explicit value from both screens and preserve it during renewal prefill. Make displays and cron agree with stored state.

**Start in:** `league.create` input/data mapping; web `league/create/schema.ts` and `client-page.tsx`; mobile `app/league/create.tsx` and `lib/league/createLeagueForm.ts`; cron reminder selection.

**Done when:** create and renew with each setting, read it back, and exercise a fake-provider reminder job: disabled leagues produce zero reminders, enabled leagues remain eligible. No production emails during tests.

### WEB-08 — Preserve intended renewal roles across clients and retries

**Why / evidence:** F11. Omitted `adminMemberIds` currently means “clear selected promotions”; mobile omits it.

**Change:** distinguish unspecified role changes from explicit assignments. Prefer per-member optional role patches, or preserve stored roles when the legacy role array is absent. Keep existing web inputs compatible. Persist role intent independently of provider success, expose the intended role in previews, and make successful/failed/already-joined outcomes visible. Prior-admin retention must remain deliberate, not an accidental exception.

**Start in:** `league/admin.ts` (`sendRenewalInvites`, preview builder), web renewal manager, mobile renewal manager.

**Done when:** web promotes a returning player, sending fails, legacy/mobile retry omits roles, and the player still joins as admin. Test explicit role changes, non-admin denials and successful-send duplicate prevention. Ship the server compatibility fix before a mobile UI update.

### WEB-09 — Prove recovery and destination restoration end to end

**Why / evidence:** existing worklog lists recovery as uncovered; account access is part of the core loop.

**Change:** add local Supabase recovery-link capture to the E2E harness and test request → callback/session → new password → login. Test protected join/league links through login and onboarding, including query context. Repair only failures found; route presence alone is not a reason to rewrite auth.

**Start in:** `apps/web/src/app/(auth)`, existing `apps/web/e2e/auth`, local E2E helpers. No external email delivery.

**Done when:** valid, expired and reused recovery links have explicit outcomes; old/new password expectations are verified; original league/week destination survives sign-in. Record a fresh full web E2E baseline after the earlier behavior fixes.

### WEB-10 — Establish one authoritative season lifecycle

**Why / evidence:** F14. Started/completed definitions differ; repository lacks an identified normal active-state writer.

**Change:** first inspect/document the actual environment's state owner through read-only inspection; check for external jobs/triggers before adding another. Specify state transitions, postseason visibility, completion, and rollover. Use one shared derivation/service for client eligibility and visibility. Require all relevant games to be final before completion; retain or change the one-month delay only by a documented product decision.

**Start in:** cron, `league.hasStarted`, `league.superbowlPicks`, leaderboard, `utils/seasonRenewal.ts`, PRD. Do not infer production state solely from fixtures.

**Done when:** fixtures cover preseason, first kickoff, postponed unfinished game, regular-season final, postseason and next-season rollover. Screens agree on the expected state. Any external prerequisite has a named owner and verification evidence.

### WEB-11 — Separate notification delivery from scoring and channel success

**Why / evidence:** F15/F16/F19. Push eligibility depends on email logs, timezone is implicit, and HTTP acceptance is counted as delivery success.

**Change:** use independent member/league/week/channel delivery records with concurrency-safe claiming, retry status and provider IDs. Keep email logs as history rather than the push gate. Make UTC calculation explicit. Parse Expo per-token tickets and process receipts; retire invalid tokens. Keep notification exceptions from altering a completed scoring/message transaction. Define “accepted” versus “delivered” accurately.

**Start in:** shared Resend/Expo services, cron, schema/migrations. Reuse existing email delivery-event support rather than replacing it.

**Done when:** email-success/push-failure and the reverse retry only the failed channel; overlapping jobs do not double-send; clocks in UTC and America/New_York yield the agreed same instant; fake provider token errors are visible. Decide retry horizon for summaries. Required before mobile summary notifications are treated as reliable.

### WEB-12 — Align validation and enforce username uniqueness

**Change:** share league-name and score schemas; recommended ranges are the existing create contract (5–100) and API pick score contract (1–200 inclusive). Require admin score edits to refer to the tiebreaker. Define username trim/case normalization, inventory conflicts, and add database-backed uniqueness with a useful conflict response. Do not rename existing users automatically.

**Start in:** F20/F21 source locations; `packages/api/utils/schemas`, schema/migrations and both clients' forms.

**Done when:** boundary tests agree across create/edit/web/mobile; concurrent username claims yield one winner and one conflict. Split validation and username migration into separate small PRs if helpful.

### WEB-13 — Replace empty settings and expose delivery outcomes

**Change:** make web notification settings manage the same durable preference as MOB-02. Do not add browser push just to match a toggle. Return stored delivery status/failure reason from `memberEmails`; label unknown/provider-unavailable outcomes honestly in both clients. Link failed renewal delivery to a deliberate retry workflow, not unrestricted re-sending.

**Start in:** `apps/web/src/app/settings/notifications/page.tsx`, shared settings/member-history endpoints, web `MemberEmailLogs`, mobile `admin-emails.tsx`.

**Done when:** web opt-out survives native registration; webhook-derived failure remains visible even if live provider content cannot load; only league admins can inspect history. Depends on MOB-02/WEB-11 contracts.

### WEB-14 — Bound chat payloads and verify cross-device unread state

**Change:** add cursor pagination and incremental new-message fetch by `(createdAt, message_id)`; support old mobile callers during rollout. Avoid fetching all author fields. Preserve the monotonic read cursor, only advance through actually viewed messages, and keep league-specific badges capped at 99+. Add server-side message operation idempotency with MOB-03.

**Start in:** messages router, `LeagueChat`, `LeagueMessageBoard`, unread hooks. F17/F18 and the existing Chat worklog gaps.

**Done when:** a 10,000-message fixture loads a bounded initial page, older pages have no duplicates/holes, posting does not snap a reader out of history, and two clients agree on unread state. If a representative release league cannot meet a usable load budget, promote pagination to P1 before release; otherwise it can follow the first player release.

## Mobile release queue

Public release means an App Store/Google Play release, not just a development build. Store/configuration observations below identify work to verify; this audit did not inspect developer-console settings or signed artifacts. Do not assume a missing checked-in file proves a remote build configuration is absent.

| Order | Ticket | Priority | Release condition                                               |
| ----- | ------ | -------- | --------------------------------------------------------------- |
| 1     | MOB-01 | P0       | No prior-account data or pushes after logout/account switch     |
| 2     | MOB-02 | P1       | Explicit notification preference survives registration/restart  |
| 3     | MOB-03 | P1       | No duplicate actions or misleading saves on bad networks        |
| 4     | MOB-04 | P1       | Working invite, recovery and contextual links on devices        |
| 5     | MOB-05 | P1       | Reproducible, correctly identified/signed release builds        |
| 6     | MOB-06 | P1       | Account deletion and accessible privacy/support surfaces        |
| 7     | MOB-07 | P1       | Appropriate moderation/report/block flows for shipped Chat      |
| 8     | MOB-08 | P1       | Complete core-player device test gate and release evidence      |
| 9     | MOB-09 | P1/P2    | Safe renewal functionality now; richer commissioner parity next |
| 10    | MOB-10 | P2       | Exports, visual parity and optional additions after launch      |

### MOB-01 — Clear account data and revoke device association

**Change:** cancel account-bound requests, remove private in-memory/persisted query data and pending mutations on identity change, and isolate persistence by user. Purge caches on invalid-session recovery as well as explicit logout. Revoke this installation's token association before ending its session; preserve other devices. Define offline logout behavior: local deletion is immediate, and server token revocation needs a reliable design rather than a promise that cannot be fulfilled offline. Prevent the previous account's paused mutations from resuming as the next account.

**Start in:** `apps/mobile/lib/trpc/react.tsx`, `create-query-client.ts`, `hooks/useAuthHandler.ts`, account screen; shared settings needs a current-device unregister operation. F04/F06. The unused persistence helper is not the active integration point.

**Done when:** A signs out, B signs in, app restarts offline, and no A session, league, message or queued action appears. A's other device still receives pushes; the logged-out installation does not after successful revocation. Test invalid refresh token and logout request failure. API checks remain required even with cleared local state.

### MOB-02 — Preserve opt-out and separate account preference from tokens

**Change:** store durable user preference independently from token availability, optionally with explicit device overrides. Registration updates ownership/platform/last-seen without setting preference back on. Fanout requires enabled preference and an eligible token. Explain OS-denied versus in-app-disabled versus unavailable registration. Ask for notification permission with useful context rather than making it an unexplained startup interruption.

**Start in:** shared `settings.ts`, Expo fanout, `usePushNotificationRegistration`, account UI. F05; WEB-13 consumes this same contract.

**Done when:** disable, restart, re-login, change token and add another device: no pushes until deliberate re-enable. Test zero tokens and denied OS permission. Existing token state needs a conservative migration plan so disabled users are not silently opted back in.

### MOB-03 — Make poor-network behavior safe for picks and Chat

**Change:** stop global automatic retries for non-idempotent mutations until each has a safe operation contract. Use client operation IDs for posts/create-like writes and keep the same ID across retry. For picks, show saving/confirmed/error states and actual per-league outcomes; server clock/deadline remains authoritative. Revalidate queued picks on reconnect. Recommended v1 behavior: allow cached reading, preserve unsent drafts, and never label an offline or unacknowledged pick “submitted.”

**Start in:** query-client defaults, `ClientPickPage`, `LeagueMessageBoard`, shared writers. F18; depends on WEB-01–03.

**Done when:** inject response loss after server commit, disconnect during save, reconnect after kickoff, and retry: no duplicate message/league/pick and no false success. Account switch discards the prior user's pending work. Keep retry errors actionable rather than clearing the draft.

### MOB-04 — Finish native route mapping and auth-link handling

**Change:** enumerate web routes and map them to existing native screens or an explicit supported web fallback. Fix same-path/different-query early return. Route notification taps and shared URLs through a consistent context-preserving approach; validate destinations rather than accepting arbitrary league suffixes. Prevent a web fallback from reopening the same app-link loop. Keep pending destination through login, signup and recovery.

**Start in:** `lib/deeplink/resolveDeepLink.ts`, `useAuthHandler`, push tap handler, route tests, web association endpoints. F12/F13.

**Done when:** real installed iOS/Android builds handle join, league/week, Chat, leaderboard, own/member profile, settings and admin destinations cold/warm and signed-in/out. Missing/unauthorized destinations give a useful outcome. Verify actual domain association IDs and Android release-signing fingerprints against artifacts—not only app configuration.

### MOB-05 — Establish the production build and update contract

**Why / evidence:** new F23. `app.json` names the app `mobile`, has no explicit iOS bundle identifier, and uses version `1.0.0` with app-version/fixed runtime policy. No `eas.json` was found. Checked-in Android release signing uses the debug signing configuration; native display name is also `mobile`. Existing remote credentials/configuration may exist but were not inspected.

**Change:** verify ownership of the existing EAS project/store identities first. Set the public name to Funtime, retain intended package identity, and record the real iOS bundle identifier. Add reproducible preview/production build profiles (EAS or documented equivalent), release signing, build-number progression, production API configuration, and update-channel separation. Keep private signing material out of the repository. Do not regenerate identifiers or credentials just because local configuration is incomplete.

**Update requirement:** define native compatibility rules for OTA releases; a native dependency change must use a compatible new runtime/binary rather than reusing a fixed runtime accidentally. Document rollback, diagnostics and owner. Replace the starter README with install/build/release instructions using the repo's package manager.

**Done when:** a clean checkout produces a release artifact with correct name, app IDs, endpoint, signing and update channel; installation runs without Metro/dev launcher; update compatibility and recovery are tested. Decide iPad support deliberately (`supportsTablet: true` currently advertises it), and test it if retained. No build or submission was performed by this audit.

### MOB-06 — Add account deletion and release privacy/support paths

**Why / evidence:** new F24. No deletion route/mutation or native deletion action was found. The app supports account creation. Apple requires in-app initiation of deletion; Google Play also requires a discoverable external deletion-request resource for applicable apps. [Apple account deletion guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app/), [Google Play account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).

**Change:** add an authenticated, confirmed deletion-request flow in account settings and a working web request route. Reauthenticate where appropriate; make asynchronous completion/retry explicit. Cover Supabase auth, people/profile, device tokens and related records. Decide retained/anonymized league history and commissioner ownership transfer before destructive implementation: current league creator relation is restrictive, while other relations cascade. Do not blindly cascade league history or block sole admins permanently from deletion. Publish accessible privacy/support pages and link them in-app and in store metadata; inventory actual Supabase/Expo/PostHog/Resend data use before filling disclosures.

**Start in:** account screen, auth/settings routers, Prisma relationship inventory; new web privacy/support/deletion routes. Verify whether externally hosted pages already exist before creating replacements.

**Done when:** ordinary member and sole-commissioner cases can initiate and complete the agreed deletion flow; unauthorized deletion fails; tokens/sessions are revoked and failure is retryable. Product approves retention/ownership rules and disclosures. This is public-release work, not optional feature parity; it upgrades the original audit's lower-priority account-deletion suggestion.

### MOB-07 — Complete moderation for the Chat experience being shipped

**Why / evidence:** new F25. Existing API/client supports own/admin delete but no report, user-block or content-filter workflow was found. Apple UGC guidance calls for filtering, reporting with timely response, blocking and contact information; Google Play also describes ongoing moderation and report/block requirements. [Apple §1.2](https://developer.apple.com/app-store/review/guidelines/#user-generated-content), [Google Play UGC policy](https://support.google.com/googleplay/android-developer/answer/9876937?hl=en). Private leagues should not be assumed exempt.

**Change:** add report-message/report-user actions, server-backed reports, block-user behavior, content handling and a named moderation owner. Define how blocking affects thread rendering and push previews; enforce it in fanout as well as the UI. Keep existing commissioner deletion, provide support contact and community terms, and decide escalation/response expectations. Apply shared moderation state to web too. Choose the exact filtering/moderation design deliberately; a word filter alone is not a complete workflow.

**Start in:** shared messages API/schema, both Chat components, push fanout and an operator report-review surface. Scope the response workflow before collecting reports nobody can act on.

**Done when:** an ordinary user can report/block, reports reach an authorized reviewer, abusive content can be removed, blocked authors' notification previews are suppressed according to policy, and no cross-league report access leaks. Keep a reviewable evidence set for the shipped functionality. Store guidance is a release dependency, not a guarantee of review approval.

### MOB-08 — Establish a release gate for the actual app

**Change:** add automated coverage around the fixed shared APIs plus native core flows; make fast mobile tests/typecheck part of PR validation. Keep device E2E scoped enough to be useful; existing Android scheduled/manual signup/create/pick smoke is not complete release evidence. Record OS/device/build/runtime, test accounts/fixtures and results for the release candidate. Use staging/local fixtures for writes and provider tests.

**Required journeys:** signup confirmation; password recovery; join with contest eligibility; weekly picks/edit/apply-to-all around kickoff; leaderboard and other-player privacy; Chat/unread/report/block; sign-out/account switch; push opt-out/tap; account deletion. Exercise background/resume, offline/reconnect, denied permissions, small screens, keyboard obstruction, text scaling and screen-reader names for primary actions. Include one physical iOS device and one physical Android device for OS-specific links/notifications, plus supported tablet validation if retained.

**Start in:** native Jest/route tests, `apps/mobile/e2e/flows`, `.github/workflows/mobile-e2e-supabase.yml`, testing docs. Provide a stable reviewer/demo league with usable data and credentials through the appropriate private review channel, not committed secrets.

**Done when:** the agreed release-candidate matrix passes and failures have owners; all required migrations/configuration are verified in the target environment; clean install/update paths work; remaining P2 gaps are explicit. Existing checks passing is only a baseline: prior audit ran 7 API tests, 52 mobile tests and 3 typechecks; they were not rerun for this documentation-only follow-up.

### MOB-09 — Keep commissioners effective without delaying player release

**P1 portion:** finish safe renewal sending with WEB-08, preserve/display intended next-season roles, handle preview errors instead of infinite loading, and label create-then-review accurately (recommended “Create League & Review Invites”). If a tool remains web-only, provide an authorized working web path and test return-to-app behavior.

**P2 portion:** add native unredacted commissioner Super Bowl review using `league.admin.superbowlPicks`; add missed-pick/already-invited context and richer pre-create renewal review. Native full parity is preferable, but a tested web fallback is sufficient for the first player release if product accepts that scope. Missing a native commissioner screen must not weaken player prediction privacy.

**Start in:** `app/league/create.tsx`, `app/league/[id]/renewal-invites.tsx`, `admin.tsx`, a new admin review screen if chosen. F11/P01/P02/P06.

**Done when:** commissioner can finish the advertised workflow, failed recipients remain manageable, role assignment survives both clients, and no exposed control dead-ends. Role/permission failures have an explicit message and back/retry action.

### MOB-10 — Defer low-risk polish and extensions

After release prerequisites: named CSV file sharing, richer charts/postseason presentation, additional home search parity, animations, more granular notification categories, and push pick reminders if adopted by the PRD. Prioritize real player feedback over making every screen structurally identical to web. Maintain the current non-goals: do not add payments, public leagues or new scoring systems as part of launch preparation.

## Mobile remediation queue (September 12 audit)

Evidence: [the mobile audit](MOBILE_AUDIT_2026-09-12.md), findings F26–F35, plus the still-open mobile findings it re-verified.

MOB-01 through MOB-10 above remain the release epics and keep their IDs and release conditions. The slices below are the PR-sized units of work. Slices of an existing epic keep its number with a letter suffix, following the `WEB-02a`/`WEB-02b` precedent. New epics start at MOB-11. Every slice names its own test layer rather than defaulting to end-to-end; use the decision table in [Testing Strategy](TESTING_STRATEGY.md#choosing-the-test-layer-agreed-september-6-2026).

**Execute this table top to bottom, one PR at a time.** The order is chosen so each slice lands before anything that shares its files, which keeps rebases small and keeps a behavioral fix from colliding with a refactor. Do not reorder without recording the reason.

| Order | Slice   | Priority | Deliverable                                                               | Test layer                    |
| ----- | ------- | -------- | ------------------------------------------------------------------------- | ----------------------------- |
| 1     | MOB-13a | P3       | Hook hygiene warm-up; unblocks `_layout.tsx` and `home.tsx`               | Existing checks only          |
| 2     | MOB-01a | P0       | Purge account-scoped cache and revoke this device's token on identity change | Mobile unit + API integration |
| 3     | MOB-03a | P1       | One honest mutation retry and persistence contract                        | Mobile unit                   |
| 4     | MOB-11a | P1       | Targeted invalidation instead of invalidate-everything                    | Component + unit              |
| 5     | MOB-02a | P1       | Durable push preference, independent of token rows                        | API integration + migration   |
| 6     | MOB-02b | P1       | Notification permission and preference UX                                 | Component + device record     |
| 7     | MOB-14a | P1       | Home weekly-status league list (PRD §7.2 parity)                          | Component                     |
| 8     | WEB-12a | P2       | Inclusive 1–200 tiebreaker bound on both clients                          | API integration + unit        |
| 9     | MOB-15a | P1       | Live kickoff locks and a real closed-week state on the pick page          | Mobile unit + component       |
| 10    | MOB-04a | P1       | One validated resolver for links and notification taps                    | Mobile unit                   |
| 11    | MOB-04b | P1       | Route inventory with an explicit web fallback                             | Mobile unit + device record   |
| 12    | WEB-15  | P1       | Stop returning peer email addresses from the member profile               | API integration + component   |
| 13    | MOB-12a | P2       | Hold the splash screen through initialization                             | Mobile unit                   |
| 14    | MOB-12b | P2       | Root error boundary and crash reporting                                   | Component                     |
| 15    | MOB-12c | P2       | Analytics identity and a deliberate session-replay decision               | Mobile unit                   |
| 16    | WEB-14a | P1       | Cursor-paginate the league message board                                  | API integration               |
| 17    | MOB-03c | P2       | Chat client: incremental fetch, optimistic send, honest copy               | Component                     |
| 18    | MOB-13b | P3       | Split the 1,849-line league screen; deliberately last                     | Existing checks only          |

**Current position:** **MOB-15a** in progress (mobile-only). **MOB-14a** merged (#49). **WEB-12a** deferred from auto-merge (touches `apps/web`). **MOB-02a / MOB-02b** still deferred (shared schema). Update this line when a slice starts or merges.

MOB-05 (build and signing), MOB-06 (account deletion) and MOB-07 (chat moderation) are not in this queue because they need product decisions and have long external lead times. They remain public-release prerequisites; start their decisions in parallel with this queue even though their implementation is serial with it.

### File ownership and ordering constraints

The order above exists because these files are touched by more than one slice. A later slice must rebase onto the earlier one, never the reverse.

| File or area                                        | Slices that touch it                     | Ordering constraint                                                           |
| --------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------- |
| `lib/trpc/react.tsx`, `lib/trpc/create-query-client.ts` | MOB-01a, MOB-03a, MOB-11a, MOB-12a       | In that order. This is the app's highest-traffic shared file pair.            |
| `app/_layout.tsx`                                   | MOB-13a, MOB-01a, MOB-12a, MOB-12b       | MOB-13a first, so later slices do not inherit the conditional hook calls.    |
| `app/(tabs)/home.tsx`                               | MOB-13a, MOB-14a                         | MOB-13a first; it is small and removes a hook-order hazard.                   |
| `app/(tabs)/account.tsx`                            | MOB-01a, MOB-02b                         | MOB-01a owns `signOut`; MOB-02b then owns the notification toggle.            |
| `components/picks/ClientPickPage.tsx`               | WEB-12a, MOB-15a                         | WEB-12a's bound change first, or fold it into MOB-15a and close both.         |
| `components/messages/LeagueMessageBoard.tsx`        | MOB-11a, MOB-03c                         | MOB-11a adjusts polling; MOB-03c then rewrites the fetch strategy.            |
| `app/league/[id]/index.tsx`                         | MOB-13b                                  | Last. Any behavioral fix in this file lands before the split.                 |

### MOB-13a — Hook hygiene warm-up

**Priority: P3. Fixes: F31 (partial).**

**Change:** make `useCacheDebugger` and `useDataAvailabilityTracker` unconditional calls that no-op internally when `!__DEV__`, removing the two `if (__DEV__)` hook call sites. Delete the `useIsomorphicLayoutEffect` indirection in `_layout.tsx`, whose branches both resolve to `useEffect`. Do not touch `lib/trpc/cache-persistence.ts`; MOB-01a deletes it as part of the real fix, and deleting it here would imply F04 was addressed.

**Start in:** `apps/mobile/app/_layout.tsx`, `apps/mobile/app/(tabs)/home.tsx`, `apps/mobile/hooks/useCacheDebugger.ts`.

**Test layer:** none new. This is the behavior-preserving-refactor row of the testing-strategy table, and a new test here would only mirror the implementation. Evidence is mobile typecheck, the existing suite, and `expo lint`.

**Done when:** no conditional hook call sites remain in the app tree; lint, typecheck and the existing suite are green; the diff contains no behavior change.

### MOB-01a — Purge account-scoped cache and revoke the device token on identity change

**Priority: P0. Fixes: F26, F04, F06.**

**Change:** add `lib/auth/identitySession.ts` exporting a pure `resolveIdentityTransition(previousUid, nextUid)` and an effectful `purgeAccountScopedCache({ queryClient, persister })` that cancels in-flight queries, clears the `QueryClient`, and removes the persisted cache entry. Drive both from one owner — the `onAuthStateChange` handler in `useAuthHandler` — keyed on the Supabase user id so it fires on `SIGNED_OUT`, on an A-to-B switch, and on `clearPersistedSupabaseSession` recovery. Add a `settings.unregisterPushToken({ token })` mutation and call it on explicit sign-out before `supabase.auth.signOut()`, scoped to this installation's token only so other signed-in devices keep working. Delete `lib/trpc/cache-persistence.ts` and remove the `setTimeout(() => utils.invalidate(), 100)` in the login screen.

Prefer clearing on transition over namespacing the persister key by user id: it is simpler and leaves no stale per-user keys behind. Define offline sign-out explicitly — the local purge is immediate and unconditional, while server revocation is best-effort and retried on the next authenticated request rather than promised offline.

**Start in:** `apps/mobile/lib/auth/identitySession.ts` (new), `lib/trpc/react.tsx`, `hooks/useAuthHandler.ts`, `app/(tabs)/account.tsx`, `app/(auth)/auth.tsx`, delete `lib/trpc/cache-persistence.ts`; `packages/api/server/api/routers/settings.ts`.

**Test layer:** mobile unit plus API integration.

- `apps/mobile/tests/auth/identitySession.test.ts`: the transition matrix (null→A, A→A, A→B, A→null), and a real `QueryClient` seeded with data proving `clear()` empties it and the AsyncStorage key is removed. The AsyncStorage package ships a Jest mock; no new harness framework is required.
- `packages/api/tests/integration/push-token-lifecycle.test.ts`: unregister disables only the calling device's token, leaves the same user's other tokens enabled, and rejects another user's token.
- Remove the `!<rootDir>/lib/trpc/**/*` exclusion from `jest.config.js` `collectCoverageFrom`, since this becomes tested code.

**Design requirement:** the purge and transition logic must be pure and injectable. The audit's coverage-limitations section explains why: nothing touching the query client is currently testable, and inlining this logic in a component would keep it that way.

**Done when:** an A-to-B transition leaves zero A-scoped queries in memory or in storage; sign-out revokes this device's token and leaves other devices enabled; invalid-refresh-token recovery takes the same purge path; a sign-out whose revocation request fails still purges locally and surfaces a retryable state.

### MOB-03a — One honest mutation retry and persistence contract

**Priority: P1. Fixes: F27, F18.**

**Change:** stop persisting mutations (`shouldDehydrateMutation: () => false`) and remove the `resumePausedMutations()` call that no registered mutation default can satisfy. Set `mutations.retry: 0` so no non-idempotent write is retried automatically. Set `mutations.networkMode: "online"` so an offline write fails fast with an actionable error instead of pausing invisibly, while queries keep `offlineFirst` so cached reading still works. Record that offline write queueing is unsupported in v1; client operation IDs for genuinely queueable writes are a later slice under MOB-03, not this one.

**Start in:** `apps/mobile/lib/trpc/create-query-client.ts`, `lib/trpc/react.tsx`.

**Test layer:** mobile unit — `apps/mobile/tests/trpc/queryClientDefaults.test.ts` asserting mutation defaults are `retry: 0` and `networkMode: "online"`, query defaults keep `offlineFirst`, and a dehydrated client contains no mutations.

**Done when:** no mutation survives a restart in a resumable-looking state; a failed write surfaces an error rather than pausing silently; the unsupported-offline-write decision is written down.

### MOB-11a — Targeted invalidation instead of invalidate-everything

**Priority: P1. Fixes: F28.**

**Change:** remove the app-wide `MutationCache` `onSettled` invalidation. Audit every `useMutation` call site and give each one explicit invalidations; most screens already do their own, so the blanket handler is mostly redundant work. Explicitly exempt `messages.markRead`, so a read receipt can no longer refetch the app. Collapse the duplicated ten-second polling: derive unread state from the message-board query while a thread is open, or lengthen the `unreadCounts` interval in that case.

**Start in:** `apps/mobile/lib/trpc/create-query-client.ts`, `hooks/useLeagueUnreadMessages.ts`, `components/messages/LeagueMessageBoard.tsx`, and every `useMutation` caller that relied on the global handler.

**Test layer:** component plus unit. A component test with a mocked tRPC provider asserting `markRead` causes no message-board refetch, and that sending a message invalidates the board and unread counts only. A unit assertion that the query client registers no global `onSettled`. A grep-derived inventory of call sites is not sufficient evidence on its own.

**Done when:** an incoming chat message no longer refetches unrelated queries, each mutation's invalidation set is explicit in code, and one open thread requires one poll rather than two.

### MOB-02a — Durable push preference, independent of token rows

**Priority: P1. Fixes: F05. Consumed by WEB-13.**

**Change:** store the notification preference on the account rather than inferring it from token rows, with a reviewed migration that defaults existing users conservatively so anyone currently disabled stays disabled. `registerPushToken` stops writing `enabled: true` on its update branch and may only refresh ownership, platform and `last_seen_at`. Fanout requires both an enabled account preference and an eligible token. `pushNotificationStatus` returns preference, token count and a reason so clients can distinguish OS-denied from in-app-disabled from storage-unavailable.

**Start in:** `packages/api/prisma/schema.prisma` and a new migration, `server/api/routers/settings.ts`, `server/services/expo-push/index.ts`.

**Test layer:** API integration plus migration evidence — `packages/api/tests/integration/push-preference.test.ts`: disable, then re-register the same token and a new token, and assert the preference stays off; fanout selects nobody while disabled; zero-token and denied-permission response shapes. Per delivery rule 4, include a read-only inventory of current token rows in the PR before the migration runs.

**Done when:** a disabled user receives no pushes across restart, re-login, token change and a second device, until they deliberately re-enable.

### MOB-02b — Notification permission and preference UX

**Priority: P1. Fixes: F05 (client half). Depends on MOB-02a and MOB-01a.**

**Change:** request OS notification permission with context at a meaningful moment rather than as an unexplained interruption during the first authenticated launch. Bind the account toggle to the durable preference so it is controllable with zero registered tokens; today `canTogglePushNotifications` disables the switch unless a token exists, which makes the setting unreachable in exactly the state a user wants to fix. Distinguish OS-denied, in-app-disabled and storage-unavailable in the copy, and offer a route to OS settings when denied.

**Start in:** `apps/mobile/hooks/usePushNotificationRegistration.ts`, `app/(tabs)/account.tsx`.

**Test layer:** component, plus a recorded device check. The component test covers the toggle reflecting a durable preference with zero tokens and each unavailable state rendering its own guidance. The actual OS prompt is verified on a device under MOB-08 and must not be claimed from the component test.

**Done when:** the preference is controllable without a token, permission is requested with context, and each state has honest copy.

### MOB-14a — Home weekly-status league list

**Priority: P1. Fixes the PRD §7.2 parity and ordering gaps.**

**Change:** switch home from `home.summary` to the existing `home.leagues`, which already returns `weeklyStatus` and the PRD ordering (season descending, name ascending, league id). No API work is required; web already consumes it. Render per-league status with the week named: **Picks are in** with **View picks**, **Picks needed** with **Make picks**, and **Picks not submitted · Closed** with no action once picking closed. Show preseason or season-over context when no week is available. Remove all partial-progress language and the in-season **Create League** shortcut, keeping **Join**. Refresh on screen focus and on an interval while visible; a failed refresh shows unavailable status with retry rather than implying picks are in.

**Start in:** `apps/mobile/app/(tabs)/home.tsx`, `components/home/HomeLeagueCard.tsx`, `lib/home/getSingleActiveLeague.ts`, and `docs/PRD.md` for the auto-open sentence.

**Test layer:** component — `apps/mobile/tests/home/HomeLeagueList.test.tsx` covering submitted, needed, closed, no-week and status-unavailable states, and asserting no partial-progress copy renders. Reuse the shared `getHomeLeagueStatus` coverage rather than re-deriving status in the client.

**Decision required first:** keep or drop single-league auto-open on mobile. Recommendation: drop it, since Home now carries the status the screen exists to show; the PRD currently grandfathers the behavior and would be amended by this slice.

**Done when:** mobile home matches the PRD league-list contract, ordering is stable within a season, and no refresh failure can claim picks are in.

### WEB-12a — Inclusive 1–200 tiebreaker bound on both clients

**Priority: P2. Fixes: F20 (score half).**

**Change:** change the client validation from `Number(val) < 200` to `<= 200` on both pick forms so the copy, both clients and the server agree. Confirm the admin pick writer applies the same 1–200 integer and tiebreaker-only rule.

**Start in:** `apps/mobile/components/picks/ClientPickPage.tsx`, `apps/web/src/app/league/[leagueId]/pick/client-pick-page.tsx`, `packages/api/server/api/routers/league/admin.ts`.

**Test layer:** API integration plus unit — extend `packages/api/tests/integration/pick-validation.test.ts` with 200 accepted and 0 and 201 rejected on both the bulk and admin writers, plus one mobile Jest case for the form boundary.

**Done when:** a score of exactly 200 is accepted everywhere the copy promises it, and rejected values behave identically across writers.

### MOB-15a — Live kickoff locks and a real closed-week state

**Priority: P1. Fixes: F33.**

**Change:** replace mount-time `new Date()` comparisons with a ticking clock, refreshed on an interval and on `AppState` resume, so games and the tiebreaker flip to locked while the form is open instead of letting a user pick a started game and learn about it from a server skip outcome. For `close_at_first_game_start` leagues, show the weekly cutoff and replace the form with a closed state once it passes, matching web and PRD §6.1. Preserve locked-game handling and the WEB-02c saved/skipped confirmation.

**Start in:** `apps/mobile/components/picks/ClientPickPage.tsx`, `components/picks/PickGameCard.tsx`, `lib/picks/getPickWindow.ts` (new).

**Test layer:** mobile unit plus component — `apps/mobile/tests/picks/getPickWindow.test.ts` with a controlled clock covering before first kickoff, exactly at kickoff, between games, all locked, and per-game versus first-kickoff policy; a component test that the form is replaced by the closed state. Server enforcement stays covered by `packages/api/tests/integration/late-policy.test.ts` and must not be duplicated in the client.

**Done when:** a kickoff passing with the form open locks that game and its tiebreaker without a reload, and a closed week shows a closed state rather than a submit button.

### MOB-04a — One validated resolver for links and notification taps

**Priority: P1. Fixes: F34, F13.**

**Change:** route the notification payload's `content.data.path` through `resolveDeepLink`, or a shared `resolveAppDestination`, so taps use the same allowlist as URLs instead of pushing an unvalidated string. Compare the full destination href rather than the pathname alone in `useAuthHandler`, so a shared link with a changed `week` or `tab` navigates while already inside that league.

**Start in:** `apps/mobile/hooks/usePushNotificationRegistration.ts`, `hooks/useAuthHandler.ts`, `lib/deeplink/resolveDeepLink.ts`.

**Test layer:** mobile unit — extend `apps/mobile/tests/deeplink/resolveDeepLink.test.ts` with notification payload cases (valid, unknown path, empty), and add cases for a pure `shouldNavigate(currentHref, nextHref)` covering same-path/different-query and same-path/same-query.

**Done when:** taps and URLs resolve through one validated function, unknown destinations produce a useful outcome, and week and tab changes navigate inside the same league.

### MOB-04b — Route inventory with an explicit web fallback

**Priority: P1. Fixes: F12. Depends on MOB-04a.**

**Change:** enumerate every shareable web route and map it to an existing native screen or an explicit unsupported-to-web fallback. Stop accepting arbitrary `/league/` suffixes, so an app-link association cannot turn a working web URL into a missing native destination.

**Start in:** `apps/mobile/lib/deeplink/resolveDeepLink.ts`, `app/+not-found.tsx`.

**Test layer:** mobile unit plus a recorded device check — a table-driven test over the full route matrix asserting each web URL maps to an existing native route file or a declared fallback, failing on any unmapped route. Device link verification belongs to MOB-08 and is not claimed here.

**Done when:** every shareable destination has a tested native target or a working web fallback, and unauthorized or missing destinations give a useful outcome.

### WEB-15 — Stop returning peer email addresses from the member profile

**Priority: P1. Fixes: F32.**

**Change:** project only the fields clients use out of `playerProfile.get`, dropping `people.email` for non-admin viewers — the same response-level approach WEB-04 used for predictions. Preserve email on authorized commissioner surfaces and on self-view. Remove the email line from the mobile member profile once the response changes.

**Start in:** `packages/api/server/api/routers/playerProfileRouter.ts`, `apps/mobile/components/profile/LeagueMemberProfile.tsx`, the web profile component.

**Test layer:** API integration plus component — `packages/api/tests/integration/profile-privacy.test.ts` asserting a peer viewer receives no email field, the commissioner path still does, and self-view is unchanged; update the existing `apps/mobile/tests/profile/LeagueMemberProfile.test.tsx` expectations.

**Decision required first:** is peer email visibility intentional for small private leagues? If yes, this slice becomes a PRD §7.5 amendment recording it, not a code change. If the decision is unresolved when the queue reaches this slice, mark it `BLOCKED` and advance.

**Done when:** no peer-visible endpoint returns another member's email, or the PRD records the exposure as intended.

### MOB-12a — Hold the splash screen through initialization

**Priority: P2. Fixes: F29.**

**Change:** call `SplashScreen.preventAutoHideAsync()` at module scope and `hideAsync()` only once fonts, cache restore and the initial session check have resolved. Stop returning `null` from `TRPCReactProvider`; render the tree behind the splash, or gate only the subtree that genuinely needs restored cache. Add a hard timeout so a failed or slow restore can never hold the splash indefinitely.

**Start in:** `apps/mobile/app/_layout.tsx`, `lib/trpc/react.tsx`.

**Test layer:** mobile unit — `apps/mobile/tests/app/splashGate.test.ts` against an extracted pure `shouldHideSplash({ fontsLoaded, cacheRestored, sessionResolved, timedOut })`, including the timeout path.

**Done when:** cold start goes splash to first frame with no blank interval, and a restore failure still reaches the app within the timeout.

### MOB-12b — Root error boundary and crash reporting

**Priority: P2. Fixes: F30 (partial). Depends on MOB-12a.**

**Change:** add an error boundary above the router with a user-facing retry screen that can reset state and optionally purge the cache, and forward the caught error to the logger and a crash reporter. Install the chosen reporter and wire the global JS error and unhandled-rejection handlers so a blank screen is never silent.

**Start in:** `apps/mobile/app/_layout.tsx`, `apps/mobile/components/ErrorBoundary.tsx` (new).

**Test layer:** component — `apps/mobile/tests/app/ErrorBoundary.test.tsx`: a throwing child renders the fallback, retry remounts the tree, and the reporter receives the error exactly once.

**Decision required first:** which reporter. Recommendation: Sentry via `@sentry/react-native`. PostHog-only error capture is acceptable if recorded as a known limitation.

**Done when:** a render error shows a recoverable screen and produces one reported event with enough context to act on.

### MOB-12c — Analytics identity and a deliberate session-replay decision

**Priority: P2. Fixes: F30 (remainder). Depends on MOB-01a.**

**Change:** call `identify(uid)` on sign-in and `reset()` on the same identity transition MOB-01a introduces, so events stop being anonymous and never bleed across accounts. Resolve `enableSessionReplay`: either set it false and delete the contradictory comment, or keep it with a documented privacy decision and masking configuration. Bound logger metadata so `mobile_log` cannot ship arbitrary or sensitive payloads.

**Start in:** `apps/mobile/lib/posthog.ts`, `providers/PostHogProvider.tsx`, `lib/logging/index.ts`.

**Test layer:** mobile unit — `apps/mobile/tests/observability/analyticsIdentity.test.ts` against an injected fake client: identify on sign-in, reset then identify on A-to-B, reset on sign-out, and metadata redaction.

**Decision required first:** keep or disable session replay for a private-league app. The code and its adjacent comment currently disagree, so someone should decide on purpose.

**Done when:** events are attributable to the signed-in user and never to the previous one, and replay is a recorded decision.

### WEB-14a — Cursor-paginate the league message board

**Priority: P1. Fixes: F17 (server half). First slice of WEB-14.**

**Change:** add cursor pagination and a stable order (`createdAt` with `message_id` as tiebreak) to `messages.leagueMessageBoard`, keeping the existing response shape available so already-installed mobile clients keep working, per delivery rule 3. Record explicit payload-size and response-time budgets for a full season's thread.

**Start in:** `packages/api/server/api/routers/messages/index.ts`.

**Test layer:** API integration — `packages/api/tests/integration/message-pagination.test.ts`: page boundaries, identical-timestamp ordering, cursor stability while new messages arrive, and old-shape callers still succeeding.

**Done when:** a long thread loads in bounded pages with a stable order and released mobile clients are unaffected.

### MOB-03c — Chat client: incremental fetch, optimistic send, honest copy

**Priority: P2. Fixes: F17 (client half), F35. Depends on WEB-14a, MOB-03a, MOB-11a.**

**Change:** consume the cursor API with `useInfiniteQuery` and delete the download-everything-then-`slice` approach. Append optimistically with rollback on failure so sending feels immediate rather than waiting on a round trip plus a full invalidation. Replace implementation copy — "auto-refreshes every 10s", "Pull down to sync" — with product copy per PRD §7.2.2, and enlarge the delete affordance with `hitSlop` or move it behind a long-press.

**Start in:** `apps/mobile/components/messages/LeagueMessageBoard.tsx`.

**Test layer:** component — `apps/mobile/tests/messages/LeagueMessageBoard.test.tsx`: an optimistic message appears then reconciles with the server row, rolls back on error, older pages load, and a retry produces no duplicate.

**Done when:** sending feels immediate, history pages in, and no user-facing copy describes the refresh mechanism.

### MOB-13b — Split the league screen

**Priority: P3. Fixes: F31 (remainder).**

**Change:** extract per-tab containers and the header and sharing logic from the 1,849-line `app/league/[id]/index.tsx`, with no behavior change.

**Test layer:** none new; behavior-preserving refactor covered by the existing suite, typecheck and a reviewed diff.

**Done when:** the screen is decomposed, behavior is unchanged, and the diff is reviewable. Deliberately last so it never collides with a behavioral fix in the same file.

## Delivery and handoff rules

1. Start with WEB-01 as a small, reviewable integrity fix; capture the failing direct-API regression before changing behavior. Follow the serial PR workflow below rather than starting other tickets in parallel.
2. Every ticket needs implementation owner, status, PR, test evidence and unresolved decisions added here when work begins. Keep IDs stable. A proposed approach is not a settled product decision where explicitly labeled above.
3. Keep shared API changes compatible with already-installed mobile versions. Distinguish omitted fields from explicit values, add new responses compatibly, and prove old payload behavior where needed. Deploy reviewed schema changes before enabling dependent features.
4. For migrations, record a read-only data inventory and a reviewed conflict-resolution plan before cleanup. Test on an isolated copy/fixture; do not use a production reset or `db push` as a shortcut.
5. Completion requires matching PRD changes where behavior changed, deterministic tests at the correct layer, updated coverage docs and relevant full-suite results. Device/provider assertions require their own evidence; browser E2E disables outbound effects.
6. Recommended public-mobile gate: shared integrity/registration/policy fixes, MOB-01–08, safe behavior for every exposed commissioner action, and an explicitly verified season lifecycle. Full native commissioner parity and visual additions can follow. If a notification feature is deferred, remove its promise/enablement deliberately instead of shipping unreliable delivery as complete.

## E2E coverage criteria

Use the decision table in [Testing Strategy](TESTING_STRATEGY.md#choosing-the-test-layer-agreed-september-6-2026). A new feature does not automatically need a new E2E test. New/changed critical journeys, auth/navigation handoffs, UI/API wiring and reload/persistence behavior do; narrow rules, role/time matrices and races belong in unit or API/database integration tests. Reuse the existing owning flow spec and document why it is sufficient. WEB-01 will add direct router/database regression coverage and run existing player/admin E2E rather than duplicate the browser journey for every role/time case.

## Agreed workflow: one small PR at a time

Maintain at most one active implementation PR from this backlog. Finish its validation and review, and wait for it to merge before starting the next slice. Do not bundle unrelated cleanup or another finding into a fix. A ticket can span several sequential PRs when that makes each change safer to review; no slice may leave a known partial integrity fix presented as complete.

**Serial execution is a standing decision, reaffirmed September 12, 2026.** Parallel lanes were considered and rejected for cost reasons. One active implementation PR across the entire backlog, website and mobile alike — not one per area, and not one per lane. Concretely:

- Take slices in the documented queue order. The mobile queue order additionally encodes file ownership, so reordering creates avoidable rebase conflicts; record the reason if you must.
- If a slice is blocked on an unresolved product decision when the queue reaches it, record it as `BLOCKED` with the specific decision needed and advance to the next unblocked slice. Do not open a second concurrent PR to work around a block.
- Decisions and external lead times may run concurrently with implementation. Only implementation PRs are serialized.

**Keep this file current as work proceeds.** It is the single source of truth for what is in flight, so a stale entry is worse than no entry. On starting a slice, add its execution-record row with owner, branch and the pre-fix evidence you captured. On merging, update the status, the merged commit and the remaining verification. When a finding turns out to be already fixed or not reproducible, record that evidence against its ID instead of silently dropping it. Audit reports keep their original findings and IDs; status lives here.

1. **Choose a bounded behavior.** Use the queue order and dependencies. Record the ticket, exact scope, expected before/after behavior, and any decision needed. Recheck the finding against latest main; if it is already fixed or cannot be reproduced, document that evidence rather than manufacturing a change.
2. **Start from current main.** Check for local changes, pull main safely, and create a `codex/` branch for this slice. Preserve unrelated work. Keep the large initial audit/priority documents in a separate documentation commit/PR so they do not obscure the first fix; subsequent fix PRs include only relevant status/coverage updates.
3. **Prove the bug.** Add a deterministic regression at the boundary where the defect exists. For API integrity, use the real router with an isolated local database and controlled time. Record the failing assertion on the original behavior; a test of a new helper alone is insufficient.
4. **Make the smallest complete fix.** Cover equivalent writers and existing client compatibility. Include necessary schema or shared-policy changes, but split unrelated refactors. If the scope grows, explain the reason and define another sequential slice. Resolve required product decisions before changing the dependent behavior.
5. **Validate the outcome.** Show the regression now passing, exercise the surrounding allowed/denied paths, and run relevant typechecks and existing tests. Use the test-layer criteria in `docs/TESTING_STRATEGY.md`: add/update E2E for changed or uncovered critical journeys and cross-layer behavior; use focused API/database tests for rule matrices and retain existing flow E2E when sufficient. Run the required full web suite for core/shared behavior changes. Record commands, results and any unverified device/provider behavior. Never equate a green typecheck with a proven fix.
6. **Open a focused PR.** Describe the concrete trigger, before/after behavior, tests, and material migration/compatibility risks. Link the ticket, update its execution record and WORKLOG/coverage docs, and inspect the final diff for unintended changes. Do not mark the ticket done just because a PR exists.
7. **Validate CI and review.** Follow repository CI-monitoring rules: at most one compact poll every five minutes unless explicitly requested otherwise; inspect logs after failure, avoid unchanged status updates, and stop at a terminal result. Fix failures within the same scope. Do not merge with pending/failing required checks or an unmergeable PR; merge requires user authorization.
8. **Close the loop before advancing.** Record the merged commit and validation evidence, then move to the next slice from updated main. If runtime verification is still needed, retain `MERGED / VERIFICATION PENDING` rather than `DONE`, and resolve it or record an explicitly accepted deferral before proceeding. Deployments, external sends and destructive data cleanup require their own applicable authorization; a code merge is not proof of production behavior.

### First implementation slice: WEB-01

**Scope:** close the ordinary-admin post-kickoff bypass in `picks.submitPicks`, align its lock decision with `league.admin.setPick`, and preserve the existing permitted super-admin correction workflow. Do not fold in late-policy behavior, duplicate-pick migrations, prediction privacy, or general pick-form cleanup.

**Regression:** as an ordinary league admin, submit an override for a member's started game through `picks.submitPicks`. Assert rejection and unchanged database state. Exercise both mutation paths, unauthorized target leagues, pre-kickoff allowed edits, exact kickoff, post-kickoff denial and the supported super-admin override. Tests must not send confirmation emails to real recipients.

**PR acceptance:** failing-before/passing-after evidence, direct API and relevant web regression coverage, required local checks and CI green, a reviewed diff, and updated ticket/worklog evidence. Only then advance to WEB-02 after merge.

### Execution record

Status vocabulary: `OPEN`, `IN PROGRESS`, `PR OPEN`, `READY FOR REVIEW`, `MERGED / VERIFICATION PENDING`, `DONE`, `BLOCKED` (with explicit reason).

| Ticket / slice         | Status | Owner | Branch / PR                                                                              | Before-fix evidence                | After-fix checks                                                                 | Merge / remaining verification                                     |
| ---------------------- | ------ | ----- | ---------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| WEB-01 / kickoff guard | DONE   | Codex | [PR #34](https://github.com/bambrose24/funtime-t3/pull/34), `codex/web-01-kickoff-guard` | Original routers: 18 pass / 4 fail | Fixed: 22 API integration cases and 7 API unit tests pass; all 3 typechecks pass | Merged main `40148de`; full browser/API CI passed, run 34049186920 |
| MOB-13a+01a+03a+11a   | IN PROGRESS | Auto | `codex/mob-core-identity-cache` | Source-confirmed F26/F27/F28/F31; no prior failing suite for cache purge | Pending: mobile Jest + typecheck; API push-token integration when local DB available | Open PR; no web UI changes |

Add a row when each later slice starts. Keep one active implementation slice; record test counts and links to actual runs, not intended commands as if they passed.

## Product decisions to resolve without blocking unrelated fixes

| Decision                             | Recommendation                                                                  | Blocks                    |
| ------------------------------------ | ------------------------------------------------------------------------------- | ------------------------- |
| Late joining with Super Bowl enabled | Allow weekly participation; no new preseason-contest eligibility after deadline | WEB-05 eligibility UI/API |
| Legacy all-week late policy          | Stop offering it; agree on compatibility/migration after inventory              | WEB-02 legacy behavior    |
| Partial-week picks                   | Define explicit draft/submitted semantics and visibility threshold              | WEB-03 completeness rules |
| Completion/postseason window         | One shared state contract with documented operational owner                     | WEB-10 final behavior     |
| Account deletion and league history  | Explicit retention/anonymization and ownership-transfer policy                  | MOB-06 data mutation      |
| Initial mobile scope                 | Player-complete; essential commissioner actions with tested web fallbacks       | MOB-09 release acceptance |
| Peer email visibility on profiles    | Hide it in the response; amend PRD §7.5 instead if it is intentional            | WEB-15                    |
| Single-league auto-open on mobile    | Drop it once Home carries weekly status, matching web                           | MOB-14a                   |
| Crash reporter choice                | Sentry via `@sentry/react-native`; PostHog-only capture is a recorded limitation | MOB-12b                   |
| Session replay on mobile             | Disable it; the code and its own comment currently disagree                     | MOB-12c                   |
| Offline write queueing               | Not a v1 requirement; cached reads and preserved drafts only                     | MOB-03a                   |

Store guidance was checked against primary Apple/Google sources on September 6, 2026. Recheck before submission; developer-console configuration and actual submission outcomes remain unverified. This file and the audit are the only intended changes from this planning work.

WEB-02a: merged as `f5ba79a` / PR #35. WEB-02b: merged as `fd8a37f` / PR #36. WEB-02c native confirmation: branch `codex/mobile-pick-outcome-confirmation`; focused helper coverage and native typecheck are included. The outstanding legacy-policy decision needs read-only production data.
