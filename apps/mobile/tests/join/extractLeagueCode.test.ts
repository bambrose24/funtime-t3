import { extractLeagueCode } from "@/lib/join/extractLeagueCode";

describe("extractLeagueCode", () => {
  it("returns plain league codes unchanged", () => {
    expect(extractLeagueCode("ABC123")).toBe("ABC123");
    expect(extractLeagueCode("  ABC123  ")).toBe("ABC123");
  });

  it("extracts league codes from canonical web URLs", () => {
    expect(extractLeagueCode("https://play-funtime.com/join-league/ABC123")).toBe(
      "ABC123",
    );
    expect(
      extractLeagueCode("https://www.play-funtime.com/join-league/ABC123/"),
    ).toBe("ABC123");
  });

  it("strips query/hash noise from pasted URLs and codes", () => {
    expect(
      extractLeagueCode(
        "https://play-funtime.com/join-league/ABC123?utm_source=test#invite",
      ),
    ).toBe("ABC123");
    expect(extractLeagueCode("ABC123?utm_source=test#invite")).toBe("ABC123");
  });

  it("supports custom-scheme and expo-dev join paths", () => {
    expect(extractLeagueCode("funtime://join-league/ABC123")).toBe("ABC123");
    expect(extractLeagueCode("funtime://--/join-league/ABC123?ref=push")).toBe(
      "ABC123",
    );
  });

  it("supports /join-league?code=... query links", () => {
    expect(extractLeagueCode("https://play-funtime.com/join-league?code=ABC123")).toBe(
      "ABC123",
    );
    expect(extractLeagueCode("/join-league?code=ABC123")).toBe("ABC123");
  });

  it("returns empty string for empty input", () => {
    expect(extractLeagueCode("")).toBe("");
    expect(extractLeagueCode("   ")).toBe("");
  });
});
