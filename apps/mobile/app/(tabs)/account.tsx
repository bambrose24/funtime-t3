import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/lib/useColorScheme";
import { supabase } from "@/lib/supabase/client";
import { clientApi } from "@/lib/trpc/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AccountScreen() {
  const [loading, setLoading] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [loadedUsername, setLoadedUsername] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingPushPreference, setIsUpdatingPushPreference] =
    useState(false);
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();
  const utils = clientApi.useUtils();

  // Get user data from tRPC - will only be called if user is authenticated
  const { data: userData, isLoading: userLoading } =
    clientApi.session.current.useQuery();
  const { data: isSuperAdmin } = clientApi.generalAdmin.isSuperAdmin.useQuery();
  const { mutateAsync: updateUsername } =
    clientApi.settings.updateUsername.useMutation();
  const { mutateAsync: setPushNotificationsEnabled } =
    clientApi.settings.setPushNotificationsEnabled.useMutation();
  const { data: pushStatus, refetch: refetchPushStatus } =
    clientApi.settings.pushNotificationStatus.useQuery(undefined, {
      enabled: Boolean(userData?.dbUser),
    });

  useEffect(() => {
    const username = userData?.dbUser?.username;
    if (!username) {
      return;
    }
    if (loadedUsername !== username) {
      setUsernameDraft(username);
      setLoadedUsername(username);
    }
  }, [loadedUsername, userData?.dbUser?.username]);

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    }
    setLoading(false);
  };

  const onUpdateUsername = async () => {
    const nextUsername = usernameDraft.trim();
    if (!nextUsername) {
      Alert.alert("Invalid Username", "Username is required.");
      return;
    }
    if (!/^[A-Za-z\d]{8,30}$/.test(nextUsername)) {
      Alert.alert(
        "Invalid Username",
        "Username must be 8-30 characters and use only letters and numbers.",
      );
      return;
    }
    if (nextUsername === userData?.dbUser?.username) {
      return;
    }

    try {
      setIsUpdatingUsername(true);
      await updateUsername({ username: nextUsername });
      await utils.settings.get.invalidate();
      await utils.session.current.invalidate();
      Alert.alert("Updated", "Username updated successfully.");
    } catch (error) {
      console.error("Failed to update username", error);
      Alert.alert(
        "Update Failed",
        error instanceof Error ? error.message : "Unable to update username.",
      );
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const onTogglePushNotifications = async () => {
    if (!pushStatus || pushStatus.unavailable) {
      Alert.alert(
        "Unavailable",
        "Push notification settings are unavailable until the database table is deployed.",
      );
      return;
    }

    const nextEnabled = !pushStatus.enabled;
    try {
      setIsUpdatingPushPreference(true);
      await setPushNotificationsEnabled({ enabled: nextEnabled });
      await refetchPushStatus();
      Alert.alert(
        "Updated",
        nextEnabled
          ? "Push notifications enabled."
          : "Push notifications disabled.",
      );
    } catch (error) {
      console.error("Failed to update push notification preferences", error);
      Alert.alert(
        "Update Failed",
        error instanceof Error
          ? error.message
          : "Unable to update push notification settings.",
      );
    } finally {
      setIsUpdatingPushPreference(false);
    }
  };

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <View className="border-b border-gray-200 px-5 py-4 dark:border-zinc-800 flex-row justify-between items-center">
        <Pressable
          onPress={() => router.back()}
          className="bg-app-card-light dark:bg-app-card-dark rounded-lg p-2"
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={isDarkColorScheme ? "#e5e7eb" : "#374151"}
          />
        </Pressable>
        <Text className="text-app-fg-light dark:text-app-fg-dark text-3xl font-bold">
          Account
        </Text>
        <View className="w-16" />
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
                  Username
                </Text>
                <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-medium">
                  @{userData.dbUser.username}
                </Text>
                <View className="gap-2 pt-2">
                  <Input
                    value={usernameDraft}
                    onChangeText={setUsernameDraft}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="New username"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      isUpdatingUsername ||
                      usernameDraft.trim() === userData.dbUser.username
                    }
                    onPress={onUpdateUsername}
                  >
                    {isUpdatingUsername ? "Saving..." : "Update Username"}
                  </Button>
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Email
                </Text>
                <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-medium">
                  {userData.dbUser.email}
                </Text>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Notifications
                </Text>
                <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                  {pushStatus?.unavailable
                    ? "Push notification settings will activate after database deployment."
                    : pushStatus?.tokenCount
                      ? `Push notifications are ${pushStatus.enabled ? "enabled" : "disabled"} on ${pushStatus.tokenCount} device${pushStatus.tokenCount === 1 ? "" : "s"}.`
                      : "No registered device token yet. Grant notification permission to register this device."}
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    isUpdatingPushPreference ||
                    Boolean(pushStatus?.unavailable) ||
                    !pushStatus?.tokenCount
                  }
                  onPress={onTogglePushNotifications}
                >
                  {isUpdatingPushPreference
                    ? "Saving..."
                    : pushStatus?.enabled
                      ? "Disable Push Notifications"
                      : "Enable Push Notifications"}
                </Button>
              </View>

              {isSuperAdmin ? (
                <View className="gap-2">
                  <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Super Admin
                  </Text>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => router.push("/admin" as any)}
                  >
                    Open Global Admin Dashboard
                  </Button>
                </View>
              ) : null}
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
