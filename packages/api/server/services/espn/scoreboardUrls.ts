export const ESPN_NFL_SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

export const REGULAR_SEASON_WEEK_COUNT = 18;
export const POSTSEASON_WEEKS = [1, 2, 3, 5] as const;

export function regularSeasonWeekScoreboardUrl(
  season: number,
  week: number,
): string {
  return `${ESPN_NFL_SCOREBOARD_URL}?limit=100&seasontype=2&week=${week}&season=${season}`;
}

export function postseasonWeekScoreboardUrl(
  season: number,
  week: number,
): string {
  return `${ESPN_NFL_SCOREBOARD_URL}?limit=100&seasontype=3&week=${week}&season=${season}`;
}

export function regularSeasonWeekScoreboardUrls(season: number): string[] {
  return Array.from({ length: REGULAR_SEASON_WEEK_COUNT }, (_, index) =>
    regularSeasonWeekScoreboardUrl(season, index + 1),
  );
}

export function postseasonWeekScoreboardUrls(season: number): string[] {
  return POSTSEASON_WEEKS.map((week) =>
    postseasonWeekScoreboardUrl(season, week),
  );
}
