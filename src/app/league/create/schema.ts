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
  pickPolicy: z.nativeEnum(PickPolicy).optional(),
  reminderPolicy: z.nativeEnum(ReminderPolicy).or(z.literal("none")),
  scoringType: z.nativeEnum(ScoringType).optional(),
  superbowlCompetition: z.boolean(),
  priorLeagueId: z.string().optional(),
});
