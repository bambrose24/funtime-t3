import { filterLeaguesByQuery } from "@/lib/home/filterLeaguesByQuery";

describe("filterLeaguesByQuery", () => {
  const leagues = [
    { league_id: 1, name: "Office Picks", season: 2025 },
    { league_id: 2, name: "Family League", season: 2025 },
    { league_id: 3, name: "Late Night Crew", season: 2024 },
  ];

  it("returns all leagues for an empty query", () => {
    expect(filterLeaguesByQuery(leagues, "")).toEqual(leagues);
    expect(filterLeaguesByQuery(leagues, "   ")).toEqual(leagues);
  });

  it("matches league names case-insensitively", () => {
    expect(filterLeaguesByQuery(leagues, "family")).toEqual([leagues[1]]);
    expect(filterLeaguesByQuery(leagues, "OFFICE")).toEqual([leagues[0]]);
  });

  it("returns only matching league names", () => {
    expect(filterLeaguesByQuery(leagues, "night")).toEqual([leagues[2]]);
    expect(filterLeaguesByQuery(leagues, "unknown")).toEqual([]);
  });
});
