import { isValidTiebreakerScoreInput } from "@funtime/api/utils/pickValidation";

describe("isValidTiebreakerScoreInput", () => {
  it.each(["1", "40", "200"])("accepts inclusive bound %s", (val) => {
    expect(isValidTiebreakerScoreInput(val)).toBe(true);
  });

  it.each(["0", "-1", "201", "1.5", "abc", ""])(
    "rejects out-of-range or non-integer %s",
    (val) => {
      expect(isValidTiebreakerScoreInput(val)).toBe(false);
    },
  );
});
