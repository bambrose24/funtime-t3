# PRD and cross-platform implementation audit

Audit date: September 5, 2026 (America/New_York).

Source: latest `main`, `aaa5f89c01aa46c0ea807b9daef2119d54839319`, pulled from `origin/main` during this audit. Platforms: Next.js web and Expo mobile, including their shared API. Mobile OS-specific behavior remains unverified on physical iOS/Android devices.

September 6 follow-up: [Engineering priority list](ENGINEERING_PRIORITY_LIST.md) turns these findings into ordered website fixes and mobile release tickets with changes, code locations, dependencies and acceptance criteria. Four additional findings (F22–F25) appear below. All remain open; no fixes have been implemented.

This is a documentation-only audit. No application code, tests, database records, infrastructure, or product requirements were changed. Findings describe the inspected source; they are not claims of reproduced production incidents. References below are repository-relative paths and symbols at the audited commit.

## Overall assessment

The major player and commissioner workflows exist on both platforms. The main concern is that a feature being present in both clients does not guarantee that its shared rules are correct. Competitive integrity, mobile account isolation, notification preferences, and correction workflows have more consequential gaps than the remaining screen-level parity work.

Prioritize the shared pick API, preseason prediction privacy, mobile logout isolation, and durable notification preferences before additional features. Then complete mobile renewal roles and commissioner Super Bowl review. Keep production/device validation separate from implementation status.

## Feature status matrix

“Present” means an implementation was located, not that every path was exercised. Finding IDs below qualify the status.

| PRD area | Web | Mobile | Assessment / remaining work |
| --- | --- | --- | --- |
| Signup, login, confirmation, profile onboarding | Present | Present | Recovery E2E remains explicitly missing; mobile cache isolation needs correction (F04). |
| Password reset | Request and confirmation routes present | Request, callback and confirmation routes present | Validate complete recovery journey, expired links, and destination restoration. |
| Account username | Present | Present | Shared uniqueness is a read-before-write check without a username database unique constraint (F21). |
| Account notification settings | Placeholder page | Token status and enable/disable controls | Reverse parity gap; preference and logout defects (F05–F06, P03). |
| Build/OTA diagnostics | Not a comparable web requirement | Present in account settings | Appropriate platform-specific feature; no need to clone onto web. |
| Home, league history and renewal discovery | Present | Present, plus search and collapsible history | Broad parity; explicit season lifecycle contract needed (F14). |
| Create/join and share links | Present | Present | Join atomicity and Super Bowl validation gaps (F09–F10); link mapping incomplete (F12–F13). |
| Renewal eligibility, linked creation, inherited settings | Present | Present | Mobile creates before invitation review; expected web-specific distinction, but label misleading (P01). |
| Renewal recipient selection and roles | Rich review and role controls | Recipient selection, share, send, skip | Mobile lacks next-season role controls and some recipient context; retry can erase web-selected roles (F11). |
| Weekly pick entry, randomize, apply to all | Present | Present | Shared kickoff bypass, unenforced policy, invalid payload handling and concurrency (F01–F03, F08). |
| Opponent weekly-pick visibility | API redaction present | Same API | Positive: membership, submission presence and individual kickoff are checked. Define whether one pick counts as “submitted” (D02). |
| Weekly results and season leaderboard | Present | Present, including chart | Competition rankings implemented. Finalized winner records become stale after corrections (F07). |
| Member/my profile | Present | Present | Preseason predictions leak through profile API; mobile renders them (F03). |
| Super Bowl own prediction, lock, board and postseason context | Present | Present | Admin review missing on mobile; join bypasses edit lock; status semantics inconsistent (F09, F14, P02). |
| Persistent Chat and unread state | Dedicated route/navigation | Header action and tab | Shared durable read cursor exists; performance, retry semantics and cross-device verification remain (F17–F18). |
| Member role, removal, paid status and pick editor | Present | Present | Dedicated editor checks kickoff; alternate submission route does not. Self-demotion/removal API guards exist. |
| Commissioner rename and broadcast | Present | Present | Name length inconsistent across create/rename (F20). Broadcast provider delivery not exercised. |
| Email history | Present | Present with HTML/text fallback | Stored delivery lifecycle not exposed by member-history response (P04). |
| Member CSV export | File-oriented export UI | CSV text in native share sheet | Partial artifact parity: mobile shares text rather than a named CSV file (P05). |
| Unredacted commissioner Super Bowl review | Dedicated admin route | No caller of admin Super Bowl query found | Concrete mobile feature gap (P02). |
| Global super-admin dashboard | Present | Present | Core surface exists; physical-device workflow QA still needed. |
| Pick confirmations, welcome, reminders, broadcasts and renewals | Shared email services | Same services | Email side effects and failed/retried writes need contract coverage (F10, F18). |
| Week-summary email and personal push | Shared cron/service | Push reception and deep links | Separate delivery ledgers needed; “12:00 UTC” depends on process timezone (F15–F16). |
| Message pushes | Shared event fanout | Registration and notification tap | Best-effort exception handling exists; success metrics do not inspect Expo tickets (F19). |
| Pick-reminder push | No implementation found | No implementation found | Email reminder exists. Clarify whether mobile push is required by notification priorities (D06). |
| ESPN scoring and postseason automation | Shared cron | Consumes shared output | Source correction and season lifecycle edge cases need integration coverage (F07, F14). |

## Findings: competitive integrity and data consistency

### F01 — High: alternate pick submission bypasses commissioner kickoff lock

**Platforms:** both through the shared API. **Confidence:** confirmed code path.

`packages/api/server/api/routers/picks.ts`, `submitPicks`, checks that an overriding caller is a league admin, then sets `finalPicks = input.picks` whenever `overrideMemberId` is supplied. It does not apply the kickoff check or reserve this exemption for the super admin. In contrast, `league/admin.ts`, `setPick`, explicitly rejects ordinary admins after kickoff.

An ordinary commissioner can therefore call `picks.submitPicks` for a member and change a started game even though the dedicated editor blocks it. PRD §§6.1/7.8 are violated at the API boundary.

**Suggested acceptance:** call both mutation paths as player, league admin, and super admin immediately before, exactly at, and after kickoff. Only the super admin can override a started game. Apply one authorization/lock policy consistently to all writers.

### F02 — High: configurable late policy does not govern actual submissions

**Platforms:** both. **Confidence:** confirmed source mismatch.

League creation exposes `close_at_first_game_start` and `allow_late_and_lock_after_start`. Neither `picks.submitPicks` nor either client pick form reads the selected league's late policy when determining eligibility; they check individual game timestamps. A league configured to close at its first weekly kickoff still accepts later games. The legacy `allow_late_whole_week` enum remains accepted by the API but has no separate submission behavior either.

**Evidence:** `packages/api/server/api/routers/league/index.ts` (`createForm`, `create`); `packages/api/server/api/routers/picks.ts`; `apps/web/src/app/league/[leagueId]/pick/client-pick-page.tsx`; `apps/mobile/components/picks/ClientPickPage.tsx`.

**Suggested acceptance:** same-season leagues with different policies must produce different eligibility after Thursday kickoff, including apply-to-all. Return explicit per-league outcomes rather than silently treating every policy alike.

### F03 — High: preseason Super Bowl privacy can be bypassed through profiles

**Platforms:** web API exposure; mobile profile UI exposure. **Confidence:** confirmed source path.

`playerProfileRouter.ts`, `get`, returns the full member with `superbowl: true` after membership checks, without preseason redaction. Web's profile component hides the section before kickoff for other users, but the data is still returned. Mobile's `LeagueMemberProfile.tsx` directly renders `member.superbowl[0]` without a corresponding season/ownership condition. The separate `league.superbowlPicks` board does redact predictions, so the privacy rule depends on which endpoint is called.

**Suggested acceptance:** a player requesting another player's profile before kickoff receives no prediction fields and sees no prediction in either UI. Preserve the deliberate unredacted commissioner endpoint separately.

### F07 — High: corrected picks do not repair finalized weekly winners

**Platforms:** both. **Confidence:** confirmed source path.

`league/admin.ts`, `setPick`, allows the super admin to correct a started/final game and clears its correctness. The cron recomputes pick correctness, but skips winner generation whenever any winner already exists for the league/week. It does not replace stale winners. Consequently leaderboard totals can change while weekly winner banners and profile week-win counts retain the old outcome. Historical seasons are also outside the cron's `DEFAULT_SEASON` processing.

**Evidence:** `apps/web/src/cron/index.ts`, pick-result loop and `existingWinners.some(...)` early continue; `packages/api/server/api/routers/league/admin.ts`, `setPick`.

**Suggested acceptance:** correct a pick that changes the winner of a finalized week, then verify all standings, week wins and banners agree, including a prior season. Decide how corrected results affect previously delivered summaries. Also test upstream score corrections: the sync currently skips games already marked `done`.

### F08 — High: pick validation and idempotency are incomplete

**Platforms:** both. **Confidence:** confirmed checks absent in the inspected writer/schema; concurrency not runtime-reproduced.

`picks.submitPicks` does not validate that a winner is one of the game's two teams or that the game's season matches every destination league. A valid team from another game can be saved, and a game from another season can be recorded with the destination league's season. `viewerMembers.length > 0` also accepts a mixed list of member/non-member league IDs by silently processing only memberships found, contrary to its “all of these leagues” error wording.

Picks are read first and then individually created/updated. Neither the Prisma schema nor checked-in migrations provides a unique `(member_id, gid)` constraint. Concurrent submissions, or repeated game IDs in one payload when no prior pick exists, can create duplicate picks and inflate counts. The dedicated admin writer also lacks a game/league season equality check.

**Evidence:** `packages/api/server/api/routers/picks.ts`; `packages/api/server/api/routers/league/admin.ts`, `setPick`; `packages/api/prisma/schema.prisma`, `picks`.

**Suggested acceptance:** reject unrelated teams, cross-season games, duplicate game IDs and unauthorized destinations; enforce database-backed member/game uniqueness and exercise concurrent identical submits. Decide whether multi-league writes must be atomic or return explicit partial results—the current transaction boundary is one member at a time.

### F09 — High: join can create a Super Bowl prediction after the prediction lock

**Platforms:** both through registration. **Confidence:** confirmed source mismatch; desired late-join policy needs a decision.

`league.register` requires a prediction when the competition is enabled but never checks season start or completed-league status. `member.updateOrCreateSuperbowlPick` rejects edits after the first season kickoff. A person joining late can therefore submit a new prediction with knowledge unavailable to existing members. The join schema also has no score maximum and neither writer checks that winner and loser differ. The update writer caps scores at 200.

**Suggested acceptance:** define whether late joins are allowed, and whether those members are ineligible for the preseason contest, join without a prediction, or are blocked. Validate distinct legitimate teams and one score range on both mutations. Decide whether opposite conferences are required; the present UI filters are not an API rule.

### F10 — Medium: registration can partially succeed and duplicate under races

**Platforms:** both. **Confidence:** confirmed transaction/constraint gaps.

`league.register` creates membership, then creates the optional prediction, then awaits welcome email outside a common transaction. If prediction insertion fails, membership remains and retry reports “already in league.” The membership duplication guard reads the current user's memberships, while `leaguemembers` has no unique league/user constraint in the checked-in schema/migrations. Simultaneous joins can both pass it.

**Suggested acceptance:** membership and required prediction are atomic; concurrent join attempts produce one membership. Isolate email delivery failure from registration success and make retries safe. Apply the same principle to pick confirmation: `submitPicks` awaits confirmation after committing picks, so downstream failure must not make a completed save look unsuccessful.

## Findings: mobile account and notification state

### F04 — High: mobile persisted query data is not isolated by account

**Platform:** mobile. **Confidence:** confirmed source wiring; device/account-switch reproduction still required.

`apps/mobile/lib/trpc/react.tsx` uses a singleton query client and an AsyncStorage persister with a shared key/default persistence policy, restoring queries for up to seven days. The account screen's `signOut` only calls Supabase sign-out. The auth-state listener updates session state without clearing queries/persistence. No active logout hook clearing that cache was found. `session.current` and league query keys are not namespaced by user.

Another user on the same installation can receive stale prior-account session/league/chat data from cache, particularly with the five-minute freshness window or offline operation. API authorization does not remove already-cached responses. The similarly named `cache-persistence.ts` helper is separate from the persister actually installed by `react.tsx`.

**Suggested acceptance:** sign in as A, visit private screens, sign out, sign in as B, restart offline, and verify no A data renders. Clear or namespace in-memory/persisted private queries and pending mutations on every identity change, including invalid-session recovery.

### F05 — High: automatic push registration reverses notification opt-out

**Platform:** mobile/shared settings API. **Confidence:** confirmed source path.

`settings.registerPushToken` sets `enabled: true` in both the create and update branches. `usePushNotificationRegistration` automatically registers once per user per mounted lifecycle; a restart resets that ref. A user who disables notifications in-app, while retaining OS permission, has the same token re-enabled on the next registration. There is no durable account-level preference separate from token rows.

**Suggested acceptance:** disable notifications, restart/re-authenticate, register the existing token and a new token, and confirm delivery stays disabled until explicitly enabled. Define whether preference is account-wide or per device.

### F06 — High: signed-out devices remain eligible for private message pushes

**Platform:** mobile. **Confidence:** confirmed source path; physical-device delivery unverified.

Sign-out does not disable or unregister the current Expo token. Push fanout selects all enabled tokens for league users independently of their current auth session, and message pushes include author and message preview. A signed-out device can therefore remain a delivery target for the previous account until token ownership changes or it is disabled.

**Evidence:** account `signOut`; `settings.ts`; `server/services/expo-push/index.ts`.

**Suggested acceptance:** revoke only the current device's association on logout, preserve other signed-in devices, and verify account switching and sign-out stop former-account notifications.

## Findings: parity, links and resilience

### F11 — High: mobile renewal retries can remove a web-selected admin role

**Platforms:** cross-platform renewal management. **Confidence:** confirmed source interaction.

Mobile `renewal-invites.tsx` sends only `leagueId` and `memberIds`. The API defaults omitted `adminMemberIds` to `[]`, then deletes stored role records for selected recipients not in that array. Web can first select a returning player for promotion; if that invitation fails and remains eligible, retrying from mobile removes the stored promotion. Returning prior admins still retain admin status through the separate join fallback; this finding concerns newly promoted returning players.

**Suggested acceptance:** choose a next-season admin on web, simulate a failed send, retry on mobile, and verify the intended role survives and is applied on join. Expose role controls on mobile and distinguish “role omitted” from an explicit demotion in the API contract.

### F12 — Medium: several web league links resolve to nonexistent mobile routes

**Platform:** mobile. **Confidence:** confirmed route inventory/resolver mismatch.

`resolveDeepLink.ts` translates `/chat`, `/info`, `/leaderboard`, `/pick`, and `/superbowl`, then accepts any `/league/` prefix unchanged. Web destinations `/league/:id/my-profile`, `/league/:id/admin/members`, and `/league/:id/admin/superbowl` have no equivalent native file at those paths. Native member/pick/email admin navigation uses different route shapes. These URLs are covered by the broad iOS `/league/*` association, so installing the app can turn an otherwise valid web link into a missing native destination.

**Suggested acceptance:** enumerate every shareable route and its native equivalent. Explicitly map supported destinations and retain a working web fallback for unsupported ones. Test both cold and warm opens on iOS/Android.

### F13 — Medium: warm deep links discard changed week/tab context

**Platform:** mobile. **Confidence:** confirmed source path.

`useAuthHandler` compares the destination pathname to the current pathname and returns before considering query parameters. When already viewing `/league/123`, opening a shared link for `/league/123?week=5` or its Chat path (normalized to the same pathname with `tab=messages`) is ignored. The notification listener has its own route path and should be tested separately rather than assumed equivalent.

**Suggested acceptance:** open week and Chat links while already inside that league and ensure the requested context changes without losing authentication intent.

### F14 — Medium: season state has competing definitions and an undocumented dependency

**Platforms:** both. **Confidence:** source inconsistency confirmed; production state updater unknown.

Super Bowl board visibility uses persisted `league.status === not_started`; own-prediction edit lock uses actual game timestamps; leaderboard completion uses every game being final. The cron marks leagues completed one month after the latest scheduled regular-season game if that final game is done, without checking every other game. No normal `not_started -> in_progress` writer was found in the inspected application/cron or checked-in migrations; fixtures assign states explicitly.

This can produce locked own predictions alongside still-hidden board predictions, or different completed-season experiences across screens. An external job/trigger could be responsible for the transition, but that was not verified. Cron operates on the configured current season, so prior-season completion after a configuration rollover also needs an owner.

**Suggested acceptance:** specify preseason, regular-season active, postseason and completed states, their authoritative triggers and backfill behavior. Verify postponed/unfinalized games and season rollover. Document any external state writer before declaring the lifecycle complete.

### F17 — Medium: persistent chat still downloads the entire history

**Platforms:** both. **Confidence:** confirmed implementation.

`messages.leagueMessageBoard` calls `findMany` without a cursor or limit, including author/member data. Mobile's 80-message increment is only a local `slice` after downloading the full thread; its query refetches every ten seconds. Web also polls the full board. Persistent league-wide history therefore grows network/database work throughout the season despite virtualized mobile rendering.

**Suggested acceptance:** server-side cursor pagination/incremental refresh, stable order across identical timestamps, and tested behavior with a long season's messages. Set measurable payload and response-time budgets.

### F18 — Medium: automatic mobile retries lack mutation idempotency

**Platform:** mobile/shared API. **Confidence:** confirmed design risk; lost-response scenario not injected.

`create-query-client.ts` defaults all mutations to `retry: 2` and offline-first network behavior. Message posting inserts a new row with a server-generated ID and has no client operation key. If the server commits but the response is lost, retrying can post the same message again and send duplicate pushes. Similar retry semantics matter for create/join/picks, though their individual outcomes differ.

**Suggested acceptance:** simulate commit-then-response-loss for each non-idempotent mutation. Reconcile committed success or deduplicate using a stable operation identifier; define which offline actions may be queued and what happens at kickoff or account switch.

### F20 — Low: validation and labels disagree at boundaries

**Platforms:** both, with mobile-specific renewal copy. **Confidence:** confirmed source mismatch.

Creation accepts league names of 5–100 characters; `league.admin.changeName` only accepts 5–50. Both weekly pick forms say scores are between 1 and 200 but enforce `< 200`, whereas submission accepts `<= 200`. The admin pick API accepts an optional integer score without the normal bounds or tiebreaker-only check. Align client/server constraints and clearly state inclusive endpoints.

### F21 — Medium: username uniqueness is not enforced under concurrency

**Platforms:** both. **Confidence:** confirmed schema/check pattern.

`settings.updateUsername` checks `findFirst({ username })` and later updates the row. `people.username` has no unique constraint in the checked-in schema/migrations. Two concurrent requests can select the same currently available username. Case sensitivity/normalization is also not specified in the PRD.

**Suggested acceptance:** define normalization, enforce database uniqueness, and test concurrent claims and casing variants. Review existing duplicates before adding such a constraint in future implementation work.

## Findings: scheduled delivery and observability

### F15 — Medium: week-summary push retries are coupled to email success

**Platforms:** shared pipeline/mobile delivery. **Confidence:** confirmed source path.

Cron builds `membersToNotify` from members without `week_summary` email logs and uses the same member set for pushes. If email succeeds but push fails or there is no registered token, future runs exclude that member and cannot retry push. If email fails while push succeeds, subsequent runs may repeatedly push. There is no separate push delivery ledger.

**Evidence:** `apps/web/src/cron/index.ts`, `existingSummaryEmailLogs`, `membersToNotify`, `recipientMemberIds`, and `sendWeekSummaryNotifications`.

**Suggested acceptance:** independently retry and deduplicate email/push for each member/league/week; test every mixed-success combination and overlapping cron runs.

### F16 — Medium: documented 12:00 UTC threshold depends on server timezone

**Platforms:** shared scheduler. **Confidence:** confirmed timezone dependency; deployed timezone unverified.

The cron computes `addHours(startOfDay(addDays(latestWeekGame.ts, 1)), 12)`. These operations use the process-local day, not an explicit UTC day. This matches PRD §7.9 only when the process timezone is UTC. Also, the reference is latest scheduled start, not actual final completion; the PRD already identifies that distinction as an open question.

**Suggested acceptance:** identical UTC send threshold under multiple process timezones and DST boundaries. Separately decide the desired behavior for unusually delayed game completion.

### F19 — Medium: reported push “sent” count is only HTTP acceptance

**Platforms:** shared push service. **Confidence:** confirmed implementation limitation.

`sendExpoMessages` counts an entire batch as sent when `response.ok`, without parsing per-token tickets or checking receipts. Individual token errors in a successful HTTP response can be reported as success; stale tokens are not disabled by a receipt-processing path in the inspected service. The account's token count reports database registrations, not proven active delivery.

**Suggested acceptance:** distinguish attempted, accepted, failed and delivered where observable; inspect ticket errors, handle receipts and retire invalid tokens. Keep device smoke tests for actual delivery, permissions and tap routing.

## Concrete cross-platform additions

These are feature suggestions, not implementation changes authorized by this audit.

| ID | Priority | Proposed addition | Reason / acceptance |
| --- | --- | --- | --- |
| P01 | Next | Finish mobile renewal role controls, invited count, missed-pick context and partial-failure messaging | Match web recipient decisions and avoid F11. Mobile already has selection/select-all and result counts: do not rebuild these. Its “Create & Invite” button only creates and opens another screen; use wording that describes that step, or add the web-style pre-create review. |
| P02 | Next | Native commissioner Super Bowl review | Consume `league.admin.superbowlPicks`, include members with no prediction, and expose it from admin navigation with strict role protection. Player-board privacy is intentionally different. |
| P03 | Next | Useful web notification settings | `settings/notifications/page.tsx` currently says “More coming soon.” At minimum manage the same durable account preference and show registration context; browser push itself is a separate product decision. |
| P04 | Later | Delivery status in both commissioner email-history views | `memberEmails` returns IDs, dates and fetched provider content, but omits stored delivery status/reason from email logs. Surface the durable webhook outcome and actionable failures, especially for renewal invites. |
| P05 | Later | Native named CSV attachment | Mobile currently passes CSV as `Share.share({ message: csv })`. Offer a `.csv` file for reliable spreadsheet import and large leagues; preserve escaping and test share targets. |
| P06 | Later | Shared feature-level error/retry UX | Mobile renewal preview errors leave `!preview` displaying “Loading renewal invites...” indefinitely. Distinguish loading, permission denial, missing league and network failure with recovery actions. |
| P07 | Later | Explicit pick-save outcome across leagues | Show saved/skipped/locked/failed results per destination, particularly around kickoff and differing late policies. Preserve the draft if only some targets succeed. |
| P08 | Later | Reuse useful mobile home search on web if league count warrants it | Search/history organization is a mobile advantage. Treat this as an optional usability extension, not an established requirement violation. |

## PRD changes to decide before more implementation

| ID | Missing or ambiguous contract | Suggested clarification |
| --- | --- | --- |
| D01 | “Full parity” versus deliberate platform differences | Separate equivalent outcomes from identical UI. Mark native sharing/OTA diagnostics as platform-specific; explicitly classify pre-create invite review and CSV artifact support. |
| D02 | What counts as submitting a week? | API accepts partial arrays and visibility opens once any pick exists; clients require all available games. Decide whether one partial pick should unlock started opponent picks and whether partial saves are supported. |
| D03 | Deadline semantics | Specify exact kickoff equality, first-game policy behavior, tiebreaker deadline, postponed/canceled games, and mixed-policy apply-to-all results. |
| D04 | Super Bowl late entrants and scoring | Define eligibility after season start, creator's required-prediction timing, valid matchup/score constraints, and the board's winner/runner-up/score-difference ranking. The code has result ranking, but the PRD mainly specifies capture and bracket context. |
| D05 | Season lifecycle and corrections | Define regular-season versus postseason completion, renewal availability, the owner of persisted status, historical corrections and recomputation of winners. |
| D06 | Notification channel/preferences contract | State whether pick reminders need push in addition to email, opt-out persistence across devices, per-league/category controls, logout privacy and delivery retry guarantees. |
| D07 | Account lifecycle and privacy | Add acceptance for account switching, cache purge, device revocation and sensitive preview behavior. Consider account deletion/export as a product backlog item; not currently a PRD requirement. |
| D08 | Renewal permission after join | State how admins correct an intended role after an invite was successfully logged or the member joined, and how failed email delivery becomes eligible for retry. “Successfully logged” is not necessarily delivered. |
| D09 | Quantified release quality | Set actual responsiveness, accessibility, payload, offline and device/browser support targets, plus owners and measurable events for the proposed success metrics. |

The PRD correctly distinguishes some targets from current behavior, but the parity plan's `IN_PROGRESS` label mixes implemented/untested, partially implemented and actively changing features. Use separate implementation and validation columns, date evidence, and list the exact outstanding acceptance condition rather than general “polish/QA.”

## Verification and coverage limitations

Run during this audit on the pulled source using the existing local dependencies:

| Check | Result |
| --- | --- |
| `pnpm --filter @funtime/api test` | 7 tests passed. These cover postseason gating and Resend delivery-event helpers, not the router/cron scenarios above. |
| `pnpm --filter @funtime/mobile test -- --runInBand` | 13 suites, 52 tests passed. Primarily helpers/components; not full native journey coverage. |
| `pnpm typecheck` | API, web and mobile all passed. |
| Source audit | PRD/parity/coverage docs, web/native routes, shared writers/readers, schema/migrations, chat, auth/cache, push, scoring/notification cron and CI configuration inspected. |

No application build was run. No dependency installation, browser E2E, native build/device smoke, production queries, external sends or cron execution was performed. The findings are based on source tracing and existing lightweight checks; a passing typecheck or helper suite does not disprove a business-rule defect.

`docs/WEB_E2E_WORKLOG.md` records a 21-test August 8 baseline and says 22 tests in 18 files are currently defined. The audit found 24 top-level `test(...)` declarations, so the inventory/baseline narrative is stale. Several checked claims (admin kickoff lock, preseason privacy, idempotency) cover particular UI paths, not every equivalent API path or concurrency case. Its unchecked recovery, renewal, self-protection and Chat entries remain useful follow-ups; some may already have partial spec coverage and need reconciliation rather than wholly new tests.

`.github/workflows/mobile-e2e-supabase.yml` runs a scheduled/manual Android signup/create/pick smoke flow. It is not configured as a pull-request trigger and supplies no iOS job. The mobile Jest inventory does not include full renewal-role handoff, account-switch cache isolation, persistent unread cursor integration, push delivery, or commissioner Super Bowl review journeys.

Recommended validation backlog, in priority order:

1. Direct API integrity coverage for every pick writer, both late policies, season/team validation, concurrent writes, and profile redaction.
2. Mobile account-switch/offline/logout tests and notification preference persistence across restarts and multiple devices.
3. Final-week correction/recalculation and independent notification delivery retry tests with fake providers and a controlled clock.
4. Cross-platform renewal role retry, partial send, deferred invite, and join atomicity cases.
5. Cold/warm signed-in/signed-out deep links for the complete route matrix on iOS and Android, plus recovery-session E2E.
6. Chat read cursors across two clients, history pagination and lost-response retries; then accessibility and performance checks against explicit budgets.

## Suggested sequencing

First address high-impact integrity and privacy findings: F01–F06, F08–F09 and F11. Next repair result correction, atomic joins, lifecycle consistency and notification reliability. Then complete the commissioner/renewal parity surfaces and refresh coverage evidence. Defer broader new features until the shared rules and cross-device behavior have explicit acceptance coverage.

This report leaves the PRD and parity plan unchanged so observations and recommendations can be reviewed before being promoted into product commitments.

## September 6 follow-up findings

### F22 — Medium: selecting “No reminders” enables the API default instead

Both create screens omit `reminderPolicy` when their selected value is `none`. `league.create` defaults an omitted value to `three_hours_before`, and that is the only member of the Prisma `ReminderPolicy` enum. The nullable database field could represent disabled reminders, but the current create path does not write it for that selection. Renewal prefill can also turn an inherited disabled setting back on. Cron selects leagues with `reminder_policy: "three_hours_before"`.

Evidence: web `src/app/league/create/client-page.tsx` around the create payload; mobile `app/league/create.tsx` around `onSubmit`; API `league/index.ts` create schema/data; Prisma enum; cron reminder query. The observed source path contradicts the selected UI setting. Fix and acceptance checks: **WEB-07** in the priority list. No outbound delivery was tested.

### F23 — Release prerequisite: checked-in mobile production configuration is incomplete

`apps/mobile/app.json` uses display name `mobile` and lacks an explicit iOS bundle identifier. No `eas.json` was found in the repository. The native Android display name is also `mobile`, and `android/app/build.gradle` assigns the debug signing configuration to the release build type. Runtime/version configuration also needs an explicit OTA compatibility process.

These are repository observations, not proof that store identities, remote credentials or a separate build process do not exist. Verify the existing EAS project and actual artifact first, then document/reconcile configuration. See **MOB-05**; no build/signing/submission changes were made.

### F24 — Public release prerequisite: no account-deletion flow located

The inspected native account UI and shared auth/settings routers have no account-deletion flow. Because the app creates accounts, this is more than a potential future feature for a public store release. Apple requires in-app initiation of deletion; Google Play requires applicable apps to support deletion and provide an external request resource. [Apple guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app/), [Google Play guidance](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).

This supersedes D07's original suggestion to treat deletion as an optional backlog addition when the goal is public mobile distribution. **MOB-06** specifies work and acceptance criteria, including a decision on league history/creator ownership before destructive implementation. Existing externally hosted privacy/support pages and store configuration were not inspected.

### F25 — Public release prerequisite: Chat moderation needs report/block handling

The inspected messages API/native Chat implements author/admin deletion but no reporting, user-blocking or filtering workflow was found. Apple and Google publish moderation requirements for apps with user-generated content; private-league membership alone should not be treated as an exemption. [Apple UGC guidance](https://developer.apple.com/app-store/review/guidelines/#user-generated-content), [Google Play UGC guidance](https://support.google.com/googleplay/android-developer/answer/9876937?hl=en).

See **MOB-07** for a shared report/block/moderation workflow, push consequences, reviewer ownership and acceptance criteria. This raises the original PRD moderation open question to a distribution decision; it is not a claim of a received store rejection.

The September 6 follow-up was source/documentation work plus verification of primary store guidance. Existing test results above belong to the initial audit and were not rerun. No product implementation, external writes, build or release was performed.

## Original audit source references

These permalinks preserve the audited revision even after main changes.

- [Pick submission rules (F01/F02/F08)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/packages/api/server/api/routers/picks.ts#L57)

- [Player profile response (F03)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/packages/api/server/api/routers/playerProfileRouter.ts#L13)

- [Native member profile (F03)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/apps/mobile/components/profile/LeagueMemberProfile.tsx#L76)

- [Active mobile persistence (F04)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/apps/mobile/lib/trpc/react.tsx#L48)

- [Mobile query/retry defaults (F04/F18)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/apps/mobile/lib/trpc/create-query-client.ts#L4)

- [Native sign-out (F04/F06)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/apps/mobile/app/%28tabs%29/account.tsx#L318)

- [Push registration API (F05)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/packages/api/server/api/routers/settings.ts#L63)

- [Automatic push registration (F05)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/apps/mobile/hooks/usePushNotificationRegistration.ts#L95)

- [Admin pick mutation (F07/F08/F20)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/packages/api/server/api/routers/league/admin.ts#L729)

- [Weekly winner generation (F07)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/apps/web/src/cron/index.ts#L217)

- [Registration (F09/F10)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/packages/api/server/api/routers/league/index.ts#L349)

- [Super Bowl edit lock (F09)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/packages/api/server/api/routers/member/index.ts#L40)

- [Membership schema (F10)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/packages/api/prisma/schema.prisma#L101)

- [Pick schema (F08)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/packages/api/prisma/schema.prisma#L239)

- [Mobile renewal send (F11/P01/P06)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/apps/mobile/app/league/%5Bid%5D/renewal-invites.tsx#L81)

- [Renewal role mutation (F11)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/packages/api/server/api/routers/league/admin.ts#L512)

- [Deep-link mapping (F12)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/apps/mobile/lib/deeplink/resolveDeepLink.ts#L132)

- [Warm-link guard (F13)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/apps/mobile/hooks/useAuthHandler.ts#L148)

- [Season completion (F14)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/apps/web/src/cron/index.ts#L142)

- [Summary eligibility and timing (F15/F16)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/apps/web/src/cron/index.ts#L449)

- [Chat query (F17)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/packages/api/server/api/routers/messages/index.ts#L54)

- [Push transport (F19)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/packages/api/server/services/expo-push/index.ts#L67)

- [Username check (F21)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/packages/api/server/api/routers/settings.ts#L34)

- [Native create action (P01)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/apps/mobile/app/league/create.tsx#L190)

- [Commissioner Super Bowl endpoint (P02)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/packages/api/server/api/routers/league/admin.ts#L433)

- [Web notification placeholder (P03)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/apps/web/src/app/settings/notifications/page.tsx#L16)

- [Email-history response (P04)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/packages/api/server/api/routers/league/admin.ts#L814)

- [Native CSV sharing (P05)](https://github.com/bambrose24/funtime-t3/blob/aaa5f89c01aa46c0ea807b9daef2119d54839319/apps/mobile/app/league/%5Bid%5D/admin.tsx#L124)
