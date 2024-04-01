import { createBrowserClient } from "@supabase/ssr";
import { env } from "~/env";

export const clientSupabase = createBrowserClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
