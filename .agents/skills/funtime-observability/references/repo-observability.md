# Funtime observability map

## Production services

- Railway project: `Funtime` (the repository is linked; resolve live IDs with `railway status --json`).
- Production application service: `web`.
- Public web route involved in the September 3, 2026 login incident: `/login` followed by `/`.

## Web telemetry

- PostHog browser initialization and manual `$pageview` capture live in `apps/web/src/app/(auth)/provider/UserProviderClient.tsx`.
- The browser identifies a signed-in user only after `clientApi.session.current` returns a database user.
- Session recording is enabled. Password inputs are masked; other form input masking must be reviewed before sharing a recording.
- There are currently no explicit web events for login submit, auth success, redirect requested, redirect completed, or redirect failure. A successful authentication followed by stalled navigation therefore has to be inferred from pageviews/session replay and server traffic.
- Next.js request-error capture is registered in `apps/web/src/instrumentation.ts` through Axiom.
- Server and client Axiom transports live under `apps/web/src/lib/axiom/`.

## Known login incident signature

On September 3, 2026, production Railway HTTP logs aligned with an iPhone screenshot showing “Successfully logged in” while still on `/login`. Requests to `/login` and `/` repeatedly took about 20.5–20.9 seconds. Runtime logs reported an unsupported `CompressionStream` in the Edge runtime and the Axiom client timing out after 20 seconds.

The hotfix in PR #30 removes the per-request Axiom log and `logger.flush()` from Next middleware while retaining Supabase session refresh. When investigating later incidents, first verify whether the active Railway deployment contains that change; do not assume it has shipped merely because the PR exists.

## Correlation limits and next instrumentation

Railway HTTP logs can establish server response status, route, duration, request ID, deployment, source IP, and user agent. PostHog can establish browser page sequence, console errors, and session behavior if those products contain data. The current implementation does not attach a shared correlation ID across Railway, Axiom, and PostHog.

## September 3, 2026 CLI setup check

The PostHog CLI was installed and authenticated successfully, but its scoped project was `Chronicle Expo` (ID `330074`). A secret-safe hash comparison showed that project's public token did not match production's `NEXT_PUBLIC_POSTHOG_KEY`. Empty CLI results from that session therefore describe the wrong project and must not be used to claim Funtime has no telemetry. Rerun `pnpm posthog:login`, explicitly select the project that owns production's token, and verify with `scripts/posthog-project-check.sh` before querying.

At the same time, Railway showed the production `web` service was still running commit `20c72ed`, before PR #30, and continued emitting the Axiom `CompressionStream`/20-second timeout signature. Recheck the active deployment rather than treating this dated observation as current state.

If evidence remains ambiguous, add explicit sanitized lifecycle events rather than logging credentials or auth payloads:

- `login_submitted`
- `login_succeeded`
- `login_redirect_started`
- `login_destination_rendered`
- `login_failed` with a low-cardinality failure category

Include route, app version/release, platform, and a generated correlation ID. Never include passwords, access tokens, refresh tokens, or raw authentication responses.
