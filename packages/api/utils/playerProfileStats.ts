import { withRankings } from "./withRankings";

export type DoneGame = {
  gid: number;
  week: number;
};

export type MemberPick = {
  gid: number;
  week: number;
  correct: number | null;
  winner: number | null;
};

export type WeekRecord = {
  week: number;
  correct: number;
  wrong: number;
  missed: number;
  possible: number;
  won: boolean;
};

export type PlayerProfileStats = {
  correctPicks: number;
  wrongPicks: number;
  missedPicks: number;
  decidedGames: number;
  accuracyPct: number | null;
  rank: number | null;
  leagueSize: number;
  tiedForRank: boolean;
  leaderCorrect: number;
  correctBehind: number;
  weeks: WeekRecord[];
};

function pickWasMade(winner: number | null | undefined) {
  return typeof winner === "number" && winner > 0;
}

export function summarizePlayerProfile({
  memberId,
  doneGames,
  picks,
  weekWinWeeks,
  memberIds,
  correctByMemberId,
}: {
  memberId: number;
  doneGames: readonly DoneGame[];
  picks: readonly MemberPick[];
  weekWinWeeks: readonly number[];
  memberIds: readonly number[];
  correctByMemberId: ReadonlyMap<number, number>;
}): PlayerProfileStats {
  const pickByGid = new Map(picks.map((pick) => [pick.gid, pick]));
  const weekWins = new Set(weekWinWeeks);
  const weeksMap = new Map<
    number,
    { possible: number; correct: number; wrong: number; missed: number }
  >();

  for (const game of doneGames) {
    let week = weeksMap.get(game.week);
    if (!week) {
      week = { possible: 0, correct: 0, wrong: 0, missed: 0 };
      weeksMap.set(game.week, week);
    }
    week.possible += 1;
    const pick = pickByGid.get(game.gid);
    if (pick?.correct === 1) {
      week.correct += 1;
    } else if (pickWasMade(pick?.winner)) {
      week.wrong += 1;
    } else {
      week.missed += 1;
    }
  }

  const weeks: WeekRecord[] = [...weeksMap.entries()]
    .sort(([left], [right]) => left - right)
    .map(([week, record]) => ({
      week,
      ...record,
      won: weekWins.has(week),
    }));

  const correctPicks = weeks.reduce((sum, week) => sum + week.correct, 0);
  const wrongPicks = weeks.reduce((sum, week) => sum + week.wrong, 0);
  const missedPicks = weeks.reduce((sum, week) => sum + week.missed, 0);
  const decidedGames = correctPicks + wrongPicks + missedPicks;
  const accuracyPct =
    decidedGames > 0 ? Math.round((correctPicks / decidedGames) * 100) : null;

  const ranked = withRankings(
    memberIds
      .map((id) => ({
        id,
        correct: correctByMemberId.get(id) ?? 0,
      }))
      .sort(
        (left, right) => right.correct - left.correct || left.id - right.id,
      ),
    (row) => row.correct,
  );
  const self = ranked.find((row) => row.id === memberId);
  const leaderCorrect = ranked.at(0)?.correct ?? 0;
  const rank = decidedGames > 0 ? (self?.rank ?? null) : null;
  const tiedForRank = Boolean(
    rank !== null && ranked.filter((row) => row.rank === rank).length > 1,
  );

  return {
    correctPicks,
    wrongPicks,
    missedPicks,
    decidedGames,
    accuracyPct,
    rank,
    leagueSize: memberIds.length,
    tiedForRank,
    leaderCorrect,
    correctBehind: Math.max(0, leaderCorrect - (self?.correct ?? 0)),
    weeks,
  };
}
