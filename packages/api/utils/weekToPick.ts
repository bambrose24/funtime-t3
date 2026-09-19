import { hasWeekKickedOff, isWeekClosedForPicks } from "./pickPermissions";

type WeekToPickGame = { week: number; ts: Date };

/**
 * Pick target from kickoff time, league late policy, and this person's picks.
 * Unstarted weeks stay the target even after a submit. A started week stays
 * only while it still accepts picks and this person has not submitted it.
 */
export function getWeekToPick(
  schedule: readonly WeekToPickGame[],
  {
    now,
    policy,
    submittedWeeks,
  }: {
    now: Date;
    policy: string | null | undefined;
    submittedWeeks: ReadonlySet<number>;
  },
) {
  if (!schedule.length) {
    return 1;
  }
  const weeks = [...new Set(schedule.map((game) => game.week))].sort(
    (a, b) => a - b,
  );
  for (const week of weeks) {
    const weekGames = schedule.filter((game) => game.week === week);
    if (isWeekClosedForPicks(policy, weekGames, now)) {
      continue;
    }
    if (!hasWeekKickedOff(weekGames, now) || !submittedWeeks.has(week)) {
      return week;
    }
  }
  return weeks.at(-1)!;
}
