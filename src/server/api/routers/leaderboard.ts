import { TRPCError } from "@trpc/server";
import { sortBy } from "lodash";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { cache } from "~/utils/cache";
import { withRankings } from "~/utils/withRankings";

export const leaderboardRouter = createTRPCRouter({
  league: publicProcedure
    .input(z.object({ leagueId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const { db, supabaseUser, dbUser } = ctx;

      if (!supabaseUser || !dbUser) {
        return null;
      }

      const { leagueId } = input;
      if (!dbUser.leaguemembers.find((m) => m.league_id === leagueId)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You do not have access to this league",
        });
      }

      const getLeagueLeaderboard = cache(
        async () => {
          const [league, leagueMembers] = await Promise.all([
            db.leagues.findFirstOrThrow({ where: { league_id: leagueId } }),
            db.leaguemembers.findMany({
              relationLoadStrategy: "join",
              where: {
                league_id: leagueId,
              },
              include: {
                people: true,
              },
            }),
          ]);

          const memberIdToMember = leagueMembers.reduce((prev, curr) => {
            prev.set(curr.membership_id, curr);
            return prev;
          }, new Map<number, (typeof leagueMembers)[number]>());

          const groupedPicks = await db.picks.groupBy({
            by: ["week", "member_id"],
            where: {
              member_id: { in: leagueMembers.map((m) => m.membership_id) },
              correct: 1,
            },
            _count: {
              correct: true,
            },
          });

          const maxWeek = Math.max(...groupedPicks.map((p) => p.week));

          const weekTotals = new Map<number, Map<number, number>>();
          [...memberIdToMember.keys()].map((memberId) => {
            weekTotals.set(memberId, new Map());
            const memberPicks = groupedPicks.filter(
              (p) => p.member_id === memberId,
            );
            let weekIter = 1;
            while (weekIter <= maxWeek) {
              const total = memberPicks
                .filter((p) => p.week <= weekIter)
                .reduce((prev, curr) => {
                  return prev + curr._count.correct;
                }, 0);
              weekTotals.get(memberId)?.set(weekIter, total);
              weekIter += 1;
            }
          });

          const memberToTotal = groupedPicks.reduce((prev, curr) => {
            if (!curr.member_id) {
              return prev;
            }
            if (!prev.has(curr.member_id)) {
              prev.set(curr.member_id, 0);
            }
            prev.set(
              curr.member_id,
              prev.get(curr.member_id)! + curr._count.correct,
            );
            return prev;
          }, new Map<number, number>());

          const correctCounts = [...memberToTotal.entries()].map(
            ([member_id, correct]) => {
              return { member: memberIdToMember.get(member_id)!, correct };
            },
          );

          const correctCountsSorted = withRankings(
            sortBy(correctCounts, [
              (p) => -p.correct,
              (p) => p.member.people.username.toLocaleLowerCase(),
            ]),
            (x) => x.correct,
          );

          return { league, weekTotals, correctCountsSorted };
        },
        [leagueId.toString()],
        {
          revalidate: 60 * 60, // 1 hour
        },
      );

      return await getLeagueLeaderboard();
    }),
});
