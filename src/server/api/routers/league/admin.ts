import { z } from "zod";
import { authorizedProcedure, createTRPCRouter } from "../../trpc";
import { MemberRole } from "~/generated/prisma-client";
import { TRPCError } from "@trpc/server";
import { groupBy, orderBy } from "lodash";

const leagueAdminProcedure = authorizedProcedure
  .input(z.object({ leagueId: z.number().int() }))
  .use(async ({ ctx, next, path, input }) => {
    const member = ctx.dbUser?.leaguemembers.find(
      (m) => m.league_id === input.leagueId,
    );
    if (member?.role !== MemberRole.admin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `You are not an admin of the league ${input.leagueId}. Path ${path}`,
      });
    }
    return next();
  });

export const leagueAdminRouter = createTRPCRouter({
  removeMember: leagueAdminProcedure
    .input(
      z.object({
        memberId: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { leagueId, memberId } = input;
      const memberInLeague = await db.leaguemembers.findFirstOrThrow({
        where: {
          membership_id: memberId,
          league_id: leagueId,
        },
      });

      // const response = await db.leaguemembers.delete({
      //   where: {
      //     membership_id: memberInLeague.membership_id,
      //   },
      // });

      return memberInLeague;
    }),
  members: leagueAdminProcedure.query(async ({ ctx, input }) => {
    const { db } = ctx;
    const { leagueId } = input;

    const [dbMembers, league] = await Promise.all([
      db.leaguemembers.findMany({
        where: {
          league_id: leagueId,
        },
        include: {
          people: true,
        },
      }),
      db.leagues.findFirstOrThrow({
        where: {
          league_id: leagueId,
        },
      }),
    ]);
    const memberIds = dbMembers.map((m) => m.membership_id);

    const [picks, doneGames] = await Promise.all([
      db.picks.groupBy({
        by: ["member_id", "correct"],
        where: {
          member_id: {
            in: memberIds,
          },
          done: 1,
        },
        _count: true,
      }),
      await db.games.count({
        where: {
          season: league.season,
          done: true,
        },
      }),
    ]);

    const donePicksByMemberId = groupBy(picks, (p) => p.member_id);

    const members = orderBy(
      dbMembers.map((member) => {
        const picksCounts = donePicksByMemberId[member.membership_id] ?? [];
        const correctPicks = picksCounts
          .filter((p) => p.correct === 1)
          .reduce((prev, curr) => prev + curr._count, 0);
        const wrongPicks = picksCounts
          .filter((p) => p.correct !== 1)
          .reduce((prev, curr) => prev + curr._count, 0);

        return {
          ...member,
          correctPicks,
          wrongPicks,
          misssedPicks: doneGames - (correctPicks + wrongPicks),
        };
      }),
      (m) => m.people.username.toLowerCase(),
    );

    return { members };
  }),
});
