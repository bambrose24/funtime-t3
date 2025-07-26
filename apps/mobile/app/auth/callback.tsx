import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { code, next } = useLocalSearchParams<{ 
    code?: string; 
    next?: string; 
  }>();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!code) {
          setError("No authentication code provided");
          return;
        }

        // Exchange the code for a session
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (authError) {
          console.error("Auth callback error:", authError);
          setError("Failed to confirm authentication");
          return;
        }

        if (data?.session) {
          // Authentication successful, redirect to confirm-signup to complete profile
          const redirectUrl = `/confirm-signup${next ? `?redirectTo=${encodeURIComponent(next)}` : ''}`;
          router.replace(redirectUrl as any);
        } else {
          setError("No session created");
        }
      } catch (err) {
        console.error("Unexpected auth callback error:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [code, next, router]);

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