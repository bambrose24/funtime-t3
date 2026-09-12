import { orderBy } from "lodash";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { DEFAULT_SEASON } from "../../../utils/const";
import { getHomeLeagueStatus } from "../../../utils/homeLeagueStatus";

export const homeRouter = createTRPCRouter({
  leagues: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.supabaseUser || !ctx.dbUser) return null;

    const memberships = ctx.dbUser.leaguemembers;
    const activeMemberIds = memberships
      .filter((member) => member.leagues.season === DEFAULT_SEASON)
      .map((member) => member.membership_id);
    const [leagues, schedule] = await Promise.all([
      ctx.db.leagues.findMany({
        where: { league_id: { in: memberships.map((m) => m.league_id) } },
        select: {
          league_id: true,
          name: true,
          season: true,
          late_policy: true,
        },
        orderBy: [{ season: "desc" }, { name: "asc" }, { league_id: "asc" }],
      }),
      activeMemberIds.length
        ? ctx.db.games.findMany({
            where: { season: DEFAULT_SEASON },
            select: { gid: true, week: true, ts: true, done: true },
          })
        : Promise.resolve([]),
    ]);
    // Weekly submissions are represented by the existing per-game pick rows.
    // Do not turn missing locked games from a valid late entry into a task.
    const submissions =
      activeMemberIds.length && schedule.length
        ? await ctx.db.picks.findMany({
            where: {
              member_id: { in: activeMemberIds },
              gid: { in: schedule.map((game) => game.gid) },
            },
            select: { member_id: true, week: true },
            distinct: ["member_id", "week"],
          })
        : [];
    const now = new Date();
    return leagues.map(({ late_policy, ...league }) => {
      const member = memberships.find((m) => m.league_id === league.league_id);
      const submittedWeeks = new Set(
        submissions
          .filter((pick) => pick.member_id === member?.membership_id)
          .map((pick) => pick.week),
      );
      return {
        ...league,
        weeklyStatus:
          league.season === DEFAULT_SEASON
            ? getHomeLeagueStatus(schedule, submittedWeeks, late_policy, now)
            : null,
      };
    });
  }),
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
      const weekWins = [
        ...new Set(league.WeekWinners.map((week) => week.week)),
      ].sort((a, b) => a - b);

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
