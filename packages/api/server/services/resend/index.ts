import { createHash } from "node:crypto";
import { chunk } from "lodash";
import { Resend } from "resend";
import LeagueBroadcastEmail from "../../../emails/league-broadcast";
import LeagueRenewalInvite from "../../../emails/league-renewal-invite";
import LeagueWelcome from "../../../emails/league-welcome";
import PicksConfirmationEmail from "../../../emails/picks-confirmation";
import PickReminderEmail from "../../../emails/picks-reminder";
import WeekSummaryEmail from "../../../emails/week-summary";

import type {
  leaguemembers,
  leagues,
  people,
} from "../../../src/generated/prisma-client";
import { Defined } from "../../../utils/defined";
import { isE2EMode } from "../../../utils/e2e";
import { getLogger } from "../../../utils/logging";
import { db } from "../../db";

const FROM = "Funtime System <no-reply@play-funtime.com>";

const LOG_PREFIX = "[resend-api]";
const EMAILS_DISABLED =
  isE2EMode ||
  ["1", "true", "yes", "on"].includes(
    (process.env.FUNTIME_DISABLE_EMAILS ?? "").toLowerCase(),
  );

let resendClient: Resend | undefined;

const getResendClient = () => {
  if (resendClient) {
    return resendClient;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is required when outbound email is enabled.",
    );
  }

  resendClient = new Resend(apiKey);
  return resendClient;
};

const createIdempotencyKey = (scope: string, identity: string) => {
  const digest = createHash("sha256").update(identity).digest("hex");
  return `${scope}/${digest}`;
};

const createTags = (category: string, leagueId?: number) => [
  { name: "category", value: category },
  ...(leagueId === undefined
    ? []
    : [{ name: "league_id", value: leagueId.toString() }]),
];

const sendEmail = async (
  payload: Parameters<Resend["emails"]["send"]>[0],
  context: string,
  idempotencyKey: string,
) => {
  if (EMAILS_DISABLED) {
    getLogger().info(
      `${LOG_PREFIX} Skipping email send (${context}) because FUNTIME_DISABLE_EMAILS is enabled.`,
    );
    return { data: null, error: null };
  }
  return await getResendClient().emails.send(payload, { idempotencyKey });
};

const sendBatchEmail = async (
  payload: Parameters<Resend["batch"]["send"]>[0],
  context: string,
  idempotencyKey: string,
) => {
  if (EMAILS_DISABLED) {
    getLogger().info(
      `${LOG_PREFIX} Skipping batch email send (${context}) because FUNTIME_DISABLE_EMAILS is enabled.`,
    );
    return { data: null, error: null };
  }
  return await getResendClient().batch.send(payload, { idempotencyKey });
};

export const resendApi = {
  getMany: async (ids: string[]) => {
    if (EMAILS_DISABLED) {
      getLogger().info(
        `${LOG_PREFIX} Skipping ${ids.length} email reads because FUNTIME_DISABLE_EMAILS is enabled.`,
      );
      return [];
    }
    const emails = await Promise.all(
      ids.map(async (id) => {
        try {
          return await getResendClient().emails.get(id);
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
    if (EMAILS_DISABLED) {
      getLogger().info(
        `${LOG_PREFIX} Skipping email read (${id}) because FUNTIME_DISABLE_EMAILS is enabled.`,
      );
      return null;
    }
    try {
      return await getResendClient().emails.get(id);
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
        tags: createTags("league_registration", league.league_id),
      },
      `league_registration:${league.league_id}:${memberId}`,
      createIdempotencyKey(
        "league-registration",
        `${league.league_id}:${memberId}`,
      ),
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

  sendLeagueRenewalInvites: async ({
    adminName,
    joinHref,
    nextLeagueName,
    nextLeagueId,
    priorLeagueId,
    priorLeagueName,
    season,
    to,
  }: {
    adminName: string;
    joinHref: string;
    nextLeagueName: string;
    nextLeagueId: number;
    priorLeagueId: number;
    priorLeagueName: string;
    season: number;
    to: { email: string; memberId: number; username: string }[];
  }) => {
    getLogger().info(
      `${LOG_PREFIX} Going to send renewal invites for prior league ${priorLeagueId}`,
    );

    let sentCount = 0;
    let failedCount = 0;
    const chunks = chunk(to, 90);

    for (const [chunkIndex, emailChunk] of chunks.entries()) {
      const { data, error } = await sendBatchEmail(
        emailChunk.map((recipient) => {
          return {
            from: FROM,
            to: recipient.email,
            subject: `Next season: ${nextLeagueName} is open`,
            react: LeagueRenewalInvite({
              adminName,
              joinHref,
              nextLeagueName,
              priorLeagueName,
              season,
              username: recipient.username,
            }),
            tags: createTags("renewal_invite", nextLeagueId),
          };
        }),
        `renewal_invite:${priorLeagueId}:${chunkIndex}`,
        createIdempotencyKey(
          "renewal-invite",
          `${nextLeagueId}:${emailChunk
            .map((recipient) => recipient.memberId)
            .sort((a, b) => a - b)
            .join(",")}`,
        ),
      );

      if (error) {
        failedCount += emailChunk.length;
        getLogger().error(
          `${LOG_PREFIX} Error sending renewal invites for prior league ${priorLeagueId}`,
          { error },
        );
        continue;
      }

      if (!data?.data || data.data.length === 0) {
        continue;
      }

      sentCount += data.data.length;
      const resendEmails = await Promise.all(
        data.data.map(async (email) => {
          return await getResendClient().emails.get(email.id);
        }),
      );

      const logsToCreate = data.data
        .map((email) => {
          const resendEmail = resendEmails.find((e) => e.data?.id === email.id);
          const memberAndEmail = emailChunk.find((recipient) =>
            resendEmail?.data?.to.includes(recipient.email),
          );
          if (!memberAndEmail) {
            getLogger().error(
              `${LOG_PREFIX} Unable to find member for renewal invite email ${email.id} for prior league ${priorLeagueId}`,
            );
            return null;
          }

          return {
            resend_id: email.id,
            email_type: "renewal_invite",
            league_id: nextLeagueId,
            member_id: memberAndEmail.memberId,
          } as const;
        })
        .filter(Defined);

      if (logsToCreate.length > 0) {
        await db.emailLogs.createMany({
          data: logsToCreate,
        });
      }
    }

    return { sentCount, failedCount };
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
      const confirmationEmail = PicksConfirmationEmail({
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
      });

      const { data, error } = await sendEmail(
        {
          from: FROM,
          to: [email],
          subject: `Your ${leagues.length === 1 ? (leagues.at(0)?.name ?? "") : "Funtime"} picks for Week ${week}!`,
          react: confirmationEmail,
          tags: createTags("week_picks"),
        },
        `week_picks:${userId}:${week}`,
        createIdempotencyKey(
          "week-picks",
          JSON.stringify({
            userId,
            week,
            leagueIds: [...leagueIds].sort((a, b) => a - b),
            picks: picks
              .map((pick) => ({
                id: pick.pickid,
                winner: pick.winner,
                score: pick.score,
              }))
              .sort((a, b) => a.id - b.id),
          }),
        ),
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
        tags: createTags("pick_reminder", league.league_id),
      },
      `pick_reminder:${league.league_id}:${member.membership_id}:${week}`,
      createIdempotencyKey(
        "pick-reminder",
        `${league.league_id}:${member.membership_id}:${week}`,
      ),
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

    let sent = 0;
    for (const recipient of recipients) {
      const { data, error } = await sendEmail(
        {
          from: FROM,
          to: [recipient.email],
          subject: `${leagueName} - Week ${week} Summary`,
          react: WeekSummaryEmail({
            leagueId,
            leagueName,
            week,
            standings,
            weekWinners,
            tiebreakerTotal,
            recipient,
          }),
          tags: createTags("week_summary", leagueId),
        },
        `week_summary:${leagueId}:${recipient.memberId}:${week}`,
        createIdempotencyKey(
          "week-summary",
          JSON.stringify({
            leagueId,
            week,
            standings,
            weekWinners,
            tiebreakerTotal,
            recipient,
          }),
        ),
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
    adminEmail,
    markdownMessage,
    leagueId,
    to,
  }: {
    leagueName: string;
    adminName: string;
    adminEmail?: string;
    markdownMessage: string;
    leagueId: number;
    to: { email: string; memberId: number }[];
  }) => {
    getLogger().info(
      `${LOG_PREFIX} Going to send league broadcast email for league ${leagueName}`,
    );

    // Have to chunk into <100 per batch here, so let's chunk into 90 per group and send batches that way to stay under the limit
    const chunks = chunk(to, 90);
    for (const [chunkIndex, emailChunk] of chunks.entries()) {
      const { data, error } = await sendBatchEmail(
        emailChunk.map((t) => {
          return {
            from: FROM,
            to: t.email,
            replyTo: adminEmail,
            subject: `Funtime - Message from ${leagueName} Admin`,
            react: LeagueBroadcastEmail({
              leagueName,
              leagueId,
              adminName,
              markdownMessage,
            }),
            tags: createTags("league_broadcast", leagueId),
          };
        }),
        `league_broadcast:${leagueId}:${chunkIndex}`,
        createIdempotencyKey(
          "league-broadcast",
          JSON.stringify({
            leagueId,
            markdownMessage,
            memberIds: emailChunk
              .map((recipient) => recipient.memberId)
              .sort((a, b) => a - b),
          }),
        ),
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
            return await getResendClient().emails.get(d.id);
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
