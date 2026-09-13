# Prisma migrations

Schema changes ship as checked-in SQL under `packages/api/prisma/migrations/`. Production uses the `funtime_db` Postgres schema via `?schema=funtime_db` on database URLs.

## How migrations run

| Environment | Command | When |
| --- | --- | --- |
| Local / E2E Supabase | `pnpm e2e:backend:up` (includes `prisma migrate deploy`) | Backend bootstrap |
| Local manual | `pnpm --filter @funtime/api db:migrate:dev` | Creating/applying during development |
| Production Railway `web` | `npm run db:migrate:deploy` | **Pre-deploy** on every `web` deploy (`apps/web/railway-web.json`) |
| Manual against a target DB | `pnpm db:migrate:deploy` with `DATABASE_URL` + `DIRECT_URL` set | Ops / recovery |

Do **not** use `db push` for shared or production environments. Prefer `prisma migrate deploy`.

Cron services do not run migrations; only `web` does, so a single deploy applies schema once.

## Required connection settings

- `DATABASE_URL`: app traffic (pooler is fine). Must include `?schema=funtime_db`.
- `DIRECT_URL`: used by Prisma migrate. Must also include `?schema=funtime_db`. Prefer a direct DB host over `*.pooler.supabase.com` when possible.

If `DIRECT_URL` omits the schema param, `migrate status` / `migrate deploy` look at `public` and will report every migration as pending even when `funtime_db` is up to date.

## Operator commands

Status (read-only), using Railway production env vars:

```bash
railway run -p <project> -e production -s web -- pnpm db:migrate:status
```

Apply pending migrations manually (only if pre-deploy did not run or you need an out-of-band fix):

```bash
railway run -p <project> -e production -s web -- pnpm db:migrate:deploy
```

Local diagnostics helper (reads `.env.local` / env, prints host connectivity tips):

```bash
pnpm prisma:migrate:check
pnpm prisma:migrate:apply   # same check, then migrate deploy
```

## Adding a schema change

1. Update `packages/api/prisma/schema.prisma`.
2. Create a migration: `pnpm --filter @funtime/api db:migrate:create -- --name <short_name>` (or `db:migrate:dev` locally).
3. Review the generated SQL; keep backfills explicit and conservative.
4. Merge; production `web` pre-deploy runs `prisma migrate deploy` before the new release receives traffic.
