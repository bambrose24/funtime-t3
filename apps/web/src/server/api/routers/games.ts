import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { cache } from "~/utils/cache";
import { DEFAULT_SEASON } from "~/utils/const";
import { PrismaClient } from "@funtime/api/generated/prisma-client";

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
    .query(async ({ input, ctx }) => {
      const { skipCache, season, week } = input;
      if (skipCache) {
        return await getGamesImpl({ season, week, db: ctx.db });
      }

      const getGames = cache(
        async () => {
          return await getGamesImpl({ season, week, db: ctx.db });
        },
        ["getGamesBySeason", season.toString(), week?.toString() ?? ""],
        {
          revalidate: 60 * 2,
        },
      );
      return await getGames();
    }),
});

async function getGamesImpl({
  season,
  week,
  db,
}: {
  season: number;
  week?: number;
  db: PrismaClient;
}) {
  return await db.games.findMany({
    where: { season, ...(week ? { week } : {}) },
    orderBy: [{ ts: "asc" }, { gid: "asc" }],
  });
}
