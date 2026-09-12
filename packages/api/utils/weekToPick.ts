/** Match the editor: advance only when the next kickoff is in the next week. */
export function getWeekToPick(
  mostRecentStartedWeek: number | undefined,
  nextGameWeek: number | undefined,
) {
  const week = mostRecentStartedWeek ?? nextGameWeek ?? 1;
  return nextGameWeek === week + 1 ? week + 1 : week;
}
