---
name: funtime-observability
description: Investigate Funtime production incidents with Railway runtime, HTTP, network, and deployment logs plus PostHog events, error tracking, logs, and session recordings. Use for login failures, slow requests, blank or stuck screens, production errors, regressions, user-session investigations, or requests to inspect Railway/PostHog telemetry for this repository.
---

# Funtime Observability

Use Railway for server/runtime evidence and PostHog for browser behavior. Correlate them by a narrow UTC time window, route, deployment, browser/device, and—only when the user supplied it—an account identifier.

## Guardrails

- Treat emails, IP addresses, request IDs, session IDs, and recording URLs as sensitive. Do not paste raw identifiers into summaries, commits, PRs, or tickets.
- Prefer aggregates and redacted excerpts. Fetch the smallest useful time range and result count.
- Keep all API keys out of the repository. PostHog's `NEXT_PUBLIC_POSTHOG_KEY` is an ingestion key and cannot query analytics.
- Use read-only commands by default. Ask before changing telemetry configuration, creating dashboards, deleting recordings, restarting services, or deploying.
- Use UTC timestamps in queries and report both UTC and the user's relevant local time when correlating a screenshot.

## Start with the incident frame

1. Capture the route/screen, approximate time and timezone, device/browser, visible result, expected result, and whether login itself succeeded.
2. Convert the time into a narrow UTC window, normally five minutes on either side.
3. Inspect the current deployment before attributing behavior to source code.
4. Query Railway and PostHog independently, then correlate. Do not assume an HTTP 2xx means navigation or client rendering succeeded.

## Railway workflow

The repo is linked to the `Funtime` project. Production's app service is `web`; resolve current IDs from `railway status --json` instead of copying IDs into instructions.

For every Railway CLI call, set these variables inline:

```bash
RAILWAY_CALLER=skill:funtime-observability@1.0.0 RAILWAY_AGENT_SESSION=<stable-id-for-this-investigation> railway status --json
```

Then use the bundled helper for compact historical snapshots:

```bash
.agents/skills/funtime-observability/scripts/railway-web-logs.sh runtime-errors 1h 50
.agents/skills/funtime-observability/scripts/railway-web-logs.sh axiom-edge-errors 1h 50
.agents/skills/funtime-observability/scripts/railway-web-logs.sh http-errors 1h 50
.agents/skills/funtime-observability/scripts/railway-web-logs.sh slow-http 1h 50
.agents/skills/funtime-observability/scripts/railway-web-logs.sh network-drops 1h 50
```

For an exact screenshot window, call `railway logs` directly with `--since <ISO-8601>` and `--until <ISO-8601>`. Start with HTTP status and duration metadata. Fetch more runtime output only after a suspicious request or error signature is identified.

Read [references/repo-observability.md](references/repo-observability.md) before diagnosing Funtime-specific auth or Axiom behavior.

## PostHog setup

The pinned CLI is available through `pnpm posthog`. Authentication is per developer machine and must never be committed.

```bash
pnpm posthog:login
```

Alternatively, supply `POSTHOG_CLI_API_KEY` and `POSTHOG_CLI_PROJECT_ID` through a secure local environment. Use a personal API key with the narrowest read scopes that cover the intended query.

Verify access with a small schema read:

```bash
.agents/skills/funtime-observability/scripts/posthog-project-check.sh
pnpm posthog:api -- call read-data-schema '{"query":{"kind":"events","limit":25}}'
```

The project check compares the authenticated project's public token with production's `NEXT_PUBLIC_POSTHOG_KEY` without printing either token. A mismatch means the CLI is authenticated correctly but cannot inspect Funtime's production data; rerun login and select the project that owns the production token.

The CLI downloads its API bundle under `POSTHOG_HOME`. If the home directory is sandboxed, set `POSTHOG_HOME` to a private writable directory. Do not put credentials in that directory or commit it.

## PostHog investigation workflow

1. Run `pnpm posthog:api -- search <concept>`; do not guess tool names.
2. Run `pnpm posthog:api -- info <tool>` once and follow its input schema.
3. Call `read-data-schema` before relying on event or property names.
4. For a stuck web login, look for sessions that visited `/login`, console errors, rage clicks, and the expected destination page. Use `query-session-recordings-list` with a narrow date range and `recording` filters such as `visited_page` or `console_error_count`.
5. Use `query-error-tracking-issues-list`, then `query-error-tracking-issue-events`, then recording IDs from `$session_id` when error tracking is populated.
6. Use `query-logs` only after discovering `service.name` values and always provide a service/resource filter plus an explicit date range.

Useful discovery commands:

```bash
pnpm posthog:api -- search query-session-recordings
pnpm posthog:api -- search query-error-tracking
pnpm posthog:api -- search query-logs
pnpm posthog:api -- info query-session-recordings-list
```

If a query returns no data, distinguish “no matching incident” from “that telemetry is not ingested.” Check the schema and service/attribute discovery tools before concluding there was no error.

## Report findings

Lead with the most likely cause and confidence. Include the correlated window, deployment commit, affected route, observed HTTP duration/status, relevant client error or recording behavior, and telemetry gaps. Separate direct evidence from inference and recommend the smallest next instrumentation change when evidence is missing.
