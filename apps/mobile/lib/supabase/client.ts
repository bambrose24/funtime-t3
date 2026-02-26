import "react-native-url-polyfill/auto";
import { createClient, type AuthError } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

const INVALID_REFRESH_TOKEN_CODES = new Set([
  "refresh_token_not_found",
  "session_not_found",
  "refresh_token_expired",
]);

const INVALID_REFRESH_TOKEN_PATTERN =
  /(invalid refresh token|session not found|refresh token.*(not found|expired|revoked|already used))/i;

let isClearingPersistedSession = false;

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

export async function clearPersistedSupabaseSession(context: string) {
  if (isClearingPersistedSession) {
    return;
  }

  isClearingPersistedSession = true;
  try {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error && !isInvalidRefreshTokenError(error)) {
      console.error(
        `[Auth] Failed to clear persisted Supabase session (${context})`,
        error,
      );
    }
  } catch (error) {
    console.error(
      `[Auth] Unexpected error while clearing persisted Supabase session (${context})`,
      error,
    );
  } finally {
    isClearingPersistedSession = false;
  }
}
