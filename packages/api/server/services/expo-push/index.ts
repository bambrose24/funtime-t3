import { type PrismaClient } from "../../../src/generated/prisma-client";
import { isE2EMode } from "../../../utils/e2e";

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";
const EXPO_PUSH_BATCH_SIZE = 100;

const chunkArray = <T>(values: T[], size: number) => {
  const chunks: T[][] = [];
  let index = 0;
  while (index < values.length) {
    chunks.push(values.slice(index, index + size));
    index += size;
  }
  return chunks;
};

const truncate = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}…`;
};

const isMissingPushTokensTableError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2021"
  );
};

type SendLeagueMessagePushInput = {
  db: PrismaClient;
  leagueId: number;
  authorUserId: number;
  authorUsername: string;
  messageContent: string;
};

type WeekSummaryRecipient = {
  userId: number;
  rank: number;
  correctPicks: number;
};

type SendWeekSummaryPushInput = {
  db: PrismaClient;
  leagueId: number;
  week: number;
  recipients: WeekSummaryRecipient[];
};

type ExpoPushMessage = {
  to: string;
  sound: "default";
  title: string;
  body: string;
  data: {
    path: string;
    leagueId: number;
    type: "league_message" | "week_summary";
    week?: number;
  };
};

const sendExpoMessages = async ({
  leagueId,
  messages,
  type,
}: {
  leagueId: number;
  messages: ExpoPushMessage[];
  type: "league_message" | "week_summary";
}) => {
  if (isE2EMode) {
    return { sent: 0, skipped: true as const };
  }

  if (messages.length === 0) {
    return { sent: 0, skipped: true as const };
  }

  let sent = 0;
  const batches = chunkArray(messages, EXPO_PUSH_BATCH_SIZE);
  for (const batch of batches) {
    const response = await fetch(EXPO_PUSH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("Failed sending Expo push batch", {
        leagueId,
        type,
        status: response.status,
        body,
      });
      continue;
    }

    sent += batch.length;
  }

  return { sent, skipped: false as const };
};

export const expoPushApi = {
  sendLeagueMessageNotification: async ({
    db,
    leagueId,
    authorUserId,
    authorUsername,
    messageContent,
  }: SendLeagueMessagePushInput) => {
    try {
      const [league, members] = await Promise.all([
        db.leagues.findFirst({
          where: { league_id: leagueId },
          select: { name: true },
        }),
        db.leaguemembers.findMany({
          where: { league_id: leagueId },
          select: { user_id: true },
        }),
      ]);

      const recipientUserIds = members
        .map((member) => member.user_id)
        .filter((userId) => userId !== authorUserId);

      if (recipientUserIds.length === 0) {
        return { sent: 0, skipped: true as const };
      }

      const tokens = await db.pushNotificationTokens.findMany({
        where: {
          user_id: {
            in: recipientUserIds,
          },
          enabled: true,
        },
        select: {
          token: true,
        },
      });

      if (tokens.length === 0) {
        return { sent: 0, skipped: true as const };
      }

      const bodyPreview = truncate(messageContent.trim(), 140);
      const messages: ExpoPushMessage[] = tokens.map((tokenRow) => ({
        to: tokenRow.token,
        sound: "default",
        title: `New message in ${league?.name ?? "your league"}`,
        body: `${authorUsername}: ${bodyPreview}`,
        data: {
          path: `/league/${leagueId}?tab=messages`,
          leagueId,
          type: "league_message",
        },
      }));
      return await sendExpoMessages({
        leagueId,
        messages,
        type: "league_message",
      });
    } catch (error) {
      if (isMissingPushTokensTableError(error)) {
        console.warn(
          "Push send skipped: pushNotificationTokens table missing. Run db push before enabling push sends.",
        );
        return { sent: 0, skipped: true as const };
      }
      console.error("Unexpected error sending league message push notifications", {
        leagueId,
        error,
      });
      return { sent: 0, skipped: true as const };
    }
  },
  sendWeekSummaryNotifications: async ({
    db,
    leagueId,
    week,
    recipients,
  }: SendWeekSummaryPushInput) => {
    try {
      if (recipients.length === 0) {
        return { sent: 0, skipped: true as const };
      }

      const [league, tokens] = await Promise.all([
        db.leagues.findFirst({
          where: { league_id: leagueId },
          select: { name: true },
        }),
        db.pushNotificationTokens.findMany({
          where: {
            user_id: {
              in: recipients.map((recipient) => recipient.userId),
            },
            enabled: true,
          },
          select: {
            token: true,
            user_id: true,
          },
        }),
      ]);

      if (tokens.length === 0) {
        return { sent: 0, skipped: true as const };
      }

      const recipientByUserId = new Map(
        recipients.map((recipient) => [recipient.userId, recipient]),
      );
      const rawMessages: Array<ExpoPushMessage | null> = tokens
        .map((tokenRow) => {
          const recipient = recipientByUserId.get(tokenRow.user_id);
          if (!recipient) {
            return null;
          }
          return {
            to: tokenRow.token,
            sound: "default",
            title: `Week ${week} is final in ${league?.name ?? "your league"}`,
            body: `You finished #${recipient.rank} with ${recipient.correctPicks} correct picks.`,
            data: {
              path: `/league/${leagueId}?week=${week}`,
              leagueId,
              week,
              type: "week_summary",
            },
          };
        });
      const messages = rawMessages.filter(
        (message): message is ExpoPushMessage => message !== null,
      );

      return await sendExpoMessages({
        leagueId,
        messages,
        type: "week_summary",
      });
    } catch (error) {
      if (isMissingPushTokensTableError(error)) {
        console.warn(
          "Week summary push skipped: pushNotificationTokens table missing. Run db push before enabling push sends.",
        );
        return { sent: 0, skipped: true as const };
      }
      console.error("Unexpected error sending week summary push notifications", {
        leagueId,
        week,
        error,
      });
      return { sent: 0, skipped: true as const };
    }
  },
};
