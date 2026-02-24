import { useState, useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import * as Linking from "expo-linking";
import { type Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { clientApi } from "@/lib/trpc/react";

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
  const { data: appSession, isLoading: isAppSessionLoading } =
    clientApi.session.current.useQuery(undefined, {
      enabled: !!session,
      retry: false,
      refetchOnWindowFocus: true,
    });
  const segments = useSegments();
  const router = useRouter();

  // Handle deep links for auth flows
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      const { path, queryParams } = Linking.parse(url);

      // Handle auth callback deep links (email confirmation)
      if ((path === "/auth/callback" || path === "auth/callback") && queryParams?.code) {
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

    const hasSession = Boolean(session);
    const hasDbUser = Boolean(appSession?.dbUser);
    const waitingOnDbUser = hasSession && isAppSessionLoading;
    if (waitingOnDbUser) return;

    const inAuthGroup =
      segments[0] === "auth" ||
      segments[0] === "signup";
    const inConfirmSignup = segments[0] === "confirm-signup";
    const inAuthCallback = segments[0] === "auth" && segments[1] === "callback";

    if (!hasSession) {
      if (!inAuthGroup && !inAuthCallback) {
        router.replace("/auth");
      }
      return;
    }

    // Signed in but profile not created in app DB yet.
    if (!hasDbUser) {
      if (!inConfirmSignup && !inAuthCallback) {
        router.replace("/confirm-signup");
      }
      return;
    }

    // Fully onboarded user should not remain on auth/onboarding screens.
    if (inAuthGroup || inConfirmSignup || inAuthCallback) {
      router.replace("/");
    }
  }, [session, appSession?.dbUser, segments, isLoading, isAppSessionLoading, router]);

  return {
    session,
    isLoading: isLoading || (Boolean(session) && isAppSessionLoading),
  };
}
