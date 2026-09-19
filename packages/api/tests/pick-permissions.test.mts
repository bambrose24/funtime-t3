import assert from "node:assert/strict";
import test from "node:test";
import {
  canViewMemberWeekPicks,
  getWeekPickDeadline,
  hasWeekKickedOff,
  isWeekClosedForPicks,
  shouldHideLeaguePicksTable,
} from "../utils/pickPermissions.ts";

const firstKickoff = new Date("2026-09-14T17:00:00Z");
const laterKickoff = new Date("2026-09-15T17:00:00Z");
const games = [{ ts: laterKickoff }, { ts: firstKickoff }];

test("the week locks at the earliest kickoff, inclusive", () => {
  assert.equal(
    hasWeekKickedOff(games, new Date(firstKickoff.getTime() - 1)),
    false,
  );
  assert.equal(hasWeekKickedOff(games, firstKickoff), true);
  assert.equal(
    hasWeekKickedOff(games, new Date(firstKickoff.getTime() + 1)),
    true,
  );
});

test("an empty slate has not kicked off", () => {
  assert.equal(hasWeekKickedOff([], firstKickoff), false);
});

test("viewers see their own row always; opponents wait for kickoff and a submit", () => {
  assert.equal(
    canViewMemberWeekPicks({
      viewerMemberId: 1,
      targetMemberId: 1,
      weekHasStarted: false,
      viewerHasSubmitted: false,
      weekClosedForPicks: false,
    }),
    true,
  );
  assert.equal(
    canViewMemberWeekPicks({
      viewerMemberId: 1,
      targetMemberId: 2,
      weekHasStarted: false,
      viewerHasSubmitted: true,
      weekClosedForPicks: false,
    }),
    false,
  );
  assert.equal(
    canViewMemberWeekPicks({
      viewerMemberId: 1,
      targetMemberId: 2,
      weekHasStarted: true,
      viewerHasSubmitted: true,
      weekClosedForPicks: false,
    }),
    true,
  );
  assert.equal(
    canViewMemberWeekPicks({
      viewerMemberId: 1,
      targetMemberId: 2,
      weekHasStarted: true,
      viewerHasSubmitted: false,
      weekClosedForPicks: false,
    }),
    false,
  );
  assert.equal(
    canViewMemberWeekPicks({
      viewerMemberId: 1,
      targetMemberId: 2,
      weekHasStarted: true,
      viewerHasSubmitted: false,
      weekClosedForPicks: true,
    }),
    true,
  );
});

test("allow-late hides the table after kickoff; first-kickoff does not", () => {
  assert.equal(
    shouldHideLeaguePicksTable(
      false,
      isWeekClosedForPicks(
        "allow_late_and_lock_after_start",
        games,
        firstKickoff,
      ),
    ),
    true,
  );
  assert.equal(
    shouldHideLeaguePicksTable(
      false,
      isWeekClosedForPicks("close_at_first_game_start", games, firstKickoff),
    ),
    false,
  );
});

test("first-kickoff late policy still uses the earliest game", () => {
  assert.deepEqual(
    getWeekPickDeadline("close_at_first_game_start", games),
    firstKickoff,
  );
  assert.equal(
    getWeekPickDeadline("allow_late_and_lock_after_start", games),
    null,
  );
});

test("first-kickoff weeks close at kickoff; per-game weeks stay open until every game starts", () => {
  assert.equal(
    isWeekClosedForPicks("close_at_first_game_start", games, firstKickoff),
    true,
  );
  assert.equal(
    isWeekClosedForPicks(
      "allow_late_and_lock_after_start",
      games,
      firstKickoff,
    ),
    false,
  );
  assert.equal(
    isWeekClosedForPicks(
      "allow_late_and_lock_after_start",
      games,
      laterKickoff,
    ),
    true,
  );
});
