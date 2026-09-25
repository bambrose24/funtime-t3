import { beforeEach, expect, mock, test } from "bun:test";
import type { TRPCContext } from "../server/api/trpc";
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test";
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:1";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test";
process.env.E2E_MODE = "1";
const getEmail = mock(async (_id: string): Promise<any> => ({
  data: {
    subject: "Week 4",
    html: '<p>Hello</p><img src="https://track.example/open">',
    text: null,
    last_event: "opened",
  },
}));
mock.module("../server/services/resend", () => ({
  resendApi: { get: getEmail },
}));
const { leagueAdminRouter } =
  await import("../server/api/routers/league/admin");
const log = {
  email_log_id: "log1",
  league_id: 10,
  member_id: 100,
  resend_id: "r1",
  ts: new Date(),
  email_type: "week_summary",
  week: 4,
  delivery_status: "bounced",
  failure_reason: "Mailbox missing",
};
const findLog = mock(async ({ where }: any) =>
  where.email_log_id === log.email_log_id &&
  where.league_id === log.league_id &&
  where.member_id === log.member_id
    ? log
    : null,
);
const groups = mock(async (_args: any) => []);
const ctx = {
  headers: new Headers(),
  supabaseUser: null,
  dbUser: {
    uid: 1,
    email: "admin@example.com",
    leaguemembers: [{ league_id: 10, role: "admin" }],
  },
  db: {
    leaguemembers: {
      findFirst: async ({ where }: any) =>
        where.membership_id === 100 && where.league_id === 10 ? {} : null,
    },
    emailLogs: { findFirst: findLog, findMany: async () => [log] },
    emailDeliveryEvents: { groupBy: groups },
  },
} as unknown as TRPCContext;
beforeEach(() => {
  getEmail.mockClear();
  findLog.mockClear();
  groups.mockClear();
});

test("listing stored activity does not fan out to Resend", async () => {
  const result = await leagueAdminRouter
    .createCaller(ctx)
    .memberEmails({ leagueId: 10, memberId: 100, includeContent: false });
  expect(result.emails[0]!.delivery_status).toBe("bounced");
  expect(getEmail).not.toHaveBeenCalled();
});
test("member context is checked before querying activity", async () => {
  await expect(
    leagueAdminRouter
      .createCaller(ctx)
      .memberEmails({ leagueId: 10, memberId: 999, includeContent: false }),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
  expect(groups).not.toHaveBeenCalled();
});
test("detail lookup scopes the log to its league and member before provider access", async () => {
  await expect(
    leagueAdminRouter
      .createCaller(ctx)
      .memberEmail({ leagueId: 10, memberId: 999, emailLogId: "log1" }),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
  expect(getEmail).not.toHaveBeenCalled();
  const result = await leagueAdminRouter
    .createCaller(ctx)
    .memberEmail({ leagueId: 10, memberId: 100, emailLogId: "log1" });
  expect(getEmail).toHaveBeenCalledTimes(1);
  expect(result.provider_available).toBe(true);
  expect(result.preview_html).toBe("<p>Hello</p>");
});
test("an admin cannot read another league's email", async () => {
  await expect(
    leagueAdminRouter
      .createCaller(ctx)
      .memberEmail({ leagueId: 20, memberId: 100, emailLogId: "log1" }),
  ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  expect(findLog).not.toHaveBeenCalled();
  expect(getEmail).not.toHaveBeenCalled();
});
test("provider errors retain stored status and show unavailability", async () => {
  getEmail.mockImplementationOnce(async () => ({
    data: null,
    error: { statusCode: 429 },
  }));
  const result = await leagueAdminRouter
    .createCaller(ctx)
    .memberEmail({ leagueId: 10, memberId: 100, emailLogId: "log1" });
  expect(result.provider_available).toBe(false);
  expect(result.delivery_status).toBe("bounced");
  expect(result.failure_reason).toBe("Mailbox missing");
});
