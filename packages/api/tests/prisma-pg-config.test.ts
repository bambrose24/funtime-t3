import { expect, test } from "bun:test";
import { prismaPgConfigFromUrl } from "../utils/prismaPgConfig";

test("passes the Prisma schema query param to the pg adapter", () => {
  expect(
    prismaPgConfigFromUrl(
      "postgresql://user:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres?schema=funtime_db&pgbouncer=true",
    ),
  ).toEqual({
    connectionString:
      "postgresql://user:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
    schema: "funtime_db",
  });
});

test("keeps postgres URLs and trailing schema params", () => {
  expect(
    prismaPgConfigFromUrl(
      "postgres://user:pass@localhost:5432/postgres?pgbouncer=true&schema=funtime_db",
    ),
  ).toEqual({
    connectionString: "postgres://user:pass@localhost:5432/postgres?pgbouncer=true",
    schema: "funtime_db",
  });
});

test("leaves URLs without a schema param unchanged", () => {
  const connectionString =
    "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
  expect(prismaPgConfigFromUrl(connectionString)).toEqual({
    connectionString,
  });
});
