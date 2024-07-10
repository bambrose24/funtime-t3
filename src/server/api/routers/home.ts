import { orderBy } from "lodash";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
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
  summary: publicProcedure.query(async ({ input: _input, ctx }) => {
    const { db, supabaseUser, dbUser } = ctx;
    if (!supabaseUser || !dbUser) {
      return null;
    }

    const leagueIds = dbUser.leaguemembers.map((m) => m.league_id).sort();
    const memberIds = dbUser.leaguemembers.map((m) => m.membership_id).sort();

    const leagues = await db.leagues.findMany({
      where: {
        league_id: {
          in: leagueIds,
        },
      },
      include: {
        WeekWinners: {
          where: {
            membership_id: {
              in: memberIds,
            },
          },
          select: {
            correct_count: true,
            week: true,
          },
        },
      },
    });

    return orderBy(leagues, (l) => l.season, "desc");
  }),
});
