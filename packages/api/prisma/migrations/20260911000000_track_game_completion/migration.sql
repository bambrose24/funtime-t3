-- First observation of a final score, used to schedule morning recaps.
ALTER TABLE "games" ADD COLUMN "completed_at" TIMESTAMPTZ(6);
