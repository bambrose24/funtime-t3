-- Persistent, per-membership read cursors let unread counts follow a player
-- between web and mobile without changing the existing league-wide messages.
CREATE TABLE "league_message_read_state" (
    "membership_id" INTEGER NOT NULL,
    "last_read_at" TIMESTAMP(3) NOT NULL,
    "last_read_message_id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "league_message_read_state_pkey" PRIMARY KEY ("membership_id")
);

CREATE INDEX "league_message_read_state_last_read_at_idx"
ON "league_message_read_state"("last_read_at");

CREATE INDEX "leaguemessages_league_id_status_createdAt_message_id_idx"
ON "leaguemessages"("league_id", "status", "createdAt", "message_id");

ALTER TABLE "league_message_read_state"
ADD CONSTRAINT "league_message_read_state_membership_id_fkey"
FOREIGN KEY ("membership_id") REFERENCES "leaguemembers"("membership_id")
ON DELETE CASCADE ON UPDATE CASCADE;
