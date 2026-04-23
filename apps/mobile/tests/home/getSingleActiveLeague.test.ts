import { getSingleActiveLeague } from "@/lib/home/getSingleActiveLeague";

describe("getSingleActiveLeague", () => {
  it("returns null when there are no leagues", () => {
    expect(getSingleActiveLeague([], 2025)).toBeNull();
    expect(getSingleActiveLeague(null, 2025)).toBeNull();
    expect(getSingleActiveLeague(undefined, 2025)).toBeNull();
  });

  it("returns the active league when exactly one league matches season", () => {
    const leagues = [
      { league_id: 10, season: 2024, name: "Prior League" },
      { league_id: 42, season: 2025, name: "Only Active League" },
    ];

    expect(getSingleActiveLeague(leagues, 2025)).toEqual(leagues[1]);
  });

  it("returns null when there are multiple active leagues for the season", () => {
    const leagues = [
      { league_id: 1, season: 2025 },
      { league_id: 2, season: 2025 },
    ];

    expect(getSingleActiveLeague(leagues, 2025)).toBeNull();
  });

  it("returns null when no league matches the requested season", () => {
    const leagues = [
      { league_id: 1, season: 2023 },
      { league_id: 2, season: 2024 },
    ];

    expect(getSingleActiveLeague(leagues, 2025)).toBeNull();
  });
});
