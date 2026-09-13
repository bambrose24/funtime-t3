# Mobile app audit: initialization, core plumbing and PRD parity

Audit date: September 12, 2026 (America/New_York).

Source: `origin/main` at `5efc01a`. The audit was read from a working tree on
`codex/weekly-league-recap` (`16a1661`), but that branch changes no file under
`apps/mobile` and none of the routers cited below, so every finding applies
unchanged to `main`.

Scope: the Expo mobile app, with emphasis on application initialization, the
shared query/cache layer, authentication handoff, and parity against
[the PRD](PRD.md). This is a documentation-only audit. No application code,
tests, database records or infrastructure were changed.

Finding IDs: this report owns **F26–F35**. F01–F25 belong to
[the September 5 cross-platform audit](PRD_CROSS_PLATFORM_AUDIT_2026-09-05.md)
and keep their original meaning. Implementation tickets for these findings are
in [the engineering priority list](ENGINEERING_PRIORITY_LIST.md).

## Overall assessment

The feature surface is broad, and the shared integrity fixes merged since
September 5 (WEB-01 kickoff enforcement, WEB-02 late policy and named
outcomes, WEB-03a pick validation, WEB-04 prediction privacy, WEB-05a atomic
registration) improved mobile behavior without mobile-side work.

The concern is the layer beneath the screens. Cache identity, offline mutation
handling, query invalidation, the launch sequence and crash visibility each
have defects that no individual screen can compensate for. Separately, the
mobile-specific queue from the prior audit has not moved: one mobile commit has
landed since September 5, so F04–F06, F11–F13, F17–F18, F20, F22–F25 remain
open as previously described.

Recommended order is the serial queue in the priority list: hygiene warm-up,
then account isolation, then the data layer, then product surfaces.

## Verification performed

| Check                                          | Result                                     |
| ---------------------------------------------- | ------------------------------------------ |
| `pnpm --filter @funtime/mobile typecheck`      | Pass                                       |
| `pnpm --filter @funtime/mobile test`           | 15 suites, 57 tests pass                   |
| Source trace of app init, auth, cache and push | Complete for the files cited below         |
| Native build, device run, push delivery        | Not performed; no claim is made about them |

A passing typecheck and unit suite do not disprove any finding below. The
existing mobile suite covers pure helpers and three components; none of it
exercises the query client, the tRPC provider, sign-out or cache persistence.

## Findings: initialization and core plumbing

### F26 — High: identity changes never reset the query cache, on sign-in or sign-out

**Platform:** mobile. **Confidence:** confirmed source path; device
account-switch reproduction still required.

This is the concrete mechanism behind F04, and it is broader than that finding
described: the defect exists on sign-in as well as sign-out.

- `app/(auth)/auth.tsx` "refreshes" data after `signInWithPassword` with
  `setTimeout(() => utils.invalidate(), 100)`. That is a race-based delay, and
  `invalidate()` only marks queries stale — it never removes the previous
  account's cached responses.
- `app/(tabs)/account.tsx` `signOut` calls only `supabase.auth.signOut()`.
- The `onAuthStateChange` listener in `hooks/useAuthHandler.ts` updates session
  state and nothing else.
- `lib/trpc/react.tsx` installs an AsyncStorage persister with a single shared
  key and a seven-day `maxAge`, restoring all queries on launch.

No call site anywhere clears the `QueryClient` or removes the persisted entry.
With a five-minute `staleTime`, a second user on the same installation can be
shown the previous account's session, league, profile and chat data, and
offline that data is authoritative rather than transient.

`lib/trpc/cache-persistence.ts` is a separate unused module and is not the
installed persister; see F31.

**Suggested acceptance:** sign in as A, visit private screens, sign out, sign
in as B, restart offline, and observe no A data. Cover the invalid-refresh-token
recovery path in `clearPersistedSupabaseSession`, not only explicit sign-out.

### F27 — High: persisted mutations can never resume, while retries remain enabled

**Platform:** mobile. **Confidence:** confirmed source contradiction.

`lib/trpc/react.tsx` calls `queryClient.resumePausedMutations()` after the
persisted cache is restored. No `setMutationDefaults` registration exists
anywhere in the app, so a mutation persisted across a restart has no
`mutationFn` to resume with and fails silently. The app therefore advertises an
offline-queueing capability it cannot deliver.

At the same time `lib/trpc/create-query-client.ts` sets
`mutations: { networkMode: "offlineFirst", retry: 2 }`. Non-idempotent writes —
chat posts, league joins, pick submissions — can pause invisibly and be retried
automatically, which is the duplicate-write risk recorded as F18.

The two halves are individually defensible and jointly incoherent: one implies
durable offline writes, the other silently discards them.

**Suggested acceptance:** choose one contract and prove it. Either remove
mutation persistence and automatic retries, or register per-mutation defaults
with client-side operation IDs and prove commit-then-response-loss produces no
duplicate.

### F28 — Medium: every mutation invalidates the whole app, and chat turns that into a loop

**Platform:** mobile. **Confidence:** confirmed implementation.

`lib/trpc/create-query-client.ts` installs a `MutationCache` whose `onSettled`
calls `qc.invalidateQueries({ refetchType: "active" })` — every active query,
after every mutation.

In an open Chat tab this compounds. `components/messages/LeagueMessageBoard.tsx`
polls `messages.leagueMessageBoard` every ten seconds, and the near-bottom
effect calls `markRead` whenever the newest message changes. Each incoming
message therefore triggers a `markRead` mutation, which refetches every active
query, including the full unpaginated message thread (F17) and the session and
league queries. `hooks/useLeagueUnreadMessages.ts` independently polls
`messages.unreadCounts` on its own ten-second interval.

The result is avoidable network, battery and database load that scales with
chat activity, precisely during games.

**Suggested acceptance:** measure requests per incoming message before and
after. A read receipt must not refetch unrelated queries, and one league thread
must not require two independent polls.

### F29 — Medium: cold start shows a blank frame instead of holding the splash

**Platform:** mobile. **Confidence:** confirmed source path.

`app/_layout.tsx` returns `null` while fonts and the color scheme load, and
`TRPCReactProvider` returns `null` until the asynchronous cache restore
resolves. Neither calls `SplashScreen.preventAutoHideAsync` or `hideAsync`,
even though `expo-splash-screen` is installed and configured in `app.json`.

The splash therefore hides on its own schedule and the user sees a blank frame
before the first screen on every cold start. A slow or failed cache restore
extends it.

**Suggested acceptance:** cold start on a physical device shows splash then
first frame with no blank interval, and a failed restore still reaches the app
within a bounded timeout.

### F30 — Medium: no error boundary, no crash reporting, and anonymous analytics

**Platform:** mobile. **Confidence:** confirmed absence in the inspected tree.

- No React error boundary exists above the router, and no crash reporter is
  installed. A render error in production is an unrecoverable blank screen with
  no telemetry and no user-facing retry.
- `providers/PostHogProvider.tsx` initializes PostHog but never calls
  `identify`, so every event carries an anonymous device identifier. There is
  no `reset` on sign-out either, so events after an account switch are
  attributed to the prior anonymous profile.
- `lib/logging/index.ts` forwards every non-debug log as a `mobile_log` capture
  with unbounded spread metadata (`...combinedMeta`).
- `lib/posthog.ts` sets `enableSessionReplay: true` directly beside the inline
  comment "Disable session replay for mobile". Session replay on a private
  league app should be an explicit, documented decision rather than a
  contradiction in two adjacent lines.

**Suggested acceptance:** a thrown render error produces a recoverable screen
and exactly one reported event with user context; analytics identity follows
the signed-in user and resets on sign-out; replay is a recorded decision.

### F31 — Medium: conditional hook calls, and a dead cache module that invites a wrong fix

**Platform:** mobile. **Confidence:** confirmed source.

- `app/_layout.tsx` calls `useCacheDebugger()` inside `if (__DEV__)`, and
  `app/(tabs)/home.tsx` calls `useDataAvailabilityTracker()` the same way. This
  only works because `__DEV__` is constant for a given build; it violates the
  rules of hooks and breaks under any refactor that makes the condition dynamic.
- `lib/trpc/cache-persistence.ts` is unused. It declares its own
  `funtime-trpc-cache` storage key, a 24-hour `maxAge`, a query allowlist, and a
  `handleLogout()` helper that clears a key the installed persister never
  writes. Anyone fixing logout by calling it would clear nothing and reasonably
  believe F26 was fixed.
- `useIsomorphicLayoutEffect` in `app/_layout.tsx` resolves to `useEffect` in
  both branches.
- `app/league/[id]/index.tsx` is a single 1,849-line module containing seven
  tab surfaces, the header, sharing and modal behavior.

**Suggested acceptance:** no conditional hook call sites remain; the dead module
is gone or is the real integration point; behavior is unchanged.

## Findings: privacy and product behavior

### F32 — Medium: peer email addresses are shown to every league member

**Platforms:** shared API response and mobile UI. **Confidence:** confirmed
source path. Desired policy needs a product decision.

`playerProfileRouter.get` returns the member with `people` included, and
`components/profile/LeagueMemberProfile.tsx` renders
`member.people.email` for any member viewing any other member's profile.

PRD §7.5 specifies member profiles as correct/wrong totals, accuracy, week
wins, message count and Super Bowl context. Email is not part of that contract.
WEB-04 established the pattern for this class of problem: project only the
fields clients need, in the response, rather than hiding data in one client.

The admin-gated renewal invite list also displays emails; that is a defensible
commissioner affordance and is not part of this finding.

**Suggested acceptance:** decide whether peer email visibility is intentional.
If not, the peer response contains no email while commissioner review and
self-view are unchanged. If it is intentional, record it in the PRD.

### F33 — Low: pick locks are evaluated once at mount, and there is no closed-week state

**Platform:** mobile. **Confidence:** confirmed source path.

`components/picks/ClientPickPage.tsx` computes lock state from `new Date()`
when the form initializes and in the `onTeamPick`/`randomizePicks` guards. If a
kickoff passes while the form is open, the UI continues to present that game as
pickable. The server now rejects or skips it correctly, so the user's feedback
arrives as an after-the-fact outcome rather than a live lock.

The mobile form also has no weekly-cutoff display and no closed state for
`close_at_first_game_start` leagues. PRD §6.1 states the client shows the
weekly cutoff and replaces the pick form when the deadline passes; web does
this and mobile does not.

Separately, the tiebreaker validation is `Number(val) < 200` while the adjacent
copy promises "between 1 and 200" and the API accepts `<= 200`. This is the
score half of F20, still present.

**Suggested acceptance:** a kickoff passing with the form open locks that game
and its tiebreaker without a reload; a closed week replaces the form; a score
of exactly 200 is accepted everywhere the copy promises it.

### F34 — Low: notification taps bypass the deep-link allowlist

**Platform:** mobile. **Confidence:** confirmed source path.

`hooks/usePushNotificationRegistration.ts` reads
`response.notification.request.content.data.path` and calls
`router.push(path as any)` without validation, while URL deep links go through
`lib/deeplink/resolveDeepLink.ts` and its route allowlist. Two navigation
entry points, one of them unguarded: a stale or malformed payload lands on
`+not-found` with no preserved intent and no recovery action.

This shares a root cause with F13, where the warm-link guard in
`useAuthHandler` compares pathnames only and discards a changed `week` or `tab`
query parameter.

**Suggested acceptance:** taps and URLs resolve through one validated
destination function; unknown destinations produce a useful outcome; week and
tab context changes navigate while already inside that league.

### F35 — Low: Chat reads as mechanical rather than modern

**Platform:** mobile. **Confidence:** confirmed implementation.

- The header renders "auto-refreshes every 10s" and the footer renders "Pull
  down to sync". Both describe the implementation rather than the product, and
  §7.2.2 of the PRD asks for copy that leads with meaning.
- There is no optimistic send. `onSend` awaits `writeMessage` and then awaits a
  full board invalidation before the message appears, which reads as lag beside
  any modern chat client.
- The delete affordance is a 14px icon inside a `p-1` pressable with no
  `hitSlop`, below a comfortable touch-target size.

**Suggested acceptance:** a sent message appears immediately and reconciles or
rolls back; no user-facing copy describes the refresh mechanism; interactive
targets meet a stated minimum size.

## Status of prior mobile findings

Verified against source on September 12. Nothing in this table is a new claim;
it records which September 5 findings are still reproducible in source.

| ID  | Finding                                  | Status | Evidence                                                                                             |
| --- | ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| F03 | Preseason prediction leak via profile    | FIXED  | WEB-04 redacts in the response; mobile honors `superbowlPickHidden`.                                 |
| F04 | Mobile cache not isolated by account     | OPEN   | Sign-out unchanged; persister unchanged. Mechanism detailed as F26.                                  |
| F05 | Registration reverses notification opt-out | OPEN | `settings.registerPushToken` still writes `enabled: true` in both create and update branches.        |
| F06 | Signed-out devices still receive pushes  | OPEN   | No token revocation on sign-out.                                                                     |
| F11 | Renewal retry erases web-selected roles  | OPEN   | `renewal-invites.tsx` still sends only `leagueId` and `memberIds`.                                   |
| F12 | Web links resolve to missing native routes | OPEN | `resolveDeepLink` still passes any `/league/` prefix through unchanged.                               |
| F13 | Warm links discard week/tab context      | OPEN   | `useAuthHandler` still compares pathname only and returns early.                                     |
| F17 | Chat downloads full history              | OPEN   | `messages.leagueMessageBoard` still unpaginated; mobile slices locally. Compounded by F28.            |
| F18 | Retries lack mutation idempotency        | OPEN   | `retry: 2` with `offlineFirst` unchanged. See F27.                                                   |
| F20 | Validation and labels disagree           | OPEN   | Tiebreaker still `< 200` against a server bound of `<= 200`. See F33.                                |
| F22 | "No reminders" restores the default      | OPEN   | `app/league/create.tsx` omits `reminderPolicy` when `none`; the API defaults it to three hours before. |
| F23 | Production build configuration incomplete | OPEN  | `app.json` name and Android `app_name` are still `mobile`; no `eas.json`; no iOS bundle identifier; release build type uses the debug signing config. |
| F24 | No account-deletion flow                 | OPEN   | No deletion mutation or native action found.                                                          |
| F25 | Chat moderation incomplete               | OPEN   | Author/admin delete only; no report, block or filter workflow.                                        |

WEB-02c (named saved/skipped pick outcomes on mobile) merged as PR #37 and is
consumed by the native confirmation alert.

## Parity gaps against the PRD

| Gap                                     | PRD reference                                    | Current mobile state                                                                                                                                                                                    |
| --------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home weekly-status league list          | §7.2 "Home screen league list (Web; Target for mobile)" | Web consumes `home.leagues` with `weeklyStatus`. Mobile still uses `home.summary` and shows season stat cards, a prominent Create League action, member-count ordering, and single-league auto-open. No weekly submission status appears anywhere. |
| Closed-week pick state and visible cutoff | §6.1                                           | No cutoff display and no closed state; relies on per-game locks and server skip outcomes. See F33.                                                                                                       |
| Current-season league ordering          | §7.2                                             | Mobile sorts by member count descending within a season; the PRD specifies season descending, then name ascending, then league ID. `home.leagues` already returns the correct order.                      |
| Commissioner Super Bowl review          | §7.8                                             | No native caller of `league.admin.superbowlPicks`. Tracked as P02 and MOB-09.                                                                                                                            |
| Renewal roles and invite context        | §7.2.1                                           | Selection, share, send and skip exist; next-season role controls, already-invited counts and missed-pick context do not. Preview failure renders "Loading renewal invites..." indefinitely.                |
| Account deletion, privacy and support   | Store requirement                                | Not implemented. MOB-06.                                                                                                                                                                                 |
| Chat report and block                   | Store requirement                                | Not implemented. MOB-07.                                                                                                                                                                                 |
| Named CSV export artifact               | §7.8                                             | CSV is shared as message text rather than a `.csv` file. P05, low priority.                                                                                                                              |

## Coverage limitations

The mobile Jest suite has no harness for anything that touches the query
client or the tRPC provider: `jest.config.js` sets `roots: ["<rootDir>/tests"]`
and `collectCoverageFrom` explicitly excludes `lib/trpc/**/*`. Sign-out, cache
persistence, identity transitions, invalidation behavior and offline mutation
handling are consequently untested.

That is a design constraint on the fixes, not only a testing gap: the remedies
for F26–F28 need their logic extracted into pure, injectable modules so they
can be asserted without rendering the application. The corresponding tickets
state this explicitly.

No native build, device run, push delivery, deep-link open, production query or
external send was performed as part of this audit.
