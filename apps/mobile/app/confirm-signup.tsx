import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clientApi } from "@/lib/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useColorScheme } from "@/lib/useColorScheme";

const signupFormSchema = z.object({
  username: z.string().min(5, "Username must be at least 5 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type SignupFormData = z.infer<typeof signupFormSchema>;

export default function ConfirmSignupScreen() {
  const router = useRouter();
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const { isDarkColorScheme } = useColorScheme();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
    },
    mode: "onChange",
  });

  const { mutateAsync: funtimeSignup } = clientApi.auth.signup.useMutation();

  const onSubmit = async (data: SignupFormData) => {
    try {
      setSubmitting(true);
      const { username, firstName, lastName } = data;

      await funtimeSignup({ firstName, lastName, username });

      Alert.alert(
        "Success!",
        "Your account has been created successfully!",
        [
          {
            text: "Continue",
            onPress: () => {
              // Redirect to the specified page or home
              if (redirectTo) {
                router.replace(redirectTo as any);
              } else {
                router.replace("/");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert(
        "Error",
        "There was an error completing your signup. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* Header */}
            <View className="mb-8">
              <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-center text-3xl font-bold">
                Complete Signup
              </Text>
              <Text className="text-center text-base text-gray-600 dark:text-gray-400">
                Enter your information to finish creating your account
              </Text>
            </View>

            {/* Form */}
            <View className="gap-6">
              {/* First Name & Last Name Row */}
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-sm font-medium">
                    First Name
                  </Text>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        placeholder="John"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                        textContentType="givenName"
                      />
                    )}
                  />
                  {errors.firstName && (
                    <Text className="mt-1 text-sm text-red-500">
                      {errors.firstName.message}
                    </Text>
                  )}
                </View>

                <View className="flex-1">
                  <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-sm font-medium">
                    Last Name
                  </Text>
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        placeholder="Doe"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                        textContentType="familyName"
                      />
                    )}
                  />
                  {errors.lastName && (
                    <Text className="mt-1 text-sm text-red-500">
                      {errors.lastName.message}
                    </Text>
                  )}
                </View>
              </View>

              {/* Username */}
              <View>
                <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-sm font-medium">
                  Username
                </Text>
                <Controller
                  control={control}
                  name="username"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="john_doe123"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="username"
                    />
                  )}
                />
                {errors.username && (
                  <Text className="mt-1 text-sm text-red-500">
                    {errors.username.message}
                  </Text>
                )}
                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Username must be at least 5 characters long
                </Text>
              </View>

              {/* Submit Button */}
              <Button
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || submitting}
                size="lg"
                className="mt-4"
              >
                {submitting ? "Creating Account..." : "Finish Signup"}
              </Button>

              {/* Footer */}
              <View className="mt-6">
                <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <Text
                    className="text-blue-500 underline"
                    onPress={() => router.push("/auth")}
                  >
                    Sign in
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}