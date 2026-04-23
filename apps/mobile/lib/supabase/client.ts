import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { isInvalidRefreshTokenError } from "./errors";

export { isInvalidRefreshTokenError } from "./errors";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
const isServerWebRuntime =
  Platform.OS === "web" && typeof window === "undefined";

const serverStorage = (() => {
  const store = new Map<string, string>();
  return {
    getItem: async (key: string) => store.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: async (key: string) => {
      store.delete(key);
    },
  };
})();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isServerWebRuntime ? serverStorage : AsyncStorage,
    autoRefreshToken: !isServerWebRuntime,
    persistSession: !isServerWebRuntime,
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
