import {
  createOptimisticMessage,
  flattenMessagePages,
  mergeMessagesWithOptimistic,
  reconcileOptimisticWithServer,
  withoutOptimisticId,
  type LeagueMessage,
  type LeagueMessageBoardPage,
} from "@/lib/messages/optimisticMessages";

function message(partial: Partial<LeagueMessage> & { message_id: string }): LeagueMessage {
  return {
    content: partial.content ?? partial.message_id,
    member_id: partial.member_id ?? 1,
    league_id: partial.league_id ?? 10,
    week: null,
    message_type: "LEAGUE_MESSAGE",
    createdAt: partial.createdAt ?? new Date("2026-09-01T12:00:00.000Z"),
    status: "PUBLISHED",
    leaguemembers: {
      people: { username: "player" },
    },
    reactions: [],
    ...partial,
  } as LeagueMessage;
}

test("flattenMessagePages reverses newest-first infinite pages into chronology", () => {
  const pages: LeagueMessageBoardPage[] = [
    {
      messages: [message({ message_id: "m4" }), message({ message_id: "m5" })],
      nextCursor: { createdAt: new Date(), messageId: "m4" },
    },
    {
      messages: [message({ message_id: "m2" }), message({ message_id: "m3" })],
      nextCursor: { createdAt: new Date(), messageId: "m2" },
    },
  ];

  expect(flattenMessagePages(pages).map((row) => row.message_id)).toEqual([
    "m2",
    "m3",
    "m4",
    "m5",
  ]);
});

test("optimistic send appears then reconciles without duplicating on retry", () => {
  const server: LeagueMessage[] = [message({ message_id: "m1" })];
  const optimistic = createOptimisticMessage({
    optimisticId: "opt-1",
    content: "hello",
    leagueId: 10,
    memberId: 7,
    username: "you",
  });

  const withPending = mergeMessagesWithOptimistic(server, [optimistic]);
  expect(withPending.map((row) => row.message_id)).toEqual(["m1", "opt-1"]);

  const created = message({
    message_id: "server-1",
    content: "hello",
    member_id: 7,
  });

  // Cache not yet updated: keep a non-pending stand-in keyed by optimistic id.
  const reconciled = reconcileOptimisticWithServer({
    optimistic: [optimistic],
    optimisticId: "opt-1",
    serverMessage: created,
    serverMessages: server,
  });
  expect(reconciled).toHaveLength(1);
  expect(reconciled[0]?.message_id).toBe("server-1");
  expect(reconciled[0]?.pending).toBe(false);

  const afterCache = mergeMessagesWithOptimistic(
    [...server, created],
    reconciled,
  );
  expect(afterCache.map((row) => row.message_id)).toEqual(["m1", "server-1"]);

  // Retry after cache catch-up must not reintroduce the optimistic bubble.
  const afterRetry = mergeMessagesWithOptimistic(
    [...server, created],
    reconcileOptimisticWithServer({
      optimistic: reconciled,
      optimisticId: "opt-1",
      serverMessage: created,
      serverMessages: [...server, created],
    }),
  );
  expect(afterRetry.map((row) => row.message_id)).toEqual(["m1", "server-1"]);
});

test("failed send rolls back the optimistic message", () => {
  const server: LeagueMessage[] = [message({ message_id: "m1" })];
  const optimistic = createOptimisticMessage({
    optimisticId: "opt-fail",
    content: "nope",
    leagueId: 10,
    memberId: 7,
    username: "you",
  });

  const pending = mergeMessagesWithOptimistic(server, [optimistic]);
  expect(pending).toHaveLength(2);

  const rolledBack = mergeMessagesWithOptimistic(
    server,
    withoutOptimisticId([optimistic], "opt-fail"),
  );
  expect(rolledBack.map((row) => row.message_id)).toEqual(["m1"]);
});
