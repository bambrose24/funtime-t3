import { z } from "zod";
import { DEFAULT_SEASON } from "../../../utils/const";
import { publicCacheMiddleware } from "../../cache";
import { db } from "../../db";
import { createTRPCRouter, publicProcedure } from "../trpc";

const getGamesSchema = z.object({
  season: z.number().int(),
  week: z.number().int().optional(),
  skipCache: z.boolean().optional().default(false),
});

export const gamesRouter = createTRPCRouter({
  lastStarted: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.games.findFirst({
      where: {
        ts: {
          lte: new Date(),
        },
        season: {
          gte: DEFAULT_SEASON - 1,
        },
      },
      orderBy: {
        ts: "desc",
      },
    });
  }),
  getGames: publicProcedure
    .input(getGamesSchema)
    .use(async (opts) => {
      return publicCacheMiddleware({
        by: "params",
        cacheTimeSeconds: 60 * 2,
        ...opts,
      });
    })
    .query(async ({ input }) => {
      const { skipCache, season, week } = input;
      if (skipCache) {
        return await getGamesImpl({ season, week });
      }

      return await getGamesImpl({ season, week });
    }),
});

async function getGamesImpl({
  season,
  week,
}: {
  season: number;
  week?: number;
}) {
  return await db.games.findMany({
    where: { season, ...(week ? { week } : {}) },
    orderBy: [{ ts: "asc" }, { gid: "asc" }],
  });
}
