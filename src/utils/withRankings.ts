export function withRankings<T>(
  sortedVals: Array<T>,
  valFn: (x: T) => number,
): Array<T & { rank: number }> {
  let runningRank = 1;
  let prevScore: number | undefined = undefined;
  return sortedVals.map((v, idx) => {
    if (idx === 0) {
      return { ...v, rank: runningRank };
    }
    const currScore = valFn(sortedVals[idx]!);

    if (currScore !== prevScore) {
      runningRank = idx + 1;
      prevScore = currScore;
    }

    return { ...v, rank: runningRank };
  });
}
