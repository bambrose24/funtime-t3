export type MobileLatePolicy =
  | "allow_late_whole_week"
  | "allow_late_and_lock_after_start"
  | "close_at_first_game_start";

export type MobileReminderPolicy = "three_hours_before" | "none";

export const MOBILE_LATE_POLICY_LABELS: Record<MobileLatePolicy, string> = {
  allow_late_whole_week: "Allow Late Picks (All Week)",
  allow_late_and_lock_after_start: "Allow Late Picks",
  close_at_first_game_start: "Close at First Kickoff",
};

const DEFAULT_LATE_POLICY: MobileLatePolicy = "allow_late_and_lock_after_start";
const MAX_LEAGUE_NAME_LENGTH = 100;

type PriorLeagueTemplate = {
  league_id: number;
  late_policy: string | null;
  reminder_policy: string | null;
  superbowl_competition: boolean | null;
};

export function getCreateLeagueNameError(rawName: string): string | null {
  const name = rawName.trim();
  if (name.length === 0) {
    return null;
  }
  if (name.length < 5) {
    return "League name must be at least 5 characters.";
  }
  if (name.length > 100) {
    return "League name must be 100 characters or fewer.";
  }
  return null;
}

export function coerceLatePolicy(
  policy: string | null | undefined,
): MobileLatePolicy {
  if (!policy) {
    return DEFAULT_LATE_POLICY;
  }
  if (policy in MOBILE_LATE_POLICY_LABELS) {
    return policy as MobileLatePolicy;
  }
  return DEFAULT_LATE_POLICY;
}

export function coerceReminderPolicy(
  policy: string | null | undefined,
): MobileReminderPolicy {
  return policy === "three_hours_before" ? "three_hours_before" : "none";
}

export function buildPrefillFromPriorLeague(league: PriorLeagueTemplate) {
  return {
    priorLeagueId: league.league_id.toString(),
    latePolicy: coerceLatePolicy(league.late_policy),
    reminderPolicy: coerceReminderPolicy(league.reminder_policy),
    superbowlCompetition: Boolean(league.superbowl_competition),
  };
}

export function getSuggestedRenewalLeagueName(rawName: string, season: number) {
  const trimmed = rawName.trim();
  const withoutTrailingYear = trimmed
    .replace(/\s*(?:-\s*)?\(?20\d{2}\)?\s*$/, "")
    .trim();
  const baseName = withoutTrailingYear || trimmed || "Funtime League";
  const seasonSuffix = ` ${season}`;
  const maxBaseLength = MAX_LEAGUE_NAME_LENGTH - seasonSuffix.length;
  const trimmedBaseName =
    baseName.length > maxBaseLength
      ? baseName.slice(0, maxBaseLength).trim()
      : baseName;
  const suggestedName = `${trimmedBaseName || "Funtime League"}${seasonSuffix}`;

  if (suggestedName.length <= MAX_LEAGUE_NAME_LENGTH) {
    return suggestedName;
  }

  return suggestedName.slice(0, MAX_LEAGUE_NAME_LENGTH);
}
