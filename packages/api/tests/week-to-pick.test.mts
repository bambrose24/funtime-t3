import assert from "node:assert/strict";
import test from "node:test";
import { getWeekToPick } from "../utils/weekToPick.ts";

const now = new Date("2026-09-13T17:00:00Z");
const week1Thursday = new Date("2026-09-10T00:20:00Z");
const week1Sunday = new Date("2026-09-14T17:00:00Z");
const week2Thursday = new Date("2026-09-17T00:20:00Z");
const week3Thursday = new Date("2026-09-24T00:20:00Z");
const schedule = [
  { week: 1, ts: week1Thursday },
  { week: 1, ts: week1Sunday },
  { week: 2, ts: week2Thursday },
  { week: 3, ts: week3Thursday },
];

test("before kickoff, the picker stays on the first unstarted week", () => {
  assert.equal(
    getWeekToPick(schedule, new Date(week1Thursday.getTime() - 1)),
    1,
  );
  assert.equal(getWeekToPick(schedule.slice(0, 2), week1Thursday), 1);
});

test("the first kickoff locks that week and advances to the next unstarted week", () => {
  assert.equal(getWeekToPick(schedule, week1Thursday), 2);
  assert.equal(getWeekToPick(schedule, now), 2);
  assert.equal(getWeekToPick(schedule, week1Sunday), 2);
});

test("the picker stays on a started week only when no later week exists", () => {
  assert.equal(getWeekToPick(schedule.slice(0, 2), now), 1);
  assert.equal(getWeekToPick(schedule, new Date("2026-09-25")), 3);
});

test("an empty schedule still has a week-1 target", () => {
  assert.equal(getWeekToPick([], now), 1);
});
