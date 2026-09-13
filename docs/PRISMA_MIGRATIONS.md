# Prisma schema and migrations

Checked-in SQL lives under `packages/api/prisma/migrations/`. `packages/api/prisma/schema.prisma` must stay in sync with those migrations.

## CI gate (required)

GitHub Actions workflow **Prisma schema sync** runs:

```bash
pnpm prisma:schema-sync
```

That compares migrations → schema with `prisma migrate diff --exit-code` against a temporary Postgres shadow database.

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

## Adding a schema change

1. Edit `packages/api/prisma/schema.prisma`.
2. Create SQL: `pnpm --filter @funtime/api db:migrate:create -- --name <short_name>`.
3. Review the migration; keep backfills explicit.
4. Confirm `pnpm prisma:schema-sync` passes.
5. Merge only after CI is green. Treat migration-bearing PRs as needing a deliberate `pnpm db:migrate:deploy` (or Railway operator run) against the target DB before/at cutover — app deploys do not invent schema.

Do **not** use `db push` for shared or production databases.
