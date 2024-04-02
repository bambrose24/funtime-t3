import { unstable_cache } from "next/cache";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const HOME_REVALIDATE_SECONDS = 60 * 3; // 3 minutes should be good

export const homeRouter = createTRPCRouter({
  nav: publicProcedure.query(async ({ ctx }) => {
    const { db, supabaseUser, dbUser } = ctx;

    if (!supabaseUser || !dbUser) {
      return null;
    }

    const leagueIds = dbUser.leaguemembers.map((m) => m.league_id).sort();

    const getLeagues = unstable_cache(
      async () => {
        console.log("fetching leagues in homeRouter.nav...");
        const leagues = await db.leagues.findMany({
          where: {
            league_id: {
              in: leagueIds,
            },
          },
        });
        return { leagues, dbUser };
      },
      leagueIds.map((league_id) => league_id.toString()),
      { revalidate: HOME_REVALIDATE_SECONDS },
    );

    return await getLeagues();
  }),
  summary: publicProcedure
    .input(z.object({ season: z.number() }))
    .query(async ({ input, ctx }) => {
      const { db, supabaseUser, dbUser } = ctx;
      if (!supabaseUser || !dbUser) {
        return null;
      }

      const leagueIds = dbUser.leaguemembers.map((m) => m.league_id).sort();
      const memberIds = dbUser.leaguemembers.map((m) => m.membership_id).sort();

      const getSummaries = unstable_cache(
        async () => {
          console.log("fetching leagues in homeRouter.summary...");
          const leagues = await db.leagues.findMany({
            where: {
              league_id: {
                in: leagueIds,
              },
            },
            orderBy: {
              season: "desc",
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
              leaguemembers: {
                where: {
                  membership_id: {
                    in: memberIds,
                  },
                },
                include: {
                  picks: {
                    select: {
                      correct: true,
                    },
                  },
                },
              },
            },
          });
          return leagues;
        },
        [
          "leagues",
          ...leagueIds.map((league_id) => league_id.toString()),
          "members",
          ...memberIds.map((m) => m.toString()),
        ],
        { revalidate: HOME_REVALIDATE_SECONDS },
      );

      return await getSummaries();
    }),
});
