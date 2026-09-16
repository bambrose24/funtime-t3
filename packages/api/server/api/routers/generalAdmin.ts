import { TRPCError } from "@trpc/server";
import { MemberRole } from "../../../src/generated/prisma-client";
import {
  createTRPCRouter,
  authorizedProcedure,
  publicProcedure,
} from "../trpc";

const SUPER_ADMIN_EMAILS = ["bambrose24@gmail.com"];

const adminOnlyProcedure = authorizedProcedure.use(async ({ ctx, next }) => {
  if (!SUPER_ADMIN_EMAILS.includes(ctx?.dbUser?.email ?? "")) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Only the admin can access this data",
    });
  }
  return next();
});

export const generalAdminRouter = createTRPCRouter({
  isSuperAdmin: publicProcedure.query(async ({ ctx }) => {
    return SUPER_ADMIN_EMAILS.includes(ctx.dbUser?.email ?? "");
  }),
  getAdminData: adminOnlyProcedure.query(async ({ ctx }) => {
    const db = ctx.db;

    const [
      allLeaguesData,
      picksBySeason,
      membersByLeague,
      emailsSent,
      messagesSent,
    ] = await Promise.all([
      db.leagues.findMany({
        orderBy: {
          season: "desc",
        },
        include: {
          leaguemembers: {
            where: { role: MemberRole.admin },
            select: {
              membership_id: true,
              people: {
                select: {
                  uid: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      db.picks.groupBy({
        by: ["season"],
        _count: true,
        orderBy: {
          season: "desc",
        },
      }),
      db.leaguemembers.groupBy({
        by: ["league_id"],
        _count: true,
        orderBy: {
          league_id: "desc",
        },
      }),
      db.emailLogs.groupBy({
        by: ["league_id"],
        _count: true,
        orderBy: {
          league_id: "desc",
        },
      }),
      db.leaguemessages.groupBy({
        by: ["league_id"],
        _count: true,
        orderBy: {
          league_id: "desc",
        },
      }),
    ]);

    const allLeagues = allLeaguesData.map((league) => {
      const { leaguemembers, ...leagueData } = league;
      return {
        ...leagueData,
        members:
          membersByLeague.find((m) => m.league_id === league.league_id)
            ?._count ?? 0,
        picks:
          picksBySeason.find((p) => p.season === league.season)?._count ?? 0,
        admins: [...leaguemembers]
          .sort((a, b) =>
            a.people.username.localeCompare(b.people.username, undefined, {
              sensitivity: "base",
            }),
          )
          .map((member) => ({
            membershipId: member.membership_id,
            userId: member.people.uid,
            username: member.people.username,
            email: member.people.email,
          })),
      };
    });

    return {
      allLeagues,
      picksBySeason,
      membersByLeague,
      emailsSent,
      messagesSent,
    };
  }),
});
