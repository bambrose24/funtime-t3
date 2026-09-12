import { z } from "zod";
import { buildWeekSummary } from "./weekSummary";

export const previewScenarios = [
  "tiebreaker",
  "outright",
  "shared",
  "missing-picks",
  "final-week",
] as const;
export type PreviewScenario = (typeof previewScenarios)[number];

export function parsePreviewArgs(args: string[]) {
  let to = "bambrose24@gmail.com";
  let scenario: PreviewScenario = "tiebreaker";
  let leagueId = 123;
  let dryRun = false;
  let help = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--help") help = true;
    else if (arg === "--to" || arg === "--scenario" || arg === "--league-id") {
      const value = args[++i];
      if (!value || value.startsWith("--"))
        throw new Error(`Missing value for ${arg}`);
      if (arg === "--to") to = z.string().email().parse(value);
      if (arg === "--scenario")
        scenario = z.enum(previewScenarios).parse(value);
      if (arg === "--league-id")
        leagueId = z.coerce.number().int().positive().parse(value);
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  return { to, scenario, leagueId, dryRun, help };
}

export function buildPreview(
  scenario: PreviewScenario,
  to: string,
  leagueId: number,
) {
  const week = scenario === "final-week" ? 18 : 4;
  const names = [
    "Alex",
    "Jordan",
    "Sam",
    "Brian",
    "Dana",
    "Casey",
    "Taylor",
    "Morgan",
    "Riley",
    "Jamie",
    "Avery",
    "Quinn",
  ];
  const members = names.map((username, i) => ({
    membership_id: i + 1,
    user_id: i + 1,
    people: { username, email: to },
  }));
  const weekGames = Array.from({ length: 16 }, (_, i) => ({
    gid: i + 1,
    week,
    ts: new Date("2026-09-15T00:15:00Z"),
    completed_at: new Date("2026-09-15T03:30:00Z"),
    done: true,
    is_tiebreaker: i === 15,
    homescore: 21,
    awayscore: 27,
  }));
  const totals = [
    scenario === "outright" ? 13 : 12,
    12,
    11,
    10,
    8,
    8,
    7,
    7,
    6,
    6,
    5,
    4,
  ];
  const weekPicks = members.flatMap((member, i) => {
    if (scenario === "missing-picks" && member.people.username === "Brian")
      return [];
    return weekGames.map((g, index) => ({
      member_id: member.membership_id,
      gid: g.gid,
      week,
      correct: index < totals[i]! ? 1 : 0,
      score: g.is_tiebreaker
        ? i === 0
          ? 50
          : i === 1
            ? scenario === "shared"
              ? 46
              : 53
            : 45
        : null,
    }));
  });
  const previousTotals = [36, 35, 25, 32, 33, 24, 23, 22, 21, 20, 19, 18];
  const priorPicks = members.flatMap((member, i) =>
    Array.from({ length: previousTotals[i]! }, (_, j) => ({
      member_id: member.membership_id,
      gid: 1000 + j,
      week: Math.floor(j / 16) + 1,
      correct: 1,
      score: null,
    })),
  );
  const summary = buildWeekSummary({
    members,
    weekPicks,
    seasonPicks: [...priorPicks, ...weekPicks],
    weekGames,
    week,
    nextWeek: scenario === "final-week" ? null : week + 1,
  });
  return {
    ...summary,
    leagueId,
    leagueName: "Sunday Crew (test data)",
    week,
    recipient: summary.recipients.find((r) => r.username === "Brian")!,
  };
}
