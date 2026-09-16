import { afterAll, expect, test } from "bun:test";
import { TRPCError } from "@trpc/server";
import type { TRPCContext } from "../../server/api/trpc";

const localUrl = "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
if (process.env.DATABASE_URL !== localUrl || process.env.E2E_MODE !== "1") {
  throw new Error(
    "Super Bowl admin tests require the isolated local DB and E2E_MODE=1",
  );
}

const { db } = await import("../../server/db");
const { leagueAdminRouter } =
  await import("../../server/api/routers/league/admin");

afterAll(async () => {
  await db.$disconnect();
});

async function createPerson(label: string) {
  const suffix = crypto.randomUUID();
  return db.people.create({
    data: {
      username: `sb-admin-${label}-${suffix}`.slice(0, 30),
      fname: "Sb",
      lname: "Admin",
      email: `web.e2e.sb.admin.${label}.${suffix}@example.com`,
      season: 2026,
    },
  });
}

async function cleanup(uids: number[], leagueIds: number[]) {
  await db.superbowl.deleteMany({
    where: { uid: { in: uids } },
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
  return leagueAdminRouter.createCaller(ctx);
}

test("league admin can create and update another member's Super Bowl pick", async () => {
  const admin = await createPerson("admin");
  const player = await createPerson("player");
  const leagueIds: number[] = [];

  try {
    const league = await db.leagues.create({
      data: {
        name: `sb-admin-${admin.uid}`,
        season: 2026,
        superbowl_competition: true,
        created_by_user_id: admin.uid,
        leaguemembers: {
          create: [
            { user_id: admin.uid, role: "admin" },
            { user_id: player.uid, role: "player" },
          ],
        },
      },
      include: { leaguemembers: true },
    });
    leagueIds.push(league.league_id);
    const playerMember = league.leaguemembers.find(
      (member) => member.user_id === player.uid,
    )!;
    const adminCaller = await callerFor(admin.uid);

    await adminCaller.setSuperbowlPick({
      leagueId: league.league_id,
      memberId: playerMember.membership_id,
      winnerTeamId: 2,
      loserTeamId: 5,
      score: 53,
    });

    expect(
      await db.superbowl.findFirst({
        where: { member_id: playerMember.membership_id },
      }),
    ).toMatchObject({
      uid: player.uid,
      winner: 2,
      loser: 5,
      score: 53,
      season: 2026,
    });

    await adminCaller.setSuperbowlPick({
      leagueId: league.league_id,
      memberId: playerMember.membership_id,
      winnerTeamId: 1,
      loserTeamId: 6,
      score: 44,
    });

    const board = await adminCaller.superbowlPicks({
      leagueId: league.league_id,
    });
    expect(
      board.members.find((member) => member.membership_id === playerMember.membership_id)
        ?.pick,
    ).toMatchObject({
      winner: 1,
      loser: 6,
      score: 44,
    });
  } finally {
    await cleanup([admin.uid, player.uid], leagueIds);
  }
});

test("players cannot edit Super Bowl picks through the admin endpoint", async () => {
  const admin = await createPerson("gate-admin");
  const player = await createPerson("gate-player");
  const leagueIds: number[] = [];

  try {
    const league = await db.leagues.create({
      data: {
        name: `sb-admin-gate-${admin.uid}`,
        season: 2026,
        superbowl_competition: true,
        created_by_user_id: admin.uid,
        leaguemembers: {
          create: [
            { user_id: admin.uid, role: "admin" },
            { user_id: player.uid, role: "player" },
          ],
        },
      },
      include: { leaguemembers: true },
    });
    leagueIds.push(league.league_id);
    const playerMember = league.leaguemembers.find(
      (member) => member.user_id === player.uid,
    )!;
    const playerCaller = await callerFor(player.uid);

    try {
      await playerCaller.setSuperbowlPick({
        leagueId: league.league_id,
        memberId: playerMember.membership_id,
        winnerTeamId: 2,
        loserTeamId: 5,
        score: 53,
      });
      throw new Error("expected player to be rejected");
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("UNAUTHORIZED");
    }
  } finally {
    await cleanup([admin.uid, player.uid], leagueIds);
  }
});

test("admin Super Bowl edits require an AFC team and an NFC team", async () => {
  const admin = await createPerson("conf-admin");
  const player = await createPerson("conf-player");
  const leagueIds: number[] = [];

  try {
    const league = await db.leagues.create({
      data: {
        name: `sb-admin-conf-${admin.uid}`,
        season: 2026,
        superbowl_competition: true,
        created_by_user_id: admin.uid,
        leaguemembers: {
          create: [
            { user_id: admin.uid, role: "admin" },
            { user_id: player.uid, role: "player" },
          ],
        },
      },
      include: { leaguemembers: true },
    });
    leagueIds.push(league.league_id);
    const playerMember = league.leaguemembers.find(
      (member) => member.user_id === player.uid,
    )!;
    const adminCaller = await callerFor(admin.uid);

    try {
      await adminCaller.setSuperbowlPick({
        leagueId: league.league_id,
        memberId: playerMember.membership_id,
        winnerTeamId: 1,
        loserTeamId: 2,
        score: 50,
      });
      throw new Error("expected same-conference pick to be rejected");
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).message).toContain("different conferences");
    }
  } finally {
    await cleanup([admin.uid, player.uid], leagueIds);
  }
});
