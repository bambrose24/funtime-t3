import {
  canCreateNextSeasonLeagues,
  getRenewalIneligibilityReason,
} from "../../../../packages/api/utils/seasonRenewal";

describe("season renewal eligibility", () => {
  it("does not open self-service renewals during the 2026 season", () => {
    expect(canCreateNextSeasonLeagues(2026)).toBe(false);
    expect(canCreateNextSeasonLeagues(2027)).toBe(true);
  });

  it("requires the prior league to be completed once renewals are open", () => {
    expect(
      getRenewalIneligibilityReason(
        { season: 2026, status: "in_progress" },
        { targetSeason: 2027, renewalsOpen: true },
      ),
    ).toBe("Only completed leagues can be renewed");

    expect(
      getRenewalIneligibilityReason(
        { season: 2026, status: "completed" },
        { targetSeason: 2027, renewalsOpen: true },
      ),
    ).toBeNull();
  });

  it("does not allow a current-season league to be renewed", () => {
    expect(
      getRenewalIneligibilityReason(
        { season: 2027, status: "completed" },
        { targetSeason: 2027, renewalsOpen: true },
      ),
    ).toBe("Only prior-season leagues can be renewed");
  });
});
