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
import { isE2EMode } from "../../../utils/e2e";
import { getLogger } from "../../../utils/logging";
import { db } from "../../db";
const resend = new Resend(process.env.RESEND_API_KEY ?? "");

const FROM = "Funtime System <no-reply@play-funtime.com>";

const LOG_PREFIX = "[resend-api]";
const EMAILS_DISABLED =
  isE2EMode ||
  ["1", "true", "yes", "on"].includes(
    (process.env.FUNTIME_DISABLE_EMAILS ?? "").toLowerCase(),
  );

const sendEmail = async (
  payload: Parameters<typeof resend.emails.send>[0],
  context: string,
) => {
  if (EMAILS_DISABLED) {
    getLogger().info(
      `${LOG_PREFIX} Skipping email send (${context}) because FUNTIME_DISABLE_EMAILS is enabled.`,
    );
    return { data: null, error: null };
  }
  return await resend.emails.send(payload);
};

const sendBatchEmail = async (
  payload: Parameters<typeof resend.batch.send>[0],
  context: string,
) => {
  if (EMAILS_DISABLED) {
    getLogger().info(
      `${LOG_PREFIX} Skipping batch email send (${context}) because FUNTIME_DISABLE_EMAILS is enabled.`,
    );
    return { data: null, error: null };
  }
  return await resend.batch.send(payload);
};

const escapeHtml = (input: string) => {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

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
    const { data, error } = await sendEmail(
      {
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
      },
      `league_registration:${league.league_id}:${memberId}`,
    );

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

      const { data, error } = await sendEmail(
        {
        from: FROM,
        to: [email],
        subject: `Your ${leagues.length === 1 ? (leagues.at(0)?.name ?? "") : "Funtime"} picks for Week ${week}!`,
        html: emailHtml,
        },
        `week_picks:${userId}:${week}`,
      );

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

    const { data, error } = await sendEmail(
      {
      from: FROM,
      to: [user.email],
      subject: `Reminder: Make Your Picks for ${league.name}!`,
      react: PickReminderEmail({
        username: user.username,
        leagueName: league.name,
        leagueHomeHref: `https://www.play-funtime.com/league/${league.league_id}`,
      }),
      },
      `pick_reminder:${league.league_id}:${member.membership_id}:${week}`,
    );

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
  sendWeekSummaryEmail: async ({
    leagueId,
    leagueName,
    week,
    standings,
    weekWinners,
    tiebreakerTotal,
    recipients,
  }: {
    leagueId: number;
    leagueName: string;
    week: number;
    standings: Array<{
      rank: number;
      username: string;
      correctPicks: number;
      seasonTotal: number;
    }>;
    weekWinners: string[];
    tiebreakerTotal: number | null;
    recipients: Array<{
      email: string;
      memberId: number;
      username: string;
      rank: number;
      correctPicks: number;
      seasonRank: number;
      seasonTotal: number;
      seasonMovement: number | null;
      tiebreakerPick: number | null;
      tiebreakerDiff: number | null;
      picks: Array<{
        game: string;
        pick: string;
        result: "Correct" | "Wrong" | "Pending";
      }>;
    }>;
  }) => {
    if (recipients.length === 0) {
      return { sent: 0 };
    }

    const standingsRows = standings
      .map((standing) => {
        return `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${standing.rank}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(standing.username)}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${standing.correctPicks}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${standing.seasonTotal}</td></tr>`;
      })
      .join("");
    const winnersText =
      weekWinners.length > 0 ? weekWinners.map(escapeHtml).join(", ") : "TBD";
    const tiebreakerText =
      tiebreakerTotal === null
        ? "No completed tiebreaker total."
        : `Tiebreaker total: ${tiebreakerTotal}.`;

    let sent = 0;
    for (const recipient of recipients) {
      const movementText =
        recipient.seasonMovement === null
          ? "no prior week comparison"
          : recipient.seasonMovement === 0
            ? "no rank change"
            : recipient.seasonMovement > 0
              ? `up ${recipient.seasonMovement}`
              : `down ${Math.abs(recipient.seasonMovement)}`;
      const recipientTiebreakerText =
        recipient.tiebreakerPick === null || recipient.tiebreakerDiff === null
          ? ""
          : `<p style="margin: 0 0 12px;">Your tiebreaker pick: ${recipient.tiebreakerPick} (${recipient.tiebreakerDiff} off).</p>`;
      const picksRows =
        recipient.picks.length > 0
          ? recipient.picks
              .map((pick) => {
                return `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(pick.game)}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(pick.pick)}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${pick.result}</td></tr>`;
              })
              .join("")
          : `<tr><td colspan="3" style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">No picks submitted.</td></tr>`;
      const html = `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <h2 style="margin-bottom: 8px;">Week ${week} Summary - ${escapeHtml(leagueName)}</h2>
          <p style="margin-top: 0;">
            Hi ${escapeHtml(recipient.username)}, you finished <strong>#${recipient.rank}</strong> with
            <strong>${recipient.correctPicks}</strong> correct picks this week.
          </p>
          <p style="margin: 0 0 12px;">Week winner(s): <strong>${winnersText}</strong>. ${tiebreakerText}</p>
          ${recipientTiebreakerText}
          <p style="margin: 0 0 12px;">Season: <strong>#${recipient.seasonRank}</strong>, <strong>${recipient.seasonTotal}</strong> correct (${movementText}).</p>
          <p>Week standings:</p>
          <table style="border-collapse: collapse; width: 100%; max-width: 460px;">
            <thead>
              <tr>
                <th align="left" style="padding:6px 8px;border-bottom:2px solid #d1d5db;">Rank</th>
                <th align="left" style="padding:6px 8px;border-bottom:2px solid #d1d5db;">Player</th>
                <th align="left" style="padding:6px 8px;border-bottom:2px solid #d1d5db;">Correct</th>
                <th align="left" style="padding:6px 8px;border-bottom:2px solid #d1d5db;">Season</th>
              </tr>
            </thead>
            <tbody>
              ${standingsRows}
            </tbody>
          </table>
          <p>Your picks:</p>
          <table style="border-collapse: collapse; width: 100%; max-width: 560px;">
            <thead>
              <tr>
                <th align="left" style="padding:6px 8px;border-bottom:2px solid #d1d5db;">Game</th>
                <th align="left" style="padding:6px 8px;border-bottom:2px solid #d1d5db;">Pick</th>
                <th align="left" style="padding:6px 8px;border-bottom:2px solid #d1d5db;">Result</th>
              </tr>
            </thead>
            <tbody>
              ${picksRows}
            </tbody>
          </table>
          <p style="margin-top: 16px;">
            <a href="https://www.play-funtime.com/league/${leagueId}?week=${week}" style="color: #2563eb;">
              View league details
            </a>
          </p>
        </div>
      `;

      const { data, error } = await sendEmail(
        {
        from: FROM,
        to: [recipient.email],
        subject: `${leagueName} - Week ${week} Summary`,
        html,
        },
        `week_summary:${leagueId}:${recipient.memberId}:${week}`,
      );

      if (error) {
        getLogger().error(
          `${LOG_PREFIX} Error sending week summary email for league ${leagueId} member ${recipient.memberId}`,
          { error },
        );
        continue;
      }

      sent += 1;
      if (data?.id) {
        await db.emailLogs.create({
          data: {
            email_type: "week_summary",
            resend_id: data.id,
            league_id: leagueId,
            member_id: recipient.memberId,
            week,
          },
        });
      }
    }

    return { sent };
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
      const { data, error } = await sendBatchEmail(
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
        `league_broadcast:${leagueId}`,
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
