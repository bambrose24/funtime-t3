/** The pick page shows the next week that has not started. */
export function getWeekToPick(
  schedule: readonly { week: number; ts: Date }[],
  now: Date,
) {
  if (!schedule.length) {
    return 1;
  }
  const startedWeeks = new Set(
    schedule.filter((game) => game.ts <= now).map((game) => game.week),
  );
  const weeks = [...new Set(schedule.map((game) => game.week))].sort(
    (a, b) => a - b,
  );
  return weeks.find((week) => !startedWeeks.has(week)) ?? weeks.at(-1)!;
}
