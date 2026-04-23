import { useState, useEffect, useRef } from "react";
import { useGlobalSearchParams, usePathname, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { type Session } from "@supabase/supabase-js";
import {
  clearPersistedSupabaseSession,
  isInvalidRefreshTokenError,
  supabase,
} from "@/lib/supabase/client";
import { resolveDeepLink } from "@/lib/deeplink/resolveDeepLink";
import { clientApi } from "@/lib/trpc/react";

// Lightweight hook for just Supabase session state (for auth navigation logic)
export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const syncInitialSession = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          if (isInvalidRefreshTokenError(error)) {
            console.warn(
              "[Auth] Invalid refresh token during session bootstrap; clearing local auth state.",
            );
            await clearPersistedSupabaseSession("bootstrap:getSession");
          } else {
            console.error("[Auth] Failed to load session on startup.", error);
          }

          if (isActive) {
            setSession(null);
          }
          return;
        }

        if (isActive) {
          setSession(currentSession);
        }
      } catch (error) {
        if (isInvalidRefreshTokenError(error)) {
          console.warn(
            "[Auth] Invalid refresh token thrown during session bootstrap; clearing local auth state.",
          );
          await clearPersistedSupabaseSession("bootstrap:throw");
        } else {
          console.error("[Auth] Unexpected session bootstrap failure.", error);
        }

        if (isActive) {
          setSession(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void syncInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (
        event === "TOKEN_REFRESHED" &&
        !nextSession?.access_token &&
        !nextSession?.refresh_token
      ) {
        console.warn(
          "[Auth] TOKEN_REFRESHED emitted without tokens; forcing signed-out state.",
        );
      }

      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
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
  const pathname = usePathname();
  const globalSearchParams = useGlobalSearchParams<{ redirectTo?: string }>();
  const router = useRouter();
  const pendingDeepLinkRef = useRef<string | null>(null);
  const pathnameRef = useRef(pathname);
  const sessionRef = useRef(session);
  const initialDeepLinkHandledRef = useRef(false);
  const routeRedirectTo =
    typeof globalSearchParams.redirectTo === "string" &&
    globalSearchParams.redirectTo.length > 0
      ? (() => {
          try {
            return decodeURIComponent(globalSearchParams.redirectTo);
          } catch {
            return globalSearchParams.redirectTo;
          }
        })()
      : null;

  useEffect(() => {
    pathnameRef.current = pathname;
    sessionRef.current = session;
  }, [pathname, session]);

  // Handle deep links for auth flows
  useEffect(() => {
    let isActive = true;

    const handleDeepLink = (url: string) => {
      try {
        const target = resolveDeepLink(url);
        if (!target) {
          return;
        }

        const nextPathname = target.href.split("?")[0] ?? target.href;
        const currentPath = pathnameRef.current ?? "/";
        const currentPathname = currentPath.split("?")[0] ?? currentPath;
        if (nextPathname === currentPathname) {
          return;
        }

        const hasSession = Boolean(sessionRef.current);
        const isAuthSurface =
          target.href.startsWith("/auth") ||
          target.href.startsWith("/signup") ||
          target.href.startsWith("/forgot-password") ||
          target.href.startsWith("/confirm-signup") ||
          target.href.startsWith("/confirm-reset-password");
        if (target.mode === "replace") {
          if (!hasSession && !isAuthSurface) {
            pendingDeepLinkRef.current = target.href;
          }
          router.replace(target.href as any);
          return;
        }

        if (!hasSession && !isAuthSurface) {
          pendingDeepLinkRef.current = target.href;
        }
        router.push(target.href as any);
      } catch (error) {
        console.error("Failed to parse deep link", { url, error });
      }
    };

    // Handle initial deep link (app opened from link)
    if (!initialDeepLinkHandledRef.current) {
      initialDeepLinkHandledRef.current = true;
      Linking.getInitialURL()
        .then((url) => {
          if (isActive && url) {
            handleDeepLink(url);
          }
        })
        .catch((error) => {
          console.error("Failed to read initial deep link URL", error);
        });
    }

    // Handle deep links while app is running
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      isActive = false;
      subscription?.remove();
    };
  }, [router]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const hasSession = Boolean(session);
    const hasDbUser = Boolean(appSession?.dbUser);
    const waitingOnDbUser = hasSession && isAppSessionLoading;
    if (waitingOnDbUser) return;

    const route = pathname as string;
    const inAuthScreen =
      route === "/auth" ||
      route === "/signup" ||
      route === "/forgot-password";
    const inConfirmSignup = route === "/confirm-signup";
    const inConfirmResetPassword = route === "/confirm-reset-password";
    const inAuthCallback = route.startsWith("/auth/callback");
    const inBootstrapRoute = route === "/";
    const inAuthFlow = inAuthScreen || inConfirmSignup;

    if (!hasSession) {
      if (!inAuthScreen && !inAuthCallback && !inConfirmResetPassword) {
        const authHref =
          route && route !== "/"
            ? `/auth?redirectTo=${encodeURIComponent(route)}`
            : "/auth";
        router.replace(authHref as any);
      }
      return;
    }

    // Signed in but profile not created in app DB yet.
    if (!hasDbUser) {
      if (!inConfirmSignup && !inAuthCallback && !inConfirmResetPassword) {
        const confirmSignupHref = routeRedirectTo
          ? `/confirm-signup?redirectTo=${encodeURIComponent(routeRedirectTo)}`
          : "/confirm-signup";
        router.replace(confirmSignupHref as any);
      }
      return;
    }

    // Fully onboarded user should not remain on auth/onboarding screens.
    if (inAuthFlow || inAuthCallback || inBootstrapRoute) {
      const pendingDeepLink = pendingDeepLinkRef.current;
      pendingDeepLinkRef.current = null;
      router.replace((pendingDeepLink ?? routeRedirectTo ?? "/home") as any);
    }
  }, [
    appSession?.dbUser,
    isAppSessionLoading,
    isLoading,
    pathname,
    routeRedirectTo,
    router,
    session,
  ]);

  return {
    session,
    isLoading: isLoading || (Boolean(session) && isAppSessionLoading),
  };
}
