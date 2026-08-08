"use client";

import { useCallback } from "react";
import { createSupabaseBrowser } from "~/utils/supabase/client";

export function useLogout() {
  return useCallback(async () => {
    const clientSupabase = createSupabaseBrowser();
    const { error } = await clientSupabase.auth.signOut();
    if (error) {
      throw error;
    }
    window.location.href = "/login";
  }, []);
}
