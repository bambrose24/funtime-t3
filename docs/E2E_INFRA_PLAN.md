# E2E Infra Plan: Portable Supabase-Backed Mobile Testing

## 0. Current Status Snapshot (Paused)
Status captured: `2026-02-27T21:36:04Z` (UTC)

- Program status: paused for later pickup with implementation preserved.
- Completed and validated:
  - season/env abstraction and deterministic `2025` fixture/seed pipeline,
  - local Supabase bootstrap and seed verification scripts,
  - Android dev-build E2E runner orchestration (emulator/dev-client/deep-link path),
  - `E2E_MODE` provider guards (Resend/Expo Push/ESPN/MSF/Axiom/PostHog/cron paths),
  - mobile Jest baseline (`3/3` suites, `7/7` tests), API/Web typechecks.
- Remaining to close this plan:
  - run full host-side `pnpm e2e:mobile:maestro` and capture definitive pass/fail,
  - harden selectors/startup for any remaining flaky step in signup/login/create-pick path,
  - promote stable run to CI confidence (manual workflow verification).
- Environment caveat for resume:
  - this Codex sandbox cannot start `adb` daemon (`could not install *smartsocket* listener: Operation not permitted`);
  - run final E2E validation in a normal host terminal session.

## 1. Goal
Stand up a portable local E2E environment for Expo mobile that:
- runs against local Supabase in Docker,
- uses deterministic seeded schedule data,
- keeps season logic aligned (`CURRENT_SEASON=2025`), and
- validates that pick submission persists in local Postgres.

## 2. Scope
- Backend/runtime season abstraction:
  - `FUNTIME_CURRENT_SEASON` (API/server)
  - `NEXT_PUBLIC_CURRENT_SEASON` (web)
  - `EXPO_PUBLIC_CURRENT_SEASON` (mobile)
- Deterministic fixture pipeline:
  - committed fixture: `supabase/fixtures/season-2025.json`
  - generated seed SQL: `supabase/seed.sql`
  - optional live refresh: `pnpm e2e:fixtures:refresh`
- Local Supabase orchestration:
  - `supabase/config.toml`
  - auth configured for local test signup without email confirmations
- E2E orchestration scripts:
  - `pnpm e2e:backend:up`
  - `pnpm e2e:seed:verify`
  - `pnpm e2e:mobile:maestro`
- Outbound provider guardrails in E2E:
  - `E2E_MODE=1` disables side-effect providers (email/push/telemetry/sports pulls) during test runs.
- CI workflow (manual + nightly):
  - `.github/workflows/mobile-e2e-supabase.yml`

## 3. Data Strategy
### 3.1 Canonical committed fixture
- File: `supabase/fixtures/season-2025.json`
- Contents: `teams` + `games` only.
- Leagues/members/picks are created by E2E flows.

### 3.2 Live refresh pipeline
Run manually when schedule fixtures need to be updated:
```bash
LIVE_DATABASE_URL='postgresql://...'
FUNTIME_CURRENT_SEASON=2025
E2E_SCHEDULE_ANCHOR_UTC='2026-09-11T00:00:00Z'
pnpm e2e:fixtures:refresh
```

What refresh does:
1. Dumps `teams` + `games where season=2025` from live DB.
2. Writes raw snapshot to `supabase/.temp/live-season-2025.raw.json`.
3. Shifts all game `ts` to a future anchor (deterministic offset).
4. Resets game completion state (`done=false`, scores/winner reset).
5. Writes committed fixture and regenerates `supabase/seed.sql`.

## 4. Season and Pickability Safeguards
- Season constants now resolve from env-backed `CURRENT_SEASON` with fallback `2025`.
- Seed verification (`pnpm e2e:seed:verify`) checks:
  - games exist for season,
  - first game is in the future,
  - first week is `1`,
  - seeded games are not marked done,
  - simulated week/pick flow can persist picks.
- Local Supabase ports for this project are isolated to avoid conflicts with other stacks:
  - API: `55421`
  - DB: `55422`
  - Studio: `55423`

### 4.1 External side-effect guard in E2E
- E2E runs must set `E2E_MODE=1` (runner default).
- Under `E2E_MODE`, runtime integrations are mocked/short-circuited:
  - API email provider (`resendApi`)
  - API push provider (`expoPushApi`)
  - External sports-data pulls (ESPN/MySportsFeeds clients)
  - Axiom telemetry transports (API + web runtime logger paths)
  - Web PostHog init/capture
  - Web cron/postseason sync entrypoints

## 5. Local Runbook
### 5.0 Prerequisites
- Docker Desktop running.
- Supabase CLI installed.
- Workspace dependencies installed (`pnpm install` at repo root).
- Android tooling for mobile E2E:
  - `adb` available in `PATH`
  - at least one created AVD (the runner can auto-start it)
  - Maestro CLI installed (`maestro` in `PATH`)
  - Android dev build installed for app id `com.funtime.mobile` (install once via `pnpm e2e:mobile:install-dev-client`)

### 5.1 Backend setup + seed + verification
```bash
pnpm e2e:backend:up
```

### 5.2 Start web/API against local Supabase
```bash
pnpm e2e:backend:up -- --start-web
```

### 5.3 Run Maestro smoke flow
```bash
pnpm e2e:mobile:maestro
```

Resume checkpoint sequence:
```bash
adb devices
pnpm e2e:backend:up
pnpm e2e:mobile:maestro
```

Runner behavior:
- If no Android device is connected, the script auto-starts an emulator.
- Default requested AVD label is `Pixel 9a` (fuzzy-matched to available AVDs, for example `Pixel_9a`).
- Override target AVD with:
```bash
E2E_ANDROID_AVD="MyAVDName" pnpm e2e:mobile:maestro
```
- The runner now fully orchestrates local prerequisites:
  1. backend bootstrap (`supabase start/reset`, migrate, seed, verify),
  2. web API dev server,
  3. Expo mobile dev server in dev-client mode,
  4. deep-link launch into Android dev build (`com.funtime.mobile`),
  5. Maestro execution with unique generated test user credentials.
- If the Android dev build is missing, the runner auto-installs it by default.
- Disable auto-install and fail fast instead:
```bash
E2E_INSTALL_DEV_CLIENT=0 pnpm e2e:mobile:maestro
```
- Install/refresh dev build manually:
```bash
pnpm e2e:mobile:install-dev-client
```
- Skip backend bootstrap when already running:
```bash
pnpm e2e:mobile:maestro -- --skip-backend-up
```

## 6. CI Strategy
Workflow: `.github/workflows/mobile-e2e-supabase.yml`

Triggers:
- `workflow_dispatch` (manual)
- nightly schedule

Stages:
1. install dependencies/tooling
2. generate deterministic seed
3. start Supabase + reset + Prisma migrate + seed + verify
4. run web API server
5. run Android emulator + Expo dev client + Maestro flow
6. upload logs/artifacts

## 7. Troubleshooting
### 7.1 `supabase db reset` fails
- Confirm Docker is running.
- Confirm `supabase/config.toml` is present.

### 7.2 Prisma migrate fails against Supabase local DB
- Ensure `DATABASE_URL` and `DIRECT_URL` point to `postgresql://postgres:postgres@127.0.0.1:55422/postgres`.

### 7.3 Seed verify fails with "first game must be in the future"
- Regenerate fixture with newer `E2E_SCHEDULE_ANCHOR_UTC` and rebuild seed.

### 7.4 Mobile app cannot reach API on Android emulator
- Use emulator host bridge URL: `http://10.0.2.2:3000` (not `localhost`).

### 7.5 Signup flow blocked by confirmation
- Verify `supabase/config.toml` has `[auth.email].enable_confirmations = false`.

### 7.6 `pnpm e2e:mobile:maestro` fails immediately
- If command-not-found appears, install required CLIs (`maestro`, Android platform-tools/`adb`).
- If no device is detected, start an Android emulator first (`adb devices` must show a `device` entry).
- If runner reports missing app `com.funtime.mobile`, install the dev build once with `pnpm e2e:mobile:install-dev-client`.
- If `adb` prints `could not install *smartsocket* listener: Operation not permitted`, rerun from a non-sandboxed host terminal (environment restriction, not app logic failure).

## 8. Governance
- Any flow/screen/backend behavior change that affects auth/league/picks must update:
  1. relevant Jest/RNTL tests,
  2. Maestro flow(s) when behavior changes user-visible pathing, and
  3. seed verification logic if season/pickability logic changes.
- If deferred, log a dated exception + follow-up ticket in `WORKLOG.md` and `E2E_INFRA_WORKLOG.md`.
