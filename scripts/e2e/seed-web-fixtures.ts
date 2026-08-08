#!/usr/bin/env bun
import { execFileSync } from "node:child_process";

const localApiUrl = "http://127.0.0.1:55421";
const localDatabaseUrl =
  "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
const apiUrl = process.env.SUPABASE_URL ?? process.env.API_URL;
const databaseUrl = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (apiUrl !== localApiUrl) {
  throw new Error(`[web-e2e] Refusing non-local Supabase API URL: ${apiUrl}`);
}
if (databaseUrl !== localDatabaseUrl) {
  throw new Error(`[web-e2e] Refusing non-local database URL: ${databaseUrl}`);
}
if (!serviceRoleKey) {
  throw new Error("[web-e2e] SUPABASE_SERVICE_ROLE_KEY is required");
}

const users = [
  {
    email: "web.e2e.admin@example.com",
    password: "Password123!",
    username: "webadmin",
    firstName: "Web",
    lastName: "Admin",
  },
  {
    email: "web.e2e.player@example.com",
    password: "Password123!",
    username: "webplayer",
    firstName: "Web",
    lastName: "Player",
  },
  {
    email: "web.e2e.outsider@example.com",
    password: "Password123!",
    username: "weboutsider",
    firstName: "Web",
    lastName: "Outsider",
  },
  {
    email: "bambrose24@gmail.com",
    password: "Password123!",
    username: "websuperadmin",
    firstName: "Web",
    lastName: "SuperAdmin",
  },
] as const;

type AdminUser = { id: string; email?: string };

async function adminRequest(path: string, init?: RequestInit) {
  return fetch(`${apiUrl}/auth/v1/admin${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

const existingResponse = await adminRequest("/users?per_page=1000");
if (!existingResponse.ok) {
  throw new Error(
    `[web-e2e] Unable to list local auth users: ${await existingResponse.text()}`,
  );
}
const existingUsers = (await existingResponse.json()) as { users: AdminUser[] };

const fixtureEmails = new Set(users.map((user) => user.email.toLowerCase()));
const usersToDelete = existingUsers.users.filter((user) => {
  const email = user.email?.toLowerCase();
  return (
    email !== undefined &&
    (fixtureEmails.has(email) ||
      (email.startsWith("web.e2e.") && email.endsWith("@example.com")))
  );
});

for (const existing of usersToDelete) {
  const deleteResponse = await adminRequest(`/users/${existing.id}`, {
    method: "DELETE",
  });
  if (!deleteResponse.ok) {
    throw new Error(
      `[web-e2e] Unable to replace fixture user ${existing.email}: ${await deleteResponse.text()}`,
    );
  }
}

const createdUsers = new Map<string, string>();
for (const fixtureUser of users) {
  const createResponse = await adminRequest("/users", {
    method: "POST",
    body: JSON.stringify({
      email: fixtureUser.email,
      password: fixtureUser.password,
      email_confirm: true,
    }),
  });
  if (!createResponse.ok) {
    throw new Error(
      `[web-e2e] Unable to create fixture user ${fixtureUser.email}: ${await createResponse.text()}`,
    );
  }
  const created = (await createResponse.json()) as AdminUser;
  if (!/^[0-9a-f-]{36}$/i.test(created.id)) {
    throw new Error(`[web-e2e] Invalid local auth user id: ${created.id}`);
  }
  createdUsers.set(fixtureUser.email, created.id);
}

const sqlString = (value: string) => `'${value.replaceAll("'", "''")}'`;
const peopleRows = users
  .map((user) => {
    const supabaseId = createdUsers.get(user.email);
    if (!supabaseId) {
      throw new Error(`[web-e2e] Missing auth id for ${user.email}`);
    }
    return `(${sqlString(user.username)}, ${sqlString(user.firstName)}, ${sqlString(user.lastName)}, ${sqlString(user.email)}, 2027, ${sqlString(supabaseId)})`;
  })
  .join(",\n");

const fixtureSql = `
BEGIN;
TRUNCATE TABLE "people" RESTART IDENTITY CASCADE;
DELETE FROM "games" WHERE "season" IN (2028, 2029);
DELETE FROM "postseason_games" WHERE "season" = 2030;
INSERT INTO "games" ("gid", "season", "week", "ts", "home", "away", "done", "winner", "international", "is_tiebreaker", "espn_id")
VALUES
  (2028001, 2028, 1, NOW() - INTERVAL '1 hour', 2, 1, FALSE, 0, FALSE, FALSE, 600001),
  (2028002, 2028, 1, NOW() + INTERVAL '1 day', 6, 5, FALSE, 0, FALSE, TRUE, 600002),
  (2029001, 2029, 1, NOW() - INTERVAL '2 days', 2, 1, TRUE, 2, FALSE, FALSE, 700001),
  (2029002, 2029, 1, NOW() - INTERVAL '1 day', 6, 5, TRUE, 6, FALSE, TRUE, 700002);
INSERT INTO "people" ("username", "fname", "lname", "email", "season", "supabase_id")
VALUES
${peopleRows};

INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "reminder_policy", "scoring_type", "share_code", "superbowl_competition", "status")
SELECT "uid", 'E2E Active League', 2027, 'allow_late_and_lock_after_start', 'choose_winner', 'three_hours_before', 'game_winner', 'E2EACTIVE', TRUE, 'not_started'
FROM "people" WHERE "email" = 'web.e2e.admin@example.com';
INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "reminder_policy", "scoring_type", "share_code", "superbowl_competition", "status")
SELECT "uid", 'E2E Bracket League', 2030, 'allow_late_and_lock_after_start', 'choose_winner', 'three_hours_before', 'game_winner', 'E2EBRACKET', TRUE, 'completed'
FROM "people" WHERE "email" = 'web.e2e.admin@example.com';
INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "reminder_policy", "scoring_type", "share_code", "superbowl_competition", "status")
SELECT "uid", 'E2E Admin Ops League', 2027, 'allow_late_and_lock_after_start', 'choose_winner', 'three_hours_before', 'game_winner', 'E2EADMINOPS', FALSE, 'not_started'
FROM "people" WHERE "email" = 'web.e2e.admin@example.com';
INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "reminder_policy", "scoring_type", "share_code", "superbowl_competition", "status")
SELECT "uid", 'E2E Completed League', 2026, 'allow_late_and_lock_after_start', 'choose_winner', 'three_hours_before', 'game_winner', 'E2ECOMPLETE', TRUE, 'completed'
FROM "people" WHERE "email" = 'web.e2e.admin@example.com';
INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "reminder_policy", "scoring_type", "share_code", "superbowl_competition", "status")
SELECT "uid", 'E2E Completed Regression League', 2026, 'allow_late_and_lock_after_start', 'choose_winner', 'three_hours_before', 'game_winner', 'E2EREGRESSION', TRUE, 'completed'
FROM "people" WHERE "email" = 'web.e2e.admin@example.com';
INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "reminder_policy", "scoring_type", "share_code", "superbowl_competition", "status")
SELECT "uid", 'E2E Competition League', 2027, 'allow_late_and_lock_after_start', 'choose_winner', 'three_hours_before', 'game_winner', 'E2ECOMPETE', TRUE, 'in_progress'
FROM "people" WHERE "email" = 'web.e2e.admin@example.com';
INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "reminder_policy", "scoring_type", "share_code", "superbowl_competition", "status")
SELECT "uid", 'E2E Integrity League', 2028, 'allow_late_and_lock_after_start', 'choose_winner', 'three_hours_before', 'game_winner', 'E2EINTEGRITY', FALSE, 'in_progress'
FROM "people" WHERE "email" = 'web.e2e.admin@example.com';
INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "reminder_policy", "scoring_type", "share_code", "superbowl_competition", "status")
SELECT "uid", 'E2E Override League', 2028, 'allow_late_and_lock_after_start', 'choose_winner', 'three_hours_before', 'game_winner', 'E2EOVERRIDE', FALSE, 'in_progress'
FROM "people" WHERE "email" = 'web.e2e.admin@example.com';
INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "reminder_policy", "scoring_type", "share_code", "superbowl_competition", "status")
SELECT "uid", 'E2E Results League', 2029, 'allow_late_and_lock_after_start', 'choose_winner', 'three_hours_before', 'game_winner', 'E2ERESULTS', FALSE, 'in_progress'
FROM "people" WHERE "email" = 'web.e2e.admin@example.com';
INSERT INTO "leagues" ("created_by_user_id", "name", "season", "late_policy", "pick_policy", "reminder_policy", "scoring_type", "share_code", "superbowl_competition", "status")
SELECT "uid", 'E2E Waiting League', 2027, 'allow_late_and_lock_after_start', 'choose_winner', 'three_hours_before', 'game_winner', 'E2EWAITING', FALSE, 'not_started'
FROM "people" WHERE "email" = 'web.e2e.admin@example.com';

INSERT INTO "leaguemembers" ("league_id", "user_id", "role", "paid")
SELECT l."league_id", p."uid", 'admin', TRUE FROM "leagues" l CROSS JOIN "people" p
WHERE p."email" = 'web.e2e.admin@example.com';
INSERT INTO "leaguemembers" ("league_id", "user_id", "role", "paid")
SELECT l."league_id", p."uid", 'player', FALSE FROM "leagues" l CROSS JOIN "people" p
WHERE p."email" = 'web.e2e.player@example.com'
  AND l."share_code" NOT IN ('E2EWAITING', 'E2EADMINOPS');
INSERT INTO "leaguemembers" ("league_id", "user_id", "role", "paid")
SELECT l."league_id", p."uid", 'player', FALSE FROM "leagues" l CROSS JOIN "people" p
WHERE l."share_code" = 'E2EWAITING' AND p."email" = 'web.e2e.outsider@example.com';
INSERT INTO "leaguemembers" ("league_id", "user_id", "role", "paid")
SELECT l."league_id", p."uid", 'player', FALSE FROM "leagues" l CROSS JOIN "people" p
WHERE l."share_code" = 'E2EADMINOPS' AND p."email" = 'web.e2e.outsider@example.com';

INSERT INTO "EmailLogs" ("email_log_id", "league_id", "member_id", "email_type", "ts", "resend_id")
SELECT 'e2e-admin-ops-email-1', m."league_id", m."membership_id", 'league_broadcast', NOW() - INTERVAL '1 day', 'e2e-resend-1'
FROM "leaguemembers" m
JOIN "leagues" l ON l."league_id" = m."league_id"
JOIN "people" p ON p."uid" = m."user_id"
WHERE l."share_code" = 'E2EADMINOPS' AND p."email" = 'web.e2e.outsider@example.com';
INSERT INTO "EmailLogs" ("email_log_id", "league_id", "member_id", "email_type", "ts", "resend_id")
SELECT 'e2e-admin-ops-email-2', m."league_id", m."membership_id", 'league_broadcast', NOW() - INTERVAL '2 days', 'e2e-resend-2'
FROM "leaguemembers" m
JOIN "leagues" l ON l."league_id" = m."league_id"
JOIN "people" p ON p."uid" = m."user_id"
WHERE l."share_code" = 'E2EADMINOPS' AND p."email" = 'web.e2e.outsider@example.com';

INSERT INTO "superbowl" ("uid", "winner", "loser", "score", "season", "member_id")
SELECT m."user_id", 1, 5, 48, l."season", m."membership_id"
FROM "leaguemembers" m
JOIN "leagues" l ON l."league_id" = m."league_id"
JOIN "people" p ON p."uid" = m."user_id"
WHERE l."share_code" = 'E2EACTIVE' AND p."email" = 'web.e2e.player@example.com';
INSERT INTO "superbowl" ("uid", "winner", "loser", "score", "season", "member_id")
SELECT m."user_id", 2, 6, 51, l."season", m."membership_id"
FROM "leaguemembers" m
JOIN "leagues" l ON l."league_id" = m."league_id"
JOIN "people" p ON p."uid" = m."user_id"
WHERE l."share_code" = 'E2EACTIVE' AND p."email" = 'web.e2e.admin@example.com';
INSERT INTO "superbowl" ("uid", "winner", "loser", "score", "season", "member_id")
SELECT m."user_id",
  CASE WHEN p."email" = 'web.e2e.admin@example.com' THEN 2 ELSE 1 END,
  CASE WHEN p."email" = 'web.e2e.admin@example.com' THEN 6 ELSE 5 END,
  CASE WHEN p."email" = 'web.e2e.admin@example.com' THEN 51 ELSE 48 END,
  l."season", m."membership_id"
FROM "leaguemembers" m
JOIN "leagues" l ON l."league_id" = m."league_id"
JOIN "people" p ON p."uid" = m."user_id"
WHERE l."share_code" = 'E2ECOMPETE'
  AND p."email" IN ('web.e2e.admin@example.com', 'web.e2e.player@example.com');

INSERT INTO "superbowl" ("uid", "winner", "loser", "score", "season", "member_id")
SELECT m."user_id",
  CASE WHEN p."email" = 'web.e2e.admin@example.com' THEN 2 ELSE 1 END,
  CASE WHEN p."email" = 'web.e2e.admin@example.com' THEN 6 ELSE 5 END,
  CASE WHEN p."email" = 'web.e2e.admin@example.com' THEN 51 ELSE 48 END,
  l."season", m."membership_id"
FROM "leaguemembers" m
JOIN "leagues" l ON l."league_id" = m."league_id"
JOIN "people" p ON p."uid" = m."user_id"
WHERE l."share_code" = 'E2EBRACKET'
  AND p."email" IN ('web.e2e.admin@example.com', 'web.e2e.player@example.com');

INSERT INTO "postseason_games" ("game_id", "espn_id", "season", "round", "conference", "ts", "home_team", "away_team", "home_score", "away_score", "winner", "done", "bracket_position")
VALUES ('e2e-super-bowl-2030', 800001, 2030, 'super_bowl', NULL,
  NOW() - INTERVAL '1 day', 6, 2, 24, 27, 2, TRUE, 1);

INSERT INTO "leaguemessages" ("message_id", "content", "member_id", "league_id", "message_type", "status")
SELECT 'e2e-fixture-message', 'Fixture player message', m."membership_id", m."league_id", 'LEAGUE_MESSAGE', 'PUBLISHED'
FROM "leaguemembers" m
JOIN "leagues" l ON l."league_id" = m."league_id"
JOIN "people" p ON p."uid" = m."user_id"
WHERE l."share_code" = 'E2ECOMPETE' AND p."email" = 'web.e2e.player@example.com';

-- Give the admin a completed Week 1 card so the in-progress league renders its
-- standings/message-board page even though the deterministic schedule is future dated.
INSERT INTO "picks" ("uid", "season", "week", "gid", "winner", "loser", "score", "is_random", "member_id")
SELECT m."user_id", g."season", g."week", g."gid", g."home", g."away",
  CASE WHEN g."is_tiebreaker" THEN 44 ELSE NULL END,
  FALSE, m."membership_id"
FROM "leaguemembers" m
JOIN "leagues" l ON l."league_id" = m."league_id"
JOIN "people" p ON p."uid" = m."user_id"
JOIN "games" g ON g."season" = l."season" AND g."week" = 1
WHERE l."share_code" = 'E2ECOMPETE' AND p."email" = 'web.e2e.admin@example.com';

INSERT INTO "picks" ("uid", "season", "week", "gid", "winner", "loser", "score", "is_random", "member_id")
SELECT m."user_id", g."season", g."week", g."gid", g."home", g."away",
  CASE WHEN g."is_tiebreaker" THEN 46 ELSE NULL END,
  FALSE, m."membership_id"
FROM "leaguemembers" m
JOIN "leagues" l ON l."league_id" = m."league_id"
JOIN "people" p ON p."uid" = m."user_id"
JOIN "games" g ON g."season" = l."season" AND g."week" = 1
WHERE l."share_code" = 'E2EINTEGRITY' AND p."email" = 'web.e2e.admin@example.com';

INSERT INTO "picks" ("uid", "season", "week", "gid", "winner", "loser", "score", "is_random", "member_id", "correct", "done")
SELECT m."user_id", g."season", g."week", g."gid", g."winner",
  CASE WHEN g."winner" = g."home" THEN g."away" ELSE g."home" END,
  CASE WHEN g."is_tiebreaker" THEN 44 ELSE NULL END,
  FALSE, m."membership_id", 1, 1
FROM "leaguemembers" m
JOIN "leagues" l ON l."league_id" = m."league_id"
JOIN "people" p ON p."uid" = m."user_id"
JOIN "games" g ON g."season" = l."season" AND g."week" = 1
WHERE l."share_code" = 'E2ERESULTS'
  AND p."email" IN ('web.e2e.admin@example.com', 'web.e2e.player@example.com');

INSERT INTO "WeekWinners" ("league_id", "membership_id", "week", "correct_count", "score_diff")
SELECT m."league_id", m."membership_id", 1, 2, 0
FROM "leaguemembers" m
JOIN "leagues" l ON l."league_id" = m."league_id"
JOIN "people" p ON p."uid" = m."user_id"
WHERE l."share_code" = 'E2ERESULTS'
  AND p."email" IN ('web.e2e.admin@example.com', 'web.e2e.player@example.com');
COMMIT;
`;

execFileSync(
  "psql",
  [databaseUrl, "-v", "ON_ERROR_STOP=1", "-q", "-c", fixtureSql],
  { stdio: "inherit" },
);

console.log(
  `[web-e2e] Seeded ${users.length} local auth users and 10 deterministic leagues.`,
);
