import { afterAll, expect, test } from "bun:test";
import type { TRPCContext } from "../../server/api/trpc";

const localUrl = "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
if (process.env.DATABASE_URL !== localUrl || process.env.E2E_MODE !== "1") {
  throw new Error(
    "Push token lifecycle tests require the isolated local DB and E2E_MODE=1",
  );
}

const { db } = await import("../../server/db");
const { settingsRouter } = await import("../../server/api/routers/settings");

afterAll(async () => {
  await db.$disconnect();
});

async function personWithTokens() {
  const suffix = crypto.randomUUID();
  const owner = await db.people.create({
    data: {
      username: `push-owner-${suffix}`,
      fname: "Push",
      lname: "Owner",
      email: `web.e2e.push.owner.${suffix}@example.com`,
      season: 2026,
    },
  });
  const other = await db.people.create({
    data: {
      username: `push-other-${suffix}`,
      fname: "Push",
      lname: "Other",
      email: `web.e2e.push.other.${suffix}@example.com`,
      season: 2026,
    },
  });

  const deviceToken = `ExponentPushToken[device-${suffix}]`;
  const otherDeviceToken = `ExponentPushToken[other-device-${suffix}]`;
  const foreignToken = `ExponentPushToken[foreign-${suffix}]`;

  await db.pushNotificationTokens.createMany({
    data: [
      {
        token: deviceToken,
        user_id: owner.uid,
        platform: "ios",
        enabled: true,
      },
      {
        token: otherDeviceToken,
        user_id: owner.uid,
        platform: "android",
        enabled: true,
      },
      {
        token: foreignToken,
        user_id: other.uid,
        platform: "ios",
        enabled: true,
      },
    ],
  });

  return { owner, other, deviceToken, otherDeviceToken, foreignToken };
}

async function cleanup(uids: number[]) {
  await db.pushNotificationTokens.deleteMany({
    where: { user_id: { in: uids } },
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
  return settingsRouter.createCaller(ctx);
}

test("unregister disables only this device token for the caller", async () => {
  const { owner, other, deviceToken, otherDeviceToken, foreignToken } =
    await personWithTokens();
  try {
    const caller = await callerFor(owner.uid);
    const result = await caller.unregisterPushToken({ token: deviceToken });

    expect(result).toEqual({
      success: true,
      updatedCount: 1,
      unavailable: false,
    });

    const tokens = await db.pushNotificationTokens.findMany({
      where: {
        token: { in: [deviceToken, otherDeviceToken, foreignToken] },
      },
      select: { token: true, enabled: true },
    });
    const byToken = Object.fromEntries(tokens.map((row) => [row.token, row]));

    expect(byToken[deviceToken]?.enabled).toBe(false);
    expect(byToken[otherDeviceToken]?.enabled).toBe(true);
    expect(byToken[foreignToken]?.enabled).toBe(true);
  } finally {
    await cleanup([owner.uid, other.uid]);
  }
});

test("unregister of another user's token updates nothing", async () => {
  const { owner, other, foreignToken } = await personWithTokens();
  try {
    const caller = await callerFor(owner.uid);
    const result = await caller.unregisterPushToken({ token: foreignToken });

    expect(result.updatedCount).toBe(0);
    expect(result.success).toBe(true);

    const foreign = await db.pushNotificationTokens.findUniqueOrThrow({
      where: { token: foreignToken },
    });
    expect(foreign.enabled).toBe(true);
  } finally {
    await cleanup([owner.uid, other.uid]);
  }
});
