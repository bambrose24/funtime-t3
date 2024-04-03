import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { cache } from "~/utils/cache";

const REVALIDATE_SECONDS = 120;

const getGamesSchema = z.object({
  season: z.number().int(),
  week: z.number().int().optional(),
  skipCache: z.boolean().optional().default(false),
});

export const gamesRouter = createTRPCRouter({
  getGames: publicProcedure.input(getGamesSchema).query(async ({ input }) => {
    const { skipCache, season, week } = input;
    if (skipCache) {
      return await getGamesImpl({ season, week });
    }

    const getGames = cache(
      async () => {
        return await getGamesImpl({ season, week });
      },
      ["getGamesBySeason", season.toString()],
      {
        revalidate: REVALIDATE_SECONDS,
      },
    );
    return await getGames();
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
