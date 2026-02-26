import { isInvalidRefreshTokenError } from "@/lib/supabase/errors";

describe("isInvalidRefreshTokenError", () => {
  it("returns true for known Supabase invalid-refresh error codes", () => {
    expect(
      isInvalidRefreshTokenError({
        code: "refresh_token_not_found",
        message: "Refresh Token Not Found",
      }),
    ).toBe(true);
  });

  it("returns true when the message matches known invalid-refresh patterns", () => {
    expect(
      isInvalidRefreshTokenError({
        message: "AuthApiError: Invalid Refresh Token: Refresh token expired",
      }),
    ).toBe(true);
  });

  it("returns false for unrelated errors", () => {
    expect(
      isInvalidRefreshTokenError({
        code: "unexpected_error",
        message: "Something else failed",
      }),
    ).toBe(false);
    expect(isInvalidRefreshTokenError(null)).toBe(false);
    expect(isInvalidRefreshTokenError("invalid refresh token")).toBe(false);
  });
});
