CREATE TABLE "WeeklyRecapDelivery" (
  "id" TEXT NOT NULL,
  "league_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "season" INTEGER NOT NULL,
  "week" INTEGER NOT NULL,
  "state" TEXT NOT NULL DEFAULT 'sending',
  "resend_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WeeklyRecapDelivery_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WeeklyRecapDelivery_league_id_user_id_season_week_key"
ON "WeeklyRecapDelivery"("league_id", "user_id", "season", "week");

-- Preserve prior sends, including multiple memberships belonging to one user.
INSERT INTO "WeeklyRecapDelivery" ("id", "league_id", "user_id", "season", "week", "state", "resend_id")
SELECT 'legacy-' || e."email_log_id", e."league_id", m."user_id", l."season", e."week", 'sent', e."resend_id"
FROM "EmailLogs" e
JOIN "leaguemembers" m ON m."membership_id" = e."member_id"
JOIN "leagues" l ON l."league_id" = e."league_id"
WHERE e."email_type" = 'week_summary' AND e."week" IS NOT NULL
ON CONFLICT ("league_id", "user_id", "season", "week") DO NOTHING;
