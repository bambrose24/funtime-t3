import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase/client";
import { clientApi } from "@/lib/trpc/react";

export default function AccountScreen() {
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // Get user data from tRPC - will only be called if user is authenticated
  const { data: userData, isLoading: userLoading } =
    clientApi.session.current.useQuery();

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <View className="border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
        <Text className="text-app-fg-light dark:text-app-fg-dark text-3xl font-bold">
          Account
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {userLoading ? (
            <View className="flex-1 items-center justify-center py-10">
              <Text className="text-base text-gray-500 dark:text-gray-400">
                Loading your profile...
              </Text>
            </View>
          ) : userData?.dbUser ? (
            <View className="gap-6">
              <View className="gap-2">
                <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  First Name
                </Text>
                <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-medium">
                  {userData.dbUser.fname}
                </Text>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Last Name
                </Text>
                <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-medium">
                  {userData.dbUser.lname}
                </Text>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Username
                </Text>
                <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-medium">
                  @{userData.dbUser.username}
                </Text>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Email
                </Text>
                <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-medium">
                  {userData.dbUser.email}
                </Text>
              </View>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-10">
              <Text className="text-center text-base leading-6 text-gray-500 dark:text-gray-400">
                Unable to load profile data. Please try signing in again.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        className="border-t border-gray-200 px-5 pt-5 dark:border-zinc-800"
        style={{ paddingBottom: insets.bottom || 20 }}
      >
        <TouchableOpacity
          className="items-center rounded-xl bg-red-500 p-4 dark:bg-red-600"
          style={{ opacity: loading ? 0.6 : 1 }}
          onPress={signOut}
          disabled={loading}
        >
          <Text className="text-base font-semibold text-white">
            {loading ? "Signing out..." : "Sign Out"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
