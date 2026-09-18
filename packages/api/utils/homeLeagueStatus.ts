import { getWeekPickDeadline, isPickLocked } from "./pickPermissions";
import { getWeekToPick } from "./weekToPick";

type ScheduledGame = { week: number; ts: Date; done: boolean | null };

export function getHomeLeagueStatus(
  schedule: readonly ScheduledGame[],
  submittedWeeks: ReadonlySet<number>,
  latePolicy: string | null,
  now: Date,
) {
  if (!schedule.length) {
    return { state: "no_schedule" as const, week: null };
  }
  const ordered = [...schedule].sort((a, b) => a.ts.getTime() - b.ts.getTime());
  const week = getWeekToPick(ordered, now);
  if (ordered.every((game) => game.done)) {
    return { state: "season_over" as const, week };
  }
  if (submittedWeeks.has(week)) {
    return { state: "submitted" as const, week };
  }
  const weekGames = ordered.filter((game) => game.week === week);
  const deadline = getWeekPickDeadline(latePolicy, weekGames);
  const closed = deadline
    ? isPickLocked(deadline, now)
    : !weekGames.some((game) => game.ts > now);
  return { state: closed ? ("closed" as const) : ("needed" as const), week };
}
