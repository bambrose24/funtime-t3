export function withRankings<T>(
  sortedVals: Array<T>,
  valFn: (x: T) => number,
): Array<T & { rank: number }> {
  let runningRank = 1;
  const first = sortedVals.at(0);
  if (!first) {
    return [];
  }
  let prevScore = valFn(first);

  return sortedVals.map((v, idx) => {
    const currScore = valFn(v);

    if (currScore !== prevScore) {
      runningRank = idx + 1;
      prevScore = currScore;
    }

    return { ...v, rank: runningRank };
  });
}
