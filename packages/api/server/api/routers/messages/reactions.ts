import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  MessageReactionEmoji,
  Prisma,
  PrismaClient,
} from "../../../../src/generated/prisma-client/client";
import {
  MESSAGE_REACTION_EMOJI_KEYS,
  summarizeMessageReactions,
  type MessageReactionSummary,
} from "../../../../utils/messageReactions";

const messageReactionEmojiSchema = z.enum(MESSAGE_REACTION_EMOJI_KEYS);

export const toggleReactionInput = z.object({
  messageId: z.string().min(1),
  emoji: messageReactionEmojiSchema,
});

type Db = PrismaClient;

export async function attachReactionsToMessages<
  T extends { message_id: string },
>(
  db: Db,
  messages: T[],
  viewerMembershipId: number,
): Promise<Array<T & { reactions: MessageReactionSummary[] }>> {
  if (messages.length === 0) {
    return [];
  }

  const rows = await db.league_message_reactions.findMany({
    where: {
      message_id: { in: messages.map((message) => message.message_id) },
    },
    select: {
      message_id: true,
      emoji: true,
      membership_id: true,
      leaguemembers: {
        select: {
          people: {
            select: { username: true },
          },
        },
      },
    },
  });

  const summaries = summarizeMessageReactions(
    rows.map((row) => ({
      message_id: row.message_id,
      emoji: row.emoji,
      membership_id: row.membership_id,
      username: row.leaguemembers.people.username,
    })),
    viewerMembershipId,
  );

  return messages.map((message) => ({
    ...message,
    reactions: summaries.get(message.message_id) ?? [],
  }));
}

export async function loadMessageReactionSummaries(
  db: Db,
  messageId: string,
  viewerMembershipId: number,
): Promise<MessageReactionSummary[]> {
  const [attached] = await attachReactionsToMessages(
    db,
    [{ message_id: messageId }],
    viewerMembershipId,
  );
  return attached?.reactions ?? [];
}

export async function toggleMessageReaction(
  db: Db,
  args: {
    messageId: string;
    emoji: (typeof MESSAGE_REACTION_EMOJI_KEYS)[number];
    membershipId: number;
    leagueId: number;
  },
): Promise<{ added: boolean; reactions: MessageReactionSummary[] }> {
  const message = await db.leaguemessages.findFirst({
    where: {
      message_id: args.messageId,
      league_id: args.leagueId,
      status: "PUBLISHED",
    },
    select: { message_id: true },
  });
  if (!message) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Message not found in that league",
    });
  }

  const added = await db.$transaction(async (tx) => {
    const existing = await tx.league_message_reactions.findUnique({
      where: {
        message_id_membership_id_emoji: {
          message_id: args.messageId,
          membership_id: args.membershipId,
          emoji: args.emoji as MessageReactionEmoji,
        },
      },
      select: { reaction_id: true },
    });

    if (existing) {
      await tx.league_message_reactions.delete({
        where: { reaction_id: existing.reaction_id },
      });
      return false;
    }

    try {
      await tx.league_message_reactions.create({
        data: {
          message_id: args.messageId,
          membership_id: args.membershipId,
          emoji: args.emoji as MessageReactionEmoji,
        },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return true;
      }
      throw error;
    }
  });

  return {
    added,
    reactions: await loadMessageReactionSummaries(
      db,
      args.messageId,
      args.membershipId,
    ),
  };
}
