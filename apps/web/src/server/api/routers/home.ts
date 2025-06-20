import { orderBy } from "lodash";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// const HOME_REVALIDATE_SECONDS = 60 * 3; // 3 minutes should be good

export const homeRouter = createTRPCRouter({
  nav: publicProcedure.query(async ({ ctx }) => {
    const { db, supabaseUser, dbUser } = ctx;

    if (!supabaseUser || !dbUser) {
      return null;
    }

    const leagueIds = dbUser.leaguemembers.map((m) => m.league_id).sort();

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
  }),
  summary: publicProcedure.query(async ({ ctx }) => {
    const { db, supabaseUser, dbUser } = ctx;
    if (!supabaseUser || !dbUser) {
      return null;
    }

    const leagueIds = dbUser.leaguemembers.map((m) => m.league_id).sort();

    const leagues = await db.leagues.findMany({
      where: {
        league_id: {
          in: leagueIds,
        },
      },
    });

    return orderBy(leagues, (l) => l.season, "desc");
  }),
});
