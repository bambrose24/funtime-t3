import "server-only";
import { db } from "../db";
import { cache } from "~/utils/cache";

export async function getGames({
  season,
  week,
  skipCache,
}: {
  season: number;
  week?: number;
  skipCache?: boolean;
}) {
  if (skipCache) {
    return await getGamesImpl({ season, week });
  }
  const getGamesFn = cache(
    async () => {
      return await getGamesImpl({ season, week });
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
}: {
  season: number;
  week?: number;
}) {
  return await db.games.findMany({
    where: { season, ...(week ? { week } : {}) },
    orderBy: [{ ts: "asc" }, { gid: "asc" }],
  });
}
