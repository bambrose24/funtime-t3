// NativeWind CSS
import "../global.css";

// Hermes doesn't support structuredClone, so we need to polyfill it for supabase to work
// Attach the polyfill as a Global function
import structuredClone from "@ungap/structured-clone";
if (!("structuredClone" in globalThis)) {
  // @ts-ignore this is a global polyfill on purpose
  globalThis.structuredClone = structuredClone;
}

import * as SplashScreen from "expo-splash-screen";

// Keep the native splash visible until fonts, cache restore, and session resolve
// (or the hard timeout fires). Must run at module scope before first paint.
void SplashScreen.preventAutoHideAsync().catch(() => {
  // Expo Go / web may reject; ignore.
});

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "../lib/useColorScheme";
import { NAV_THEME } from "../lib/constants";
import { TRPCReactProvider } from "@/lib/trpc/react";
import LoadingScreen from "@/components/LoadingScreen";
import { useColdStartPrefetch } from "@/hooks/useColdStartPrefetch";
import { useCacheDebugger } from "@/hooks/useCacheDebugger";
import { useAuthHandler } from "@/hooks/useAuthHandler";
import { usePushNotificationRegistration } from "@/hooks/usePushNotificationRegistration";
import { PostHogProvider } from "@/providers/PostHogProvider";
import {
  shouldHideSplash,
  SPLASH_TIMEOUT_MS,
} from "@/lib/app/splashGate";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { installGlobalErrorHandlers } from "@/lib/app/crashReporting";
import { getQueryClient } from "@/lib/trpc/react";
import { removePersistedQueryCache } from "@/lib/trpc/persisted-cache";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

function AppContent({
  fontsLoaded,
  cacheRestored,
  timedOut,
}: {
  fontsLoaded: boolean;
  cacheRestored: boolean;
  timedOut: boolean;
}) {
  const { isDarkColorScheme } = useColorScheme();

  // Handle all auth logic (session, deep links, navigation)
  const { session, isLoading } = useAuthHandler();
  const sessionResolved = !isLoading;
  const splashHiddenRef = useRef(false);

  useEffect(() => {
    if (splashHiddenRef.current) {
      return;
    }
    if (
      !shouldHideSplash({
        fontsLoaded,
        cacheRestored,
        sessionResolved,
        timedOut,
      })
    ) {
      return;
    }
    splashHiddenRef.current = true;
    void SplashScreen.hideAsync().catch(() => {
      // Already hidden or unavailable.
    });
  }, [cacheRestored, fontsLoaded, sessionResolved, timedOut]);

  // Register and refresh Expo push token once user session is active.
  usePushNotificationRegistration(Boolean(session));

  // Prefetch essential data on cold start
  useColdStartPrefetch(session, isLoading);

  // Always call; no-ops outside __DEV__.
  useCacheDebugger();

  // Show loading screen while checking authentication (under the splash until hide).
  if (isLoading) {
    return (
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <LoadingScreen />
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
      </ThemeProvider>
    );
  }

  // Show router with all screens available
  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen name="league/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const hasMounted = useRef(false);
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);
  const [cacheRestored, setCacheRestored] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const onCacheRestored = useCallback(() => {
    setCacheRestored(true);
  }, []);

  useEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setTimedOut(true);
    }, SPLASH_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    installGlobalErrorHandlers();
  }, []);

  const fontsLoaded = loaded && isColorSchemeLoaded;

  const handleBoundaryReset = useCallback(async () => {
    const queryClient = getQueryClient();
    queryClient.clear();
    await removePersistedQueryCache();
  }, []);

  // Always mount the tree behind the native splash — never return null here.
  return (
    <PostHogProvider>
      <ErrorBoundary onReset={handleBoundaryReset}>
        <TRPCReactProvider onCacheRestored={onCacheRestored}>
          <AppContent
            fontsLoaded={fontsLoaded}
            cacheRestored={cacheRestored}
            timedOut={timedOut}
          />
        </TRPCReactProvider>
      </ErrorBoundary>
    </PostHogProvider>
  );
}
