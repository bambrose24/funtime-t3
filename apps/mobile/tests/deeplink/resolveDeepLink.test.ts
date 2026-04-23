import { resolveDeepLink } from "@/lib/deeplink/resolveDeepLink";

describe("resolveDeepLink", () => {
  it("maps required play-funtime.com routes to mobile routes", () => {
    expect(resolveDeepLink("https://play-funtime.com/join-league/ABC123")).toEqual({
      href: "/join-league/ABC123",
      mode: "replace",
    });
    expect(resolveDeepLink("https://play-funtime.com/league/42")).toEqual({
      href: "/league/42",
      mode: "replace",
    });
    expect(resolveDeepLink("https://play-funtime.com/league/42/info")).toEqual({
      href: "/league/42?tab=info",
      mode: "replace",
    });
    expect(resolveDeepLink("https://play-funtime.com/settings")).toEqual({
      href: "/account",
      mode: "replace",
    });
    expect(
      resolveDeepLink("https://play-funtime.com/login?redirectTo=%2Fleague%2F42"),
    ).toEqual({
      href: "/auth?redirectTo=%2Fleague%2F42",
      mode: "replace",
    });
    expect(resolveDeepLink("https://play-funtime.com/admin")).toEqual({
      href: "/admin",
      mode: "replace",
    });
    expect(resolveDeepLink("https://play-funtime.com/forgot-password")).toEqual({
      href: "/forgot-password",
      mode: "replace",
    });
    expect(
      resolveDeepLink("https://play-funtime.com/confirm-reset-password"),
    ).toEqual({
      href: "/confirm-reset-password",
      mode: "replace",
    });
  });

  it("preserves league query parameters such as tab selection", () => {
    expect(resolveDeepLink("https://play-funtime.com/league/42?tab=picks")).toEqual({
      href: "/league/42?tab=picks",
      mode: "replace",
    });
    expect(
      resolveDeepLink("https://play-funtime.com/league/42?tab=leaderboard&week=1"),
    ).toEqual({
      href: "/league/42?tab=leaderboard&week=1",
      mode: "replace",
    });
  });

  it("normalizes auth callback links and requires a code", () => {
    expect(resolveDeepLink("https://play-funtime.com/auth/callback?code=abc123")).toEqual({
      href: "/auth/callback?code=abc123",
      mode: "replace",
    });
    expect(
      resolveDeepLink("https://play-funtime.com/auth/callback?code=abc123&next=/league/99"),
    ).toEqual({
      href: "/auth/callback?code=abc123&next=%2Fleague%2F99",
      mode: "replace",
    });
    expect(resolveDeepLink("https://play-funtime.com/auth/callback")).toBeNull();
  });

  it("normalizes recovery callback links from hash/session params", () => {
    expect(
      resolveDeepLink(
        "https://play-funtime.com/auth/callback#access_token=at123&refresh_token=rt456&type=recovery",
      ),
    ).toEqual({
      href: "/auth/callback?type=recovery&access_token=at123&refresh_token=rt456&flow=recovery",
      mode: "replace",
    });

    expect(
      resolveDeepLink("funtime://confirm-reset-password#access_token=at123&refresh_token=rt456"),
    ).toEqual({
      href: "/confirm-reset-password?access_token=at123&refresh_token=rt456",
      mode: "replace",
    });
  });

  it("handles custom scheme and expo dev /--/ path variants", () => {
    expect(resolveDeepLink("funtime://auth/callback?code=xyz")).toEqual({
      href: "/auth/callback?code=xyz",
      mode: "replace",
    });
    expect(resolveDeepLink("funtime://--/join-league/ABC123")).toEqual({
      href: "/join-league/ABC123",
      mode: "replace",
    });
  });

  it("routes root to /home and ignores unsupported paths", () => {
    expect(resolveDeepLink("https://play-funtime.com/")).toEqual({
      href: "/home",
      mode: "replace",
    });
    expect(resolveDeepLink("https://play-funtime.com/not-a-route")).toBeNull();
  });
});
