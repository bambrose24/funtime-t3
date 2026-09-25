import { claimWeeklyRecap } from "../../../utils/weeklyRecapDelivery";
import type { WeekSummary } from "../../../utils/weekSummary";
import { createHash } from "node:crypto";
import { chunk } from "lodash";
import { Resend } from "resend";
import { z } from "zod";
import {
  claimPickReminder,
  type PickReminderIdentity,
} from "../../../utils/pickReminderDelivery";
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
} from "../../../src/generated/prisma-client/client";
import { Defined } from "../../../utils/defined";
import { isE2EMode } from "../../../utils/e2e";
import { getLogger } from "../../../utils/logging";
import { db } from "../../db";
import { reconcileEmailDeliveryState } from "./webhooks";

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

const summarizeResendError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return { message: String(error) };
  }

  const value = error as Record<string, unknown>;
  return {
    ...(typeof value.name === "string" ? { name: value.name } : {}),
    ...(typeof value.message === "string" ? { message: value.message } : {}),
    ...(typeof value.statusCode === "number"
      ? { statusCode: value.statusCode }
      : {}),
    ...(typeof value.code === "string" ? { code: value.code } : {}),
    ...(typeof value.type === "string" ? { type: value.type } : {}),
  };
};

const getEmailDomain = (email: string) =>
  email.split("@").at(-1)?.toLowerCase() ?? "unknown";

type PickReminderRecipient = {
  member: leaguemembers;
  user: people;
  league: leagues;
  week: number;
};

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
        select: { email_log_id: true },
      });
      await reconcileEmailDeliveryState(data.id);
    }
  },

  sendLeagueRenewalInvites: async ({
    adminName,
    initiatorCopy,
    joinHref,
    nextLeagueName,
    nextLeagueId,
    priorLeagueId,
    priorLeagueName,
    season,
    to,
  }: {
    adminName: string;
    initiatorCopy?: {
      email: string;
      leagueHref: string;
      memberId: number;
      username: string;
    };
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
    let initiatorCopySent = false;
    let initiatorCopyFailed = false;
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
        await Promise.all(
          logsToCreate.map((log) => reconcileEmailDeliveryState(log.resend_id)),
        );
      }
    }

    if (initiatorCopy) {
      const { data, error } = await sendEmail(
        {
          from: FROM,
          to: [initiatorCopy.email],
          subject: `Your copy: ${nextLeagueName} is open`,
          react: LeagueRenewalInvite({
            adminName,
            isInitiatorCopy: true,
            joinHref: initiatorCopy.leagueHref,
            nextLeagueName,
            priorLeagueName,
            recipientCount: sentCount,
            season,
            username: initiatorCopy.username,
          }),
          tags: createTags("renewal_invite", nextLeagueId),
        },
        `renewal_initiator_copy:${priorLeagueId}:${initiatorCopy.memberId}`,
        createIdempotencyKey(
          "renewal-initiator-copy",
          `${nextLeagueId}:${initiatorCopy.memberId}:${
            to
              .map((recipient) => recipient.memberId)
              .sort((a, b) => a - b)
              .join(",") || "none"
          }`,
        ),
      );

      if (error) {
        initiatorCopyFailed = true;
        getLogger().error(
          `${LOG_PREFIX} Error sending renewal confirmation copy for league ${nextLeagueId}`,
          { error },
        );
      } else if (data?.id) {
        initiatorCopySent = true;
        const existingLog = await db.emailLogs.findFirst({
          where: { resend_id: data.id },
          select: { email_log_id: true },
        });
        if (!existingLog) {
          await db.emailLogs.create({
            data: {
              resend_id: data.id,
              email_type: "renewal_invite",
              league_id: nextLeagueId,
              member_id: initiatorCopy.memberId,
            },
            select: { email_log_id: true },
          });
        }
        await reconcileEmailDeliveryState(data.id);
      }
    }

    return {
      sentCount,
      failedCount,
      initiatorCopySent,
      initiatorCopyFailed,
    };
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
              select: { email_log_id: true },
            });
          }),
        );
        await reconcileEmailDeliveryState(data.id);
      }
    } catch (err) {
      getLogger().error(
        `${LOG_PREFIX} Error thrown sending weekly picks email for leagues ${leagues.map((l) => l.league_id).join(",")} for members ${members.map((m) => m.membership_id).join(",")}`,
        { error: err },
      );
      throw err;
    }
  },
  sendPickReminderEmails: async (recipients: PickReminderRecipient[]) => {
    if (EMAILS_DISABLED || recipients.length === 0) {
      return 0;
    }

    // Sort the payload itself, not just its key, and never let an invalid
    // address prevent healthy recipients in the same chunk from being sent.
    const candidates = recipients
      .map((recipient) => ({
        ...recipient,
        email: recipient.user.email?.trim(),
      }))
      .filter(
        ({ email, league }) =>
          league && z.string().email().safeParse(email).success,
      )
      .sort((a, b) => a.member.membership_id - b.member.membership_id);
    if (candidates.length !== recipients.length) {
      getLogger().error(
        `${LOG_PREFIX} Skipping invalid pick reminder recipients`,
        {
          requested: recipients.length,
          skipped: recipients.length - candidates.length,
        },
      );
    }

    let sent = 0;
    for (const candidateChunk of chunk(candidates, 100)) {
      // Only claim the current chunk; later chunks remain available if this
      // process stops during a provider request.
      const claimed: Array<{
        recipient: (typeof candidates)[number];
        identity: PickReminderIdentity;
      }> = [];
      for (const recipient of candidateChunk) {
        const identity = {
          league_id: recipient.league.league_id,
          user_id: recipient.member.user_id,
          season: recipient.league.season,
          week: recipient.week,
        };
        try {
          if (await claimPickReminder(db, identity))
            claimed.push({ recipient, identity });
        } catch (error) {
          // No provider request has been made for this recipient. An ambiguous
          // claim write is left held; other recipients can still proceed.
          getLogger().error(`${LOG_PREFIX} Pick reminder claim failed`, {
            leagueId: identity.league_id,
            season: identity.season,
            week: identity.week,
            error: summarizeResendError(error),
          });
        }
      }
      if (claimed.length === 0) continue;

      const context = `pick_reminder_batch:${claimed.map(({ recipient }) => recipient.member.membership_id).join(",")}`;
      const recipientDomains = claimed.reduce<Record<string, number>>(
        (counts, { recipient }) => {
          const domain = getEmailDomain(recipient.email!);
          counts[domain] = (counts[domain] ?? 0) + 1;
          return counts;
        },
        {},
      );
      let acceptedCount = 0;
      let stage = "provider";
      getLogger().info(
        `${LOG_PREFIX} Sending personalized pick reminder batch`,
        {
          context,
          count: claimed.length,
          recipientDomains,
        },
      );

      try {
        const { data, error } = await sendBatchEmail(
          claimed.map(({ recipient: { user, league, email } }) => ({
            from: FROM,
            to: email!,
            subject: `Reminder: Make Your Picks for ${league.name}!`,
            react: PickReminderEmail({
              username: user.username,
              leagueName: league.name,
              leagueHomeHref: `https://www.play-funtime.com/league/${league.league_id}`,
            }),
            tags: createTags("pick_reminder", league.league_id),
          })),
          context,
          createIdempotencyKey(
            "pick-reminder-batch",
            JSON.stringify(claimed.map(({ identity }) => identity)),
          ),
        );

        if (error) {
          const resendError = summarizeResendError(error);
          const retryable = resendError.statusCode === 429;
          getLogger().error(
            `${LOG_PREFIX} Pick reminder batch rejected by Resend`,
            {
              context,
              count: claimed.length,
              recipientDomains,
              retryable,
              resendError,
            },
          );
          stage = "record_rejection";
          await Promise.all(
            claimed.map(({ identity }) =>
              db.pickReminderDelivery.updateMany({
                where: identity,
                data: { state: retryable ? "retryable" : "uncertain" },
              }),
            ),
          );
          continue;
        }

        const sentEmails = data?.data ?? [];
        if (sentEmails.length !== claimed.length) {
          getLogger().error(
            `${LOG_PREFIX} Resend returned an unexpected number of pick reminder IDs`,
            {
              context,
              requested: claimed.length,
              returned: sentEmails.length,
            },
          );
        }

        // Associate each returned ID with the exact order sent to Resend.
        const accepted = claimed.flatMap((claim, index) => {
          const resendId = sentEmails[index]?.id;
          return resendId ? [{ ...claim, resendId }] : [];
        });
        acceptedCount = accepted.length;
        sent += acceptedCount;
        stage = "record_acceptance";
        await Promise.all(
          claimed.map(({ identity }, index) => {
            const resendId = sentEmails[index]?.id;
            return db.pickReminderDelivery.updateMany({
              where: identity,
              data: resendId
                ? { state: "sent", resend_id: resendId }
                : { state: "uncertain" },
            });
          }),
        );

        const logsToCreate = accepted.map(
          ({ recipient, resendId }) =>
            ({
              email_type: "week_reminder",
              resend_id: resendId,
              league_id: recipient.league.league_id,
              member_id: recipient.member.membership_id,
              week: recipient.week,
            }) as const,
        );

        if (logsToCreate.length > 0) {
          stage = "email_logs";
          await db.emailLogs.createMany({ data: logsToCreate });
          stage = "reconciliation";
          await Promise.all(
            logsToCreate.map(({ resend_id }) =>
              reconcileEmailDeliveryState(resend_id),
            ),
          );
        }

        getLogger().info(`${LOG_PREFIX} Sent pick reminder batch`, {
          context,
          requested: claimed.length,
          sent: acceptedCount,
        });
      } catch (error) {
        getLogger().error(`${LOG_PREFIX} Pick reminder batch requires review`, {
          context,
          count: claimed.length,
          recipientDomains,
          stage,
          accepted: acceptedCount,
          error: summarizeResendError(error),
        });
      }
    }
    return sent;
  },
  sendWeekSummaryEmail: async ({
    season,
    leagueId,
    leagueName,
    week,
    recipients,
    adminEmails = [],
    ...summary
  }: WeekSummary & {
    leagueId: number;
    leagueName: string;
    week: number;
    season: number;
    adminEmails?: string[];
  }) => {
    if (EMAILS_DISABLED || recipients.length === 0) {
      return { sent: 0 };
    }

    const uniqueAdminEmails = [
      ...new Set(
        adminEmails
          .map((email) => email.trim())
          .filter((email) => email.length > 0),
      ),
    ];

    let sent = 0;
    for (const recipient of recipients) {
      const identity = {
        league_id: leagueId,
        user_id: recipient.userId,
        season,
        week,
      };
      if (!(await claimWeeklyRecap(db, identity))) continue;
      try {
        const { data, error } = await sendEmail(
          {
            from: FROM,
            to: [recipient.email],
            ...(uniqueAdminEmails.length > 0
              ? { replyTo: uniqueAdminEmails }
              : {}),
            subject: `${leagueName} · Your Week ${week} results`,
            react: WeekSummaryEmail({
              leagueId,
              leagueName,
              week,
              ...summary,
              recipient,
              adminEmails: uniqueAdminEmails,
            }),
            tags: createTags("week_summary", leagueId),
          },
          `week_summary:${leagueId}:${recipient.memberId}:${week}`,
          createIdempotencyKey("week-summary", JSON.stringify(identity)),
        );

        if (error) {
          // Only an explicit rate-limit rejection is automatically retryable.
          // Unknown outcomes stay claimed, even after the provider deduplication window.
          await db.weeklyRecapDelivery.updateMany({
            where: identity,
            data: {
              state: error.statusCode === 429 ? "retryable" : "uncertain",
            },
          });
          getLogger().error(
            `${LOG_PREFIX} Error sending week summary email for league ${leagueId} member ${recipient.memberId}`,
            { error },
          );
          continue;
        }

        if (data?.id) {
          await db.weeklyRecapDelivery.updateMany({
            where: identity,
            data: { state: "sent", resend_id: data.id },
          });
          sent += 1;
          await db.emailLogs.create({
            data: {
              email_type: "week_summary",
              resend_id: data.id,
              league_id: leagueId,
              member_id: recipient.memberId,
              week,
            },
            select: { email_log_id: true },
          });
          await reconcileEmailDeliveryState(data.id);
        } else {
          await db.weeklyRecapDelivery.updateMany({
            where: identity,
            data: { state: "uncertain" },
          });
        }
      } catch (error) {
        // A crash/network timeout may happen after acceptance. Never expire this claim.
        getLogger().error(
          `${LOG_PREFIX} Weekly recap outcome requires review`,
          { identity, error },
        );
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
        await Promise.all(
          toCreate.map((log) => reconcileEmailDeliveryState(log.resend_id)),
        );
      }
    }
  },
};
