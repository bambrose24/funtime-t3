import { beforeEach, expect, mock, test } from "bun:test";
import { buildWeekSummary } from "../utils/weekSummary";

// Run in a separate Bun process: module mocks never affect router tests.
// All outbound boundaries are replaced before importing the sender.
process.env.E2E_MODE = "0";
process.env.FUNTIME_DISABLE_EMAILS = "0";
process.env.RESEND_API_KEY = "fake-unit-test-key";
const sendBatch = mock(async (payload: any[], _options: any): Promise<any> => ({
  data: { data: payload.map((_, index) => ({ id: `email-${index + 1}` })) },
  error: null,
}));
const createMany = mock(async (_args: any) => ({ count: 1 }));
const reconcile = mock(async (_id: string) => {});
const logError = mock(() => {});
mock.module("resend", () => ({
  Resend: class {
    batch = { send: sendBatch };
  },
}));
const claims = new Map<string, { state: string; resend_id?: string }>();
const key = (value: any) =>
  JSON.stringify([value.league_id, value.user_id, value.season, value.week]);
const weeklyRecapDelivery = {
  createMany: async ({ data }: any) => {
    const id = key(data);
    if (claims.has(id)) return { count: 0 };
    claims.set(id, { state: data.state });
    return { count: 1 };
  },
  updateMany: async ({ where, data }: any) => {
    const row = claims.get(key(where));
    if (!row || (where.state && row.state !== where.state)) return { count: 0 };
    Object.assign(row, data);
    return { count: 1 };
  },
};
mock.module("../server/db", () => ({
  db: { emailLogs: { createMany }, weeklyRecapDelivery },
}));
mock.module("../server/services/resend/webhooks", () => ({
  reconcileEmailDeliveryState: reconcile,
}));
mock.module("../utils/logging", () => ({
  getLogger: () => ({ info: () => {}, error: logError }),
}));
const { resendApi } = await import("../server/services/resend");
function payload() {
  return {
    ...buildWeekSummary({
      members: [
        {
          membership_id: 1,
          user_id: 1,
          people: { username: "Alex", email: "alex@example.com" },
        },
        {
          membership_id: 2,
          user_id: 2,
          people: { username: "Brian", email: "brian@example.com" },
        },
      ],
      weekPicks: [],
      seasonPicks: [],
      weekGames: [],
      week: 4,
      nextWeek: 5,
    }),
    season: 2026,
    leagueId: 123,
    leagueName: "Sunday Crew",
    week: 4,
    adminEmails: [
      "admin@example.com",
      " coadmin@example.com ",
      "admin@example.com",
    ],
  };
}
beforeEach(() => {
  claims.clear();
  sendBatch.mockReset();
  createMany.mockReset();
  reconcile.mockClear();
  logError.mockClear();
  sendBatch.mockImplementation(async (payload: any[]) => ({
    data: { data: payload.map((_, index) => ({ id: `email-${index + 1}` })) },
    error: null,
  }));
  createMany.mockImplementation(async () => ({ count: 1 }));
});
test("empty recipient list makes no provider or database calls", async () => {
  expect(
    await resendApi.sendWeekSummaryEmail({ ...payload(), recipients: [] }),
  ).toEqual({ sent: 0 });
  expect(sendBatch).not.toHaveBeenCalled();
  expect(createMany).not.toHaveBeenCalled();
});
test("sends one personalized batch and records each member", async () => {
  expect(await resendApi.sendWeekSummaryEmail(payload())).toEqual({ sent: 2 });
  expect(sendBatch).toHaveBeenCalledTimes(1);
  expect(sendBatch.mock.calls[0]![0].map((email: any) => email.to)).toEqual([
    "alex@example.com",
    "brian@example.com",
  ]);
  expect(sendBatch.mock.calls[0]![0][0].subject).toBe(
    "Sunday Crew · Your Week 4 results",
  );
  expect(
    sendBatch.mock.calls[0]![0].map((email: any) => email.replyTo),
  ).toEqual([
    ["admin@example.com", "coadmin@example.com"],
    ["admin@example.com", "coadmin@example.com"],
  ]);
  expect(
    createMany.mock.calls[0]![0].data.map((row: any) => row.member_id),
  ).toEqual([1, 2]);
  expect(reconcile).toHaveBeenCalledTimes(2);
});
test("omits reply-to when the league has no admin emails", async () => {
  expect(
    await resendApi.sendWeekSummaryEmail({ ...payload(), adminEmails: [] }),
  ).toEqual({ sent: 2 });
  expect(
    sendBatch.mock.calls[0]![0].every(
      (email: any) => email.replyTo === undefined,
    ),
  ).toBe(true);
});
test("provider failure is not logged as sent and does not stop other recipients", async () => {
  sendBatch.mockImplementationOnce(async () => ({
    data: null,
    error: { message: "rate limited", statusCode: 429 },
  }));
  expect(await resendApi.sendWeekSummaryEmail(payload())).toEqual({ sent: 0 });
  expect(createMany).not.toHaveBeenCalled();
  expect(logError).toHaveBeenCalledTimes(1);
});
test("retry identity stays stable when results or wording change", async () => {
  const p = payload();
  sendBatch.mockImplementation(async () => ({
    data: null,
    error: { statusCode: 429 },
  }));
  await resendApi.sendWeekSummaryEmail(p);
  const firstKey = sendBatch.mock.calls[0]![1].idempotencyKey;
  await resendApi.sendWeekSummaryEmail({
    ...p,
    winnerText: "Updated",
    recipients: p.recipients.map((r) => ({ ...r, correctPicks: 12 })),
  });
  expect(sendBatch.mock.calls[1]![1].idempotencyKey).toBe(firstKey);
});

test("chunks large personalized summary deliveries at Resend's batch limit", async () => {
  const p = payload();
  const recipients = Array.from({ length: 101 }, (_, index) => ({
    ...p.recipients[0]!,
    userId: index + 1,
    memberId: index + 1,
    email: `member-${index + 1}@example.com`,
  }));

  expect(await resendApi.sendWeekSummaryEmail({ ...p, recipients })).toEqual({
    sent: 101,
  });
  expect(sendBatch.mock.calls.map((call) => call[0].length)).toEqual([100, 1]);
});

test("different weeks and leagues get distinct retry identities", async () => {
  const p = payload();
  await resendApi.sendWeekSummaryEmail(p);
  await resendApi.sendWeekSummaryEmail({ ...p, week: 5 });
  await resendApi.sendWeekSummaryEmail({ ...p, leagueId: 124 });
  expect(
    new Set(sendBatch.mock.calls.map((c) => c[1].idempotencyKey)).size,
  ).toBe(3);
});
test("no provider message ID is not counted as a successful send", async () => {
  sendBatch.mockImplementation(async () => ({ data: null, error: null }));
  expect(await resendApi.sendWeekSummaryEmail(payload())).toEqual({ sent: 0 });
  expect(createMany).not.toHaveBeenCalled();
});

test("overlapping cron runs send each user only once", async () => {
  const results = await Promise.all(
    Array.from({ length: 10 }, () => resendApi.sendWeekSummaryEmail(payload())),
  );
  expect(sendBatch).toHaveBeenCalledTimes(1);
  expect(results.reduce((sum, r) => sum + r.sent, 0)).toBe(2);
});
test("later cron runs skip previously sent emails indefinitely", async () => {
  await resendApi.sendWeekSummaryEmail(payload());
  expect(await resendApi.sendWeekSummaryEmail(payload())).toEqual({ sent: 0 });
  expect(sendBatch).toHaveBeenCalledTimes(1);
});
test("membership changes do not permit a second email to the same user", async () => {
  const p = payload();
  await resendApi.sendWeekSummaryEmail(p);
  await resendApi.sendWeekSummaryEmail({
    ...p,
    recipients: p.recipients.map((r) => ({ ...r, memberId: r.memberId + 100 })),
  });
  expect(sendBatch).toHaveBeenCalledTimes(1);
});
test("one user with duplicate memberships is sent only one email", async () => {
  const p = payload();
  await resendApi.sendWeekSummaryEmail({
    ...p,
    recipients: [p.recipients[0]!, { ...p.recipients[0]!, memberId: 99 }],
  });
  expect(sendBatch).toHaveBeenCalledTimes(1);
});
test("accepted email is never resent when the email log write fails", async () => {
  createMany.mockImplementation(async () => {
    throw new Error("database unavailable");
  });
  await resendApi.sendWeekSummaryEmail(payload());
  await resendApi.sendWeekSummaryEmail(payload());
  expect(sendBatch).toHaveBeenCalledTimes(1);
  expect([...claims.values()].every((r) => r.state === "sent")).toBe(true);
});
test("network timeout leaves the claim held and still processes other users", async () => {
  sendBatch.mockImplementationOnce(async () => {
    throw new Error("timeout after acceptance");
  });
  expect(await resendApi.sendWeekSummaryEmail(payload())).toEqual({ sent: 0 });
  await resendApi.sendWeekSummaryEmail(payload());
  expect(sendBatch).toHaveBeenCalledTimes(1);
});
test("ambiguous provider error never automatically resends", async () => {
  sendBatch.mockImplementation(async () => ({
    data: null,
    error: { statusCode: 500 },
  }));
  await resendApi.sendWeekSummaryEmail(payload());
  await resendApi.sendWeekSummaryEmail(payload());
  expect(sendBatch).toHaveBeenCalledTimes(1);
  expect([...claims.values()].every((r) => r.state === "uncertain")).toBe(true);
});
test("only one concurrent runner retries a confirmed rate limit rejection", async () => {
  sendBatch.mockImplementation(async () => ({
    data: null,
    error: { statusCode: 429 },
  }));
  await resendApi.sendWeekSummaryEmail(payload());
  sendBatch.mockImplementation(async (payload: any[]) => ({
    data: {
      data: payload.map((_, index) => ({ id: `retry-success-${index}` })),
    },
    error: null,
  }));
  await Promise.all(
    Array.from({ length: 10 }, () => resendApi.sendWeekSummaryEmail(payload())),
  );
  expect(sendBatch).toHaveBeenCalledTimes(2);
  expect([...claims.values()].every((r) => r.state === "sent")).toBe(true);
});
test("a different season can send a new recap", async () => {
  await resendApi.sendWeekSummaryEmail(payload());
  expect(
    await resendApi.sendWeekSummaryEmail({ ...payload(), season: 2027 }),
  ).toEqual({ sent: 2 });
});
