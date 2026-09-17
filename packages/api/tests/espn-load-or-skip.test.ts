import { expect, test } from "bun:test";
import { loadRegularSeasonEspnGames } from "../server/services/espn/loadRegularSeasonOrSkip";

test("returns regular-season games and keeps postseason out", async () => {
  const result = await loadRegularSeasonEspnGames(async () => [
    { id: "1", season: { type: 2 } },
    { id: "2", season: { type: 3 } },
    { id: "3", season: { type: 2 } },
  ]);

  expect(result).toEqual({
    espnGames: [
      { id: "1", season: { type: 2 } },
      { id: "3", season: { type: 2 } },
    ],
    skippedEspn: false,
    totalFetched: 3,
  });
});

test("skips ESPN instead of throwing so cron can keep using DB games", async () => {
  const result = await loadRegularSeasonEspnGames(async () => {
    throw new Error("Failed to get events endpoint");
  });

  expect(result.espnGames).toEqual([]);
  expect(result.skippedEspn).toBe(true);
  expect(result.totalFetched).toBe(0);
  expect(result.error).toBeInstanceOf(Error);
  expect((result.error as Error).message).toBe("Failed to get events endpoint");
});
