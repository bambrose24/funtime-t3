import { render } from "@react-email/render";
import { chunk } from "lodash";
import { Resend } from "resend";
import LeagueBroadcastEmail from "../../../emails/league-broadcast";
import LeagueWelcome from "../../../emails/league-welcome";
import PicksConfirmationEmail from "../../../emails/picks-confirmation";
import PickReminderEmail from "../../../emails/picks-reminder";

import type {
  leaguemembers,
  leagues,
  people,
} from "../../../src/generated/prisma-client";
import { Defined } from "../../../utils/defined";
import { getLogger } from "../../../utils/logging";
import { db } from "../../db";
const resend = new Resend(process.env.RESEND_API_KEY ?? "");

const FROM = "Funtime System <no-reply@play-funtime.com>";

const LOG_PREFIX = "[resend-api]";

export const resendApi = {
  getMany: async (ids: string[]) => {
    const emails = await Promise.all(
      ids.map(async (id) => {
        try {
          return await resend.emails.get(id);
        } catch (error) {
          getLogger().error(
            `${LOG_PREFIX} Failed to fetch email with ID ${id}:`,
            error,
          );
          return null;
        }
      }),
    );
    return emails.filter(Defined);
  },
  get: async (id: string) => {
    try {
      return await resend.emails.get(id);
    } catch (error) {
      getLogger().error(
        `${LOG_PREFIX} Failed to fetch email with ID ${id}:`,
        error,
      );
      return null;
    }
  },
  sendLeagueRegistrationEmail: async (memberId: number) => {
    const member = await db.leaguemembers.findFirstOrThrow({
      where: {
        membership_id: memberId,
      },
      include: {
        leagues: {
          include: {
            leaguemembers: {
              include: {
                people: true,
              },
            },
          },
        },
        people: true,
      },
    });

    const admin = member.leagues.leaguemembers.find((m) => m.role === "admin");

    if (!member.people.email || !member.leagues) {
      throw new Error(
        "Member does not have an email or league to send registration to",
      );
    }

    const league = member.leagues;
    const email = member.people.email;

    getLogger().info(
      `${LOG_PREFIX} Going to send league registration email for league ${league.league_id} for member ${memberId}`,
    );
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: `Welcome to ${league.name}!`,
      react: LeagueWelcome({
        admin: {
          email: admin?.people.email ?? "",
          username: admin?.people.username ?? "",
        },
        leagueHomeHref: `https://www.play-funtime.com/league/${league.league_id}`,
        leagueName: league.name,
        season: league.season,
        username: member.people.username,
      }),
    });

    if (error) {
      getLogger().error(
        `${LOG_PREFIX} Error sending registration email for league ${league.league_id} member ${memberId}: ${error.message}`,
        { error },
      );
    } else {
      getLogger().info(
        `${LOG_PREFIX} Sent registration email for league ${league.league_id} member ${memberId}`,
        { data },
      );
    }

    if (data?.id) {
      await db.emailLogs.create({
        data: {
          email_type: "league_registration",
          resend_id: data.id,
          league_id: league.league_id,
          member_id: member.membership_id,
        },
      });
    }
  },

  sendWeekPicksEmail: async ({
    userId,
    leagueIds,
    pickIds,
  }: {
    userId: number;
    leagueIds: number[];
    pickIds: number[];
  }) => {
    const [members, picks, teams] = await Promise.all([
      db.leaguemembers.findMany({
        where: {
          user_id: userId,
          league_id: {
            in: leagueIds,
          },
        },
        include: {
          leagues: true,
          people: true,
        },
      }),
      db.picks.findMany({
        where: {
          pickid: {
            in: pickIds,
          },
        },
        include: {
          games: true,
        },
      }),
      db.teams.findMany(),
    ]);

    const leagues = members.map((m) => m.leagues);
    const userIdSet = new Set(members.map((m) => m.user_id));
    if (userIdSet.size !== 1) {
      throw new Error("Multiple users found for picks");
    }

    const user = members.at(0)?.people;
    if (!user) {
      throw new Error("No user found for picks");
    }

    const email = user.email;

    const week = picks.at(0)?.games.week;
    if (!week) {
      throw new Error("No week found for picks");
    }

    const teamById = new Map(teams.map((t) => [t.teamid, t]));

    getLogger().info(
      `${LOG_PREFIX} Going to send weekly picks email for leagues ${leagues.map((l) => l.league_id).join(",")} for members ${members.map((m) => m.membership_id).join(",")}`,
    );
    try {
      const emailHtml = await render(
        PicksConfirmationEmail({
          leagues: leagues.map((l) => {
            return {
              leagueId: l.league_id,
              name: l.name,
            };
          }),
          username: user.username,
          week,
          picks: picks.map((p) => {
            return {
              awayTeam: teamById.get(p.games.away)?.abbrev ?? "",
              homeTeam: teamById.get(p.games.home)?.abbrev ?? "",
              chosen: p.winner === p.games.home ? "home" : "away",
              score: p.score ?? undefined,
              time: p.games.ts,
            };
          }),
        }),
      );

      const { data, error } = await resend.emails.send({
        from: FROM,
        to: [email],
        subject: `Your ${leagues.length === 1 ? (leagues.at(0)?.name ?? "") : "Funtime"} picks for Week ${week}!`,
        html: emailHtml,
      });

      if (error) {
        getLogger().error(
          `${LOG_PREFIX} Error sending weekly picks email for leagues ${leagues.map((l) => l.league_id).join(",")} for members ${members.map((m) => m.membership_id).join(",")}`,
          { error },
        );
      } else {
        getLogger().info(
          `${LOG_PREFIX} Sent weekly picks email for leagues ${leagues.map((l) => l.league_id).join(",")} for members ${members.map((m) => m.membership_id).join(",")}`,
          { data },
        );
      }

      if (data?.id) {
        await Promise.all(
          members.map(async (m) => {
            await db.emailLogs.create({
              data: {
                email_type: "week_picks",
                week,
                resend_id: data.id,
                league_id: m.league_id,
                member_id: m.membership_id,
              },
            });
          }),
        );
      }
    } catch (err) {
      getLogger().error(
        `${LOG_PREFIX} Error thrown sending weekly picks email for leagues ${leagues.map((l) => l.league_id).join(",")} for members ${members.map((m) => m.membership_id).join(",")}`,
        { error: err },
      );
      throw err;
    }
  },
  sendPickReminderEmail: async ({
    member,
    user,
    league,
    week,
  }: {
    member: leaguemembers;
    user: people;
    league: leagues;
    week: number;
  }) => {
    if (!user.email || !league) {
      throw new Error(
        "User does not have an email or league to send pick reminder to",
      );
    }

    getLogger().info(
      `${LOG_PREFIX} Going to send pick reminder email for league ${league.league_id} for member ${member.membership_id}`,
    );

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [user.email],
      subject: `Reminder: Make Your Picks for ${league.name}!`,
      react: PickReminderEmail({
        username: user.username,
        leagueName: league.name,
        leagueHomeHref: `https://www.play-funtime.com/league/${league.league_id}`,
      }),
    });

    if (error) {
      getLogger().error(
        `${LOG_PREFIX} Error sending pick reminder email for league ${league.league_id} for member ${member.membership_id}`,
        { error },
      );
    } else {
      getLogger().info(
        `${LOG_PREFIX} Sent pick reminder email for league ${league.league_id} for member ${member.membership_id}`,
        { data },
      );
    }

    if (data?.id) {
      await db.emailLogs.create({
        data: {
          email_type: "week_reminder",
          resend_id: data.id,
          league_id: league.league_id,
          member_id: member.membership_id,
          week,
        },
      });
    }
  },
  sendLeagueBroadcast: async ({
    leagueName,
    adminName,
    markdownMessage,
    leagueId,
    to,
  }: {
    leagueName: string;
    adminName: string;
    markdownMessage: string;
    leagueId: number;
    to: { email: string; memberId: number }[];
  }) => {
    getLogger().info(
      `${LOG_PREFIX} Going to send league broadcast email for league ${leagueName}`,
    );

    // Have to chunk into <100 per batch here, so let's chunk into 90 per group and send batches that way to stay under the limit
    const chunks = chunk(to, 90);
    for (const emailChunk of chunks) {
      const { data, error } = await resend.batch.send(
        emailChunk.map((t) => {
          return {
            from: FROM,
            to: t.email,
            subject: `Funtime - Message from ${leagueName} Admin`,
            react: LeagueBroadcastEmail({
              leagueName,
              leagueId,
              adminName,
              markdownMessage,
            }),
          };
        }),
      );

      if (error) {
        getLogger().error(
          `${LOG_PREFIX} Error sending league broadcast email for league ${leagueName}`,
          { error },
        );
      } else {
        getLogger().info(
          `${LOG_PREFIX} Sent league broadcast email for league ${leagueName}`,
          { data },
        );
      }

      if (data?.data && data.data.length > 0) {
        const resendEmails = await Promise.all(
          data.data.map(async (d) => {
            return await resend.emails.get(d.id);
          }),
        );

        // Only create email logs if we are able to
        const toCreate = data.data
          .map((d) => {
            const resendEmail = resendEmails.find((e) => e.data?.id === d.id);
            const memberAndEmail = to.find((t) =>
              resendEmail?.data?.to.includes(t.email),
            );
            const memberId = memberAndEmail?.memberId;
            if (memberId) {
              return {
                resend_id: d.id,
                email_type: "league_broadcast",
                league_id: leagueId,
                member_id: memberId,
              } as const;
            } else {
              getLogger().error(
                `${LOG_PREFIX} Unable to find member for resend email id ${d.id} for league broadcast email for league ${leagueId}`,
              );
            }
            return null;
          })
          .filter(Defined);

        await db.emailLogs.createMany({
          data: toCreate,
        });
      }
    }
  },
};
