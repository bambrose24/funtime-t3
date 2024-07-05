/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const supabaseServer = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          console.log("getting all cookies...");
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          console.log("setting all cookies...", cookiesToSet);
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
};
