import { groupBy } from "lodash";
import { z } from "zod";

import { authorizedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { db } from "~/server/db";

const pickSchema = z.object({
  gid: z.number().int(),
  winner: z.number().int(),
  score: z.number().int().min(1).max(200).optional(),
});

const submitPicksSchema = z.object({
  overrideMemberId: z.number().int().optional(),
  picks: z.array(pickSchema),
});

export const picksRouter = createTRPCRouter({
  submitPicks: authorizedProcedure
    .input(submitPicksSchema)
    .mutation(async ({ ctx, input }) => {
      const pickedGames = await db.games.findMany({
        where: {
          gid: {
            in: input.picks.map((p) => p.gid),
          },
        },
      });

      return { pickedGames };
    }),
});
