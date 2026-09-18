import assert from "node:assert/strict";
import test from "node:test";
import {
  canViewMemberWeekPicks,
  getWeekPickDeadline,
  hasWeekKickedOff,
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

test("viewers see their own row before kickoff and everyone after", () => {
  assert.equal(canViewMemberWeekPicks(1, 1, false), true);
  assert.equal(canViewMemberWeekPicks(1, 2, false), false);
  assert.equal(canViewMemberWeekPicks(1, 2, true), true);
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
