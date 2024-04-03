import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "../db";

const REVALIDATE_SECONDS = 60;

export async function getGamesByWeek({
  season,
  week,
  skipCache,
}: {
  season: number;
  week: number;
  skipCache?: boolean;
}) {
  if (skipCache) {
    return await getGamesByWeekImpl({ season, week });
  }
  const getGames = unstable_cache(
    async () => {
      return await getGamesByWeekImpl({ season, week });
    },
    ["getGamesBySeason", season.toString(), week.toString()],
    {
      revalidate: REVALIDATE_SECONDS,
    },
  );
  return await getGames();
}

async function getGamesByWeekImpl({
  season,
  week,
}: {
  season: number;
  week: number;
}) {
  return await db.games.findMany({
    where: { season, week },
    orderBy: [{ ts: "asc" }, { gid: "asc" }],
  });
}
