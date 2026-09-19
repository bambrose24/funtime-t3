import { expect, test } from "bun:test";
import { getWeekToPick } from "../utils/weekToPick";

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
const none = new Set<number>();
const pickedWeek1 = new Set([1]);
const allowLate = "allow_late_and_lock_after_start";
const firstKickoff = "close_at_first_game_start";

function weekToPick(
  games: readonly { week: number; ts: Date }[],
  at: Date,
  policy: string | null,
  submittedWeeks: ReadonlySet<number> = none,
) {
  return getWeekToPick(games, { now: at, policy, submittedWeeks });
}

test("an unstarted week stays the target even after picks exist", () => {
  const beforeThursday = new Date(week1Thursday.getTime() - 1);
  expect(weekToPick(schedule, beforeThursday, allowLate)).toBe(1);
  expect(weekToPick(schedule, beforeThursday, allowLate, pickedWeek1)).toBe(1);
  expect(weekToPick(schedule, beforeThursday, firstKickoff)).toBe(1);
  expect(weekToPick(schedule.slice(0, 2), week1Thursday, allowLate)).toBe(1);
});

test("allow-late stays on a started week until this person submits remaining games", () => {
  expect(weekToPick(schedule, week1Thursday, allowLate)).toBe(1);
  expect(weekToPick(schedule, now, allowLate)).toBe(1);
  expect(weekToPick(schedule, now, null)).toBe(1);
  expect(weekToPick(schedule, now, "allow_late_whole_week")).toBe(1);
  expect(weekToPick(schedule, week1Thursday, allowLate, pickedWeek1)).toBe(2);
  expect(weekToPick(schedule, now, allowLate, pickedWeek1)).toBe(2);
  expect(weekToPick(schedule, now, allowLate, new Set([2]))).toBe(1);
  expect(weekToPick(schedule, now, allowLate, new Set([1, 2]))).toBe(2);
});

test("first-kickoff advances at the week's first start, submitted or not", () => {
  expect(weekToPick(schedule, week1Thursday, firstKickoff)).toBe(2);
  expect(weekToPick(schedule, now, firstKickoff)).toBe(2);
  expect(weekToPick(schedule, now, firstKickoff, pickedWeek1)).toBe(2);
});

test("a fully locked week advances, and the last week is the fallback", () => {
  expect(weekToPick(schedule, week1Sunday, allowLate)).toBe(2);
  expect(weekToPick(schedule.slice(0, 2), now, allowLate)).toBe(1);
  expect(weekToPick(schedule, new Date("2026-09-25"), allowLate)).toBe(3);
});

test("an empty schedule still has a week-1 target", () => {
  expect(weekToPick([], now, allowLate)).toBe(1);
});
