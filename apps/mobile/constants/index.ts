const FALLBACK_CURRENT_SEASON = 2025;

function parseSeason(rawSeason: string | undefined) {
  if (!rawSeason) {
    return FALLBACK_CURRENT_SEASON;
  }

  const parsed = Number.parseInt(rawSeason, 10);
  if (Number.isFinite(parsed) && parsed >= 2000 && parsed <= 3000) {
    return parsed;
  }

  return FALLBACK_CURRENT_SEASON;
}

export const CURRENT_SEASON = parseSeason(
  process.env.EXPO_PUBLIC_CURRENT_SEASON,
);

// Keep DEFAULT_SEASON as a compatibility alias while moving callers to CURRENT_SEASON.
export const DEFAULT_SEASON = CURRENT_SEASON;

export const EASTERN_TIMEZONE = "America/New_York";
