import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const {
    code,
    next,
    flow,
    type,
    redirectTo,
    access_token,
    refresh_token,
    error: callbackError,
    error_description,
  } =
    useLocalSearchParams<{
      code?: string;
      next?: string;
      flow?: string;
      type?: string;
      redirectTo?: string;
      access_token?: string;
      refresh_token?: string;
      error?: string;
      error_description?: string;
    }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (typeof callbackError === "string" && callbackError.length > 0) {
          setError(error_description ?? "Authentication failed");
          return;
        }

        const isRecoveryFlow = flow === "recovery" || type === "recovery";

        if (typeof code === "string" && code.length > 0) {
          const { data, error: authError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (authError) {
            console.error("Auth callback exchange error:", authError);
            setError("Failed to confirm authentication");
            return;
          }

          if (!data?.session) {
            setError("No session created");
            return;
          }
        } else if (
          typeof access_token === "string" &&
          access_token.length > 0 &&
          typeof refresh_token === "string" &&
          refresh_token.length > 0
        ) {
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (setSessionError) {
            console.error("Auth callback setSession error:", setSessionError);
            setError("Failed to restore authentication session");
            return;
          }

          if (!data?.session) {
            setError("No session created");
            return;
          }
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) {
            setError("No authentication code provided");
            return;
          }
        }

        const normalizedRedirectTo =
          typeof redirectTo === "string" && redirectTo.length > 0
            ? redirectTo
            : typeof next === "string" && next.length > 0
              ? next
              : null;

        if (isRecoveryFlow) {
          const recoveryPath = normalizedRedirectTo
            ? `/confirm-reset-password?redirectTo=${encodeURIComponent(normalizedRedirectTo)}`
            : "/confirm-reset-password";
          router.replace(recoveryPath as any);
          return;
        }

        const confirmSignupPath = normalizedRedirectTo
          ? `/confirm-signup?redirectTo=${encodeURIComponent(normalizedRedirectTo)}`
          : "/confirm-signup";
        router.replace(confirmSignupPath as any);
      } catch (err) {
        console.error("Unexpected auth callback error:", err);
        setError("An unexpected error occurred");
      }
    };

    handleAuthCallback();
  }, [
    access_token,
    code,
    callbackError,
    error_description,
    flow,
    next,
    redirectTo,
    refresh_token,
    router,
    type,
  ]);

  // Show error state
  if (error) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-4 text-center text-xl font-bold text-red-500">
            Authentication Error
          </Text>
          <Text className="text-center text-base text-gray-600 dark:text-gray-400">
            {error}
          </Text>
          <Text 
            className="mt-4 text-blue-500 underline"
            onPress={() => router.replace("/auth")}
          >
            Return to Login
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state
  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-4 text-center text-xl font-bold text-app-fg-light dark:text-app-fg-dark">
          Confirming Account...
        </Text>
        <Text className="text-center text-base text-gray-600 dark:text-gray-400">
          Please wait while we verify your email
        </Text>
      </View>
    </SafeAreaView>
  );
}
