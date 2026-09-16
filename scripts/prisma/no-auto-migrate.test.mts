import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function read(rel: string) {
  return readFileSync(path.join(rootDir, rel), "utf8");
}

const APPLY_PATTERNS = [
  /migrate\s+deploy/,
  /db:migrate:deploy/,
  /prisma:migrate:apply/,
  /db:migrate:check:apply/,
];

describe("prisma migrate deploy stays manual", () => {
  it("Railway configs never run migrations as pre-deploy", () => {
    for (const rel of [
      "apps/web/railway-web.json",
      "apps/web/railway-cron.json",
      "apps/web/railway-non-sunday-cron.json",
    ]) {
      const json = JSON.parse(read(rel)) as {
        deploy?: { preDeployCommand?: string[] };
      };
      const pre = json.deploy?.preDeployCommand ?? [];
      assert.deepEqual(
        pre,
        [],
        `${rel} must not set a pre-deploy command`,
      );
      const blob = JSON.stringify(json);
      for (const pattern of APPLY_PATTERNS) {
        assert.equal(
          pattern.test(blob),
          false,
          `${rel} must not invoke ${pattern}`,
        );
      }
    }
  });

  it("GitHub Actions never apply Prisma migrations", () => {
    const dir = path.join(rootDir, ".github/workflows");
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".yml") && !name.endsWith(".yaml")) continue;
      const contents = read(path.join(".github/workflows", name));
      for (const pattern of APPLY_PATTERNS) {
        assert.equal(
          pattern.test(contents),
          false,
          `${name} must not run ${pattern}`,
        );
      }
    }
  });

  it("operator apply scripts refuse to run when CI=true", () => {
    const deploy = spawnSync("bun", ["scripts/prisma/migrate-deploy.ts"], {
      cwd: rootDir,
      env: { ...process.env, CI: "true" },
      encoding: "utf8",
    });
    assert.notEqual(deploy.status, 0);
    assert.match(`${deploy.stdout}\n${deploy.stderr}`, /not allowed in CI/);

    const apply = spawnSync(
      "bun",
      ["scripts/prisma/validate-migrations.ts", "--apply"],
      {
        cwd: rootDir,
        env: { ...process.env, CI: "true" },
        encoding: "utf8",
      },
    );
    assert.notEqual(apply.status, 0);
    assert.match(`${apply.stdout}\n${apply.stderr}`, /not allowed in CI/);
  });
});
