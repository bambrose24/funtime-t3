import "server-only";
import { cache } from "~/utils/cache";
import { type PrismaClient } from "@funtime/api/generated/prisma-client";

export async function getGames({
  season,
  week,
  skipCache,
  db,
}: {
  season: number;
  week?: number;
  skipCache?: boolean;
  db: PrismaClient;
}) {
  if (skipCache) {
    return await getGamesImpl({ season, week, db });
  }
  const getGamesFn = cache(
    async () => {
      return await getGamesImpl({ season, week, db });
    },
    ["getGamesBySeason", season.toString(), week ? week.toString() : "no_week"],
    {
      revalidate: 60, // every minute
    },
  );
  return await getGamesFn();
}

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
