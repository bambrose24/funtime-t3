import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isInvalidRefreshTokenError } from "./errors";

export { isInvalidRefreshTokenError } from "./errors";

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

let isClearingPersistedSession = false;

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
