import assert from "node:assert/strict";
import test from "node:test";

import {
  POSTSEASON_WEEKS,
  REGULAR_SEASON_WEEK_COUNT,
  postseasonWeekScoreboardUrls,
  regularSeasonWeekScoreboardUrls,
} from "../server/services/espn/scoreboardUrls.ts";

test("regular-season scoreboard URLs request each week instead of a date range", () => {
  const urls = regularSeasonWeekScoreboardUrls(2026);
  assert.equal(urls.length, REGULAR_SEASON_WEEK_COUNT);
  for (const [index, url] of urls.entries()) {
    assert.match(url, /[?&]seasontype=2(?:&|$)/);
    assert.match(url, new RegExp(`[?&]week=${index + 1}(?:&|$)`));
    assert.match(url, /[?&]season=2026(?:&|$)/);
    assert.doesNotMatch(url, /dates=/);
  }
});

test("postseason scoreboard URLs request playoff weeks and skip the Pro Bowl", () => {
  const urls = postseasonWeekScoreboardUrls(2026);
  assert.deepEqual(
    urls.map((url) => Number(new URL(url).searchParams.get("week"))),
    [...POSTSEASON_WEEKS],
  );
  for (const url of urls) {
    assert.match(url, /[?&]seasontype=3(?:&|$)/);
    assert.match(url, /[?&]season=2026(?:&|$)/);
    assert.doesNotMatch(url, /dates=/);
    assert.doesNotMatch(url, /[?&]week=4(?:&|$)/);
  }
});
