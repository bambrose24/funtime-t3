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
import { useState, useEffect } from "react";
import { type Session } from "@supabase/supabase-js";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { TRPCReactProvider } from "@/lib/trpc/react";
import { supabase } from "@/lib/supabase/client";
import LoadingScreen from "@/components/LoadingScreen";
import AuthScreen from "./auth";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Authentication state
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

  // Show loading screen while fonts load
  if (!loaded) {
    return null;
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <TRPCReactProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <LoadingScreen />
          <StatusBar style="auto" />
        </ThemeProvider>
      </TRPCReactProvider>
    );
  }

  // Show auth screen if not logged in
  if (!session) {
    return (
      <TRPCReactProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <AuthScreen />
          <StatusBar style="auto" />
        </ThemeProvider>
      </TRPCReactProvider>
    );
  }

  // Show tabs if logged in
  return (
    <TRPCReactProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </TRPCReactProvider>
  );
}
