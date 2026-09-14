import { afterAll, expect, test } from "bun:test";
import type { TRPCContext } from "../../server/api/trpc";
import { TRPCError } from "@trpc/server";

const localUrl = "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
if (process.env.DATABASE_URL !== localUrl || process.env.E2E_MODE !== "1") {
  throw new Error(
    "Message pagination tests require the isolated local DB and E2E_MODE=1",
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
      username: `msg-page-${label}-${suffix}`.slice(0, 30),
      fname: "Msg",
      lname: "Page",
      email: `web.e2e.msg.page.${label}.${suffix}@example.com`,
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

test("legacy callers still receive a full ascending array", async () => {
  const owner = await createPerson("legacy");
  const leagueIds: number[] = [];

  try {
    const league = await db.leagues.create({
      data: {
        name: `msg-page-legacy-${owner.uid}`,
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

    const stamp = new Date("2026-09-01T12:00:00.000Z");
    await db.leaguemessages.createMany({
      data: [
        {
          message_id: "legacy-a",
          content: "a",
          member_id: membership.membership_id,
          league_id: league.league_id,
          message_type: "LEAGUE_MESSAGE",
          status: "PUBLISHED",
          createdAt: stamp,
        },
        {
          message_id: "legacy-b",
          content: "b",
          member_id: membership.membership_id,
          league_id: league.league_id,
          message_type: "LEAGUE_MESSAGE",
          status: "PUBLISHED",
          createdAt: stamp,
        },
        {
          message_id: "legacy-c",
          content: "c",
          member_id: membership.membership_id,
          league_id: league.league_id,
          message_type: "LEAGUE_MESSAGE",
          status: "PUBLISHED",
          createdAt: new Date("2026-09-01T12:00:01.000Z"),
        },
      ],
    });

    const caller = await callerFor(owner.uid);
    const legacy = await caller.leagueMessageBoard({
      leagueId: league.league_id,
    });

    expect(Array.isArray(legacy)).toBe(true);
    if (!Array.isArray(legacy)) {
      throw new Error("expected legacy array");
    }
    expect(legacy.map((row) => row.message_id)).toEqual([
      "legacy-a",
      "legacy-b",
      "legacy-c",
    ]);
  } finally {
    await cleanup([owner.uid], leagueIds);
  }
});

test("pages by createdAt/message_id with stable identical-timestamp order", async () => {
  const owner = await createPerson("pages");
  const leagueIds: number[] = [];

  try {
    const league = await db.leagues.create({
      data: {
        name: `msg-page-pages-${owner.uid}`,
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

    const stamp = new Date("2026-09-02T15:00:00.000Z");
    await db.leaguemessages.createMany({
      data: ["m1", "m2", "m3", "m4", "m5"].map((message_id, index) => ({
        message_id,
        content: message_id,
        member_id: membership.membership_id,
        league_id: league.league_id,
        message_type: "LEAGUE_MESSAGE" as const,
        status: "PUBLISHED" as const,
        // First three share a timestamp; message_id is the tiebreak.
        createdAt:
          index < 3 ? stamp : new Date(stamp.getTime() + (index - 2) * 1000),
      })),
    });

    const caller = await callerFor(owner.uid);
    const first = await caller.leagueMessageBoard({
      leagueId: league.league_id,
      limit: 2,
    });
    expect(Array.isArray(first)).toBe(false);
    if (Array.isArray(first)) {
      throw new Error("expected page object");
    }
    expect(first.messages.map((row) => row.message_id)).toEqual(["m4", "m5"]);
    expect(first.nextCursor).toEqual({
      createdAt: first.messages[0]!.createdAt,
      messageId: "m4",
    });

    const second = await caller.leagueMessageBoard({
      leagueId: league.league_id,
      limit: 2,
      cursor: first.nextCursor!,
    });
    if (Array.isArray(second)) {
      throw new Error("expected page object");
    }
    expect(second.messages.map((row) => row.message_id)).toEqual(["m2", "m3"]);
    expect(second.nextCursor?.messageId).toBe("m2");

    const third = await caller.leagueMessageBoard({
      leagueId: league.league_id,
      limit: 2,
      cursor: second.nextCursor!,
    });
    if (Array.isArray(third)) {
      throw new Error("expected page object");
    }
    expect(third.messages.map((row) => row.message_id)).toEqual(["m1"]);
    expect(third.nextCursor).toBeNull();
  } finally {
    await cleanup([owner.uid], leagueIds);
  }
});

test("cursor page stays stable when newer messages arrive", async () => {
  const owner = await createPerson("stable");
  const leagueIds: number[] = [];

  try {
    const league = await db.leagues.create({
      data: {
        name: `msg-page-stable-${owner.uid}`,
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

    const base = new Date("2026-09-03T10:00:00.000Z");
    await db.leaguemessages.createMany({
      data: ["s1", "s2", "s3"].map((message_id, index) => ({
        message_id,
        content: message_id,
        member_id: membership.membership_id,
        league_id: league.league_id,
        message_type: "LEAGUE_MESSAGE" as const,
        status: "PUBLISHED" as const,
        createdAt: new Date(base.getTime() + index * 1000),
      })),
    });

    const caller = await callerFor(owner.uid);
    const first = await caller.leagueMessageBoard({
      leagueId: league.league_id,
      limit: 2,
    });
    if (Array.isArray(first)) {
      throw new Error("expected page object");
    }
    expect(first.messages.map((row) => row.message_id)).toEqual(["s2", "s3"]);

    await db.leaguemessages.create({
      data: {
        message_id: "s4-new",
        content: "newer",
        member_id: membership.membership_id,
        league_id: league.league_id,
        message_type: "LEAGUE_MESSAGE",
        status: "PUBLISHED",
        createdAt: new Date(base.getTime() + 10_000),
      },
    });

    const older = await caller.leagueMessageBoard({
      leagueId: league.league_id,
      limit: 2,
      cursor: first.nextCursor!,
    });
    if (Array.isArray(older)) {
      throw new Error("expected page object");
    }
    // Older page must not include the newly arrived tip message.
    expect(older.messages.map((row) => row.message_id)).toEqual(["s1"]);
    expect(older.messages.some((row) => row.message_id === "s4-new")).toBe(
      false,
    );

    const tip = await caller.leagueMessageBoard({
      leagueId: league.league_id,
      limit: 2,
    });
    if (Array.isArray(tip)) {
      throw new Error("expected page object");
    }
    expect(tip.messages.map((row) => row.message_id)).toEqual([
      "s3",
      "s4-new",
    ]);
  } finally {
    await cleanup([owner.uid], leagueIds);
  }
});

test("cursor without limit is rejected", async () => {
  const owner = await createPerson("bad");
  const leagueIds: number[] = [];

  try {
    const league = await db.leagues.create({
      data: {
        name: `msg-page-bad-${owner.uid}`,
        season: 2026,
        created_by_user_id: owner.uid,
      },
    });
    leagueIds.push(league.league_id);
    await db.leaguemembers.create({
      data: {
        league_id: league.league_id,
        user_id: owner.uid,
        role: "admin",
      },
    });

    const caller = await callerFor(owner.uid);
    try {
      await caller.leagueMessageBoard({
        leagueId: league.league_id,
        cursor: {
          createdAt: new Date(),
          messageId: "x",
        },
      });
      throw new Error("expected BAD_REQUEST");
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("BAD_REQUEST");
    }
  } finally {
    await cleanup([owner.uid], leagueIds);
  }
});
