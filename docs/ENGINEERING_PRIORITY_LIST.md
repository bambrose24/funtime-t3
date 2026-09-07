# Engineering priority list: website first, mobile release next

Updated September 6, 2026. Source reviewed: `main` at `aaa5f89c01aa46c0ea807b9daef2119d54839319`.

This is the implementation backlog. The agreed delivery approach is one focused PR at a time, with behavior validation before advancing. All tickets below are **OPEN**; this plan update implements no fixes and authorizes no automatic merge or deployment. Original evidence and source permalinks are in [the cross-platform audit](PRD_CROSS_PLATFORM_AUDIT_2026-09-05.md). Ticket references such as F01 refer to that report. New findings from this follow-up are recorded at the end of that report.

## Recommendation

Fix the website's shared competitive rules before adding features. A polished pick screen cannot compensate for a commissioner bypassing kickoff, a league ignoring its selected deadline, duplicate picks affecting scores, or hidden predictions leaking through another endpoint. Start with **WEB-01**, followed by **WEB-02–05**. These backend changes also make mobile safer to release.

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

**Why / evidence:** F01. `picks.submitPicks` treats any admin override as exempt from kickoff filtering, unlike `league.admin.setPick`.

**Change:** extract shared authorization/lock evaluation used by both mutations. Validate actor, target member and league before writing. Ordinary admins cannot alter a game at or after its kickoff; only the existing super-admin identity gets that exemption. Preserve the supported super-admin correction path. Do not rely on disabling form controls, or remove an API input without checking older mobile callers.

**Start in:** `packages/api/server/api/routers/picks.ts`; `packages/api/server/api/routers/league/admin.ts`. Add a shared policy helper under `packages/api` rather than duplicating checks in web/native components.

**Done when:** direct router integration tests cover both writers for player/admin/super-admin, someone else's league, and before/equal/after kickoff with an injected clock. A started-game ordinary-admin request is rejected and the stored pick is unchanged. Extend web integrity/admin E2E to cover the user-facing denial.

### WEB-02 — Make league deadlines match selected policy

**Status: IN PROGRESS — WEB-02c.** WEB-02a merged as `f5ba79a` / [PR #35](https://github.com/bambrose24/funtime-t3/pull/35), with full browser/API CI passing in run 34050693786; WEB-02b merged as `fd8a37f` / [PR #36](https://github.com/bambrose24/funtime-t3/pull/36). The shared response returns named per-league outcomes without removing existing fields. This slice makes native confirmation consume those outcomes, so it distinguishes full and partial saves instead of claiming every league updated.

**Remaining decision task:** inventory legacy/null policy usage with read-only production evidence and decide compatibility/migration before treating WEB-02 as complete. Do not silently reinterpret existing leagues.

**Why / evidence:** F02. Clients expose a first-kickoff deadline, but submission only checks each game's timestamp.

**Change:** evaluate each target league's policy on the server. Recommended behavior: `close_at_first_game_start` freezes ordinary submissions/edits for that league/week at its earliest game kickoff; `allow_late_and_lock_after_start` leaves only unstarted games editable. Use the same eligibility response to display lock reasons on web and mobile. For apply-to-all, return explicit saved/skipped/failed outcomes per league and do not claim all leagues saved when some were excluded. Preserve draft selections when targets fail.

**Start in:** shared pick router; `league.weekToPick`; web `src/app/league/[leagueId]/pick/client-pick-page.tsx`; native `components/picks/ClientPickPage.tsx`.

**Decision needed:** define legacy `allow_late_whole_week`; do not silently reinterpret existing leagues. Recommended path is to stop offering it for new leagues, inventory affected leagues, and agree on explicit migration/compatibility behavior. Do not let it accidentally override the confirmed post-kickoff integrity rule.

**Done when:** a Thursday-start fixture proves Sunday games remain editable in one policy and locked in the other; mixed-policy apply-to-all reports exact outcomes; equal-to-kickoff and rescheduled game cases are tested. Depends on WEB-01.

### WEB-03 — Validate and deduplicate pick writes

**Why / evidence:** F08. Invalid team/season combinations and duplicate member/game rows are possible.

**Change:** require every requested league membership; reject duplicate game IDs, missing games, winners outside home/away, cross-season games, invalid scores and scores on non-tiebreaker games. Enforce one pick per `(member_id, gid)` with a migration and an atomic upsert/write strategy used by both writers. Decide and document whether partial-week submission is supported; client completeness rules must not be the only enforcement. Keep single-member writes atomic and explicitly report multi-league partial outcomes.

**Start in:** shared pick routers; `packages/api/prisma/schema.prisma`; new reviewed migration. Integration tests need an isolated local database; pure schema tests are insufficient for races.

**Migration requirement:** first produce a read-only duplicate inventory, including null membership rows, conflicting winners/scores and affected standings. Agree on which rows are canonical before deleting or merging any historical data; do not choose one arbitrarily. Recompute affected results after cleanup. Roll out constraints/writers with compatibility for released clients.

**Done when:** two simultaneous submissions and two identical payload game entries cannot create extra rows; repeated updates keep one row; invalid payloads make no unintended writes; counts/standings do not inflate. Depends on WEB-01/02 for policy integration.

### WEB-04 — Enforce prediction privacy in the response

**Why / evidence:** F03. The profile endpoint returns hidden Super Bowl fields even when web hides its section.

**Change:** use an explicit profile response projection and one preseason visibility helper across profile and board endpoints. Return no opponent winner/loser/score before the agreed reveal time. Preserve own prediction visibility and the separately authorized commissioner review. Update mobile's profile renderer to understand redacted data. Avoid serializing unnecessary member/person fields alongside the fix.

**Start in:** `playerProfileRouter.ts`; `league/index.ts` (`superbowlPicks`); both member-profile components. Coordinate reveal-time definition with WEB-10 without delaying the privacy fix.

**Done when:** player A cannot retrieve player B's prediction from either endpoint before kickoff, including server-rendered page data; A can still edit/view their own prediction; authorized commissioner review works. Verify the same state after a mobile cache refresh. Can proceed independently of WEB-01–03.

### WEB-05 — Make joining atomic and settle late-join Super Bowl eligibility

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

Store guidance was checked against primary Apple/Google sources on September 6, 2026. Recheck before submission; developer-console configuration and actual submission outcomes remain unverified. This file and the audit are the only intended changes from this planning work.

WEB-02a: merged as `f5ba79a` / PR #35. WEB-02b: merged as `fd8a37f` / PR #36. WEB-02c native confirmation: branch `codex/mobile-pick-outcome-confirmation`; focused helper coverage and native typecheck are included. The outstanding legacy-policy decision needs read-only production data.
