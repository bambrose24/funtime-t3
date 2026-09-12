import { describe, expect, test } from "bun:test";
import { render } from "react-email";
import WeekSummaryEmail from "../../emails/week-summary";
import {
  buildWeekSummary,
  isSummaryDue,
  movement,
  ordinal,
} from "../../utils/weekSummary";

type Input = Parameters<typeof buildWeekSummary>[0];
function fixture(
  scores: Array<[string, number, number | null]>,
  week = 4,
): Input {
  const weekGames = Array.from({ length: 4 }, (_, i) => ({
    gid: i + 1,
    week,
    ts: new Date("2026-09-15T00:15:00Z"),
    completed_at: new Date("2026-09-15T03:30:00Z"),
    done: true,
    is_tiebreaker: i === 3,
    homescore: 21,
    awayscore: 27,
  }));
  const members = scores.map(([username], i) => ({
    membership_id: i + 1,
    user_id: i + 1,
    people: { username, email: `${i}@example.com` },
  }));
  const weekPicks = scores.flatMap(([, correct, score], i) =>
    weekGames.map((g, j) => ({
      member_id: i + 1,
      gid: g.gid,
      week,
      correct: j < correct ? 1 : 0,
      score: g.is_tiebreaker ? score : null,
    })),
  );
  return {
    members,
    weekPicks,
    seasonPicks: [...weekPicks],
    weekGames,
    week,
    nextWeek: week + 1,
  };
}
const person = (s: ReturnType<typeof buildWeekSummary>, name: string) =>
  s.recipients.find((r) => r.username === name)!;

describe("weekly results", () => {
  test("more correct picks outrank a better tiebreaker; recipient outside top three stays in email data", () => {
    const s = buildWeekSummary(
      fixture([
        ["Alex", 4, 60],
        ["Jordan", 3, 48],
        ["Sam", 2, 48],
        ["Brian", 1, 48],
      ]),
    );
    expect(s.standings.map((r) => r.username)).toEqual([
      "Alex",
      "Jordan",
      "Sam",
    ]);
    expect(person(s, "Brian")).toMatchObject({
      rank: 4,
      correctPicks: 1,
      tiebreakerDiff: 0,
      tied: false,
    });
    expect(s.winnerText).toBe("Alex wins Week 4 with 4 correct picks!");
    expect(s.totalGames).toBe(4);
    expect(s.totalMembers).toBe(4);
  });
  test("absolute differential breaks ties both above and below actual score", () => {
    const s = buildWeekSummary(
      fixture([
        ["Alex", 3, 50],
        ["Jordan", 3, 43],
        ["Sam", 3, 51],
      ]),
    );
    expect(s.standings.map((r) => [r.username, r.tiebreakerDiff])).toEqual([
      ["Alex", 2],
      ["Sam", 3],
      ["Jordan", 5],
    ]);
    expect(s.winnerText).toBe("Alex wins Week 4 on the tiebreaker!");
  });
  test("equal differentials share the win and skip the following rank", () => {
    const s = buildWeekSummary(
      fixture([
        ["Jordan", 3, 50],
        ["Alex", 3, 46],
        ["Sam", 2, 48],
      ]),
    );
    expect(s.standings.map((r) => r.rank)).toEqual([1, 1, 3]);
    expect(s.winnerText).toBe("Alex and Jordan share the Week 4 win!");
    expect(person(s, "Jordan").tied).toBe(true);
  });
  test("includes everyone tied for third but no fourth place", () => {
    const s = buildWeekSummary(
      fixture([
        ["A", 4, 48],
        ["B", 3, 48],
        ["C", 2, 48],
        ["D", 2, 48],
        ["E", 1, 48],
      ]),
    );
    expect(s.standings.map((r) => r.rank)).toEqual([1, 2, 3, 3]);
  });
  test("missing tiebreaker is N/A, never a perfect zero", () => {
    const s = buildWeekSummary(
      fixture([
        ["A", 3, null],
        ["B", 3, 48],
      ]),
    );
    expect(person(s, "A")).toMatchObject({ rank: 2, tiebreakerDiff: null });
    expect(person(s, "B").tiebreakerDiff).toBe(0);
  });
  test("zero is a valid prediction", () => {
    const f = fixture([["A", 0, 0]]);
    f.weekGames[3]!.homescore = 0;
    f.weekGames[3]!.awayscore = 0;
    expect(person(buildWeekSummary(f), "A").tiebreakerDiff).toBe(0);
  });
  test("missing or unfinished tiebreaker keeps tied correct counts tied", () => {
    for (const mode of ["missing", "unfinished"]) {
      const f = fixture([
        ["A", 2, 48],
        ["B", 2, 100],
      ]);
      if (mode === "missing")
        f.weekGames.forEach((g) => (g.is_tiebreaker = false));
      else f.weekGames[3]!.done = false;
      const s = buildWeekSummary(f);
      expect(s.tiebreakerTotal).toBeNull();
      expect(
        s.recipients.every((r) => r.rank === 1 && r.tiebreakerDiff === null),
      ).toBe(true);
    }
  });
  test("member without picks still gets a personalized result", () => {
    const f = fixture([
      ["A", 2, 48],
      ["B", 0, null],
    ]);
    f.weekPicks = f.weekPicks.filter((p) => p.member_id === 1);
    f.seasonPicks = f.weekPicks;
    expect(person(buildWeekSummary(f), "B")).toMatchObject({
      rank: 2,
      correctPicks: 0,
      tiebreakerDiff: null,
    });
  });
  test("empty leagues and weeks with no submissions do not announce a winner", () => {
    for (const emptyMembers of [true, false]) {
      const f = fixture([["A", 0, null]]);
      f.weekPicks = [];
      f.seasonPicks = [];
      if (emptyMembers) f.members = [];
      expect(buildWeekSummary(f).winnerText).toBe(
        "No picks submitted this week.",
      );
    }
  });
  test("ignores picks from other games, weeks, or nonmembers", () => {
    const f = fixture([["A", 0, 48]]);
    f.weekPicks.push(
      { member_id: 1, gid: 999, week: 4, correct: 1, score: 0 },
      { member_id: 1, gid: 1, week: 3, correct: 1, score: 0 },
      { member_id: 999, gid: 1, week: 4, correct: 1, score: 0 },
    );
    expect(person(buildWeekSummary(f), "A").correctPicks).toBe(0);
  });
  test("does not mutate inputs", () => {
    const f = fixture([
      ["B", 3, 48],
      ["A", 3, 48],
    ]);
    const before = structuredClone(f);
    buildWeekSummary(f);
    expect(f).toEqual(before);
  });
});

describe("season standings", () => {
  test("movement compares cumulative totals through this week against last week; ignores future picks", () => {
    const f = fixture([
      ["A", 4, 48],
      ["B", 0, 48],
      ["C", 1, 48],
    ]);
    f.seasonPicks.push(
      ...[1, 2].map((gid) => ({
        member_id: 2,
        gid: 100 + gid,
        week: 3,
        correct: 1,
        score: null,
      })),
      { member_id: 3, gid: 110, week: 3, correct: 1, score: null },
      ...Array.from({ length: 10 }, (_, i) => ({
        member_id: 2,
        gid: 200 + i,
        week: 5,
        correct: 1,
        score: null,
      })),
    );
    const s = buildWeekSummary(f);
    expect(person(s, "A")).toMatchObject({ seasonRank: 1, seasonMovement: 2 });
    expect(person(s, "B")).toMatchObject({ seasonRank: 2, seasonMovement: -1 });
    expect(person(s, "C")).toMatchObject({ seasonRank: 2, seasonMovement: 0 });
  });
  test("first week has no invented movement", () => {
    expect(
      buildWeekSummary(fixture([["A", 2, 48]], 1)).recipients[0]!
        .seasonMovement,
    ).toBeNull();
  });
  test("formats plus/minus, unchanged and no comparison", () => {
    expect([movement(2), movement(-2), movement(0), movement(null)]).toEqual([
      " (+2)",
      " (-2)",
      " (no change)",
      "",
    ]);
  });
  test("ordinals include teen and large ranks", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 111].map(ordinal)).toEqual([
      "1st",
      "2nd",
      "3rd",
      "4th",
      "11th",
      "12th",
      "13th",
      "21st",
      "22nd",
      "23rd",
      "111th",
    ]);
  });
});

describe("morning delivery in Eastern time", () => {
  for (const [label, completed, now, due] of [
    ["summer before 8", "2026-09-15T03:30:00Z", "2026-09-15T11:59:59Z", false],
    ["summer at 8", "2026-09-15T03:30:00Z", "2026-09-15T12:00:00Z", true],
    [
      "after midnight finish",
      "2026-09-15T05:30:00Z",
      "2026-09-15T12:00:00Z",
      true,
    ],
    ["winter before 8", "2026-12-15T04:30:00Z", "2026-12-15T12:59:59Z", false],
    ["winter at 8", "2026-12-15T04:30:00Z", "2026-12-15T13:00:00Z", true],
    [
      "afternoon finish waits",
      "2026-09-15T19:00:00Z",
      "2026-09-15T19:01:00Z",
      false,
    ],
    [
      "postponed finish next morning",
      "2026-09-15T19:00:00Z",
      "2026-09-16T12:00:00Z",
      true,
    ],
    ["6am cutoff waits", "2026-09-15T10:00:00Z", "2026-09-15T12:00:00Z", false],
    [
      "end of morning window",
      "2026-09-15T03:30:00Z",
      "2026-09-15T16:00:00Z",
      false,
    ],
    [
      "retry following morning",
      "2026-09-15T03:30:00Z",
      "2026-09-16T12:00:00Z",
      true,
    ],
    [
      "spring DST transition",
      "2026-03-08T04:00:00Z",
      "2026-03-08T12:00:00Z",
      true,
    ],
    [
      "fall DST transition",
      "2026-11-01T03:00:00Z",
      "2026-11-01T13:00:00Z",
      true,
    ],
  ] as const)
    test(label, () => {
      const games = fixture([["A", 2, 48]]).weekGames.map((g) => ({
        ...g,
        completed_at: new Date(completed),
      }));
      expect(isSummaryDue(games, new Date(now))).toBe(due);
    });
  test("all games must be final with known scores and observed completion", () => {
    const games = fixture([["A", 2, 48]]).weekGames;
    const now = new Date("2026-09-15T12:00:00Z");
    expect(isSummaryDue([], now)).toBe(false);
    for (const change of [
      { done: false },
      { done: null },
      { completed_at: null },
      { homescore: null },
      { awayscore: null },
    ])
      expect(isSummaryDue([...games, { ...games[0]!, ...change }], now)).toBe(
        false,
      );
  });
});

describe("rendered email", () => {
  async function email(input: Input, username = "Brian") {
    const summary = buildWeekSummary(input);
    return render(
      <WeekSummaryEmail
        {...summary}
        leagueId={123}
        leagueName="Sunday Crew"
        week={input.week}
        recipient={person(summary, username)}
      />,
      { plainText: true },
    );
  }
  test("approved layout shows personal results first, compact top three, and picks CTA", async () => {
    const text = await email(
      fixture([
        ["Alex", 4, 50],
        ["Jordan", 4, 53],
        ["Sam", 3, 51],
        ["Brian", 2, 51],
      ]),
    );
    expect(text).toContain("Hi Brian,");
    expect(text).toContain("Correct picks: 2 / 4");
    expect(text).toContain("Weekly standing: 4th of 4");
    expect(text).toContain("Season standing: 4th (-3)");
    expect(text.indexOf("YOUR WEEK 4")).toBeLessThan(
      text.indexOf("WEEK 4 RESULTS"),
    );
    expect(text).toContain("Alex wins Week 4 on the tiebreaker!");
    expect(text).toContain("Make your Week 5 picks");
    expect(text).toContain("https://www.play-funtime.com/league/123/pick");
    expect(text).not.toContain("Your picks");
    expect(text).not.toMatch(/[↑↓]/);
  });
  test("final week omits next-week button but retains standings link", async () => {
    const f = fixture([["Brian", 2, 48]], 18);
    f.nextWeek = null;
    const text = await email(f);
    expect(text).not.toContain("Make your Week");
    expect(text).toContain("Thanks for playing this season!");
    expect(text).toContain("https://www.play-funtime.com/league/123?week=18");
  });
  test("missing tiebreaker and tied placement are explicit", async () => {
    const text = await email(
      fixture(
        [
          ["Brian", 0, null],
          ["Alex", 0, null],
        ],
        1,
      ),
    );
    expect(text).toContain("Point differential: N/A");
    expect(text).toContain("Weekly standing: Tied 1st of 2");
    expect(text).not.toContain("(no change)");
  });
  test("HTML escapes user content and uses real link/button markup", async () => {
    const summary = buildWeekSummary(
      fixture([["<script>bad</script>", 2, 48]]),
    );
    const html = await render(
      <WeekSummaryEmail
        {...summary}
        leagueId={123}
        leagueName="A & B"
        week={4}
        recipient={summary.recipients[0]!}
      />,
    );
    expect(html).not.toContain("<script>bad</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain(
      'href="https://www.play-funtime.com/league/123/pick"',
    );
  });
});
