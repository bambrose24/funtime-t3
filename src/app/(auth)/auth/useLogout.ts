"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { createSupabaseBrowser } from "~/utils/supabase/client";

export function useLogout() {
  const router = useRouter();

  return useCallback(async () => {
    const clientSupabase = createSupabaseBrowser();
    const { error } = await clientSupabase.auth.signOut();
    if (error) {
      throw error;
    }
    router.push("/login");
  }, [router]);
}
