import React, { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    setError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const redirectTo = Linking.createURL("/auth/callback?flow=recovery");
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo,
        },
      );

      if (resetError) {
        Alert.alert("Reset Failed", resetError.message);
        return;
      }

      setSent(true);
      Alert.alert(
        "Email sent",
        "Check your inbox for a password reset link.",
      );
    } catch (submitError) {
      console.error("Forgot password error:", submitError);
      Alert.alert("Error", "Unable to send reset email right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View className="mx-auto w-full max-w-sm">
          <View className="mb-8">
            <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-center text-3xl font-bold">
              Reset Password
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-400">
              Enter your email to receive a reset link.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-base font-medium">
              Email
            </Text>
            <Input
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) {
                  setError(null);
                }
              }}
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              className={error ? "border-red-500" : ""}
            />
            {error ? <Text className="mt-1 text-sm text-red-500">{error}</Text> : null}
          </View>

          <Button onPress={onSubmit} disabled={loading || sent}>
            {loading ? "Sending..." : sent ? "Check your email" : "Send reset link"}
          </Button>

          <View className="mt-6">
            <Pressable onPress={() => router.replace("/auth")}>
              <Text className="text-center text-blue-600 dark:text-blue-400">
                Back to Sign In
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
