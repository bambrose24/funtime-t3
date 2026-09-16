-- Fixed emoji allowlist for league chat reactions. One row per
-- (message, member, emoji) so toggles stay race-safe and chips can
-- show counts plus who reacted without scanning JSON blobs.
CREATE TYPE "MessageReactionEmoji" AS ENUM (
  'fire',
  'laugh',
  'cooked',
  'eyes',
  'football',
  'goat',
  'thumbs_up',
  'heart'
);

CREATE TABLE "league_message_reactions" (
    "reaction_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "membership_id" INTEGER NOT NULL,
    "emoji" "MessageReactionEmoji" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_message_reactions_pkey" PRIMARY KEY ("reaction_id")
);

CREATE UNIQUE INDEX "league_message_reactions_message_id_membership_id_emoji_key"
ON "league_message_reactions"("message_id", "membership_id", "emoji");

CREATE INDEX "league_message_reactions_message_id_idx"
ON "league_message_reactions"("message_id");

CREATE INDEX "league_message_reactions_membership_id_idx"
ON "league_message_reactions"("membership_id");

ALTER TABLE "league_message_reactions"
ADD CONSTRAINT "league_message_reactions_message_id_fkey"
FOREIGN KEY ("message_id") REFERENCES "leaguemessages"("message_id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "league_message_reactions"
ADD CONSTRAINT "league_message_reactions_membership_id_fkey"
FOREIGN KEY ("membership_id") REFERENCES "leaguemembers"("membership_id")
ON DELETE CASCADE ON UPDATE CASCADE;
