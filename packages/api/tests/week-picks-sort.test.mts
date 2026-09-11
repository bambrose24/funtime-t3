import assert from "node:assert/strict";
import test from "node:test";
import {
  getStartedTiebreakerScore,
  sortWeekPicks,
} from "../utils/weekPicksSort.ts";

const kickoff = new Date("2026-09-14T00:20:00Z");
const game = {
  ts: kickoff,
  done: false,
  homescore: 14,
  awayscore: 10,
};
const picks = [
  { people: { username: "Zoe" }, correctPicks: 5, tiebreakerScore: 24 },
  { people: { username: "bob" }, correctPicks: 5, tiebreakerScore: 30 },
  { people: { username: "Alice" }, correctPicks: 5, tiebreakerScore: 40 },
  { people: { username: "Leader" }, correctPicks: 6, tiebreakerScore: 99 },
  { people: { username: "Aaron" }, correctPicks: 4, tiebreakerScore: 24 },
];
const names = (rows: typeof picks) => rows.map((row) => row.people.username);

test("before kickoff, tied players sort alphabetically regardless of prediction", () => {
  const score = getStartedTiebreakerScore(
    game,
    new Date(kickoff.getTime() - 1),
  );
  assert.equal(score, null);
  assert.deepEqual(names(sortWeekPicks(picks, score)), [
    "Leader",
    "Alice",
    "bob",
    "Zoe",
    "Aaron",
  ]);
});

for (const [label, now, done] of [
  ["at kickoff", kickoff, false],
  ["during the game", new Date(kickoff.getTime() + 60_000), false],
  ["after the game", new Date(kickoff.getTime() + 14_400_000), true],
] as const) {
  test(`${label}, tied players sort by points off`, () => {
    const score = getStartedTiebreakerScore({ ...game, done }, now);
    assert.equal(score, 24);
    assert.deepEqual(names(sortWeekPicks(picks, score)), [
      "Leader",
      "Zoe",
      "bob",
      "Alice",
      "Aaron",
    ]);
  });
}

test("equal point differences use case-insensitive alphabetical order", () => {
  const tied = [picks[0]!, { ...picks[1]!, tiebreakerScore: 16 }];
  assert.deepEqual(names(sortWeekPicks(tied, 20)), ["bob", "Zoe"]);
});

test("a started scoreless game uses zero, not the pregame alphabetical order", () => {
  const score = getStartedTiebreakerScore(
    { ...game, homescore: null, awayscore: null },
    kickoff,
  );
  assert.equal(score, 0);
  assert.deepEqual(names(sortWeekPicks(picks, score)), [
    "Leader",
    "Zoe",
    "bob",
    "Alice",
    "Aaron",
  ]);
});

test("without a tiebreaker game, tied players sort alphabetically", () => {
  assert.deepEqual(
    names(sortWeekPicks(picks, getStartedTiebreakerScore(undefined))),
    ["Leader", "Alice", "bob", "Zoe", "Aaron"],
  );
});

test("sorting leaves the source array and rows unchanged", () => {
  const original = structuredClone(picks);
  const sorted = sortWeekPicks(picks, null);
  assert.notEqual(sorted, picks);
  assert.deepEqual(picks, original);
});
