import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { clientApi } from "@/lib/trpc/react";

const resetPasswordSchema = z
  .object({
    password1: z.string().min(8, "Password must be at least 8 characters"),
    password2: z.string().min(8, "Password must be at least 8 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.password1 !== data.password2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password2"],
        message: "Passwords must match",
      });
    }
  });

export default function ConfirmResetPasswordScreen() {
  const { code, access_token, refresh_token, redirectTo } =
    useLocalSearchParams<{
      code?: string;
      access_token?: string;
      refresh_token?: string;
      redirectTo?: string;
    }>();
  const utils = clientApi.useUtils();
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [errors, setErrors] = useState<{ password1?: string; password2?: string }>(
    {},
  );
  const [preparingSession, setPreparingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const decodedRedirectTo = useMemo(() => {
    if (typeof redirectTo !== "string" || redirectTo.length === 0) {
      return null;
    }
    try {
      return decodeURIComponent(redirectTo);
    } catch {
      return redirectTo;
    }
  }, [redirectTo]);

  useEffect(() => {
    let isActive = true;

    const prepareSession = async () => {
      setPreparingSession(true);

      try {
        if (typeof code === "string" && code.length > 0) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            throw error;
          }
          if (isActive) {
            setSessionReady(true);
          }
          return;
        }

        if (
          typeof access_token === "string" &&
          access_token.length > 0 &&
          typeof refresh_token === "string" &&
          refresh_token.length > 0
        ) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) {
            throw error;
          }
          if (isActive) {
            setSessionReady(true);
          }
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (isActive) {
          setSessionReady(Boolean(session));
        }
      } catch (error) {
        console.error("Failed to bootstrap password reset session", error);
        if (isActive) {
          setSessionReady(false);
        }
      } finally {
        if (isActive) {
          setPreparingSession(false);
        }
      }
    };

    void prepareSession();

    return () => {
      isActive = false;
    };
  }, [access_token, code, refresh_token]);

  const onSubmit = async () => {
    setErrors({});
    const parsed = resetPasswordSchema.safeParse({ password1, password2 });
    if (!parsed.success) {
      const nextErrors: { password1?: string; password2?: string } = {};
      parsed.error.errors.forEach((error) => {
        if (error.path[0] === "password1") {
          nextErrors.password1 = error.message;
        }
        if (error.path[0] === "password2") {
          nextErrors.password2 = error.message;
        }
      });
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: parsed.data.password1,
      });

      if (error) {
        Alert.alert("Reset Failed", error.message);
        return;
      }

      await utils.invalidate();
      Alert.alert("Success", "Your password has been reset.", [
        {
          text: "Continue",
          onPress: () => {
            if (decodedRedirectTo) {
              router.replace(decodedRedirectTo as any);
            } else {
              router.replace("/home" as any);
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Confirm reset password error:", error);
      Alert.alert("Error", "Unable to reset your password right now.");
    } finally {
      setSubmitting(false);
    }
  };

  if (preparingSession) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-xl font-bold">
            Preparing reset...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!sessionReady) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-3 text-center text-2xl font-bold">
            Reset Link Invalid
          </Text>
          <Text className="text-center text-gray-600 dark:text-gray-400">
            Request a new password reset email and try again.
          </Text>
          <Button
            className="mt-5"
            onPress={() => router.replace("/forgot-password" as any)}
          >
            Request New Link
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
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
                New Password
              </Text>
              <Text className="text-center text-gray-600 dark:text-gray-400">
                Enter your new password to finish recovery.
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-base font-medium">
                Password
              </Text>
              <Input
                value={password1}
                onChangeText={(text) => {
                  setPassword1(text);
                  if (errors.password1) {
                    setErrors((prev) => ({ ...prev, password1: undefined }));
                  }
                }}
                placeholder="Enter a new password"
                secureTextEntry
                autoComplete="password-new"
                className={errors.password1 ? "border-red-500" : ""}
              />
              {errors.password1 ? (
                <Text className="mt-1 text-sm text-red-500">{errors.password1}</Text>
              ) : null}
            </View>

            <View className="mb-6">
              <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-base font-medium">
                Confirm Password
              </Text>
              <Input
                value={password2}
                onChangeText={(text) => {
                  setPassword2(text);
                  if (errors.password2) {
                    setErrors((prev) => ({ ...prev, password2: undefined }));
                  }
                }}
                placeholder="Re-enter your password"
                secureTextEntry
                autoComplete="password-new"
                className={errors.password2 ? "border-red-500" : ""}
              />
              {errors.password2 ? (
                <Text className="mt-1 text-sm text-red-500">{errors.password2}</Text>
              ) : null}
            </View>

            <Button onPress={onSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Confirm Reset"}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
