# Prisma schema and migrations

Checked-in SQL lives under `packages/api/prisma/migrations/`. `packages/api/prisma/schema.prisma` must stay in sync with those migrations. Production uses the `funtime_db` Postgres schema via `?schema=funtime_db` on database URLs.

**Applying migrations is always manual.** GitHub Actions and Railway deploys never run `prisma migrate deploy` against a shared or production database.

## How migrations run

| Environment | Command | When |
| --- | --- | --- |
| CI schema gate | `pnpm prisma:schema-sync` (`prisma migrate diff`) | Every PR — **read-only drift check**, does not apply SQL |
| Local / E2E Supabase | `pnpm e2e:backend:up` | Ephemeral local DB bootstrap only |
| Local development | `pnpm --filter @funtime/api db:migrate:dev` | Creating/applying during development |
| Production Railway `web` | `pnpm db:migrate:deploy` | **Manual**, after reviewing a deployment |
| Manual against a target DB | `pnpm db:migrate:deploy` with `DATABASE_URL` + `DIRECT_URL` set | Ops / recovery |

Do **not** use `db push` for shared or production environments. Prefer `prisma migrate deploy`.

Railway `web` has no pre-deploy command. Cron services do not run migrations. `pnpm db:migrate:deploy` and `pnpm prisma:migrate:apply` refuse to run when `CI=true`.

## CI gate (required)

GitHub Actions workflow **Prisma schema sync** runs:

```bash
pnpm prisma:schema-sync
```

That compares migrations → schema with `prisma migrate diff --exit-code` against a temporary Postgres shadow database. It never applies pending migrations.

| Exit | Meaning |
| --- | --- |
| 0 | Schema matches migrations — PR can stay green |
| 2 | Drift — you changed the schema without a migration (or vice versa). CI fails |
| 1 | Tooling/config error |

Locally (needs an empty Postgres DB as the shadow):

```bash
export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
export DIRECT_URL="$DATABASE_URL"
export SHADOW_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/prisma_shadow
createdb prisma_shadow   # once
pnpm prisma:schema-sync
```

## Required connection settings

- `DATABASE_URL`: app traffic (pooler is fine). Must include `?schema=funtime_db`.
- `DIRECT_URL`: used by Prisma migrate. Must also include `?schema=funtime_db`. Prefer a direct DB host over `*.pooler.supabase.com` when possible.

If `DIRECT_URL` omits the schema param, `migrate status` / `migrate deploy` look at `public` and will report every migration as pending even when `funtime_db` is up to date.

## Operator commands

Status (read-only), using Railway production env vars:

```bash
railway run -p <project> -e production -s web -- pnpm db:migrate:status
```

Apply pending migrations **manually** after reviewing the target deployment:

```bash
railway run -p <project> -e production -s web -- pnpm db:migrate:deploy
```

Local diagnostics helper (reads `.env.local` / env, prints host connectivity tips):

```bash
pnpm prisma:migrate:check
pnpm prisma:migrate:apply   # same check, then migrate deploy — never from CI
```

## Adding a schema change

1. Edit `packages/api/prisma/schema.prisma`.
2. Create SQL: `pnpm --filter @funtime/api exec prisma migrate dev --create-only --name <short_name>` (or `pnpm --filter @funtime/api db:migrate:dev` locally).
3. Review the migration; keep backfills explicit.
4. Confirm `pnpm prisma:schema-sync` passes.
5. Merge and deploy the application. App deploys do not apply SQL.
6. After reviewing the deployment, run `pnpm db:migrate:deploy` manually against the target production database.
