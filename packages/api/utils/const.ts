import { canCreateNextSeasonLeagues } from "./seasonRenewal";

export const CURRENT_SEASON = 2026;

// Keep DEFAULT_SEASON as a compatibility alias while moving callers to CURRENT_SEASON.
export const DEFAULT_SEASON = CURRENT_SEASON;

// Keep renewal availability tied to the configured season so the API, web,
// and mobile clients agree on the target year.
export const CAN_CREATE_NEXT_SEASON_LEAGUES =
  canCreateNextSeasonLeagues(CURRENT_SEASON);

export const EASTERN_TIMEZONE = "America/New_York";
