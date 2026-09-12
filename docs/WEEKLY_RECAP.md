# Weekly league recap

Each member receives their own results first, followed by the top three weekly places (including ties at third), full standings link, and next-week picks button. At season end the button is omitted.

Weekly rank uses correct picks descending, then absolute difference from the final tiebreaker game's combined score ascending. Equal results share a rank, with subsequent positions skipped (1, 1, 3). Missing predictions display N/A and sort behind submitted predictions for equal correct counts. Season rank uses cumulative correct picks through the recap week; movement is previous rank minus current rank. Week 1 has no movement suffix.

## Timing

The scoring cron records `games.completed_at` when it first observes a final result with both scores available. Every game must be final before a recap is eligible. Send at 8 a.m. America/New_York, with retries through noon. Completion before 6 a.m. belongs to the previous game night and receives that morning's recap; completion at or after 6 a.m. receives the following morning's recap. Missed morning runs can catch up the following morning. Daylight saving changes are handled explicitly.

Already-completed games without a timestamp are assigned their first observation time by the updated cron. This may defer unsent historical recaps to the next morning. The existing one-month cutoff and per-member email logs still apply. Completion timestamps reflect observation by the cron, not an official timestamp from ESPN; extended feed/cron outages can delay sending.

## Delivery

A unique database claim on `(league_id, user_id, season, week)` is acquired **before** calling the provider. This includes user identity rather than membership identity so duplicate memberships or leaving/rejoining cannot resend the recap. Concurrent cron runs use an atomic insert; only the winner sends. Legacy email logs are backfilled into claims during migration.

States are `sending`, `sent`, `retryable`, and `uncertain`. Only a confirmed HTTP 429 rejection becomes automatically retryable, using an atomic compare-and-set to ensure one retrying worker. Accepted messages become `sent` before the secondary EmailLogs write. Network timeouts, unknown provider errors, and missing message IDs are held for review. Claims never expire automatically. Provider idempotency remains an additional safeguard.

This favors avoiding duplicate emails over guaranteed delivery: a crash after claiming but before sending may leave a message unsent. An operator must verify the provider outcome before manually releasing a held claim. The cron logs these errors; held claims can be inspected in WeeklyRecapDelivery. EmailLogs/webhooks continue to track accepted-message delivery.

## Rollout and verification

Pause the old cron and let in-flight runs finish. Apply `20260911000000_track_game_completion` and `20260911010000_claim_weekly_recap_delivery`, then deploy the updated code and resume the cron. This avoids an old worker sending between legacy-log backfill and the new claim mechanism. Regenerate the Prisma client as usual. No additional email provider or scheduled service is required. Existing cron configuration runs often enough for the 8 a.m. window.

Run:

```sh
pnpm --filter @funtime/api test
bun test ./packages/api/tests/week-summary/summary.test.tsx --coverage
pnpm --filter @funtime/api typecheck
pnpm --filter @funtime/web typecheck
```

The isolated delivery test process replaces Resend, the database, and webhook reconciliation with in-memory doubles; tests do not send email or contact a database. The recap suite covers ranking, winners, ties, missing picks, season movement, completion timing, DST, rendered content, escaping, and final-week links. Delivery tests cover personalized recipients, failures, logging, and stable retry identities.
