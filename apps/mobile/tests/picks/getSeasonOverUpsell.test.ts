import { getSeasonOverUpsell } from "@/lib/picks/getSeasonOverUpsell";

describe("getSeasonOverUpsell", () => {
  it("returns null when next league is missing", () => {
    expect(getSeasonOverUpsell(null)).toBeNull();
  });

  it("returns null when next league is not open for signup", () => {
    expect(
      getSeasonOverUpsell({
        name: "Funtime 2026",
        share_code: "ABCD1234",
        status: "in_progress",
      }),
    ).toBeNull();
  });

  it("returns null when share code is missing", () => {
    expect(
      getSeasonOverUpsell({
        name: "Funtime 2026",
        share_code: "   ",
        status: "not_started",
      }),
    ).toBeNull();
  });

  it("returns normalized upsell payload for an open next league", () => {
    expect(
      getSeasonOverUpsell({
        name: "  Funtime 2026  ",
        share_code: "  JOIN26  ",
        status: "not_started",
        season: 2026,
      }),
    ).toEqual({
      leagueName: "Funtime 2026",
      shareCode: "JOIN26",
      season: 2026,
    });
  });
});
