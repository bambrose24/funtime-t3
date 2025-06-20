import { z } from "zod";

export const createLeagueFormSchema = z.object({
  name: z.string().min(5).max(100),
  latePolicy: z.enum(["allow_late_whole_week", "close_at_first_game_start", "allow_late_and_lock_after_start"]),
  pickPolicy: z.enum(["choose_winner"]).optional(),
  reminderPolicy: z.enum(["three_hours_before"]).or(z.literal("none")),
  scoringType: z.enum(["game_winner"]).optional(),
  superbowlCompetition: z.boolean(),
  priorLeagueId: z.string().optional(),
});
