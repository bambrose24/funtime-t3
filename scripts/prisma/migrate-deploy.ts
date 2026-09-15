#!/usr/bin/env bun
/**
 * Operator-only Prisma migrate deploy.
 * Refuses to run in CI so GitHub Actions cannot apply schema changes.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (process.env.CI === "true") {
  console.error(
    "[prisma] migrate deploy is not allowed in CI. Apply migrations manually against the target database.",
  );
  process.exit(1);
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const result = spawnSync(
  "pnpm",
  [
    "--filter",
    "@funtime/api",
    "exec",
    "prisma",
    "migrate",
    "deploy",
    "--schema",
    "prisma/schema.prisma",
  ],
  { cwd: rootDir, stdio: "inherit", env: process.env },
);

process.exit(result.status ?? 1);
