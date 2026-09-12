import { groupBy, orderBy } from "lodash";
import { addDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

type Member = {
  membership_id: number;
  people: { username: string; email: string };
};
type Pick = {
  member_id: number | null;
  gid: number;
  week: number;
  correct: number | null;
  score: number | null;
};
type Game = {
  gid: number;
  week: number;
  ts: Date;
  done: boolean | null;
  completed_at: Date | null;
  is_tiebreaker: boolean | null;
  homescore: number | null;
  awayscore: number | null;
};

export function isSummaryDue(games: Game[], now: Date) {
  if (
    !games.length ||
    games.some(
      (g) =>
        !g.done ||
        !g.completed_at ||
        g.homescore === null ||
        g.awayscore === null,
    )
  )
    return false;
  const completedAt = new Date(
    Math.max(...games.map((g) => g.completed_at!.getTime())),
  );
  const zone = "America/New_York";
  // Before 6 a.m. belongs to the previous game night; later finishes wait until tomorrow.
  const localDate = formatInTimeZone(completedAt, zone, "yyyy-MM-dd");
  const morningDate =
    Number(formatInTimeZone(completedAt, zone, "H")) < 6
      ? localDate
      : addDays(new Date(`${localDate}T12:00:00Z`), 1)
          .toISOString()
          .slice(0, 10);
  const dueAt = fromZonedTime(`${morningDate}T08:00:00`, zone);
  const hour = Number(formatInTimeZone(now, zone, "H"));
  return now >= dueAt && hour >= 8 && hour < 12;
}

export function ordinal(n: number) {
  const suffix =
    n % 100 >= 11 && n % 100 <= 13
      ? "th"
      : ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th");
  return `${n}${suffix}`;
}
export function movement(value: number | null) {
  return value === null
    ? ""
    : value === 0
      ? " (no change)"
      : ` (${value > 0 ? "+" : ""}${value})`;
}

export function buildWeekSummary({
  members,
  weekPicks,
  seasonPicks,
  weekGames,
  week,
  nextWeek,
}: {
  members: Member[];
  weekPicks: Pick[];
  seasonPicks: Pick[];
  weekGames: Game[];
  week: number;
  nextWeek: number | null;
}) {
  const picksByMember = groupBy(
    weekPicks.filter(
      (p) => weekGames.some((g) => g.gid === p.gid) && p.week === week,
    ),
    (pick) => pick.member_id,
  );
  const seasonPicksByMember = groupBy(seasonPicks, (pick) => pick.member_id);
  const getSeasonRanks = (throughWeek: number) => {
    const rows = members.map((member) => {
      const picks = seasonPicksByMember[member.membership_id] ?? [];
      return {
        member,
        total: picks.filter(
          (pick) => pick.week <= throughWeek && pick.correct === 1,
        ).length,
      };
    });
    const sortedRows = orderBy(
      rows,
      [(row) => row.total, (row) => row.member.people.username.toLowerCase()],
      ["desc", "asc"],
    );
    let currentRank = 0;
    let previousTotal: number | null = null;
    return new Map(
      sortedRows.map((row, index) => {
        if (previousTotal !== row.total) {
          currentRank = index + 1;
          previousTotal = row.total;
        }
        return [
          row.member.membership_id,
          {
            rank: currentRank,
            total: row.total,
          },
        ];
      }),
    );
  };
  const currentSeasonRanks = getSeasonRanks(week);
  const previousSeasonRanks = week > 1 ? getSeasonRanks(week - 1) : null;

  const tiebreakerGame = weekGames.find((game) => game.is_tiebreaker);
  const tiebreakerTotal = tiebreakerGame?.done
    ? (tiebreakerGame.homescore ?? 0) + (tiebreakerGame.awayscore ?? 0)
    : null;

  const standingsBase = members.map((member) => {
    const picks = picksByMember[member.membership_id] ?? [];
    const correctPicks = picks.filter((pick) => pick.correct === 1).length;
    const tiebreakerPick =
      tiebreakerGame && tiebreakerTotal !== null
        ? picks.find((pick) => pick.gid === tiebreakerGame.gid)
        : null;
    const tiebreakerDiff =
      tiebreakerTotal !== null && tiebreakerPick?.score != null
        ? Math.abs(tiebreakerPick.score - tiebreakerTotal)
        : Number.POSITIVE_INFINITY;

    return {
      member,
      correctPicks,
      tiebreakerDiff,
    };
  });

  const standingsSorted = orderBy(
    standingsBase,
    [
      (row) => row.correctPicks,
      (row) => row.tiebreakerDiff,
      (row) => row.member.people.username.toLowerCase(),
      (row) => row.member.membership_id,
    ],
    ["desc", "asc", "asc", "asc"],
  );

  let currentRank = 0;
  let previousScore: { correctPicks: number; tiebreakerDiff: number } | null =
    null;
  const standings = standingsSorted.map((row, index) => {
    if (
      !previousScore ||
      previousScore.correctPicks !== row.correctPicks ||
      previousScore.tiebreakerDiff !== row.tiebreakerDiff
    ) {
      currentRank = index + 1;
      previousScore = {
        correctPicks: row.correctPicks,
        tiebreakerDiff: row.tiebreakerDiff,
      };
    }
    return {
      ...row,
      rank: currentRank,
    };
  });

  const standingsForEmail = standings
    .filter((s) => s.rank <= 3)
    .map((standing) => ({
      rank: standing.rank,
      username: standing.member.people.username,
      tiebreakerDiff: Number.isFinite(standing.tiebreakerDiff)
        ? standing.tiebreakerDiff
        : null,
      correctPicks: standing.correctPicks,
      seasonTotal:
        currentSeasonRanks.get(standing.member.membership_id)?.total ?? 0,
    }));
  const weekWinners = standings
    .filter((standing) => standing.rank === 1)
    .map((standing) => standing.member.people.username);

  const winners = standings.filter((s) => s.rank === 1);
  const names = winners.map((s) => s.member.people.username);
  const winnerText =
    winners.length === 0 ||
    !members.some((m) => (picksByMember[m.membership_id] ?? []).length > 0)
      ? "No picks submitted this week."
      : winners.length > 1
        ? `${names.join(" and ")} share the Week ${week} win!`
        : standings.some(
              (s) =>
                s.rank !== 1 && s.correctPicks === winners[0]!.correctPicks,
            )
          ? `${names[0]} wins Week ${week} on the tiebreaker!`
          : `${names[0]} wins Week ${week} with ${winners[0]!.correctPicks} correct picks!`;
  return {
    standings: standingsForEmail,
    weekWinners,
    tiebreakerTotal,
    winnerText,
    totalGames: weekGames.length,
    totalMembers: members.length,
    nextWeek,
    recipients: standings.map((s) => ({
      memberId: s.member.membership_id,
      email: s.member.people.email,
      username: s.member.people.username,
      rank: s.rank,
      tied: standings.filter((r) => r.rank === s.rank).length > 1,
      correctPicks: s.correctPicks,
      seasonRank: currentSeasonRanks.get(s.member.membership_id)!.rank,
      seasonMovement: previousSeasonRanks
        ? previousSeasonRanks.get(s.member.membership_id)!.rank -
          currentSeasonRanks.get(s.member.membership_id)!.rank
        : null,
      tiebreakerDiff: Number.isFinite(s.tiebreakerDiff)
        ? s.tiebreakerDiff
        : null,
    })),
  };
}
export type WeekSummary = ReturnType<typeof buildWeekSummary>;
