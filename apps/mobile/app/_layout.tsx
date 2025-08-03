// NativeWind CSS
import "../global.css";

// Hermes doesn't support structuredClone, so we need to polyfill it for supabase to work
// Attach the polyfill as a Global function
import structuredClone from "@ungap/structured-clone";
if (!("structuredClone" in globalThis)) {
  // @ts-ignore this is a global polyfill on purpose
  globalThis.structuredClone = structuredClone;
}

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
import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "../lib/useColorScheme";
import { NAV_THEME } from "../lib/constants";
import { TRPCReactProvider } from "@/lib/trpc/react";
import LoadingScreen from "@/components/LoadingScreen";
import { useColdStartPrefetch } from "@/hooks/useColdStartPrefetch";
import { useCacheDebugger } from "@/hooks/useCacheDebugger";
import { useAuthHandler } from "@/hooks/useAuthHandler";
import { PostHogProvider } from "@/providers/PostHogProvider";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? useEffect
    : useEffect;

function AppContent() {
  const { isDarkColorScheme } = useColorScheme();
  
  // Handle all auth logic (session, deep links, navigation)
  const { session, isLoading } = useAuthHandler();
  
  // Prefetch essential data on cold start
  useColdStartPrefetch(session, isLoading);
  
  // Debug cache hydration (remove in production)
  if (__DEV__) {
    useCacheDebugger();
  }

  // Show loading screen while checking authentication
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
      <Stack>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen name="confirm-signup" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="league/[id]/index" options={{ headerShown: false }} />
        <Stack.Screen name="account" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const hasMounted = useRef(false);
  const { isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useIsomorphicLayoutEffect(() => {
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

  // Show loading screen while fonts or color scheme load
  if (!loaded || !isColorSchemeLoaded) {
    return null;
  }

  return (
    <PostHogProvider>
      <TRPCReactProvider>
        <AppContent />
      </TRPCReactProvider>
    </PostHogProvider>
  );
}
