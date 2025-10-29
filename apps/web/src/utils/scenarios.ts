import { type RouterOutputs } from "~/trpc/types";

type PickSummary = RouterOutputs["league"]["picksSummary"][number];

export interface InRunningOptions {
  remainingGamesCount: number;
  // Future options for more complex logic
  // tiebreakerWeight?: number;
  // headToHead?: boolean;
  // playoffSeeding?: boolean;
}

/**
 * Determines who is "in the running" to win the week.
 * Currently implements simple logic: people within n picks of the leader,
 * where n is the number of remaining games.
 *
 * This function is designed to be extended with more complex logic later.
 */
export function getInRunningPeople(
  picksSummary: PickSummary[],
  options: InRunningOptions,
): PickSummary[] {
  const { remainingGamesCount } = options;

  if (remainingGamesCount === 0) return [];

  // Find the current leader (highest correct picks)
  const sortedByCorrect = [...picksSummary].sort(
    (a, b) => b.correctPicks - a.correctPicks,
  );
  const leaderCorrectPicks = sortedByCorrect[0]?.correctPicks || 0;

  // Someone is "in the running" if they can catch up to the leader
  // by getting all remaining games correct
  const maxPossibleCatchup = remainingGamesCount;
  const cutoffScore = leaderCorrectPicks - maxPossibleCatchup;

  return picksSummary.filter((pick) => {
    // Must have made picks
    if (pick.picks.length === 0) return false;

    // Must be within reach of the leader
    return pick.correctPicks >= cutoffScore;
  });
}

/**
 * Future function for more complex "in the running" logic
 * This is a placeholder for when we want to add:
 * - Tiebreaker considerations
 * - Head-to-head records
 * - Playoff seeding implications
 * - Multiple tiebreaker scenarios
 */
export function getInRunningPeopleAdvanced(
  picksSummary: PickSummary[],
  options: InRunningOptions & {
    // Future advanced options
    considerTiebreakers?: boolean;
    headToHeadWeight?: number;
    playoffImplications?: boolean;
  },
): PickSummary[] {
  // For now, use the simple logic
  // This will be expanded later with more complex scenarios
  return getInRunningPeople(picksSummary, {
    remainingGamesCount: options.remainingGamesCount,
  });
}

