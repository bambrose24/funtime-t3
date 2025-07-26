import { useState, useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import * as Linking from "expo-linking";
import { type Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

// Lightweight hook for just Supabase session state (for auth navigation logic)
export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, isLoading };
}

/**
 * Main auth handler hook that manages:
 * - Supabase session state (for auth navigation)
 * - Deep link handling for email confirmations
 * - Auth-based navigation routing
 */
export function useAuthHandler() {
  const { session, isLoading } = useSupabaseSession();
  const segments = useSegments();
  const router = useRouter();

  // Handle deep links for auth flows
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      const { path, queryParams } = Linking.parse(url);

      // Handle auth callback deep links (email confirmation)
      if (path === "/auth/callback" && queryParams?.code) {
        const next = queryParams.next ? `&next=${queryParams.next}` : "";
        router.push(`/auth/callback?code=${queryParams.code}${next}` as any);
      }
    };

    // Handle initial deep link (app opened from link)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Handle deep links while app is running
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, [router]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup =
      segments[0] === "auth" ||
      segments[0] === "signup" ||
      segments[0] === "confirm-signup";

    if (session && inAuthGroup) {
      // User is signed in but on auth page, redirect to main app
      router.replace("/");
    } else if (!session && !inAuthGroup) {
      // User is not signed in and not on auth page, redirect to auth
      router.replace("/auth");
    }
  }, [session, segments, isLoading]);

  return {
    session,
    isLoading,
  };
}
