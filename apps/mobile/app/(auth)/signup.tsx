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
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase/client";
import { useColorScheme } from "@/lib/useColorScheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientApi } from "@/lib/trpc/react";
import { z } from "zod";

// Validation schema matching web app
const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email"),
    password1: z.string().min(8, "Password must be at least 8 characters"),
    password2: z.string().min(8, "Password must be at least 8 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.password1 !== data.password2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password2"],
        message: "Passwords don't match",
      });
    }
  });

export default function SignupScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password1?: string;
    password2?: string;
  }>({});
  const [success, setSuccess] = useState(false);
  const { isDarkColorScheme } = useColorScheme();
  const utils = clientApi.useUtils();

  const handleSignup = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate form
    const validation = signupSchema.safeParse({ email, password1, password2 });
    if (!validation.success) {
      const fieldErrors: {
        email?: string;
        password1?: string;
        password2?: string;
      } = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0] === "email") fieldErrors.email = error.message;
        if (error.path[0] === "password1") fieldErrors.password1 = error.message;
        if (error.path[0] === "password2") fieldErrors.password2 = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      // Create the redirect URL for email confirmation
      const redirectUrl = Linking.createURL('/auth/callback');
      
      const { error, data } = await supabase.auth.signUp({
        email: email.trim(),
        password: password1,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        Alert.alert("Signup Failed", error.message);
        return;
      }

      if (!data.user?.id) {
        Alert.alert(
          "Signup Failed",
          "Error signing up. That email might be taken already."
        );
        return;
      }

      // Success - show confirmation message
      setSuccess(true);
      Alert.alert(
        "Success!",
        "Check your email to confirm your signup, then return to sign in.",
        [
          {
            text: "Go to Login",
            onPress: () => router.replace("/auth"),
          },
        ]
      );
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-full max-w-sm">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-2xl font-bold mb-4">
              Check Your Email
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-400 mb-8">
              We've sent you a confirmation email. Click the link in your email to
              verify your account and complete your profile setup.
            </Text>
            <Button onPress={() => router.replace("/auth")}>
              Go to Login
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      >
        <View className="w-full max-w-sm mx-auto">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-3xl font-bold mb-2">
              Create Account
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-400">
              Enter your information to create an account. You'll need to confirm your email.
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-400 mt-2">
              If you have played before, you can{" "}
              <Text 
                className="text-blue-600 dark:text-blue-400" 
                onPress={() => router.replace("/auth")}
              >
                sign in with your existing account
              </Text>
              .
            </Text>
          </View>

          {/* Signup Form */}
          <View>
            {/* Email Field */}
            <View className="mb-6">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-medium mb-2">
                Email
              </Text>
              <Input
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors(prev => ({...prev, email: undefined}));
                }}
                placeholder="example@gmail.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
              )}
            </View>

            {/* Password Field */}
            <View className="mb-6">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-medium mb-2">
                Password
              </Text>
              <Input
                value={password1}
                onChangeText={(text) => {
                  setPassword1(text);
                  if (errors.password1) setErrors(prev => ({...prev, password1: undefined}));
                }}
                placeholder="Enter your password"
                secureTextEntry
                autoComplete="password-new"
                className={errors.password1 ? "border-red-500" : ""}
              />
              {errors.password1 && (
                <Text className="text-red-500 text-sm mt-1">{errors.password1}</Text>
              )}
            </View>

            {/* Confirm Password Field */}
            <View className="mb-6">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-medium mb-2">
                Confirm Password
              </Text>
              <Input
                value={password2}
                onChangeText={(text) => {
                  setPassword2(text);
                  if (errors.password2) setErrors(prev => ({...prev, password2: undefined}));
                }}
                placeholder="Confirm your password"
                secureTextEntry
                autoComplete="password-new"
                className={errors.password2 ? "border-red-500" : ""}
              />
              {errors.password2 && (
                <Text className="text-red-500 text-sm mt-1">{errors.password2}</Text>
              )}
            </View>

            {/* Signup Button */}
            <Button
              onPress={handleSignup}
              disabled={loading}
              className="mt-2"
            >
              {loading ? "Creating account..." : "Create an account"}
            </Button>
          </View>

          {/* Footer Links */}
          <View className="mt-6">
            <Pressable onPress={() => router.replace('/auth')}>
              <Text className="text-center text-blue-600 dark:text-blue-400">
                Already have an account? Sign in
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}