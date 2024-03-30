/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { env } from "~/env";
import {
  createServerClient as supabaseCreateServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";

export const supabaseServer = () => {
  const cookieStore = cookies();
  return supabaseCreateServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          console.log(`trying to get cookie with name ${name}`);
          const res = cookieStore.get(name)?.value;
          console.log(`got cookie value ${res} for name ${name}`);
          return res;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
