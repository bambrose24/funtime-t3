# Mobile Parity Program Worklog

## Program Status
- Program: Mobile-Web Parity (player + admin parity).
- Branch: `codex/mobile-core-features`.
- Status: `IN_PROGRESS`.
- Worklog policy: mandatory update on task start/status change/commit/blocker/decision/validation.

## Current Phase
- Active phase: `Phase 0 - Foundation Refactor`.
- Pre-step: `0.0 Initialize and baseline WORKLOG.md`.

## Completed Tasks
- Task ID: `P0-WORKLOG-001`
  - Short title: Initialize `WORKLOG.md` governance and integrate with parity plan.
  - Scope touched: `WORKLOG.md`, `docs/MOBILE_PARITY_PLAN.md`.
  - Outcome: Added canonical root worklog with required sections, task schema, parity snapshot, and governance enforcement in parity plan (including Phase 0 pre-step and Worklog Gate Check).
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`.
  - Timestamp (UTC): `2026-02-25T02:53:24Z`.
- Task ID: `P0-MOB-INFRA-001`
  - Short title: Harden mobile auth, routing, and query hydration infrastructure.
  - Scope touched: `apps/mobile/hooks/useAuthHandler.ts`, `apps/mobile/lib/trpc/react.tsx`, `apps/mobile/utils/getBaseUrl.ts`, `apps/mobile/hooks/useColdStartPrefetch.ts`, `apps/mobile/app/index.tsx`, `apps/mobile/app/league/[id]/index.tsx`.
  - Outcome: Auth/onboarding routing stabilized, cache restore fixed, API base URL made env/device aware, hardcoded season logic removed, tab routing made URL-driven.
  - Validation run: `pnpm --filter @funtime/mobile typecheck`, `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T02:52:26Z`.
- Task ID: `P0-MSG-001`
  - Short title: Add league-wide messages API groundwork and admin delete behavior.
  - Scope touched: `packages/api/server/api/routers/messages/index.ts`.
  - Outcome: Introduced league-wide read/write endpoints, kept backward-compatible aliases, and enforced author-or-admin delete.
  - Validation run: `pnpm --filter @funtime/api typecheck`, `pnpm --filter @funtime/web typecheck`.
  - Timestamp (UTC): `2026-02-25T02:52:26Z`.

## In Progress
- None.

## Next Up
1. `P0-ARCH-001`: Route-group refactor (`(auth)`, `(tabs)`, bootstrap shell) with Supabase auth preserved.
2. `P1-LEAGUE-001`: Join/Create league parity screens and flows.
3. `P2-MSG-001`: Client migration to persistent league message board.
4. `P2-NOTIFY-001`: Expo push token registration + preferences foundation.

## Decisions & Rationale
- Full parity target includes player + admin (including global admin) to avoid permanent web-only operational gaps.
- Foundational refactor first to avoid repeated rewrites while adding parity features.
- Native-first UX parity to keep mobile ergonomics while preserving behavior parity.
- Dual-compat API window for messages to de-risk web/mobile migration sequencing.
- Notification strategy: Expo Push, contextual permission prompts, default core notifications enabled.

## Risks / Blockers
- Risk: Route refactor can cause regressions in deep links and auth redirects.
  - Owner: Implementer.
  - Mitigation: Add explicit bootstrap route tests and manual real-device smoke validation.
- Risk: Persistent message migration requires careful client cutover ordering.
  - Owner: Implementer.
  - Mitigation: Keep legacy endpoints until both clients are fully migrated and validated.
- Current blockers: None.

## Validation Evidence
- `2026-02-25T02:52:26Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T02:52:26Z`: `pnpm --filter @funtime/api typecheck` passed.
- `2026-02-25T02:52:26Z`: `pnpm --filter @funtime/web typecheck` passed.
- `2026-02-25T02:53:24Z`: `pnpm --filter @funtime/mobile typecheck` passed.
- `2026-02-25T02:53:24Z`: `pnpm --filter @funtime/api typecheck` passed.

## Parity Matrix Snapshot
| Area | Status | Notes |
|---|---|---|
| Auth/session | `in_progress` | Guard/bootstrap improvements done; route-group migration pending. |
| Home/nav leagues | `in_progress` | Functional baseline exists; parity polish and IA refactor pending. |
| Join league | `todo` | Not implemented in mobile parity shape. |
| Create league | `todo` | Not implemented in mobile parity shape. |
| League week view | `in_progress` | Existing implementation; parity behavior and UX consistency pending. |
| Pick submission | `in_progress` | Core flow exists; full parity and QA pending. |
| Leaderboard | `in_progress` | Present but parity verification/tie ranking QA pending. |
| Player/my profile | `todo` | Partial account screen only; full profile parity pending. |
| Super Bowl picks | `todo` | Pending. |
| Settings/profile | `todo` | Pending parity settings surface. |
| Messaging persistent board | `in_progress` | Backend groundwork complete; client migration pending. |
| Notifications | `todo` | Push/email summary pipeline not yet implemented. |
| League admin | `todo` | Pending. |
| Global admin | `todo` | Pending mobile implementation. |
