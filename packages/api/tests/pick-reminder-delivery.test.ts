import { beforeEach, expect, mock, test } from "bun:test";

// Run separately: these mocks must never affect router or recap tests.
process.env.E2E_MODE = "0";
process.env.FUNTIME_DISABLE_EMAILS = "0";
process.env.RESEND_API_KEY = "unit-test-only";
const sendBatch = mock(
  async (_payload: any[], _options: any): Promise<any> => ({}),
);
const createLogs = mock(async (_args: any) => ({ count: 1 }));
const reconcile = mock(async (_id: string) => {});
const logError = mock((_message: string, _context: any) => {});
mock.module("resend", () => ({
  Resend: class {
    batch = { send: sendBatch };
  },
}));
const claims = new Map<string, { state: string; resend_id?: string }>();
const key = (value: any) =>
  JSON.stringify([value.league_id, value.user_id, value.season, value.week]);
const insertClaim = mock(async ({ data }: any) => {
  const id = key(data);
  if (claims.has(id)) return { count: 0 };
  claims.set(id, { state: data.state });
  return { count: 1 };
});
const updateClaim = mock(async ({ where, data }: any) => {
  const row = claims.get(key(where));
  if (!row || (where.state && row.state !== where.state)) return { count: 0 };
  Object.assign(row, data);
  return { count: 1 };
});
mock.module("../server/db", () => ({
  db: {
    emailLogs: { createMany: createLogs },
    pickReminderDelivery: { createMany: insertClaim, updateMany: updateClaim },
  },
}));
mock.module("../server/services/resend/webhooks", () => ({
  reconcileEmailDeliveryState: reconcile,
}));
mock.module("../utils/logging", () => ({
  getLogger: () => ({ info() {}, error: logError }),
}));
const { resendApi } = await import("../server/services/resend");
type Recipient = Parameters<typeof resendApi.sendPickReminderEmails>[0][number];
const recipients = (count = 2): Recipient[] =>
  Array.from(
    { length: count },
    (_, index) =>
      ({
        member: { membership_id: index + 1, user_id: index + 1 },
        user: {
          email: `member${index + 1}@example.com`,
          username: `Member ${index + 1}`,
        },
        league: { league_id: 10, name: "Sunday Crew", season: 2026 },
        week: 4,
      }) as Recipient,
  );
const accepted = (emails: any[]) => ({
  data: { data: emails.map((email) => ({ id: `id-${email.to}` })) },
  error: null,
});

beforeEach(() => {
  claims.clear();
  sendBatch.mockReset();
  sendBatch.mockImplementation(async (emails) => accepted(emails));
  createLogs.mockReset();
  createLogs.mockImplementation(async () => ({ count: 1 }));
  reconcile.mockReset();
  reconcile.mockImplementation(async () => {});
  insertClaim.mockClear();
  updateClaim.mockClear();
  logError.mockClear();
});

test("empty lists do not contact the provider or claim recipients", async () => {
  expect(await resendApi.sendPickReminderEmails([])).toBe(0);
  expect(sendBatch).not.toHaveBeenCalled();
  expect(insertClaim).not.toHaveBeenCalled();
});

test("sorts personalized payloads and maps IDs to the matching members", async () => {
  const batch = recipients().reverse();
  expect(await resendApi.sendPickReminderEmails(batch)).toBe(2);
  expect(batch[0]!.member.membership_id).toBe(2);
  expect(sendBatch.mock.calls[0]![0].map((email) => email.to)).toEqual([
    "member1@example.com",
    "member2@example.com",
  ]);
  expect(
    createLogs.mock.calls[0]![0].data.map((row: any) => [
      row.member_id,
      row.resend_id,
    ]),
  ).toEqual([
    [1, "id-member1@example.com"],
    [2, "id-member2@example.com"],
  ]);
  expect(reconcile).toHaveBeenCalledTimes(2);
});

test("invalid addresses and missing leagues do not block healthy recipients or acquire claims", async () => {
  const batch = recipients(5);
  batch[0]!.user.email = " member1@example.com ";
  batch[1]!.user.email = "";
  batch[2]!.user.email = "not-an-email";
  batch[3]!.league = undefined as unknown as Recipient["league"];
  expect(await resendApi.sendPickReminderEmails(batch)).toBe(2);
  expect(claims.size).toBe(2);
  expect(sendBatch.mock.calls[0]![0].map((email) => email.to)).toEqual([
    "member1@example.com",
    "member5@example.com",
  ]);
  expect(logError.mock.calls[0]![1]).toEqual({ requested: 5, skipped: 3 });
  expect(await resendApi.sendPickReminderEmails(recipients(5))).toBe(3);
});

test("reordered retries after a rate-limit rejection preserve key and payload order", async () => {
  sendBatch.mockImplementationOnce(async () => ({
    data: null,
    error: { statusCode: 429 },
  }));
  expect(await resendApi.sendPickReminderEmails(recipients().reverse())).toBe(
    0,
  );
  expect([...claims.values()].every((row) => row.state === "retryable")).toBe(
    true,
  );
  expect(await resendApi.sendPickReminderEmails(recipients())).toBe(2);
  expect(sendBatch.mock.calls[0]![1].idempotencyKey).toBe(
    sendBatch.mock.calls[1]![1].idempotencyKey,
  );
  expect(sendBatch.mock.calls[0]![0].map((email) => email.to)).toEqual(
    sendBatch.mock.calls[1]![0].map((email) => email.to),
  );
});

test("log write failure preserves accepted count and does not resend when membership changes", async () => {
  createLogs.mockImplementationOnce(async () => {
    throw new Error("database unavailable");
  });
  expect(await resendApi.sendPickReminderEmails(recipients())).toBe(2);
  // One person submits picks; the remaining candidate must not get a duplicate.
  expect(await resendApi.sendPickReminderEmails(recipients().slice(0, 1))).toBe(
    0,
  );
  expect(sendBatch).toHaveBeenCalledTimes(1);
  expect([...claims.values()].every((row) => row.state === "sent")).toBe(true);
  expect(logError.mock.calls.at(-1)![1]).toMatchObject({
    stage: "email_logs",
    accepted: 2,
  });
});

test("reconciliation failure preserves accepted count and duplicate protection", async () => {
  reconcile.mockImplementationOnce(async () => {
    throw new Error("database unavailable");
  });
  expect(await resendApi.sendPickReminderEmails(recipients())).toBe(2);
  expect(await resendApi.sendPickReminderEmails(recipients())).toBe(0);
  expect(sendBatch).toHaveBeenCalledTimes(1);
  expect(logError.mock.calls.at(-1)![1]).toMatchObject({
    stage: "reconciliation",
    accepted: 2,
  });
});

test("acceptance state write failure keeps claims held and counts provider acceptance", async () => {
  updateClaim.mockImplementationOnce(async () => {
    throw new Error("database unavailable");
  });
  expect(await resendApi.sendPickReminderEmails(recipients())).toBe(2);
  expect(await resendApi.sendPickReminderEmails(recipients().reverse())).toBe(
    0,
  );
  expect(sendBatch).toHaveBeenCalledTimes(1);
  expect(logError.mock.calls.at(-1)![1]).toMatchObject({
    stage: "record_acceptance",
    accepted: 2,
  });
});

test("ambiguous network outcomes are not retried even if the next candidate set changes", async () => {
  sendBatch.mockImplementationOnce(async () => {
    throw new Error("timeout after acceptance");
  });
  expect(await resendApi.sendPickReminderEmails(recipients())).toBe(0);
  expect(await resendApi.sendPickReminderEmails(recipients(3).slice(1))).toBe(
    1,
  );
  expect(sendBatch.mock.calls[1]![0].map((email) => email.to)).toEqual([
    "member3@example.com",
  ]);
});

test("unknown provider errors hold claims for review", async () => {
  sendBatch.mockImplementationOnce(async () => ({
    data: null,
    error: { statusCode: 500 },
  }));
  expect(await resendApi.sendPickReminderEmails(recipients())).toBe(0);
  expect(await resendApi.sendPickReminderEmails(recipients())).toBe(0);
  expect([...claims.values()].every((row) => row.state === "uncertain")).toBe(
    true,
  );
  expect(sendBatch).toHaveBeenCalledTimes(1);
});

test("missing IDs stay uncertain without shifting another member's ID", async () => {
  sendBatch.mockImplementationOnce(async () => ({
    data: { data: [{}, { id: "second" }] },
    error: null,
  }));
  expect(await resendApi.sendPickReminderEmails(recipients())).toBe(1);
  expect(createLogs.mock.calls[0]![0].data).toHaveLength(1);
  expect(createLogs.mock.calls[0]![0].data[0]).toMatchObject({
    member_id: 2,
    resend_id: "second",
  });
  expect(await resendApi.sendPickReminderEmails(recipients())).toBe(0);
});

test("overlapping cron runs send each person once", async () => {
  const results = await Promise.all(
    Array.from({ length: 10 }, () =>
      resendApi.sendPickReminderEmails(recipients()),
    ),
  );
  expect(results.reduce((total, count) => total + count, 0)).toBe(2);
  expect(
    sendBatch.mock.calls
      .flatMap(([emails]) => emails.map((email) => email.to))
      .sort(),
  ).toEqual(["member1@example.com", "member2@example.com"]);
});

test("overlapping retries after a confirmed rejection send each person once", async () => {
  sendBatch.mockImplementationOnce(async () => ({
    data: null,
    error: { statusCode: 429 },
  }));
  await resendApi.sendPickReminderEmails(recipients());
  const results = await Promise.all(
    Array.from({ length: 10 }, () =>
      resendApi.sendPickReminderEmails(recipients()),
    ),
  );
  expect(results.reduce((total, count) => total + count, 0)).toBe(2);
  expect(
    sendBatch.mock.calls
      .slice(1)
      .flatMap(([emails]) => emails.map((email) => email.to))
      .sort(),
  ).toEqual(["member1@example.com", "member2@example.com"]);
});

test("membership churn and duplicate memberships cannot resend to the same person", async () => {
  const batch = recipients();
  await resendApi.sendPickReminderEmails([
    batch[0]!,
    { ...batch[0]!, member: { ...batch[0]!.member, membership_id: 99 } },
  ]);
  expect(sendBatch.mock.calls[0]![0]).toHaveLength(1);
  expect(
    await resendApi.sendPickReminderEmails([
      { ...batch[0]!, member: { ...batch[0]!.member, membership_id: 100 } },
    ]),
  ).toBe(0);
});

test("new weeks, seasons, and leagues have independent delivery identities", async () => {
  expect(await resendApi.sendPickReminderEmails(recipients())).toBe(2);
  expect(
    await resendApi.sendPickReminderEmails(
      recipients().map((r) => ({ ...r, week: 5 })),
    ),
  ).toBe(2);
  expect(
    await resendApi.sendPickReminderEmails(
      recipients().map((r) => ({
        ...r,
        league: { ...r.league, season: 2027 },
      })),
    ),
  ).toBe(2);
  expect(
    await resendApi.sendPickReminderEmails(
      recipients().map((r) => ({
        ...r,
        league: { ...r.league, league_id: 20 },
      })),
    ),
  ).toBe(2);
  expect(
    new Set(sendBatch.mock.calls.map((call) => call[1].idempotencyKey)).size,
  ).toBe(4);
});

test("claims only the current 100-recipient chunk while the provider request is in flight", async () => {
  let started!: () => void;
  let release!: () => void;
  const firstStarted = new Promise<void>((resolve) => {
    started = resolve;
  });
  const firstHeld = new Promise<void>((resolve) => {
    release = resolve;
  });
  sendBatch.mockImplementationOnce(async (emails) => {
    started();
    await firstHeld;
    return accepted(emails);
  });
  const firstRun = resendApi.sendPickReminderEmails(recipients(200));
  try {
    await firstStarted;
    expect(claims.size).toBe(100);
    expect(await resendApi.sendPickReminderEmails(recipients(200))).toBe(100);
    expect(sendBatch.mock.calls[1]![0][0].to).toBe("member101@example.com");
  } finally {
    release();
    await firstRun;
  }
  expect(await firstRun).toBe(100);
  expect(sendBatch.mock.calls.map(([emails]) => emails.length)).toEqual([
    100, 100,
  ]);
});
