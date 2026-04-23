import {
  buildPrefillFromPriorLeague,
  coerceLatePolicy,
  coerceReminderPolicy,
  getCreateLeagueNameError,
} from "@/lib/league/createLeagueForm";

describe("createLeagueForm helpers", () => {
  describe("getCreateLeagueNameError", () => {
    it("returns null for empty draft names", () => {
      expect(getCreateLeagueNameError("")).toBeNull();
      expect(getCreateLeagueNameError("   ")).toBeNull();
    });

    it("enforces minimum and maximum length constraints", () => {
      expect(getCreateLeagueNameError("Abc")).toBe(
        "League name must be at least 5 characters.",
      );
      expect(getCreateLeagueNameError("A".repeat(101))).toBe(
        "League name must be 100 characters or fewer.",
      );
      expect(getCreateLeagueNameError("League Name")).toBeNull();
    });
  });

  describe("policy coercion", () => {
    it("coerces known late policy values and falls back safely", () => {
      expect(coerceLatePolicy("allow_late_whole_week")).toBe("allow_late_whole_week");
      expect(coerceLatePolicy("close_at_first_game_start")).toBe(
        "close_at_first_game_start",
      );
      expect(coerceLatePolicy("unexpected_value")).toBe(
        "allow_late_and_lock_after_start",
      );
      expect(coerceLatePolicy(null)).toBe("allow_late_and_lock_after_start");
    });

    it("coerces reminder policy to explicit mobile values", () => {
      expect(coerceReminderPolicy("three_hours_before")).toBe("three_hours_before");
      expect(coerceReminderPolicy(null)).toBe("none");
    });
  });

  describe("buildPrefillFromPriorLeague", () => {
    it("builds mobile create-form defaults from a prior league template", () => {
      expect(
        buildPrefillFromPriorLeague({
          league_id: 42,
          late_policy: "close_at_first_game_start",
          reminder_policy: "three_hours_before",
          superbowl_competition: true,
        }),
      ).toEqual({
        priorLeagueId: "42",
        latePolicy: "close_at_first_game_start",
        reminderPolicy: "three_hours_before",
        superbowlCompetition: true,
      });
    });
  });
});
