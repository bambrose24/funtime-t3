import { z } from "zod";

const msfGamePlayedStatus = [
  "UNPLAYED",
  "LIVE",
  "COMPLETED",
  "COMPLETED_PENDING_REVIEW",
] as const;

export const MSFGamePlayedStatusSchema = z.enum(msfGamePlayedStatus);

export const TeamSchema = z.object({
  id: z.number(),
  abbreviation: z.string(),
});

export const MSFGameScheduleSchema = z.object({
  id: z.number(),
  week: z.number(),
  awayTeam: TeamSchema,
  homeTeam: TeamSchema,
  startTime: z.string(), // ISO string
  endedTime: z.string().nullable(),
  venueAllegiance: z.enum(["HOME", "AWAY", "NEUTRAL"]),
  playedStatus: MSFGamePlayedStatusSchema,
});

export const MSFGameScoreSchema = z.object({
  currentQuarter: z.number().nullable(),
  currentQuarterSecondsRemaining: z.number().nullable(),
  currentIntermission: z.string(),
  awayScoreTotal: z.number().nullable(),
  homeScoreTotal: z.number().nullable(),
});

export const MSFGameSchema = z.object({
  schedule: MSFGameScheduleSchema,
  score: MSFGameScoreSchema,
});
