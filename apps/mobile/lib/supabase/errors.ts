import { type AuthError } from "@supabase/supabase-js";

const INVALID_REFRESH_TOKEN_CODES = new Set([
  "refresh_token_not_found",
  "session_not_found",
  "refresh_token_expired",
]);

const INVALID_REFRESH_TOKEN_PATTERN =
  /(invalid refresh token|session not found|refresh token.*(not found|expired|revoked|already used))/i;

type AuthErrorLike = Pick<AuthError, "code" | "message"> & {
  status?: number;
};

function toAuthErrorLike(error: unknown): AuthErrorLike | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const maybeError = error as Record<string, unknown>;
  const message = maybeError.message;
  const code = maybeError.code;
  const status = maybeError.status;

  return {
    message: typeof message === "string" ? message : "",
    code: typeof code === "string" ? code : undefined,
    status: typeof status === "number" ? status : undefined,
  };
}

export function isInvalidRefreshTokenError(error: unknown): boolean {
  const authError = toAuthErrorLike(error);
  if (!authError) {
    return false;
  }

  if (authError.code && INVALID_REFRESH_TOKEN_CODES.has(authError.code)) {
    return true;
  }

  return INVALID_REFRESH_TOKEN_PATTERN.test(authError.message ?? "");
}
