import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const migrationsDir = path.join(
  rootDir,
  "packages/api/prisma/migrations",
);
const lockPath = path.join(migrationsDir, "migration_lock.toml");
const assertScript = path.join(
  rootDir,
  "scripts/prisma/assert-schema-migrations-in-sync.ts",
);

describe("prisma schema / migration CI gate", () => {
  it("keeps migration_lock.toml checked in for postgresql", () => {
    assert.equal(existsSync(lockPath), true, "migration_lock.toml must exist");
    const contents = readFileSync(lockPath, "utf8");
    assert.match(contents, /provider\s*=\s*"postgresql"/);
  });

  it("fails closed when SHADOW_DATABASE_URL is missing", () => {
    const result = spawnSync("bun", [assertScript], {
      cwd: rootDir,
      env: {
        ...process.env,
        SHADOW_DATABASE_URL: "",
        PRISMA_SHADOW_DATABASE_URL: "",
      },
      encoding: "utf8",
    });
    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /SHADOW_DATABASE_URL is required/,
    );
  });
});
