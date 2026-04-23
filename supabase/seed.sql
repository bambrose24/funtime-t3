-- Generated file. Do not edit by hand.
-- metadata: {"source":"committed_fixture","generatedAtUtc":"2026-02-26T00:00:00.000Z","season":2025,"anchorUtc":"2026-09-11T00:00:00.000Z","notes":"Deterministic schedule fixture for local Supabase E2E. Refresh with pnpm e2e:fixtures:refresh when live data updates are required."}
BEGIN;
TRUNCATE TABLE "picks", "superbowl", "leaguemessages", "WeekWinners", "EmailLogs", "leaguemembers", "leagues", "people", "postseason_team_seeds", "postseason_games", "games", "teams" RESTART IDENTITY CASCADE;

-- Teams
INSERT INTO "teams" ("teamid", "abbrev", "loc", "name", "conference", "primary_color", "secondary_color", "tertiary_color") VALUES (1, 'BUF', 'Buffalo', 'Bills', 'AFC', '#00338D', '#C60C30', NULL);
INSERT INTO "teams" ("teamid", "abbrev", "loc", "name", "conference", "primary_color", "secondary_color", "tertiary_color") VALUES (2, 'KC', 'Kansas City', 'Chiefs', 'AFC', '#E31837', '#FFB81C', NULL);
INSERT INTO "teams" ("teamid", "abbrev", "loc", "name", "conference", "primary_color", "secondary_color", "tertiary_color") VALUES (3, 'BAL', 'Baltimore', 'Ravens', 'AFC', '#241773', '#9E7C0C', NULL);
INSERT INTO "teams" ("teamid", "abbrev", "loc", "name", "conference", "primary_color", "secondary_color", "tertiary_color") VALUES (4, 'CIN', 'Cincinnati', 'Bengals', 'AFC', '#FB4F14', '#000000', NULL);
INSERT INTO "teams" ("teamid", "abbrev", "loc", "name", "conference", "primary_color", "secondary_color", "tertiary_color") VALUES (5, 'PHI', 'Philadelphia', 'Eagles', 'NFC', '#004C54', '#A5ACAF', NULL);
INSERT INTO "teams" ("teamid", "abbrev", "loc", "name", "conference", "primary_color", "secondary_color", "tertiary_color") VALUES (6, 'DAL', 'Dallas', 'Cowboys', 'NFC', '#003594', '#869397', NULL);
INSERT INTO "teams" ("teamid", "abbrev", "loc", "name", "conference", "primary_color", "secondary_color", "tertiary_color") VALUES (7, 'SF', 'San Francisco', '49ers', 'NFC', '#AA0000', '#B3995D', NULL);
INSERT INTO "teams" ("teamid", "abbrev", "loc", "name", "conference", "primary_color", "secondary_color", "tertiary_color") VALUES (8, 'DET', 'Detroit', 'Lions', 'NFC', '#0076B6', '#B0B7BC', NULL);

-- Games
INSERT INTO "games" ("gid", "season", "week", "ts", "home", "away", "homescore", "awayscore", "done", "winner", "international", "seconds", "current_record", "is_tiebreaker", "homerecord", "awayrecord", "current_quarter_seconds_remaining", "current_quarter", "msf_id", "espn_id") VALUES (2025001, 2025, 1, '2026-09-11T00:00:00.000Z'::timestamptz, 2, 1, 0, 0, FALSE, 0, FALSE, 1789084800, '0-0,0-0', FALSE, NULL, NULL, NULL, NULL, NULL, 500001);
INSERT INTO "games" ("gid", "season", "week", "ts", "home", "away", "homescore", "awayscore", "done", "winner", "international", "seconds", "current_record", "is_tiebreaker", "homerecord", "awayrecord", "current_quarter_seconds_remaining", "current_quarter", "msf_id", "espn_id") VALUES (2025002, 2025, 1, '2026-09-11T20:25:00.000Z'::timestamptz, 6, 5, 0, 0, FALSE, 0, FALSE, 1789158300, '0-0,0-0', FALSE, NULL, NULL, NULL, NULL, NULL, 500002);
INSERT INTO "games" ("gid", "season", "week", "ts", "home", "away", "homescore", "awayscore", "done", "winner", "international", "seconds", "current_record", "is_tiebreaker", "homerecord", "awayrecord", "current_quarter_seconds_remaining", "current_quarter", "msf_id", "espn_id") VALUES (2025003, 2025, 1, '2026-09-12T17:00:00.000Z'::timestamptz, 3, 4, 0, 0, FALSE, 0, FALSE, 1789232400, '0-0,0-0', FALSE, NULL, NULL, NULL, NULL, NULL, 500003);
INSERT INTO "games" ("gid", "season", "week", "ts", "home", "away", "homescore", "awayscore", "done", "winner", "international", "seconds", "current_record", "is_tiebreaker", "homerecord", "awayrecord", "current_quarter_seconds_remaining", "current_quarter", "msf_id", "espn_id") VALUES (2025004, 2025, 1, '2026-09-13T00:20:00.000Z'::timestamptz, 7, 8, 0, 0, FALSE, 0, FALSE, 1789258800, '0-0,0-0', TRUE, NULL, NULL, NULL, NULL, NULL, 500004);
INSERT INTO "games" ("gid", "season", "week", "ts", "home", "away", "homescore", "awayscore", "done", "winner", "international", "seconds", "current_record", "is_tiebreaker", "homerecord", "awayrecord", "current_quarter_seconds_remaining", "current_quarter", "msf_id", "espn_id") VALUES (2025005, 2025, 2, '2026-09-18T00:15:00.000Z'::timestamptz, 1, 3, 0, 0, FALSE, 0, FALSE, 1789680900, '0-0,0-0', FALSE, NULL, NULL, NULL, NULL, NULL, 500005);
INSERT INTO "games" ("gid", "season", "week", "ts", "home", "away", "homescore", "awayscore", "done", "winner", "international", "seconds", "current_record", "is_tiebreaker", "homerecord", "awayrecord", "current_quarter_seconds_remaining", "current_quarter", "msf_id", "espn_id") VALUES (2025006, 2025, 2, '2026-09-20T00:20:00.000Z'::timestamptz, 5, 7, 0, 0, FALSE, 0, FALSE, 1789854000, '0-0,0-0', TRUE, NULL, NULL, NULL, NULL, NULL, 500006);

-- Keep SERIAL sequences aligned with fixture IDs
SELECT setval(pg_get_serial_sequence('"teams"', 'teamid'), COALESCE((SELECT MAX("teamid") FROM "teams"), 1), true);
SELECT setval(pg_get_serial_sequence('"games"', 'gid'), COALESCE((SELECT MAX("gid") FROM "games"), 1), true);
COMMIT;
