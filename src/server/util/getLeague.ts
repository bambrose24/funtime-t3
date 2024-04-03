import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "../db";

const REVALIDATE_SECONDS = 60 * 60; // 1 hour

export async function getLeague({ leagueId }: { leagueId: number }) {
  const getLeagueImpl = unstable_cache(
    async () => {
      return await db.leagues.findFirstOrThrow({
        where: { league_id: leagueId },
      });
    },
    ["getLeague", leagueId.toString()],
    {
      revalidate: REVALIDATE_SECONDS,
    },
  );
  return await getLeagueImpl();
}
