import { beforeEach, expect, mock, test } from "bun:test";
import { buildWeekSummary } from "../utils/weekSummary";

// Run in a separate Bun process: module mocks never affect router tests.
// All outbound boundaries are replaced before importing the sender.
process.env.E2E_MODE = "0";
process.env.FUNTIME_DISABLE_EMAILS = "0";
process.env.RESEND_API_KEY = "fake-unit-test-key";
const send = mock(async (_payload: any, _options: any): Promise<any> => ({
  data: { id: "email-1" },
  error: null,
}));
const create = mock(async (_args: any) => ({ email_log_id: "log-1" }));
const reconcile = mock(async (_id: string) => {});
const logError = mock(() => {});
mock.module("resend", () => ({
  Resend: class {
    emails = { send };
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
  db: { emailLogs: { create }, weeklyRecapDelivery },
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
  };
}
beforeEach(() => {
  claims.clear();
  send.mockReset();
  create.mockReset();
  reconcile.mockClear();
  logError.mockClear();
  send.mockImplementation(async () => ({
    data: { id: "email-1" },
    error: null,
  }));
  create.mockImplementation(async () => ({ email_log_id: "log-1" }));
});
test("empty recipient list makes no provider or database calls", async () => {
  expect(
    await resendApi.sendWeekSummaryEmail({ ...payload(), recipients: [] }),
  ).toEqual({ sent: 0 });
  expect(send).not.toHaveBeenCalled();
  expect(create).not.toHaveBeenCalled();
});
test("sends separate personalized emails and records each member", async () => {
  expect(await resendApi.sendWeekSummaryEmail(payload())).toEqual({ sent: 2 });
  expect(send.mock.calls.map((c) => c[0].to)).toEqual([
    ["alex@example.com"],
    ["brian@example.com"],
  ]);
  expect(send.mock.calls[0]![0].subject).toBe(
    "Sunday Crew · Your Week 4 results",
  );
  expect(create.mock.calls.map((c) => c[0].data.member_id)).toEqual([1, 2]);
  expect(reconcile).toHaveBeenCalledTimes(2);
});
test("provider failure is not logged as sent and does not stop other recipients", async () => {
  send.mockImplementationOnce(async () => ({
    data: null,
    error: { message: "rate limited", statusCode: 429 },
  }));
  expect(await resendApi.sendWeekSummaryEmail(payload())).toEqual({ sent: 1 });
  expect(create).toHaveBeenCalledTimes(1);
  expect(create.mock.calls[0]![0].data.member_id).toBe(2);
  expect(logError).toHaveBeenCalledTimes(1);
});
test("retry identity stays stable when results or wording change", async () => {
  const p = payload();
  send.mockImplementation(async () => ({
    data: null,
    error: { statusCode: 429 },
  }));
  await resendApi.sendWeekSummaryEmail(p);
  const keys = send.mock.calls.map((c) => c[1].idempotencyKey);
  await resendApi.sendWeekSummaryEmail({
    ...p,
    winnerText: "Updated",
    recipients: p.recipients.map((r) => ({ ...r, correctPicks: 12 })),
  });
  expect(send.mock.calls.slice(2).map((c) => c[1].idempotencyKey)).toEqual(
    keys,
  );
  expect(keys[0]).not.toBe(keys[1]);
});
test("different weeks and leagues get distinct retry identities", async () => {
  const p = payload();
  await resendApi.sendWeekSummaryEmail(p);
  await resendApi.sendWeekSummaryEmail({ ...p, week: 5 });
  await resendApi.sendWeekSummaryEmail({ ...p, leagueId: 124 });
  expect(new Set(send.mock.calls.map((c) => c[1].idempotencyKey)).size).toBe(6);
});
test("no provider message ID is not counted as a successful send", async () => {
  send.mockImplementation(async () => ({ data: null, error: null }));
  expect(await resendApi.sendWeekSummaryEmail(payload())).toEqual({ sent: 0 });
  expect(create).not.toHaveBeenCalled();
});

test("overlapping cron runs send each user only once", async () => {
  const results = await Promise.all(
    Array.from({ length: 10 }, () => resendApi.sendWeekSummaryEmail(payload())),
  );
  expect(send).toHaveBeenCalledTimes(2);
  expect(results.reduce((sum, r) => sum + r.sent, 0)).toBe(2);
});
test("later cron runs skip previously sent emails indefinitely", async () => {
  await resendApi.sendWeekSummaryEmail(payload());
  expect(await resendApi.sendWeekSummaryEmail(payload())).toEqual({ sent: 0 });
  expect(send).toHaveBeenCalledTimes(2);
});
test("membership changes do not permit a second email to the same user", async () => {
  const p = payload();
  await resendApi.sendWeekSummaryEmail(p);
  await resendApi.sendWeekSummaryEmail({
    ...p,
    recipients: p.recipients.map((r) => ({ ...r, memberId: r.memberId + 100 })),
  });
  expect(send).toHaveBeenCalledTimes(2);
});
test("one user with duplicate memberships is sent only one email", async () => {
  const p = payload();
  await resendApi.sendWeekSummaryEmail({
    ...p,
    recipients: [p.recipients[0]!, { ...p.recipients[0]!, memberId: 99 }],
  });
  expect(send).toHaveBeenCalledTimes(1);
});
test("accepted email is never resent when the email log write fails", async () => {
  create.mockImplementation(async () => {
    throw new Error("database unavailable");
  });
  await resendApi.sendWeekSummaryEmail(payload());
  await resendApi.sendWeekSummaryEmail(payload());
  expect(send).toHaveBeenCalledTimes(2);
  expect([...claims.values()].every((r) => r.state === "sent")).toBe(true);
});
test("network timeout leaves the claim held and still processes other users", async () => {
  send.mockImplementationOnce(async () => {
    throw new Error("timeout after acceptance");
  });
  expect(await resendApi.sendWeekSummaryEmail(payload())).toEqual({ sent: 1 });
  await resendApi.sendWeekSummaryEmail(payload());
  expect(send).toHaveBeenCalledTimes(2);
});
test("ambiguous provider error never automatically resends", async () => {
  send.mockImplementation(async () => ({
    data: null,
    error: { statusCode: 500 },
  }));
  await resendApi.sendWeekSummaryEmail(payload());
  await resendApi.sendWeekSummaryEmail(payload());
  expect(send).toHaveBeenCalledTimes(2);
  expect([...claims.values()].every((r) => r.state === "uncertain")).toBe(true);
});
test("only one concurrent runner retries a confirmed rate limit rejection", async () => {
  send.mockImplementation(async () => ({
    data: null,
    error: { statusCode: 429 },
  }));
  await resendApi.sendWeekSummaryEmail(payload());
  send.mockImplementation(async () => ({
    data: { id: "retry-success" },
    error: null,
  }));
  await Promise.all(
    Array.from({ length: 10 }, () => resendApi.sendWeekSummaryEmail(payload())),
  );
  expect(send).toHaveBeenCalledTimes(4);
  expect([...claims.values()].every((r) => r.state === "sent")).toBe(true);
});
test("a different season can send a new recap", async () => {
  await resendApi.sendWeekSummaryEmail(payload());
  expect(
    await resendApi.sendWeekSummaryEmail({ ...payload(), season: 2027 }),
  ).toEqual({ sent: 2 });
});
