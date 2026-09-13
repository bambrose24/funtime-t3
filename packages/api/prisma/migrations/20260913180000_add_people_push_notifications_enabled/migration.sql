-- Durable account-level push preference (MOB-02a / F05).
-- Column default is true for new accounts. Existing users are backfilled
-- conservatively: preference stays off unless they currently have at least
-- one enabled token row (the prior inferred "enabled" signal).

ALTER TABLE "people"
ADD COLUMN "push_notifications_enabled" BOOLEAN NOT NULL DEFAULT true;

UPDATE "people" AS p
SET "push_notifications_enabled" = false
WHERE NOT EXISTS (
  SELECT 1
  FROM "pushNotificationTokens" AS t
  WHERE t."user_id" = p."uid"
    AND t."enabled" = true
);

CREATE INDEX "idx_people_push_notifications_enabled"
ON "people"("push_notifications_enabled");
