import type { RouterOutputs } from "~/trpc/types";

export type LeagueMessageBoardPage = Exclude<
  RouterOutputs["messages"]["leagueMessageBoard"],
  readonly unknown[]
>;

export type LeagueMessage = LeagueMessageBoardPage["messages"][number];

export type OptimisticLeagueMessage = LeagueMessage & {
  optimisticId: string;
  pending?: boolean;
};

export function flattenMessagePages(
  pages: Array<LeagueMessageBoardPage | LeagueMessage[]> | undefined,
): LeagueMessage[] {
  if (!pages?.length) {
    return [];
  }

  // Infinite pages are newest-first; reverse so FlatList stays chronological.
  return pages
    .slice()
    .reverse()
    .flatMap((page) => (Array.isArray(page) ? page : page.messages));
}

export function mergeMessagesWithOptimistic(
  serverMessages: LeagueMessage[],
  optimistic: OptimisticLeagueMessage[],
): Array<LeagueMessage | OptimisticLeagueMessage> {
  if (optimistic.length === 0) {
    return serverMessages;
  }

  const serverIds = new Set(serverMessages.map((message) => message.message_id));
  const pending = optimistic.filter(
    (message) => !serverIds.has(message.message_id),
  );
  return [...serverMessages, ...pending];
}

export function createOptimisticMessage(args: {
  optimisticId: string;
  content: string;
  leagueId: number;
  memberId: number;
  username: string;
  now?: Date;
}): OptimisticLeagueMessage {
  const createdAt = args.now ?? new Date();
  return {
    optimisticId: args.optimisticId,
    pending: true,
    message_id: args.optimisticId,
    content: args.content,
    member_id: args.memberId,
    league_id: args.leagueId,
    week: null,
    message_type: "LEAGUE_MESSAGE",
    createdAt,
    status: "PUBLISHED",
    leaguemembers: {
      people: {
        username: args.username,
      },
    },
  } as OptimisticLeagueMessage;
}

/** Drop an optimistic row after success/failure; keep server rows intact. */
export function withoutOptimisticId(
  optimistic: OptimisticLeagueMessage[],
  optimisticId: string,
): OptimisticLeagueMessage[] {
  return optimistic.filter((message) => message.optimisticId !== optimisticId);
}

/**
 * After a successful send, replace the temp row with the server row if the
 * infinite cache has not caught up yet. Prevents duplicate bubbles on retry.
 */
export function reconcileOptimisticWithServer(args: {
  optimistic: OptimisticLeagueMessage[];
  optimisticId: string;
  serverMessage: LeagueMessage;
  serverMessages: LeagueMessage[];
}): OptimisticLeagueMessage[] {
  const { optimistic, optimisticId, serverMessage, serverMessages } = args;
  if (serverMessages.some((message) => message.message_id === serverMessage.message_id)) {
    return withoutOptimisticId(optimistic, optimisticId);
  }

  return optimistic.map((message) =>
    message.optimisticId === optimisticId
      ? {
          ...serverMessage,
          optimisticId,
          pending: false,
        }
      : message,
  );
}
