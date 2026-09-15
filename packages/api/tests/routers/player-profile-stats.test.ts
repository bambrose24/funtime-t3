import { expect, test } from "bun:test";
import { summarizePlayerProfile } from "../../utils/playerProfileStats";

const games = [
  { gid: 1, week: 1 },
  { gid: 2, week: 1 },
  { gid: 3, week: 1 },
  { gid: 4, week: 2 },
  { gid: 5, week: 2 },
];

test("missed games count as losses instead of disappearing from the record", () => {
  const stats = summarizePlayerProfile({
    memberId: 1,
    doneGames: games,
    picks: [
      { gid: 1, week: 1, correct: 1, winner: 10 },
      { gid: 2, week: 1, correct: 0, winner: 11 },
      { gid: 4, week: 2, correct: 1, winner: 12 },
    ],
    weekWinWeeks: [2],
    memberIds: [1, 2],
    correctByMemberId: new Map([
      [1, 2],
      [2, 4],
    ]),
  });

  expect(stats.correctPicks).toBe(2);
  expect(stats.wrongPicks).toBe(1);
  expect(stats.missedPicks).toBe(2);
  expect(stats.decidedGames).toBe(5);
  expect(stats.accuracyPct).toBe(40);
  expect(stats.rank).toBe(2);
  expect(stats.leagueSize).toBe(2);
  expect(stats.tiedForRank).toBe(false);
  expect(stats.leaderCorrect).toBe(4);
  expect(stats.correctBehind).toBe(2);
  expect(
    stats.weeks.map((week) => ({
      week: week.week,
      correct: week.correct,
      wrong: week.wrong,
      missed: week.missed,
      possible: week.possible,
      won: week.won,
    })),
  ).toEqual([
    {
      week: 1,
      correct: 1,
      wrong: 1,
      missed: 1,
      possible: 3,
      won: false,
    },
    {
      week: 2,
      correct: 1,
      wrong: 0,
      missed: 1,
      possible: 2,
      won: true,
    },
  ]);
});

test("unmade pick rows with no winner are missed, not wrong", () => {
  const stats = summarizePlayerProfile({
    memberId: 1,
    doneGames: [{ gid: 1, week: 1 }],
    picks: [{ gid: 1, week: 1, correct: 0, winner: 0 }],
    weekWinWeeks: [],
    memberIds: [1],
    correctByMemberId: new Map([[1, 0]]),
  });

  expect(stats.correctPicks).toBe(0);
  expect(stats.wrongPicks).toBe(0);
  expect(stats.missedPicks).toBe(1);
});

test("rank is withheld until a game is decided", () => {
  const stats = summarizePlayerProfile({
    memberId: 1,
    doneGames: [],
    picks: [],
    weekWinWeeks: [],
    memberIds: [1, 2, 3],
    correctByMemberId: new Map(),
  });

  expect(stats.rank).toBeNull();
  expect(stats.leagueSize).toBe(3);
  expect(stats.accuracyPct).toBeNull();
  expect(stats.weeks).toEqual([]);
});

test("tied ranks share a place and report the gap to first as zero", () => {
  const stats = summarizePlayerProfile({
    memberId: 2,
    doneGames: [
      { gid: 1, week: 1 },
      { gid: 2, week: 1 },
    ],
    picks: [
      { gid: 1, week: 1, correct: 1, winner: 10 },
      { gid: 2, week: 1, correct: 1, winner: 11 },
    ],
    weekWinWeeks: [1],
    memberIds: [1, 2, 3],
    correctByMemberId: new Map([
      [1, 2],
      [2, 2],
      [3, 0],
    ]),
  });

  expect(stats.rank).toBe(1);
  expect(stats.tiedForRank).toBe(true);
  expect(stats.correctBehind).toBe(0);
});
