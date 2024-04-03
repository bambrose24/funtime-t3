import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "../db";

const REVALIDATE_SECONDS = 120;

export async function getGamesBySeason({
  season,
  skipCache,
}: {
  season: number;
  skipCache?: boolean;
}) {
  if (skipCache) {
    return await getGamesBySeasonImpl({ season });
  }
  const getGames = unstable_cache(
    async () => {
      return await getGamesBySeasonImpl({ season });
    },
    ["getGamesBySeason", season.toString()],
    {
      revalidate: REVALIDATE_SECONDS,
    },
  );
  return await getGames();
}

async function getGamesBySeasonImpl({ season }: { season: number }) {
  return await db.games.findMany({
    where: { season },
    orderBy: [{ ts: "asc" }, { gid: "asc" }],
  });
}
