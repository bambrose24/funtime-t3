-- Preflight before applying:
-- SELECT prior_league_id, season, COUNT(*)
-- FROM "leagues"
-- WHERE prior_league_id IS NOT NULL
-- GROUP BY prior_league_id, season
-- HAVING COUNT(*) > 1;

ALTER TYPE "EmailType" ADD VALUE IF NOT EXISTS 'renewal_invite';

CREATE UNIQUE INDEX "leagues_prior_league_id_season_key"
ON "leagues"("prior_league_id", "season")
WHERE "prior_league_id" IS NOT NULL;
