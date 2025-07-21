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
import { type Session } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "../lib/useColorScheme";
import { NAV_THEME } from "../lib/constants";
import { TRPCReactProvider } from "@/lib/trpc/react";
import { supabase } from "@/lib/supabase/client";
import LoadingScreen from "@/components/LoadingScreen";
import AuthScreen from "./auth";

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

export default function RootLayout() {
  const hasMounted = useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Authentication state
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Show loading screen while fonts or color scheme load
  if (!loaded || !isColorSchemeLoaded) {
    return null;
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <TRPCReactProvider>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <LoadingScreen />
          <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        </ThemeProvider>
      </TRPCReactProvider>
    );
  }

  // Show auth screen if not logged in
  if (!session) {
    return (
      <TRPCReactProvider>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <AuthScreen />
          <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        </ThemeProvider>
      </TRPCReactProvider>
    );
  }

  // Show tabs if logged in
  return (
    <TRPCReactProvider>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
      </ThemeProvider>
    </TRPCReactProvider>
  );
}
