-- Durable account-level weekly recap email preference.
-- Default true so existing players keep receiving recaps until they opt out.

ALTER TABLE "people"
ADD COLUMN "week_summary_emails_enabled" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "idx_people_week_summary_emails_enabled"
ON "people"("week_summary_emails_enabled");
