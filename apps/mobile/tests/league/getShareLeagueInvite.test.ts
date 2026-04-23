import { getShareLeagueInvite } from "@/lib/league/getShareLeagueInvite";

describe("getShareLeagueInvite", () => {
  it("returns null when league is missing or season already started", () => {
    expect(getShareLeagueInvite(null)).toBeNull();
    expect(
      getShareLeagueInvite({
        name: "Started League",
        share_code: "ABC123",
        status: "in_progress",
      }),
    ).toBeNull();
  });

  it("returns null when share code is unavailable", () => {
    expect(
      getShareLeagueInvite({
        name: "League",
        share_code: "   ",
        status: "not_started",
      }),
    ).toBeNull();
  });

  it("builds share URL/message with normalized code and base URL", () => {
    expect(
      getShareLeagueInvite(
        {
          name: "  Friday League  ",
          share_code: "  JOINME  ",
          status: "not_started",
        },
        "https://play-funtime.com/",
      ),
    ).toEqual({
      url: "https://play-funtime.com/join-league/JOINME",
      message:
        'Join "Friday League" on Funtime: https://play-funtime.com/join-league/JOINME',
    });
  });
});
