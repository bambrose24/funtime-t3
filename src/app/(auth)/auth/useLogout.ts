"use client";

import { useCallback } from "react";
import { clientApi } from "~/trpc/react";
import { createSupabaseBrowser } from "~/utils/supabase/client";

export function useLogout() {
  const utils = clientApi.useUtils();

  return useCallback(async () => {
    const clientSupabase = createSupabaseBrowser();
    const { error } = await clientSupabase.auth.signOut();
    void utils.invalidate();
    if (error) {
      throw error;
    }
    window.location.href = '/';
  }, [utils]);
}
