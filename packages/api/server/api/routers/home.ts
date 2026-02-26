import { orderBy } from "lodash";

import { createTRPCRouter, publicProcedure } from "../trpc";

// const HOME_REVALIDATE_SECONDS = 60 * 3; // 3 minutes should be good
const HOME_REVALIDATE_SECONDS = 10; // testing

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
    const userMemberIds = dbUser.leaguemembers.map((m) => m.membership_id);
    const memberByLeagueId = new Map(
      dbUser.leaguemembers.map((member) => [member.league_id, member]),
    );

    const leagues = await db.leagues.findMany({
      where: {
        league_id: {
          in: leagueIds,
        },
      },
      include: {
        _count: {
          select: {
            leaguemembers: true,
          },
        },
        WeekWinners: {
          where: {
            membership_id: {
              in: userMemberIds,
            },
          },
          select: {
            week: true,
            membership_id: true,
          },
        },
      },
    });

    const seasons = Array.from(new Set(leagues.map((league) => league.season)));
    const doneGames =
      seasons.length > 0
        ? await db.games.findMany({
            where: {
              season: {
                in: seasons,
              },
              done: true,
            },
            select: {
              gid: true,
            },
          })
        : [];
    const doneGids = doneGames.map((game) => game.gid);

    const pickGroups =
      userMemberIds.length > 0 && doneGids.length > 0
        ? await db.picks.groupBy({
            by: ["member_id", "correct"],
            where: {
              member_id: {
                in: userMemberIds,
              },
              gid: {
                in: doneGids,
              },
              correct: {
                in: [0, 1],
              },
            },
            _count: {
              _all: true,
            },
          })
        : [];

    const correctPickCountsByMemberId = new Map<
      number,
      { correct: number; wrong: number; total: number }
    >();
    for (const group of pickGroups) {
      const memberId = group.member_id;
      if (!memberId) {
        continue;
      }
      const counts = correctPickCountsByMemberId.get(memberId) ?? {
        correct: 0,
        wrong: 0,
        total: 0,
      };
      const groupCount = group._count._all;
      if (group.correct === 1) {
        counts.correct += groupCount;
      }
      if (group.correct === 0) {
        counts.wrong += groupCount;
      }
      counts.total += groupCount;
      correctPickCountsByMemberId.set(memberId, counts);
    }

    return orderBy(leagues, (league) => league.season, "desc").map((league) => {
      const memberId = memberByLeagueId.get(league.league_id)?.membership_id;
      const counts = memberId
        ? correctPickCountsByMemberId.get(memberId)
        : undefined;
      const weekWins = [...new Set(league.WeekWinners.map((week) => week.week))].sort(
        (a, b) => a - b,
      );

      return {
        ...league,
        viewerCorrectPickCount: counts ?? {
          correct: 0,
          wrong: 0,
          total: 0,
        },
        viewerWeekWins: weekWins,
      };
    });
  }),
});
