# E2E Infrastructure Worklog

## Program Status
- Program: Portable Supabase-backed mobile E2E infrastructure.
- Branch: `codex/mobile-core-features`.
- Status: `PAUSED` (handoff-ready; resume pending local host E2E validation).

## Current Phase
- Phase: Android dev-build E2E stabilization + final pass validation.

## Pause Snapshot (UTC `2026-02-27T21:36:04Z`)
- User requested a pause on finishing the testing plan so work can be resumed later with a clear handoff state.
- Last validated:
  - `pnpm --filter @funtime/mobile test -- --runInBand` passed (`3/3` suites, `7/7` tests).
  - `pnpm --filter @funtime/api typecheck` passed.
  - `pnpm --filter @funtime/web typecheck` passed.
- Not yet validated in this environment:
  - Full `pnpm e2e:mobile:maestro` pass/fail (blocked here by sandboxed `adb` daemon startup permission: `could not install *smartsocket* listener: Operation not permitted`).
- Resume commands (host terminal, not sandboxed):
  1. `adb devices` (confirm emulator is visible as `device`).
  2. `pnpm e2e:backend:up`
  3. `pnpm e2e:mobile:maestro`
  4. If failure: collect `/tmp/funtime-e2e-web.log`, `/tmp/funtime-e2e-expo.log`, `/tmp/funtime-e2e-open-link.log`, `/tmp/funtime-e2e-emulator.log` and rerun with same env.

## Completed Tasks
- Task ID: `E2E-INFRA-011`
  - Short title: Capture paused handoff snapshot with exact validation and restart instructions.
  - Scope touched: `E2E_INFRA_WORKLOG.md`, `docs/E2E_INFRA_PLAN.md`, `WORKLOG.md`.
  - Outcome: Recorded current pass/fail status, unresolved blocker, and concrete restart checklist so testing-plan work can be resumed without re-discovery.
  - Validation run: Docs/worklog update only (status capture task).
  - Timestamp (UTC): `2026-02-27T21:36:04Z`.

- Task ID: `E2E-INFRA-010`
  - Short title: Enforce `E2E_MODE` outbound-provider guard across remaining telemetry/provider paths.
  - Scope touched: `packages/api/utils/logging/index.ts`, `apps/web/src/app/(auth)/provider/UserProviderClient.tsx`, `apps/web/src/cron/postseason.ts`, `apps/web/src/utils/logging/index.ts`.
  - Outcome: Extended E2E guard coverage so local/CI E2E runs do not emit external calls to Axiom or PostHog, and postseason cron now exits early under `E2E_MODE`.
  - Validation run: `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-27T20:43:44Z`.

- Task ID: `E2E-INFRA-009`
  - Short title: Migrate Android E2E startup from Expo Go to Expo dev build.
  - Scope touched: `scripts/e2e/run-maestro.sh`, `scripts/e2e/install-dev-client.sh`, `apps/mobile/app.json`, `apps/mobile/package.json`, `apps/mobile/e2e/flows/*`, `package.json`, `docs/E2E_INFRA_PLAN.md`, `docs/TESTING_STRATEGY.md`.
  - Outcome: Replaced Expo Go app targeting with Android dev-build app id `com.funtime.mobile`, added automatic dev-client install path (with manual command `pnpm e2e:mobile:install-dev-client`), switched Expo startup to `--dev-client`, and updated Maestro flows/docs for deep-link bootstrap against the dev build.
  - Validation run: `bash -n scripts/e2e/run-maestro.sh`, `bash -n scripts/e2e/install-dev-client.sh`.
  - Timestamp (UTC): `2026-02-27T01:41:31Z`.

- Task ID: `E2E-INFRA-007`
  - Short title: Auto-start Android emulator from E2E runner with Pixel 9a default targeting.
  - Scope touched: `scripts/e2e/run-maestro.sh`, `docs/E2E_INFRA_PLAN.md`.
  - Outcome: Updated mobile E2E runner to auto-start an emulator when no device is connected, default target set to `Pixel 9a` (fuzzy-matched to AVD names), with configurable `E2E_ANDROID_AVD` override and explicit timeout/log diagnostics.
  - Validation run: `bash -n scripts/e2e/run-maestro.sh`, `pnpm e2e:mobile:maestro -- --skip-backend-up` (dry run shows auto-start path and emulator boot wait logs).
  - Timestamp (UTC): `2026-02-27T01:03:06Z`.

- Task ID: `E2E-INFRA-006`
  - Short title: Install local mobile E2E toolchain and add strict preflight checks.
  - Scope touched: `scripts/e2e/run-maestro.sh`, local machine tooling install (`maestro`, `openjdk@17`, `android-platform-tools`).
  - Outcome: Installed required local CLI/runtime dependencies and updated runner preflight to fail fast with explicit guidance when no Android device/emulator is attached.
  - Validation run: `maestro --version` (`2.2.0`), `adb --version` (`36.0.2`), `pnpm e2e:mobile:maestro -- --skip-backend-up` (expected preflight failure: no device/emulator).
  - Timestamp (UTC): `2026-02-27T00:18:11Z`.

- Task ID: `E2E-INFRA-005`
  - Short title: Resolve local Supabase port collision and validate end-to-end backend bootstrap.
  - Scope touched: `supabase/config.toml`, `scripts/e2e/backend-up.sh`, `scripts/e2e/verify-seed.mjs`, `scripts/e2e/run-maestro.sh`, `.github/workflows/mobile-e2e-supabase.yml`, `docs/E2E_INFRA_PLAN.md`.
  - Outcome: Moved this project to dedicated local ports (`55421`/`55422`/etc.) to avoid collisions with existing Supabase stacks, fixed Postgres CTE syntax in seed verification inserts, and validated full `pnpm e2e:backend:up` sequence through reset+migrate+seed+week-1 pickability checks.
  - Validation run: `pnpm e2e:backend:up` (pass), `node --check scripts/e2e/verify-seed.mjs`, `bash -n scripts/e2e/backend-up.sh`, `bash -n scripts/e2e/run-maestro.sh`.
  - Timestamp (UTC): `2026-02-26T21:59:38Z`.

- Task ID: `E2E-INFRA-001`
  - Short title: Introduce env-backed season abstraction across API/mobile/web.
  - Scope touched: `packages/api/utils/const.ts`, `apps/mobile/constants/index.ts`, `apps/web/src/utils/const.ts`, `packages/api/env.js`, `apps/web/src/env.js`, `.env.example`, `turbo.json`.
  - Outcome: Replaced hardcoded season constants with env-backed `CURRENT_SEASON` helpers and added shared env declarations.
  - Validation run: Static code review + typecheck step pending with broader infra run.
  - Timestamp (UTC): `2026-02-26T00:00:00Z`.

- Task ID: `E2E-INFRA-002`
  - Short title: Add deterministic fixture + seed generation pipeline.
  - Scope touched: `supabase/fixtures/season-2025.json`, `supabase/seed.sql`, `scripts/e2e/lib.mjs`, `scripts/e2e/generate-seed-from-fixture.mjs`, `scripts/e2e/refresh-fixtures-from-live.mjs`, `package.json`.
  - Outcome: Added committed schedule fixture, seed generator, and live refresh path that transforms season 2025 games into future timestamps.
  - Validation run: `pnpm e2e:fixtures:build-seed`.
  - Timestamp (UTC): `2026-02-26T00:00:00Z`.

- Task ID: `E2E-INFRA-003`
  - Short title: Add local Supabase orchestration + seed verification.
  - Scope touched: `supabase/config.toml`, `scripts/e2e/backend-up.sh`, `scripts/e2e/verify-seed.mjs`, `package.json`.
  - Outcome: Added one-command backend bootstrap (`supabase start/reset`, Prisma migrate, deterministic seed apply, pickability verification).
  - Validation run: `pnpm e2e:backend:up` (after Docker availability).
  - Timestamp (UTC): `2026-02-26T00:00:00Z`.

- Task ID: `E2E-INFRA-004`
  - Short title: Add Maestro flow scaffold and CI workflow.
  - Scope touched: `apps/mobile/e2e/flows/smoke-signup-create-pick.yaml`, `apps/mobile/e2e/flows/smoke-join-existing-league.yaml`, `scripts/e2e/run-maestro.sh`, `.github/workflows/mobile-e2e-supabase.yml`.
  - Outcome: Added first-pass Android Maestro smoke flows and CI workflow (manual + nightly) wiring local Supabase and emulator execution.
  - Validation run: Pending CI dry-run and selector hardening on device.
  - Timestamp (UTC): `2026-02-26T00:00:00Z`.

## In Progress
- `E2E-INFRA-008`: Harden Maestro selectors (`testID` coverage) and stabilize join-league second-user flow in CI.
- `E2E-INFRA-012` (next on resume): Execute full host-side `pnpm e2e:mobile:maestro` and record definitive pass/fail with artifacts.

## Next Up
1. Run host-side full E2E and log definitive result in this worklog (`E2E-INFRA-012`).
2. If E2E fails: patch selectors/flow boot logic, rerun, and record failure class + fix.
3. Validate CI workflow runtime and adjust emulator/app boot timing once local pass is stable.
4. Refresh committed fixture from live DB when credentials/network are available and verify no schema drift.

## Decisions & Rationale
- Keep deterministic in-repo fixture as default for portability.
- Use season `2025` with future timestamp shifting to keep backend pick logic open for week 1.
- Seed only `teams` + `games`; create leagues/members/picks through tests.

## Risks / Blockers
- This Codex sandbox cannot start `adb` daemon (`Operation not permitted`), so emulator/device validation must run in a normal host terminal.
- Maestro selector stability may vary without additional `testID` instrumentation.
- Full CI emulator flow may need retries/timeouts tuned for Expo startup variability.
- Local machine execution requires extra tooling (`maestro`, `adb`, running emulator/device) that may not be present by default.

## Validation Evidence
- `pnpm e2e:fixtures:build-seed` completed successfully and regenerated `supabase/seed.sql`.
- `pnpm e2e:backend:up` completed successfully on local Docker with deterministic seed verification (`weekToPick=1`, persisted picks).
- `pnpm e2e:mobile:maestro -- --skip-backend-up` now reaches device preflight and fails only due missing connected emulator/device.
- `pnpm --filter @funtime/mobile test -- --runInBand` passed (`3/3` suites, `7/7` tests) at `2026-02-27T21:36:04Z`.
- `pnpm --filter @funtime/api typecheck` and `pnpm --filter @funtime/web typecheck` passed at `2026-02-27T21:36:04Z`.

## Notes
- This is a dedicated worklog for E2E infra. Mobile parity feature work remains tracked in `WORKLOG.md`.
