# Funtime Architecture (Web-First, Mobile-Ready)

## 1. Scope
This document describes the current architecture of the Funtime monorepo with emphasis on the **Next.js web app** as the primary product surface.

It is intended to support:
- Faster onboarding for contributors
- Shared understanding of system boundaries
- Mobile companion planning against existing backend contracts

## 2. Monorepo Structure
- `apps/web`: Next.js web app (App Router), current primary client.
- `apps/mobile`: Expo React Native app (in-progress companion client).
- `packages/api`: Shared backend package:
  - tRPC routers/procedures
  - Prisma client + schema
  - service integrations (ESPN, email provider)
  - shared utilities/types

The root workspace uses Turbo + pnpm for orchestration.

## 3. High-Level System Design
1. User interacts with Next.js UI (`apps/web`).
2. Web app calls tRPC via:
  - Server Components (`serverApi` direct caller)
  - Client Components (`/api/trpc` route + `clientApi`)
3. tRPC procedures in `packages/api` resolve auth context, validate input, and execute business logic.
4. Prisma reads/writes PostgreSQL data.
5. Background cron jobs sync NFL data and compute derived outcomes.
6. Email notifications are sent via Resend integration.

## 4. Web Request + Data Flow

### 4.1 App Layer
- Next.js App Router in `apps/web/src/app`.
- Most primary pages are league-centric:
  - Home
  - League overview
  - Weekly picks
  - Leaderboard
  - Super Bowl picks
  - League admin
  - Settings/auth flows

### 4.2 API Access Patterns
- `serverApi` (`apps/web/src/trpc/server.ts`):
  - Used from Server Components.
  - Creates request-scoped tRPC context.
  - Supports server-side prefetching/hydration patterns.
- `clientApi` (`apps/web/src/trpc/react.tsx`):
  - Used from Client Components via React Query.
  - Calls `apps/web/src/app/api/trpc/[trpc]/route.ts`.

### 4.3 Authentication
- Supabase auth is the source of user identity.
- Middleware (`apps/web/src/middleware.ts`) refreshes session using Supabase SSR helpers.
- tRPC context (`packages/api/server/api/trpc.ts`) loads:
  - `supabaseUser`
  - app DB user (`dbUser`) from `people`
  - league memberships/roles

### 4.4 Authorization Model
- `publicProcedure`: open to anonymous or authenticated calls.
- `authorizedProcedure`: requires authenticated app user (`dbUser`).
- Many procedures enforce additional league membership/admin checks in-router.
- Super-admin gating currently checks a static allowlist email.

## 5. Backend API Architecture (`packages/api`)

### 5.1 Router Composition
Primary app router (`server/api/root.ts`) composes domain routers:
- `auth`, `session`, `settings`
- `home`, `league`, `member`, `picks`
- `games`, `teams`, `time`
- `leaderboard`, `playerProfile`, `messages`
- `generalAdmin`, `postseason`

### 5.2 Domain Responsibilities
- `league`: lifecycle, join/create, week selection, pick summaries, winners, Super Bowl picks.
- `picks`: pick submission and week coverage.
- `member`: user-member-specific operations (weekly picks, Super Bowl update).
- `leaderboard`: season standings aggregation/ranking + chart datasets.
- `messages`: league messaging (currently week-scoped).
- `postseason`: bracket/seeding data for playoff context.
- `league.admin`: commissioner workflows (roles, member management, pick edits, broadcasts).

### 5.3 Caching + Performance
- Select procedures use custom middleware (`publicCacheMiddleware` / `authorizedCacheMiddleware`) with tag/parameter-based revalidation windows.
- Some server-side data is cached for short intervals (e.g. leaderboard, games, teams).
- Context and query clients are request-stable in server-side tRPC helpers.

## 6. Data Model (Prisma)
Core entities (from `packages/api/prisma/schema.prisma`):
- `people`: app users
- `leagues`: league configuration and season linkage
- `leaguemembers`: membership, role, donated/paid tracking
- `games`: regular-season game schedule/results
- `picks`: weekly user picks and correctness
- `WeekWinners`: weekly winner materialization
- `superbowl`: season-long Super Bowl predictions
- `leaguemessages`: league board messages
- `EmailLogs`: notification/broadcast audit trail
- `postseason_games`, `postseason_team_seeds`: playoff bracket model

Enums encode policies/statuses:
- late policy
- reminder policy
- league status
- role/message/email types

## 7. Background Jobs and Automation

### 7.1 Regular Season Cron (`apps/web/src/cron/index.ts`)
Runs data maintenance and automation:
- Syncs regular-season games from ESPN
- Updates scores, winners, and pick correctness
- Creates weekly winners using tiebreak logic
- Updates records, tiebreaker flags, and schedule corrections
- Sends reminder emails before lock window
- Triggers postseason sync

### 7.2 Postseason Sync (`apps/web/src/cron/postseason.ts`)
- Syncs playoff seeds and postseason games from ESPN
- Upserts bracket structure and game outcomes
- Supports Super Bowl bracket UI data

## 8. Messaging Architecture (Current vs Target)

### Current
- Messages are scoped to `leagueId + week`.
- Message board fetch/write/delete procedures operate on week context.

### Target Direction (Product Decision)
- Persistent league-wide message board (not week-partitioned, week removed).
- League admins can delete any message in their league.
- Requires schema/API/UI updates across:
  - `leaguemessages` usage patterns
  - tRPC message procedures
  - league page composition
  - notification fanout logic (near real-time message pushes)

## 9. Mobile Companion Integration
- Mobile app should consume the same tRPC API surface from `packages/api`.
- `createTRPCContext` already supports bearer-token auth header paths for React Native.
- Strategy:
  1. Keep domain logic in `packages/api` (single source of business truth).
  2. Keep web/mobile UI platform-specific.
  3. Drive parity by mapping mobile screens to existing web-backed procedures.

## 10. Operational Notes
- Primary dependencies:
  - Next.js 15 + React 19 (web)
  - tRPC v11
  - Prisma + PostgreSQL
  - Supabase auth
  - Resend email
  - ESPN ingest via service client
- Logging:
  - tRPC and Prisma query logging hooks
  - middleware request logging

## 11. Known Gaps / Planned Evolution
- Messaging model migration to persistent board.
- Mobile admin parity rollout after core player loop.
- Notification expansion:
  - week summary push with personal-result payload and deep-link to week page
  - week summary email with league-wide recap/state
  - scheduled delivery morning after week completion (exact trigger logic TBD)
  - near real-time message notifications
- Potential policy refinements around late pick behavior and offseason UX.
