#!/usr/bin/env bun
/**
 * Fails when packages/api/prisma/schema.prisma is ahead of checked-in migrations.
 *
 * Uses `prisma migrate diff --exit-code`:
 *   0 = in sync
 *   1 = command error
 *   2 = drift (a new migration is required)
 *
 * Requires SHADOW_DATABASE_URL (empty Postgres database). DATABASE_URL / DIRECT_URL
 * are only needed so Prisma can load the schema datasource block.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..", "..");
const apiDir = path.join(rootDir, "packages", "api");
const schemaPath = path.join(apiDir, "prisma", "schema.prisma");
const migrationsDir = path.join(apiDir, "prisma", "migrations");
const lockPath = path.join(migrationsDir, "migration_lock.toml");

function fail(message: string, code = 1): never {
  console.error(message);
  process.exit(code);
}

const shadowUrl =
  process.env.SHADOW_DATABASE_URL ?? process.env.PRISMA_SHADOW_DATABASE_URL;
if (!shadowUrl) {
  fail(
    "SHADOW_DATABASE_URL is required (empty Postgres DB for prisma migrate diff).",
  );
}

if (!existsSync(schemaPath)) {
  fail(`Missing Prisma schema at ${schemaPath}`);
}
if (!existsSync(migrationsDir)) {
  fail(`Missing migrations directory at ${migrationsDir}`);
}
if (!existsSync(lockPath)) {
  fail(
    `Missing ${lockPath}. Prisma needs migration_lock.toml (provider = "postgresql").`,
  );
}

const placeholderUrl =
  process.env.DATABASE_URL ??
  process.env.DIRECT_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/postgres";

const result = spawnSync(
  "pnpm",
  [
    "exec",
    "prisma",
    "migrate",
    "diff",
    "--from-migrations",
    "./prisma/migrations",
    "--to-schema-datamodel",
    "./prisma/schema.prisma",
    "--shadow-database-url",
    shadowUrl,
    "--exit-code",
  ],
  {
    cwd: apiDir,
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL ?? placeholderUrl,
      DIRECT_URL: process.env.DIRECT_URL ?? placeholderUrl,
    },
    encoding: "utf8",
  },
);

if (result.stdout?.trim()) {
  console.log(result.stdout.trimEnd());
}
if (result.stderr?.trim()) {
  console.error(result.stderr.trimEnd());
}

const code = result.status ?? 1;
if (code === 0) {
  console.log(
    "OK: prisma schema matches checked-in migrations (no pending migration needed).",
  );
  process.exit(0);
}

if (code === 2) {
  fail(
    [
      "Schema drift detected: packages/api/prisma/schema.prisma does not match",
      "packages/api/prisma/migrations.",
      "",
      "Create a migration before merging:",
      "  pnpm --filter @funtime/api db:migrate:create -- --name <short_name>",
      "",
      "CI stays red until the SQL migration is checked in. Deploying app code that",
      "expects a new column/table without running migrate deploy will break production.",
    ].join("\n"),
    2,
  );
}

fail(
  `prisma migrate diff failed with exit code ${code}${
    result.error ? `: ${result.error.message}` : ""
  }`,
  1,
);
