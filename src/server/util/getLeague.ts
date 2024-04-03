import "server-only";
import { db } from "../db";
import { cache } from "~/utils/cache";

const REVALIDATE_SECONDS = 60 * 60; // 1 hour

export async function getLeague({ leagueId }: { leagueId: number }) {
  const getLeagueImpl = cache(
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
