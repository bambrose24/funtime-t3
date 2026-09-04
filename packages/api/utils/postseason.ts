export function isRegularSeasonComplete(
  totalGames: number,
  completedGames: number,
) {
  return totalGames > 0 && completedGames === totalGames;
}
