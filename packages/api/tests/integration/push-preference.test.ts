import { afterAll, expect, test } from "bun:test";
import type { TRPCContext } from "../../server/api/trpc";

const localUrl = "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
if (process.env.DATABASE_URL !== localUrl || process.env.E2E_MODE !== "1") {
  throw new Error(
    "Push preference tests require the isolated local DB and E2E_MODE=1",
  );
}

const { db } = await import("../../server/db");
const { settingsRouter } = await import("../../server/api/routers/settings");
const { expoPushApi } = await import("../../server/services/expo-push");

afterAll(async () => {
  await db.$disconnect();
});

async function createPerson(label: string) {
  const suffix = crypto.randomUUID();
  return db.people.create({
    data: {
      username: `push-pref-${label}-${suffix}`.slice(0, 30),
      fname: "Push",
      lname: "Pref",
      email: `web.e2e.push.pref.${label}.${suffix}@example.com`,
      season: 2026,
    },
  });
}

async function cleanup(uids: number[]) {
  await db.pushNotificationTokens.deleteMany({
    where: { user_id: { in: uids } },
  });
  await db.leaguemembers.deleteMany({
    where: { user_id: { in: uids } },
  });
  await db.leagues.deleteMany({
    where: { created_by_user_id: { in: uids } },
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

test("disable preference survives same-token and new-token re-register", async () => {
  const owner = await createPerson("owner");
  const sameToken = `ExponentPushToken[same-${owner.uid}]`;
  const newToken = `ExponentPushToken[new-${owner.uid}]`;

  try {
    const caller = await callerFor(owner.uid);

    await caller.registerPushToken({ token: sameToken, platform: "ios" });
    await caller.setPushNotificationsEnabled({ enabled: false });

    const afterDisable = await caller.pushNotificationStatus();
    expect(afterDisable).toMatchObject({
      enabled: false,
      preference: false,
      reason: "in_app_disabled",
      unavailable: false,
    });
    expect(afterDisable.tokenCount).toBe(1);

    await caller.registerPushToken({ token: sameToken, platform: "ios" });
    await caller.registerPushToken({ token: newToken, platform: "android" });

    const afterReregister = await caller.pushNotificationStatus();
    expect(afterReregister.preference).toBe(false);
    expect(afterReregister.enabled).toBe(false);
    expect(afterReregister.reason).toBe("in_app_disabled");
    expect(afterReregister.tokenCount).toBe(2);

    const person = await db.people.findUniqueOrThrow({
      where: { uid: owner.uid },
      select: { push_notifications_enabled: true },
    });
    expect(person.push_notifications_enabled).toBe(false);

    const tokens = await db.pushNotificationTokens.findMany({
      where: { user_id: owner.uid },
      select: { token: true, enabled: true },
    });
    expect(tokens).toHaveLength(2);
    expect(tokens.every((token) => token.enabled)).toBe(true);
  } finally {
    await cleanup([owner.uid]);
  }
});

test("fanout selects nobody while account preference is disabled", async () => {
  const author = await createPerson("author");
  const recipient = await createPerson("recipient");
  const token = `ExponentPushToken[fanout-${recipient.uid}]`;

  try {
    const league = await db.leagues.create({
      data: {
        name: `push-pref-league-${recipient.uid}`,
        season: 2026,
        created_by_user_id: author.uid,
        late_policy: "allow_late_and_lock_after_start",
        pick_policy: "choose_winner",
        reminder_policy: "three_hours_before",
        scoring_type: "game_winner",
        share_code: `pp${recipient.uid}`.slice(0, 8),
      },
    });
    await db.leaguemembers.createMany({
      data: [
        {
          league_id: league.league_id,
          user_id: author.uid,
          role: "admin",
        },
        {
          league_id: league.league_id,
          user_id: recipient.uid,
          role: "player",
        },
      ],
    });

    await db.pushNotificationTokens.create({
      data: {
        token,
        user_id: recipient.uid,
        platform: "ios",
        enabled: true,
      },
    });
    await db.people.update({
      where: { uid: recipient.uid },
      data: { push_notifications_enabled: false },
    });

    const eligibleWhileDisabled = await db.pushNotificationTokens.findMany({
      where: {
        user_id: recipient.uid,
        enabled: true,
        people: { push_notifications_enabled: true },
      },
    });
    expect(eligibleWhileDisabled).toHaveLength(0);

    const disabledSend = await expoPushApi.sendLeagueMessageNotification({
      db,
      leagueId: league.league_id,
      authorUserId: author.uid,
      authorUsername: author.username,
      messageContent: "hello while disabled",
    });
    expect(disabledSend).toEqual({ sent: 0, skipped: true });

    await db.people.update({
      where: { uid: recipient.uid },
      data: { push_notifications_enabled: true },
    });
    const eligibleWhileEnabled = await db.pushNotificationTokens.findMany({
      where: {
        user_id: recipient.uid,
        enabled: true,
        people: { push_notifications_enabled: true },
      },
    });
    expect(eligibleWhileEnabled).toHaveLength(1);
  } finally {
    await cleanup([author.uid, recipient.uid]);
  }
});

test("zero-token status reports durable preference without requiring a device", async () => {
  const owner = await createPerson("zero");
  try {
    const caller = await callerFor(owner.uid);

    const before = await caller.pushNotificationStatus();
    expect(before).toMatchObject({
      enabled: true,
      preference: true,
      tokenCount: 0,
      reason: "ok",
      unavailable: false,
    });

    await caller.setPushNotificationsEnabled({ enabled: false });
    const after = await caller.pushNotificationStatus();
    expect(after).toMatchObject({
      enabled: false,
      preference: false,
      tokenCount: 0,
      reason: "in_app_disabled",
      unavailable: false,
    });
  } finally {
    await cleanup([owner.uid]);
  }
});
