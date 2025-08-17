import "server-only";
import { cache } from "../../utils/cache";
import { db } from "../db";

export async function getLeague({ leagueId }: { leagueId: number }) {
  const getLeagueImpl = cache(
    async () => {
      return await db.leagues.findFirstOrThrow({
        where: { league_id: leagueId },
      });
    },
    ["getLeague", leagueId.toString()],
    {
      revalidate: 60 * 60, // 1 hour
    },
  );
  return await getLeagueImpl();
}
