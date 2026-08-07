const FALLBACK_CURRENT_SEASON = 2026;

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
  process.env.FUNTIME_CURRENT_SEASON ?? process.env.NEXT_PUBLIC_CURRENT_SEASON,
);

// Keep DEFAULT_SEASON as a compatibility alias while moving callers to CURRENT_SEASON.
export const DEFAULT_SEASON = CURRENT_SEASON;

// Self-service renewals are intentionally a 2027-season feature. Keeping this
// tied to the configured season means the window opens during the normal
// preseason season rollover, rather than immediately after a league ends.
export const CAN_CREATE_NEXT_SEASON_LEAGUES =
  canCreateNextSeasonLeagues(CURRENT_SEASON);

export const EASTERN_TIMEZONE = "America/New_York";
import { canCreateNextSeasonLeagues } from "./seasonRenewal";
