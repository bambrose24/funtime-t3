import { expect, test } from "bun:test";
import { ESPNClient } from "../server/services/espn/client";
import {
  POSTSEASON_WEEKS,
  REGULAR_SEASON_WEEK_COUNT,
  postseasonWeekScoreboardUrl,
  regularSeasonWeekScoreboardUrl,
} from "../server/services/espn/scoreboardUrls";

// Isolated Bun process so router tests cannot leak E2E_MODE into this file.
process.env.E2E_MODE = "0";
import {
  POSTSEASON_WEEKS,
  REGULAR_SEASON_WEEK_COUNT,
  postseasonWeekScoreboardUrl,
  regularSeasonWeekScoreboardUrl,
} from "../server/services/espn/scoreboardUrls";

test("getGamesBySeason fetches weeks 1-18 and never a date-range scoreboard", async () => {
  const urls: string[] = [];
  const client = new ESPNClient(async (url) => {
    urls.push(url);
    return { events: [] };
  });

  const events = await client.getGamesBySeason({ season: 2026 });

  expect(events).toEqual([]);
  expect(urls).toEqual(
    Array.from({ length: REGULAR_SEASON_WEEK_COUNT }, (_, index) =>
      regularSeasonWeekScoreboardUrl(2026, index + 1),
    ),
  );
  expect(urls.every((url) => !url.includes("dates="))).toBe(true);
});

test("getPostseasonGames fetches playoff weeks without a date range", async () => {
  const urls: string[] = [];
  const client = new ESPNClient(async (url) => {
    urls.push(url);
    return { events: [] };
  });

  const events = await client.getPostseasonGames({ season: 2025 });

  expect(events).toEqual([]);
  expect(urls).toEqual(
    POSTSEASON_WEEKS.map((week) => postseasonWeekScoreboardUrl(2025, week)),
  );
  expect(urls.every((url) => !url.includes("dates="))).toBe(true);
});
