import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const homeRouter = createTRPCRouter({
  summary: publicProcedure
    .input(z.object({ season: z.number() }))
    .query(async ({ input, ctx }) => {
      const { season } = input;
      const { db } = ctx;
      const games = await db.games.count({ where: { season } });
      return games;
    }),
});
