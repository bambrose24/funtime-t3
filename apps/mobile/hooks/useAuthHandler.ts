import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { type Session } from "@supabase/supabase-js";
import {
  clearPersistedSupabaseSession,
  isInvalidRefreshTokenError,
  supabase,
} from "@/lib/supabase/client";
import { clientApi } from "@/lib/trpc/react";

const WEB_DEEP_LINK_HOSTS = new Set(["play-funtime.com", "www.play-funtime.com"]);
const WEB_PROTOCOLS = new Set(["http", "https"]);

type DeepLinkTarget = {
  href: string;
  mode: "push" | "replace";
};

const normalizePath = (path?: string | null) => {
  const withoutLeadingSlash = (path ?? "").replace(/^\/+/, "");
  if (!withoutLeadingSlash) {
    return "/";
  }
  return `/${withoutLeadingSlash}`;
};

const withQueryString = (path: string, query: URLSearchParams) => {
  const queryString = query.toString();
  return queryString.length > 0 ? `${path}?${queryString}` : path;
};

function resolveDeepLink(url: string): DeepLinkTarget | null {
  const parsed = new URL(url);
  const protocol = parsed.protocol.replace(":", "").toLowerCase();
  const host = parsed.hostname.toLowerCase();
  const searchParams = parsed.searchParams;

  let routePath = normalizePath(parsed.pathname);

  // Custom schemes like "funtime://auth/callback" encode route segment in hostname.
  if (!WEB_PROTOCOLS.has(protocol) && host) {
    routePath = normalizePath(`${host}${parsed.pathname}`);
  }

  // Expo dev URLs include "/--/" before the app route.
  routePath = routePath.replace(/^\/--\//, "/");

  if (WEB_DEEP_LINK_HOSTS.has(host)) {
    if (routePath === "/settings") {
      return { href: "/account", mode: "replace" };
    }
    if (routePath === "/login") {
      return { href: "/auth", mode: "replace" };
    }
  }

  if (routePath === "/auth/callback") {
    const code = searchParams.get("code");
    if (!code) {
      return null;
    }
    const query = new URLSearchParams({ code });
    const next = searchParams.get("next");
    if (next) {
      query.set("next", next);
    }
    return {
      href: withQueryString("/auth/callback", query),
      mode: "replace",
    };
  }

  const routablePaths = [
    "/",
    "/join-league",
    "/league/create",
    "/auth",
    "/signup",
    "/confirm-signup",
    "/account",
    "/admin",
  ];
  const prefixPaths = ["/join-league/", "/league/"];

  if (
    routablePaths.includes(routePath) ||
    prefixPaths.some((prefix) => routePath.startsWith(prefix))
  ) {
    if (routePath === "/") {
      return { href: "/home", mode: "replace" };
    }

    return {
      href: withQueryString(routePath, searchParams),
      mode: "replace",
    };
  }

  return null;
}

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
  const router = useRouter();
  const pendingDeepLinkRef = useRef<string | null>(null);
  const pathnameRef = useRef(pathname);
  const sessionRef = useRef(session);
  const initialDeepLinkHandledRef = useRef(false);

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
        if (target.mode === "replace") {
          if (!hasSession && !target.href.startsWith("/auth")) {
            pendingDeepLinkRef.current = target.href;
          }
          router.replace(target.href as any);
          return;
        }

        if (!hasSession && !target.href.startsWith("/auth")) {
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
    const inAuthScreen = route === "/auth" || route === "/signup";
    const inConfirmSignup = route === "/confirm-signup";
    const inAuthCallback = route.startsWith("/auth/callback");
    const inBootstrapRoute = route === "/";
    const inAuthFlow = inAuthScreen || inConfirmSignup;

    if (!hasSession) {
      if (!inAuthScreen && !inAuthCallback) {
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
    if (inAuthFlow || inAuthCallback || inBootstrapRoute) {
      const pendingDeepLink = pendingDeepLinkRef.current;
      pendingDeepLinkRef.current = null;
      router.replace((pendingDeepLink ?? "/home") as any);
    }
  }, [session, appSession?.dbUser, pathname, isLoading, isAppSessionLoading, router]);

  return {
    session,
    isLoading: isLoading || (Boolean(session) && isAppSessionLoading),
  };
}
