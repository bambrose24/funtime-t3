import { afterAll, expect, test } from "bun:test";
import type { TRPCContext } from "../../server/api/trpc";

const localUrl = "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
if (process.env.DATABASE_URL !== localUrl || process.env.E2E_MODE !== "1") {
  throw new Error(
    "Week summary email preference tests require the isolated local DB and E2E_MODE=1",
  );
}

const { db } = await import("../../server/db");
const { settingsRouter } = await import("../../server/api/routers/settings");

afterAll(async () => {
  await db.$disconnect();
});

async function createPerson(label: string) {
  const suffix = crypto.randomUUID();
  return db.people.create({
    data: {
      username: `week-sum-${label}-${suffix}`.slice(0, 30),
      fname: "Week",
      lname: "Summary",
      email: `web.e2e.week.summary.${label}.${suffix}@example.com`,
      season: 2026,
    },
  });
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

test("week summary emails default on and can be toggled for the signed-in user", async () => {
  const person = await createPerson("owner");

  try {
    const caller = await callerFor(person.uid);
    const initial = await caller.get();
    expect(initial.dbUser.week_summary_emails_enabled).toBe(true);

    await expect(
      caller.setWeekSummaryEmailsEnabled({ enabled: false }),
    ).resolves.toEqual({ success: true, enabled: false });

    const afterDisable = await db.people.findUniqueOrThrow({
      where: { uid: person.uid },
      select: { week_summary_emails_enabled: true },
    });
    expect(afterDisable.week_summary_emails_enabled).toBe(false);
    expect(
      (await caller.get()).dbUser.week_summary_emails_enabled,
    ).toBe(false);

    await caller.setWeekSummaryEmailsEnabled({ enabled: true });
    expect(
      (await caller.get()).dbUser.week_summary_emails_enabled,
    ).toBe(true);
  } finally {
    await db.people.deleteMany({ where: { uid: person.uid } });
  }
});
