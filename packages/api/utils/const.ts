import { canCreateNextSeasonLeagues } from "./seasonRenewal";

export const CURRENT_SEASON = 2027;

// Keep DEFAULT_SEASON as a compatibility alias while moving callers to CURRENT_SEASON.
export const DEFAULT_SEASON = CURRENT_SEASON;

// Self-service renewals are intentionally a 2027-season feature. Keeping this
// tied to the configured season means the window opens during the normal
// preseason season rollover, rather than immediately after a league ends.
export const CAN_CREATE_NEXT_SEASON_LEAGUES =
  canCreateNextSeasonLeagues(CURRENT_SEASON);

export const EASTERN_TIMEZONE = "America/New_York";
