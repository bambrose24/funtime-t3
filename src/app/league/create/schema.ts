import { z } from "zod";
import {
  LatePolicy,
  PickPolicy,
  ReminderPolicy,
  ScoringType,
} from "~/generated/prisma-client";

export const createLeagueFormSchema = z.object({
  name: z.string().min(5).max(100),
  latePolicy: z.nativeEnum(LatePolicy),
  pickPolicy: z.nativeEnum(PickPolicy),
  reminderPolicy: z.nativeEnum(ReminderPolicy),
  scoringType: z.nativeEnum(ScoringType),
  superbowlCompetition: z.boolean(),
  priorLeagueId: z.number().int().optional(),
});
