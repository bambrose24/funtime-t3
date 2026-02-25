import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase/client";
import { useColorScheme } from "@/lib/useColorScheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientApi } from "@/lib/trpc/react";
import { z } from "zod";

// Validation schema matching web app
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const utils = clientApi.useUtils();

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0] === "email") fieldErrors.email = error.message;
        if (error.path[0] === "password") fieldErrors.password = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
      } else {
        // Give Supabase a moment to establish the session, then invalidate cache
        setTimeout(async () => {
          await utils.invalidate();
        }, 100);
      }
      // Success navigation is handled by auth state change in _layout.tsx
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "An unexpected error occurred");
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
          {/* Header */}
          <View className="mb-8">
            <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-center text-3xl font-bold">
              Welcome Back
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-400">
              Sign in to your Funtime account
            </Text>
          </View>

          {/* Login Form */}
          <View>
            {/* Email Field */}
            <View className="mb-6">
              <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-base font-medium">
                Email
              </Text>
              <Input
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <Text className="mt-1 text-sm text-red-500">
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Password Field */}
            <View className="mb-6">
              <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-base font-medium">
                Password
              </Text>
              <Input
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Enter your password"
                secureTextEntry
                autoComplete="password"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <Text className="mt-1 text-sm text-red-500">
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Login Button */}
            <Button
              onPress={handleLogin}
              disabled={loading || !email || !password}
              className="mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </View>

          {/* Footer Links */}
          <View className="mt-6">
            <Pressable onPress={() => router.push("/signup" as any)}>
              <Text className="text-center text-blue-600 dark:text-blue-400">
                Don't have an account? Sign up
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
