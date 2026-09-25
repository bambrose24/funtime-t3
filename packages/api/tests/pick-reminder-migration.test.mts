import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import pg from "pg";

const databaseUrl = process.env.PICK_REMINDER_TEST_DATABASE_URL;

test(
  "reminder migration backfills prior sends once per person and preserves new eligibility",
  {
    skip: !databaseUrl,
  },
  async () => {
    const url = new URL(databaseUrl!);
    assert.ok(
      ["127.0.0.1", "localhost"].includes(url.hostname),
      "Use an isolated local test database",
    );
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    try {
      await client.query("BEGIN");
      // All fixtures and migration DDL are rolled back; no application tables are touched.
      const schema = `reminder_test_${crypto.randomUUID().replaceAll("-", "")}`;
      await client.query(`CREATE SCHEMA "${schema}"`);
      await client.query(`SET LOCAL search_path TO "${schema}"`);
      await client.query(`
      CREATE TABLE "leagues" (league_id INTEGER, season INTEGER);
      CREATE TABLE "leaguemembers" (membership_id INTEGER, user_id INTEGER);
      CREATE TABLE "EmailLogs" (
        email_log_id TEXT, league_id INTEGER, member_id INTEGER,
        email_type TEXT, week INTEGER, resend_id TEXT
      );
      INSERT INTO "leagues" VALUES (10, 2026), (20, 2027);
      INSERT INTO "leaguemembers" VALUES (1, 100), (2, 100), (3, 200);
      INSERT INTO "EmailLogs" VALUES
        ('first', 10, 1, 'week_reminder', 4, 'id-first'),
        ('duplicate-membership', 10, 2, 'week_reminder', 4, 'id-duplicate'),
        ('other-week', 10, 1, 'week_reminder', 5, 'id-week5'),
        ('other-season', 20, 1, 'week_reminder', 4, 'id-2027'),
        ('summary', 10, 3, 'week_summary', 4, 'id-summary'),
        ('missing-week', 10, 3, 'week_reminder', NULL, 'id-null');
    `);
      await client.query(
        readFileSync(
          new URL(
            "../prisma/migrations/20260925000000_claim_pick_reminder_delivery/migration.sql",
            import.meta.url,
          ),
          "utf8",
        ),
      );
      const migrated = await client.query(
        `SELECT league_id, user_id, season, week, state FROM "PickReminderDelivery" ORDER BY league_id, week`,
      );
      assert.deepEqual(migrated.rows, [
        { league_id: 10, user_id: 100, season: 2026, week: 4, state: "sent" },
        { league_id: 10, user_id: 100, season: 2026, week: 5, state: "sent" },
        { league_id: 20, user_id: 100, season: 2027, week: 4, state: "sent" },
      ]);
      // Existing deliveries cannot acquire another claim even with a new row ID.
      const duplicate = await client.query(
        `INSERT INTO "PickReminderDelivery" (id, league_id, user_id, season, week) VALUES ('retry', 10, 100, 2026, 4) ON CONFLICT DO NOTHING`,
      );
      assert.equal(duplicate.rowCount, 0);
      const fresh = await client.query(
        `INSERT INTO "PickReminderDelivery" (id, league_id, user_id, season, week) VALUES ('fresh', 10, 200, 2026, 4) ON CONFLICT DO NOTHING RETURNING state`,
      );
      assert.deepEqual(fresh.rows, [{ state: "sending" }]);
    } finally {
      await client.query("ROLLBACK");
      await client.end();
    }
  },
);
