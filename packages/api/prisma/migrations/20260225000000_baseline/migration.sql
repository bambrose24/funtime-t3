-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('week_reminder', 'week_summary', 'week_picks', 'league_registration', 'league_broadcast');

-- CreateEnum
CREATE TYPE "LatePolicy" AS ENUM ('allow_late_whole_week', 'close_at_first_game_start', 'allow_late_and_lock_after_start');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('player', 'admin');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PUBLISHED', 'DELETED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('WEEK_COMMENT', 'LEAGUE_MESSAGE');

-- CreateEnum
CREATE TYPE "PickPolicy" AS ENUM ('choose_winner');

-- CreateEnum
CREATE TYPE "ReminderPolicy" AS ENUM ('three_hours_before');

-- CreateEnum
CREATE TYPE "LeagueStatus" AS ENUM ('not_started', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "ScoringType" AS ENUM ('game_winner');

-- CreateEnum
CREATE TYPE "PostseasonRound" AS ENUM ('wild_card', 'divisional', 'conference', 'super_bowl');

-- CreateEnum
CREATE TYPE "Conference" AS ENUM ('AFC', 'NFC');

-- CreateTable
CREATE TABLE "EmailLogs" (
    "email_log_id" TEXT NOT NULL,
    "league_id" INTEGER NOT NULL,
    "member_id" INTEGER NOT NULL,
    "email_type" "EmailType" NOT NULL,
    "ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "week" INTEGER,
    "resend_id" TEXT NOT NULL,

    CONSTRAINT "EmailLogs_pkey" PRIMARY KEY ("email_log_id")
);

-- CreateTable
CREATE TABLE "WeekWinners" (
    "id" SERIAL NOT NULL,
    "league_id" INTEGER NOT NULL,
    "membership_id" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "correct_count" INTEGER NOT NULL,
    "score_diff" INTEGER NOT NULL,

    CONSTRAINT "idx_184XX_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "gid" SERIAL NOT NULL,
    "season" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "ts" TIMESTAMPTZ(6) NOT NULL,
    "home" INTEGER NOT NULL,
    "away" INTEGER NOT NULL,
    "homescore" INTEGER DEFAULT 0,
    "awayscore" INTEGER DEFAULT 0,
    "done" BOOLEAN DEFAULT false,
    "winner" INTEGER DEFAULT 0,
    "international" BOOLEAN DEFAULT false,
    "seconds" INTEGER,
    "current_record" VARCHAR(50) DEFAULT '0-0,0-0',
    "is_tiebreaker" BOOLEAN,
    "homerecord" VARCHAR(10),
    "awayrecord" VARCHAR(10),
    "current_quarter_seconds_remaining" INTEGER,
    "current_quarter" INTEGER,
    "msf_id" INTEGER,
    "espn_id" INTEGER,

    CONSTRAINT "idx_18403_primary" PRIMARY KEY ("gid")
);

-- CreateTable
CREATE TABLE "leaguemembers" (
    "membership_id" SERIAL NOT NULL,
    "league_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "MemberRole" DEFAULT 'player',
    "paid" BOOLEAN DEFAULT false,

    CONSTRAINT "idx_18414_primary" PRIMARY KEY ("membership_id")
);

-- CreateTable
CREATE TABLE "leaguemessages" (
    "message_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "member_id" INTEGER NOT NULL,
    "league_id" INTEGER NOT NULL,
    "week" INTEGER,
    "message_type" "MessageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "MessageStatus" NOT NULL DEFAULT 'PUBLISHED',

    CONSTRAINT "leaguemessages_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "leagues" (
    "league_id" SERIAL NOT NULL,
    "created_by_user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "season" INTEGER NOT NULL,
    "late_policy" "LatePolicy" DEFAULT 'allow_late_whole_week',
    "pick_policy" "PickPolicy" DEFAULT 'choose_winner',
    "reminder_policy" "ReminderPolicy" DEFAULT 'three_hours_before',
    "scoring_type" "ScoringType" DEFAULT 'game_winner',
    "share_code" TEXT,
    "superbowl_competition" BOOLEAN DEFAULT true,
    "prior_league_id" INTEGER,
    "status" "LeagueStatus" NOT NULL DEFAULT 'not_started',

    CONSTRAINT "idx_18422_primary" PRIMARY KEY ("league_id")
);

-- CreateTable
CREATE TABLE "people" (
    "uid" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "fname" VARCHAR(255) NOT NULL,
    "lname" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "season" INTEGER NOT NULL,
    "email2" VARCHAR(255),
    "google_photo_url" TEXT,
    "google_email" TEXT,
    "google_userid" TEXT,
    "supabase_id" VARCHAR(255),

    CONSTRAINT "idx_18430_primary" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "picks" (
    "pickid" SERIAL NOT NULL,
    "uid" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "gid" INTEGER NOT NULL,
    "winner" INTEGER DEFAULT 0,
    "loser" INTEGER DEFAULT 0,
    "score" INTEGER DEFAULT 0,
    "ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correct" INTEGER DEFAULT 0,
    "done" INTEGER DEFAULT 0,
    "is_random" BOOLEAN,
    "member_id" INTEGER,

    CONSTRAINT "idx_18437_primary" PRIMARY KEY ("pickid")
);

-- CreateTable
CREATE TABLE "superbowl" (
    "pickid" SERIAL NOT NULL,
    "uid" INTEGER NOT NULL,
    "winner" INTEGER NOT NULL,
    "loser" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "ts" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "season" INTEGER,
    "member_id" INTEGER,

    CONSTRAINT "idx_18448_primary" PRIMARY KEY ("pickid")
);

-- CreateTable
CREATE TABLE "superbowlsquares" (
    "square_id" SERIAL NOT NULL,
    "uid" INTEGER NOT NULL,
    "league_id" INTEGER NOT NULL,
    "afc_score_index" INTEGER NOT NULL,
    "nfc_score_index" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_18454_primary" PRIMARY KEY ("square_id")
);

-- CreateTable
CREATE TABLE "teams" (
    "teamid" SERIAL NOT NULL,
    "abbrev" VARCHAR(50),
    "loc" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "conference" VARCHAR(50),
    "primary_color" VARCHAR(50),
    "secondary_color" VARCHAR(50),
    "tertiary_color" VARCHAR(50),

    CONSTRAINT "idx_18460_primary" PRIMARY KEY ("teamid")
);

-- CreateTable
CREATE TABLE "postseason_games" (
    "game_id" TEXT NOT NULL,
    "espn_id" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "round" "PostseasonRound" NOT NULL,
    "conference" "Conference",
    "ts" TIMESTAMPTZ(6) NOT NULL,
    "home_team" INTEGER,
    "away_team" INTEGER,
    "home_score" INTEGER,
    "away_score" INTEGER,
    "winner" INTEGER,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "bracket_position" INTEGER NOT NULL,
    "advances_to_game_id" TEXT,

    CONSTRAINT "postseason_games_pkey" PRIMARY KEY ("game_id")
);

-- CreateTable
CREATE TABLE "postseason_team_seeds" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "teamid" INTEGER NOT NULL,
    "conference" "Conference" NOT NULL,
    "seed" INTEGER NOT NULL,

    CONSTRAINT "postseason_team_seeds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_emaillogs_league_id" ON "EmailLogs"("league_id");

-- CreateIndex
CREATE INDEX "idx_emaillogs_league_member" ON "EmailLogs"("league_id", "member_id");

-- CreateIndex
CREATE INDEX "idx_emaillogs_league_member_week" ON "EmailLogs"("league_id", "member_id", "week");

-- CreateIndex
CREATE INDEX "idx_emaillogs_league_week" ON "EmailLogs"("league_id", "week");

-- CreateIndex
CREATE INDEX "idx_emaillogs_member_id" ON "EmailLogs"("member_id");

-- CreateIndex
CREATE INDEX "idx_emaillogs_member_week" ON "EmailLogs"("member_id", "week");

-- CreateIndex
CREATE INDEX "idx_emaillogs_resend_id" ON "EmailLogs"("resend_id");

-- CreateIndex
CREATE INDEX "idx_emaillogs_week" ON "EmailLogs"("week");

-- CreateIndex
CREATE INDEX "idx_184XX_league_and_membership" ON "WeekWinners"("league_id", "membership_id");

-- CreateIndex
CREATE INDEX "idx_184XX_league_id" ON "WeekWinners"("league_id");

-- CreateIndex
CREATE INDEX "idx_184XX_membership_id" ON "WeekWinners"("membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "games_espn_id_key" ON "games"("espn_id");

-- CreateIndex
CREATE INDEX "idx_18403_away" ON "games"("away");

-- CreateIndex
CREATE INDEX "idx_18403_home" ON "games"("home");

-- CreateIndex
CREATE INDEX "idx_18403_msf_id" ON "games"("msf_id");

-- CreateIndex
CREATE INDEX "games_espn_id_idx" ON "games"("espn_id");

-- CreateIndex
CREATE INDEX "idx_18403_season" ON "games"("season");

-- CreateIndex
CREATE INDEX "idx_18403_ts" ON "games"("ts");

-- CreateIndex
CREATE INDEX "idx_18403_week" ON "games"("week");

-- CreateIndex
CREATE INDEX "idx_18414_league_id" ON "leaguemembers"("league_id");

-- CreateIndex
CREATE INDEX "idx_18414_paid" ON "leaguemembers"("paid");

-- CreateIndex
CREATE INDEX "idx_18414_role" ON "leaguemembers"("role");

-- CreateIndex
CREATE INDEX "idx_18414_ts" ON "leaguemembers"("ts");

-- CreateIndex
CREATE INDEX "idx_18414_user_id" ON "leaguemembers"("user_id");

-- CreateIndex
CREATE INDEX "leaguemessages_createdAt_idx" ON "leaguemessages"("createdAt");

-- CreateIndex
CREATE INDEX "leaguemessages_league_id_idx" ON "leaguemessages"("league_id");

-- CreateIndex
CREATE INDEX "leaguemessages_league_id_member_id_idx" ON "leaguemessages"("league_id", "member_id");

-- CreateIndex
CREATE INDEX "leaguemessages_league_id_message_type_idx" ON "leaguemessages"("league_id", "message_type");

-- CreateIndex
CREATE INDEX "leaguemessages_league_id_message_type_status_idx" ON "leaguemessages"("league_id", "message_type", "status");

-- CreateIndex
CREATE INDEX "leaguemessages_member_id_idx" ON "leaguemessages"("member_id");

-- CreateIndex
CREATE INDEX "leaguemessages_message_type_idx" ON "leaguemessages"("message_type");

-- CreateIndex
CREATE UNIQUE INDEX "leagues_share_code_key" ON "leagues"("share_code");

-- CreateIndex
CREATE INDEX "idx_18422_created_by_user_id" ON "leagues"("created_by_user_id");

-- CreateIndex
CREATE INDEX "leagues_prior_league_id_idx" ON "leagues"("prior_league_id");

-- CreateIndex
CREATE INDEX "idx_18422_created_time" ON "leagues"("created_time");

-- CreateIndex
CREATE INDEX "idx_18422_name" ON "leagues"("name");

-- CreateIndex
CREATE INDEX "idx_18422_season" ON "leagues"("season");

-- CreateIndex
CREATE INDEX "idx_share_code" ON "leagues"("share_code");

-- CreateIndex
CREATE UNIQUE INDEX "people_email_key" ON "people"("email");

-- CreateIndex
CREATE UNIQUE INDEX "people_supabase_id_key" ON "people"("supabase_id");

-- CreateIndex
CREATE INDEX "idx_18430_email_index" ON "people"("email");

-- CreateIndex
CREATE INDEX "idx_18430_season" ON "people"("season");

-- CreateIndex
CREATE INDEX "idx_18430_supabase_id" ON "people"("supabase_id");

-- CreateIndex
CREATE INDEX "picks_uid_idx" ON "picks"("uid");

-- CreateIndex
CREATE INDEX "idx_18437_picks_ibfk_3" ON "picks"("member_id");

-- CreateIndex
CREATE INDEX "idx_18437_season" ON "picks"("season");

-- CreateIndex
CREATE INDEX "idx_week_member" ON "picks"("week", "member_id");

-- CreateIndex
CREATE INDEX "superbowl_loser_idx" ON "superbowl"("loser");

-- CreateIndex
CREATE INDEX "superbowl_winner_idx" ON "superbowl"("winner");

-- CreateIndex
CREATE INDEX "idx_18448_member_id" ON "superbowl"("member_id");

-- CreateIndex
CREATE INDEX "idx_18448_season" ON "superbowl"("season");

-- CreateIndex
CREATE INDEX "idx_18448_ts" ON "superbowl"("ts");

-- CreateIndex
CREATE INDEX "idx_18454_ts" ON "superbowlsquares"("ts");

-- CreateIndex
CREATE INDEX "idx_18460_abbrev" ON "teams"("abbrev");

-- CreateIndex
CREATE INDEX "idx_18460_conference" ON "teams"("conference");

-- CreateIndex
CREATE INDEX "idx_18460_loc" ON "teams"("loc");

-- CreateIndex
CREATE UNIQUE INDEX "postseason_games_espn_id_key" ON "postseason_games"("espn_id");

-- CreateIndex
CREATE INDEX "postseason_games_season_idx" ON "postseason_games"("season");

-- CreateIndex
CREATE INDEX "postseason_games_season_round_idx" ON "postseason_games"("season", "round");

-- CreateIndex
CREATE INDEX "postseason_games_espn_id_idx" ON "postseason_games"("espn_id");

-- CreateIndex
CREATE INDEX "postseason_games_ts_idx" ON "postseason_games"("ts");

-- CreateIndex
CREATE INDEX "postseason_team_seeds_season_idx" ON "postseason_team_seeds"("season");

-- CreateIndex
CREATE INDEX "postseason_team_seeds_season_conference_idx" ON "postseason_team_seeds"("season", "conference");

-- CreateIndex
CREATE UNIQUE INDEX "postseason_team_seeds_season_teamid_key" ON "postseason_team_seeds"("season", "teamid");

-- AddForeignKey
ALTER TABLE "EmailLogs" ADD CONSTRAINT "EmailLogs_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("league_id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "EmailLogs" ADD CONSTRAINT "EmailLogs_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "leaguemembers"("membership_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekWinners" ADD CONSTRAINT "WeekWinners_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("league_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekWinners" ADD CONSTRAINT "WeekWinners_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "leaguemembers"("membership_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_ibfk_1" FOREIGN KEY ("home") REFERENCES "teams"("teamid") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_ibfk_2" FOREIGN KEY ("away") REFERENCES "teams"("teamid") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "leaguemembers" ADD CONSTRAINT "leaguemembers_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "people"("uid") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "leaguemembers" ADD CONSTRAINT "leaguemembers_ibfk_2" FOREIGN KEY ("league_id") REFERENCES "leagues"("league_id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "leaguemessages" ADD CONSTRAINT "leaguemessages_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("league_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaguemessages" ADD CONSTRAINT "leaguemessages_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "leaguemembers"("membership_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_ibfk_1" FOREIGN KEY ("created_by_user_id") REFERENCES "people"("uid") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_prior_league_id_fkey" FOREIGN KEY ("prior_league_id") REFERENCES "leagues"("league_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "picks" ADD CONSTRAINT "picks_ibfk_1" FOREIGN KEY ("gid") REFERENCES "games"("gid") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "picks" ADD CONSTRAINT "picks_ibfk_2" FOREIGN KEY ("uid") REFERENCES "people"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "picks" ADD CONSTRAINT "picks_ibfk_3" FOREIGN KEY ("member_id") REFERENCES "leaguemembers"("membership_id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "picks" ADD CONSTRAINT "picks_winner_fkey" FOREIGN KEY ("winner") REFERENCES "teams"("teamid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "superbowl" ADD CONSTRAINT "fk_loser_team" FOREIGN KEY ("loser") REFERENCES "teams"("teamid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "superbowl" ADD CONSTRAINT "fk_member_id" FOREIGN KEY ("member_id") REFERENCES "leaguemembers"("membership_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "superbowl" ADD CONSTRAINT "fk_winner_team" FOREIGN KEY ("winner") REFERENCES "teams"("teamid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "postseason_games" ADD CONSTRAINT "postseason_games_home_team_fkey" FOREIGN KEY ("home_team") REFERENCES "teams"("teamid") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "postseason_games" ADD CONSTRAINT "postseason_games_away_team_fkey" FOREIGN KEY ("away_team") REFERENCES "teams"("teamid") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "postseason_games" ADD CONSTRAINT "postseason_games_winner_fkey" FOREIGN KEY ("winner") REFERENCES "teams"("teamid") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "postseason_games" ADD CONSTRAINT "postseason_games_advances_to_game_id_fkey" FOREIGN KEY ("advances_to_game_id") REFERENCES "postseason_games"("game_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postseason_team_seeds" ADD CONSTRAINT "postseason_team_seeds_teamid_fkey" FOREIGN KEY ("teamid") REFERENCES "teams"("teamid") ON DELETE RESTRICT ON UPDATE RESTRICT;
