import { orderBy } from "lodash";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { SECONDS_IN_DAY, SECONDS_IN_HOUR } from "~/server/const";
import { cache, getCoreUserTag } from "~/utils/cache";

// const HOME_REVALIDATE_SECONDS = 60 * 3; // 3 minutes should be good
const HOME_REVALIDATE_SECONDS = 10; // testing

export const homeRouter = createTRPCRouter({
  nav: publicProcedure.query(async ({ ctx }) => {
    const { db, supabaseUser, dbUser } = ctx;

    if (!supabaseUser || !dbUser) {
      return null;
    }

    const leagueIds = dbUser.leaguemembers.map((m) => m.league_id).sort();

    const getLeagues = cache(
      async () => {
        const leagues = await db.leagues.findMany({
          where: {
            league_id: {
              in: leagueIds,
            },
          },
          orderBy: [
            {
              season: "desc",
            },
            {
              created_time: "asc", // maybe newer leagues are less prominent? who's to say
            },
          ],
        });
        return { leagues, dbUser };
      },
      leagueIds.map((league_id) => league_id.toString()),
      {
        revalidate: HOME_REVALIDATE_SECONDS,
        tags: [getCoreUserTag(dbUser.uid)],
      },
    );

    return await getLeagues();
  }),
  summary: publicProcedure.query(async ({ ctx }) => {
    const { db, supabaseUser, dbUser } = ctx;
    if (!supabaseUser || !dbUser) {
      return null;
    }

    const cachedFn = cache(
      async () => {
        const leagueIds = dbUser.leaguemembers.map((m) => m.league_id).sort();

        const leagues = await db.leagues.findMany({
          where: {
            league_id: {
              in: leagueIds,
            },
          },
        });

        return orderBy(leagues, (l) => l.season, "desc");
      },
      [`user_home_${dbUser.uid}`],
      {
        revalidate: SECONDS_IN_DAY,
      },
    );

    return cachedFn();
  }),
});
