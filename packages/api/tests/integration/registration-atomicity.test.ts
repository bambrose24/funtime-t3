import { afterAll, expect, spyOn, test } from "bun:test";
import type { TRPCContext } from "../../server/api/trpc";

const localUrl = "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
if (process.env.DATABASE_URL !== localUrl || process.env.E2E_MODE !== "1") {
  throw new Error(
    "Registration tests require the isolated local DB and E2E_MODE=1",
  );
}
const { db } = await import("../../server/db");
const { leagueRouter } = await import("../../server/api/routers/league");
const { resendApi } = await import("../../server/services/resend");
const welcome = spyOn(
  resendApi,
  "sendLeagueRegistrationEmail",
).mockResolvedValue(undefined);
afterAll(async () => {
  welcome.mockRestore();
  await db.$disconnect();
});

type Options = {
  invalidPrediction?: boolean;
  missingPrediction?: boolean;
  competition?: boolean;
  emailFails?: boolean;
  renewal?: "promotion" | "priorAdmin" | "player";
  alreadyJoined?: boolean;
};
async function scenario(options: Options = {}) {
  const game = await db.games.findFirstOrThrow();
  const fixture = await db.$transaction(async (tx) => {
    const suffix = crypto.randomUUID();
    const personData = (name: string) => ({
      username: `registration-${name}-${suffix}`,
      fname: "Registration",
      lname: "Test",
      email: `web.e2e.registration.${name}.${suffix}@example.com`,
      season: game.season,
    });
    const owner = await tx.people.create({ data: personData("owner") });
    const joining = await tx.people.create({ data: personData("joining") });
    const prior = options.renewal
      ? await tx.leagues.create({
          data: {
            name: "E2E prior registration",
            season: game.season - 1,
            created_by_user_id: owner.uid,
            leaguemembers: {
              create: {
                user_id: joining.uid,
                role: options.renewal === "priorAdmin" ? "admin" : "player",
              },
            },
          },
        })
      : null;
    const league = await tx.leagues.create({
      data: {
        name: "E2E atomic registration",
        season: game.season,
        share_code: `E2EREG${suffix.replaceAll("-", "").toUpperCase()}`,
        created_by_user_id: owner.uid,
        superbowl_competition: options.competition ?? true,
        prior_league_id: prior?.league_id,
        leaguemembers: { create: { user_id: owner.uid, role: "admin" } },
      },
    });
    if (options.renewal === "promotion")
      await tx.league_renewal_member_roles.create({
        data: {
          league_id: league.league_id,
          user_id: joining.uid,
          role: "admin",
        },
      });
    if (options.alreadyJoined)
      await tx.leaguemembers.create({
        data: { league_id: league.league_id, user_id: joining.uid },
      });
    return { owner, joining, league };
  });
  const { owner, joining, league } = fixture;
  try {
    // Fixtures are committed so the real mutation transaction and an independent
    // delivery query can observe commit/rollback. No transaction proxy is used.
    const dbUser = await db.people.findUniqueOrThrow({
      where: { uid: joining.uid },
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
    const expectedPrediction = options.competition !== false;
    let deliveredMember:
      { membership_id: number; predictionCount: number } | undefined;
    welcome.mockClear();
    welcome.mockImplementation(async (memberId) => {
      const committedMember = await db.leaguemembers.findUniqueOrThrow({
        where: { membership_id: memberId },
        include: { superbowl: true },
      });
      deliveredMember = {
        membership_id: committedMember.membership_id,
        predictionCount: committedMember.superbowl.length,
      };
      if (options.emailFails)
        throw new Error("Simulated welcome provider failure");
    });
    const validPrediction = {
      winnerTeamId: game.home,
      loserTeamId: game.away,
      score: 48,
    };
    // A real FK failure during prediction insertion must roll back membership.
    if (options.invalidPrediction)
      expect(await db.teams.count({ where: { teamid: -1 } })).toBe(0);
    const input = {
      code: league.share_code!,
      superbowl:
        options.missingPrediction || !expectedPrediction
          ? undefined
          : {
              ...validPrediction,
              winnerTeamId: options.invalidPrediction ? -1 : game.home,
            },
    };
    const caller = leagueRouter.createCaller(ctx);
    const membershipWhere = {
      league_id: league.league_id,
      user_id: joining.uid,
    };
    if (
      options.invalidPrediction ||
      options.missingPrediction ||
      options.alreadyJoined
    ) {
      if (options.invalidPrediction) {
        await expect(caller.register(input)).rejects.toThrow(
          "Foreign key constraint violated",
        );
      } else {
        await expect(caller.register(input)).rejects.toThrow();
      }
      expect(await db.leaguemembers.count({ where: membershipWhere })).toBe(
        options.alreadyJoined ? 1 : 0,
      );
      expect(
        await db.superbowl.count({
          where: {
            uid: joining.uid,
            leaguemembers: { league_id: league.league_id },
          },
        }),
      ).toBe(0);
      expect(welcome).not.toHaveBeenCalled();
      if (options.invalidPrediction) {
        // The same caller can correct the failed request and join successfully.
        const member = await caller.register({
          code: league.share_code!,
          superbowl: validPrediction,
        });
        expect(await db.leaguemembers.count({ where: membershipWhere })).toBe(
          1,
        );
        expect(
          await db.superbowl.count({
            where: { member_id: member.membership_id },
          }),
        ).toBe(1);
        expect(welcome).toHaveBeenCalledTimes(1);
      }
    } else {
      const member = await caller.register(input);
      expect(member).toMatchObject({
        league_id: league.league_id,
        user_id: joining.uid,
        role:
          options.renewal === "promotion" || options.renewal === "priorAdmin"
            ? "admin"
            : "player",
      });
      expect(await db.leaguemembers.count({ where: membershipWhere })).toBe(1);
      const predictions = await db.superbowl.findMany({
        where: { member_id: member.membership_id },
      });
      expect(predictions).toHaveLength(expectedPrediction ? 1 : 0);
      if (expectedPrediction)
        expect(predictions[0]).toMatchObject({
          winner: game.home,
          loser: game.away,
          score: 48,
          season: league.season,
          uid: joining.uid,
        });
      expect(welcome).toHaveBeenCalledTimes(1);
      expect(welcome).toHaveBeenCalledWith(member.membership_id);
      expect(deliveredMember).toEqual({
        membership_id: member.membership_id,
        predictionCount: expectedPrediction ? 1 : 0,
      });
    }
  } finally {
    welcome.mockResolvedValue(undefined);
    await db.leagues.deleteMany({ where: { created_by_user_id: owner.uid } });
    await db.people.deleteMany({
      where: { uid: { in: [owner.uid, joining.uid] } },
    });
  }
}

test("prediction FK failure rolls back membership and permits a corrected retry", () =>
  scenario({ invalidPrediction: true }));
test("welcome delivery sees both committed rows", () => scenario());
test("welcome failure does not turn a committed join into a failed request", () =>
  scenario({ emailFails: true }));
test("league without a prediction competition joins without a prediction", () =>
  scenario({ competition: false }));
test("welcome failure does not fail a join without a prediction", () =>
  scenario({ competition: false, emailFails: true }));
test("missing required prediction writes nothing", () =>
  scenario({ missingPrediction: true }));
test("existing member rejection preserves membership and sends no welcome", () =>
  scenario({ alreadyJoined: true }));
for (const renewal of ["promotion", "priorAdmin", "player"] as const)
  test(`atomic join preserves renewal role: ${renewal}`, () =>
    scenario({ renewal }));
