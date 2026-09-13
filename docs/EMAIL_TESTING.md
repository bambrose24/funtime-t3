# Test emails

Run from the repository root on this branch. No arguments displays the catalog without sending anything. The default recipient is `bambrose24@gmail.com`.

```sh
pnpm email:test
pnpm email:test --type week-summary
pnpm email:test --type week-summary --scenario shared
pnpm email:test --type league-welcome --to you@example.com --league-id 42
pnpm email:test --all --dry-run
pnpm email:test --all
```

| Email ID | What it previews | Scenarios (first is default) |
| --- | --- | --- |
| `league-welcome` | Registration welcome | `default` |
| `picks-reminder` | Reminder to make picks | `default` |
| `picks-confirmation` | Saved picks and tiebreaker prediction | `single-league`, `multiple-leagues` |
| `week-summary` | Weekly and season results | `tiebreaker`, `outright`, `shared`, `missing-picks`, `final-week` |
| `league-broadcast` | Admin message with Markdown | `default` |
| `renewal-invite` | Player invitation for next season | `default` |
| `renewal-confirmation` | Organizer's renewal confirmation | `invited-players`, `one-invitee`, `no-invitees` |
| `component-demo` | Development button template, not a production email | `default` |

`--all` sends **eight emails**, one default scenario per ID, to the selected inbox. Requests are spaced one second apart. Use `--type` and `--scenario` for individual variants. `--all` cannot be combined with `--type` or `--scenario`.

`--dry-run` prints the rendered plain-text version and needs no credentials. Sending requires `RESEND_API_KEY` in your environment or untracked root `.env.local`. Both `E2E_MODE` and `FUNTIME_DISABLE_EMAILS` prevent sending when enabled.

All previews use the real templates and synthetic data. Subjects start with `[TEST: <ID>]`. No production users are queried, and no database records, email logs, or recap delivery claims are changed. You can rerun the command to receive more previews. Provider acceptance does not guarantee inbox delivery.

The default league ID 123 is a placeholder; set `--league-id` for links to a league you belong to. Renewal invitations contain a nonfunctional example join code. The demo uses example.com. Authentication emails managed by Supabase are not repository email templates and are outside this catalog.

The registry is `packages/api/utils/emailPreview.ts`. Adding a new template requires registering a preview: the test suite compares the catalog with every template directory and renders every registered scenario as HTML and plain text.
