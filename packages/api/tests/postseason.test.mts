import assert from "node:assert/strict";
import test from "node:test";

import { isRegularSeasonComplete } from "../utils/postseason.ts";

test("postseason sync stays closed without a full regular-season schedule", () => {
  assert.equal(isRegularSeasonComplete(0, 0), false);
});

test("postseason sync stays closed while regular-season games remain", () => {
  assert.equal(isRegularSeasonComplete(272, 271), false);
});

test("postseason sync opens once every regular-season game is final", () => {
  assert.equal(isRegularSeasonComplete(272, 272), true);
});
