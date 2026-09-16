import { afterAll, expect, test } from "bun:test";
import type { TRPCContext } from "../../server/api/trpc";
import { TRPCError } from "@trpc/server";

const localUrl = "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
if (process.env.DATABASE_URL !== localUrl || process.env.E2E_MODE !== "1") {
  throw new Error(
    "Message reaction tests require the isolated local DB and E2E_MODE=1",
  );
}

const { db } = await import("../../server/db");
const { messagesRouter } = await import("../../server/api/routers/messages");

afterAll(async () => {
  await db.$disconnect();
});

async function createPerson(label: string) {
  const suffix = crypto.randomUUID();
  return db.people.create({
    data: {
      username: `msg-react-${label}-${suffix}`.slice(0, 30),
      fname: "Msg",
      lname: "React",
      email: `web.e2e.msg.react.${label}.${suffix}@example.com`,
      season: 2026,
    },
  });
}

async function cleanup(uids: number[], leagueIds: number[]) {
  await db.leaguemessages.deleteMany({
    where: { league_id: { in: leagueIds } },
  });
  await db.leaguemembers.deleteMany({
    where: { user_id: { in: uids } },
  });
  await db.leagues.deleteMany({
    where: { league_id: { in: leagueIds } },
  });
  await db.people.deleteMany({ where: { uid: { in: uids } } });
}

async function callerFor(uid: number) {
  const dbUser = await db.people.findUniqueOrThrow({
    where: { uid },
    include: {
      leaguemembers: {
        select: {
          league_id: true,
          membership_id: true,
          role: true,
          leagues: { select: { season: true, name: true } },
        },
      },
    },
  });
  const ctx: TRPCContext = {
    db,
    dbUser,
    supabaseUser: null,
    headers: new Headers(),
  };
  return messagesRouter.createCaller(ctx);
}

test("toggle adds and removes a reaction and includes summaries on the board", async () => {
  const owner = await createPerson("owner");
  const teammate = await createPerson("mate");
  const leagueIds: number[] = [];

  try {
    const league = await db.leagues.create({
      data: {
        name: `msg-react-${owner.uid}`,
        season: 2026,
        created_by_user_id: owner.uid,
      },
    });
    leagueIds.push(league.league_id);

    const ownerMembership = await db.leaguemembers.create({
      data: {
        league_id: league.league_id,
        user_id: owner.uid,
        role: "admin",
      },
    });
    await db.leaguemembers.create({
      data: {
        league_id: league.league_id,
        user_id: teammate.uid,
        role: "player",
      },
    });

    const message = await db.leaguemessages.create({
      data: {
        message_id: `react-${owner.uid}`,
        content: "what a pick",
        member_id: ownerMembership.membership_id,
        league_id: league.league_id,
        message_type: "LEAGUE_MESSAGE",
        status: "PUBLISHED",
      },
    });

    const ownerCaller = await callerFor(owner.uid);
    const teammateCaller = await callerFor(teammate.uid);

    const added = await teammateCaller.toggleReaction({
      messageId: message.message_id,
      emoji: "fire",
    });
    expect(added.added).toBe(true);
    expect(added.reactions).toEqual([
      {
        emoji: "fire",
        count: 1,
        reacted: true,
        usernames: [teammate.username],
      },
    ]);

    const stacked = await ownerCaller.toggleReaction({
      messageId: message.message_id,
      emoji: "fire",
    });
    expect(stacked.reactions[0]).toMatchObject({
      emoji: "fire",
      count: 2,
      reacted: true,
    });

    const board = await ownerCaller.leagueMessageBoard({
      leagueId: league.league_id,
    });
    expect(Array.isArray(board)).toBe(true);
    if (!Array.isArray(board)) {
      throw new Error("expected legacy array");
    }
    expect(board[0]?.reactions[0]).toMatchObject({
      emoji: "fire",
      count: 2,
      reacted: true,
    });

    const page = await teammateCaller.leagueMessageBoard({
      leagueId: league.league_id,
      limit: 10,
    });
    if (Array.isArray(page)) {
      throw new Error("expected page object");
    }
    expect(page.messages[0]?.reactions[0]?.reacted).toBe(true);

    const removed = await teammateCaller.toggleReaction({
      messageId: message.message_id,
      emoji: "fire",
    });
    expect(removed.added).toBe(false);
    expect(removed.reactions[0]).toMatchObject({
      emoji: "fire",
      count: 1,
      reacted: false,
    });
  } finally {
    await cleanup([owner.uid, teammate.uid], leagueIds);
  }
});

test("non-members cannot react and unknown emoji is rejected", async () => {
  const owner = await createPerson("auth-owner");
  const outsider = await createPerson("auth-out");
  const leagueIds: number[] = [];

  try {
    const league = await db.leagues.create({
      data: {
        name: `msg-react-auth-${owner.uid}`,
        season: 2026,
        created_by_user_id: owner.uid,
      },
    });
    leagueIds.push(league.league_id);
    const membership = await db.leaguemembers.create({
      data: {
        league_id: league.league_id,
        user_id: owner.uid,
        role: "admin",
      },
    });
    const message = await db.leaguemessages.create({
      data: {
        content: "locked",
        member_id: membership.membership_id,
        league_id: league.league_id,
        message_type: "LEAGUE_MESSAGE",
        status: "PUBLISHED",
      },
    });

    const outsiderCaller = await callerFor(outsider.uid);
    try {
      await outsiderCaller.toggleReaction({
        messageId: message.message_id,
        emoji: "goat",
      });
      throw new Error("expected UNAUTHORIZED");
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("UNAUTHORIZED");
    }

    const ownerCaller = await callerFor(owner.uid);
    try {
      await ownerCaller.toggleReaction({
        messageId: message.message_id,
        emoji: "poop" as "fire",
      });
      throw new Error("expected BAD_REQUEST");
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("BAD_REQUEST");
    }
  } finally {
    await cleanup([owner.uid, outsider.uid], leagueIds);
  }
});
