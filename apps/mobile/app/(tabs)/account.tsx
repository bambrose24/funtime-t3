import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  SafeAreaView,
  Pressable,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "@/lib/useColorScheme";
import { supabase } from "@/lib/supabase/client";
import { clientApi } from "@/lib/trpc/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SettingsSectionProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

function SettingsSection({ title, subtitle, children }: SettingsSectionProps) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-[1px] text-gray-500 dark:text-gray-400">
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</Text>
      ) : null}
      <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        {children}
      </View>
    </View>
  );
}

type SettingsRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  disabled?: boolean;
};

function SettingsRow({
  icon,
  title,
  subtitle,
  trailing,
  onPress,
  danger = false,
  disabled = false,
}: SettingsRowProps) {
  return (
    <Pressable
      disabled={disabled || !onPress}
      onPress={onPress}
      className={cn(
        "rounded-xl px-2 py-2",
        onPress ? "active:bg-gray-100 dark:active:bg-zinc-700" : "",
        disabled ? "opacity-50" : "",
      )}
    >
      <View className="flex-row items-start gap-3">
        <View
          className={cn(
            "mt-0.5 h-9 w-9 items-center justify-center rounded-lg",
            danger
              ? "bg-red-100 dark:bg-red-950"
              : "bg-gray-100 dark:bg-zinc-700",
          )}
        >
          <Ionicons
            name={icon}
            size={18}
            color={danger ? "#dc2626" : "#6b7280"}
          />
        </View>
        <View className="flex-1">
          <Text
            className={cn(
              "text-sm font-semibold",
              danger
                ? "text-red-600 dark:text-red-400"
                : "text-app-fg-light dark:text-app-fg-dark",
            )}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View className="ml-2 items-center justify-center">{trailing}</View>
      </View>
    </Pressable>
  );
}

function AccountLoadingSkeleton() {
  return (
    <View className="gap-5">
      <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <View className="flex-row items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-full" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-48 rounded" />
          </View>
        </View>
      </View>

      <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <Skeleton className="mb-4 h-4 w-24 rounded" />
        <Skeleton className="mb-2 h-10 w-full rounded-md" />
        <Skeleton className="h-3 w-40 rounded" />
      </View>

      <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <Skeleton className="mb-4 h-4 w-32 rounded" />
        <Skeleton className="mb-2 h-3 w-full rounded" />
        <Skeleton className="h-10 w-44 rounded-full" />
      </View>
    </View>
  );
}

export default function AccountScreen() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [loadedUsername, setLoadedUsername] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingPushPreference, setIsUpdatingPushPreference] =
    useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();
  const utils = clientApi.useUtils();

  // Get user data from tRPC - will only be called if user is authenticated
  const {
    data: userData,
    isLoading: userLoading,
    refetch: refetchUserData,
  } =
    clientApi.session.current.useQuery();
  const { data: isSuperAdmin, refetch: refetchIsSuperAdmin } =
    clientApi.generalAdmin.isSuperAdmin.useQuery();
  const { mutateAsync: updateUsername } =
    clientApi.settings.updateUsername.useMutation();
  const { mutateAsync: setPushNotificationsEnabled } =
    clientApi.settings.setPushNotificationsEnabled.useMutation();
  const { data: pushStatus, refetch: refetchPushStatus } =
    clientApi.settings.pushNotificationStatus.useQuery(undefined, {
      enabled: Boolean(userData?.dbUser),
    });

  const trimmedUsernameDraft = usernameDraft.trim();
  const usernamePattern = /^[A-Za-z\d]{8,30}$/;
  const isUsernameFormatValid = usernamePattern.test(trimmedUsernameDraft);
  const isUsernameDirty = trimmedUsernameDraft !== (userData?.dbUser?.username ?? "");
  const canSubmitUsername =
    Boolean(userData?.dbUser) &&
    isUsernameDirty &&
    isUsernameFormatValid &&
    !isUpdatingUsername;

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

  const username = userData?.dbUser?.username ?? "";
  const email = userData?.dbUser?.email ?? "";
  const initials = useMemo(() => {
    if (!username) {
      return "FT";
    }
    return username.slice(0, 2).toUpperCase();
  }, [username]);

  const pushStatusSummary = pushStatus?.unavailable
    ? "Push settings are unavailable until notification token storage is deployed."
    : pushStatus?.tokenCount
      ? `Enabled on ${pushStatus.tokenCount} device${pushStatus.tokenCount === 1 ? "" : "s"}.`
      : "No registered device token yet. Enable notifications at the OS level first.";

  const canTogglePushNotifications =
    !isUpdatingPushPreference &&
    !pushStatus?.unavailable &&
    Boolean(pushStatus?.tokenCount);

  const triggerSelectionHaptic = useCallback(() => {
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });
  }, []);

  const triggerSuccessHaptic = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {
        // No-op if haptics are unavailable.
      },
    );
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    triggerSelectionHaptic();

    try {
      await refetchUserData();
      await refetchIsSuperAdmin();
      if (userData?.dbUser) {
        await refetchPushStatus();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [
    refetchIsSuperAdmin,
    refetchPushStatus,
    refetchUserData,
    triggerSelectionHaptic,
    userData?.dbUser,
  ]);

  const signOut = async () => {
    setIsSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    }
    setIsSigningOut(false);
  };

  const onPressSignOut = () => {
    Alert.alert(
      "Sign out?",
      "You can sign back in at any time.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            void signOut();
          },
        },
      ],
      { cancelable: true },
    );
  };

  const onUpdateUsername = async () => {
    const nextUsername = usernameDraft.trim();
    if (!nextUsername) {
      Alert.alert("Invalid Username", "Username is required.");
      return;
    }
    if (!usernamePattern.test(nextUsername)) {
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
      triggerSuccessHaptic();
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
      triggerSelectionHaptic();
      await setPushNotificationsEnabled({ enabled: nextEnabled });
      await refetchPushStatus();
      triggerSuccessHaptic();
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
      <View className="border-b border-gray-200 px-6 pb-4 pt-5 dark:border-zinc-800">
        <Text className="text-app-fg-light dark:text-app-fg-dark text-3xl font-bold">
          Settings
        </Text>
        <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage account identity, notifications, and access.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: (insets.bottom || 20) + 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={isDarkColorScheme ? "#9ca3af" : "#6b7280"}
          />
        }
      >
        <View className="gap-6 px-6 py-6">
          {userLoading ? (
            <AccountLoadingSkeleton />
          ) : userData?.dbUser ? (
            <View className="gap-6">
              <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                <View className="flex-row items-center gap-3">
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                    <Text className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {initials}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-semibold">
                      @{username}
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      {email}
                    </Text>
                  </View>
                  {isSuperAdmin ? (
                    <View className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 dark:border-emerald-700 dark:bg-emerald-950">
                      <Text className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                        SUPER ADMIN
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <SettingsSection
                title="Identity"
                subtitle="Keep your username clean and recognizable across leagues."
              >
                <View className="gap-3">
                  <SettingsRow
                    icon="at-outline"
                    title="Current Username"
                    subtitle={`@${username}`}
                    trailing={
                      <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        LIVE
                      </Text>
                    }
                  />
                  <View className="h-px bg-gray-200 dark:bg-zinc-700" />
                  <Input
                    value={usernameDraft}
                    onChangeText={setUsernameDraft}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="New username"
                  />
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={cn(
                        "text-xs",
                        trimmedUsernameDraft.length > 0 && !isUsernameFormatValid
                          ? "text-red-500"
                          : "text-gray-500 dark:text-gray-400",
                      )}
                    >
                      {trimmedUsernameDraft.length > 0 && !isUsernameFormatValid
                        ? "Use 8-30 letters and numbers."
                        : "8-30 letters or numbers only."}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.min(trimmedUsernameDraft.length, 30)}/30
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <Button
                        disabled={!canSubmitUsername}
                        onPress={onUpdateUsername}
                      >
                        {isUpdatingUsername ? "Saving..." : "Save Username"}
                      </Button>
                    </View>
                    <View className="flex-1">
                      <Button
                        variant="outline"
                        disabled={trimmedUsernameDraft === username || isUpdatingUsername}
                        onPress={() => setUsernameDraft(username)}
                      >
                        Reset
                      </Button>
                    </View>
                  </View>
                </View>
              </SettingsSection>

              <SettingsSection
                title="Notifications"
                subtitle="Control whether this account receives push updates."
              >
                <View className="gap-3">
                  <SettingsRow
                    icon="notifications-outline"
                    title="Push Notifications"
                    subtitle={pushStatusSummary}
                    trailing={
                      <View
                        className={cn(
                          "rounded-full px-2.5 py-1",
                          pushStatus?.unavailable
                            ? "bg-amber-100 dark:bg-amber-950"
                            : pushStatus?.enabled
                              ? "bg-emerald-100 dark:bg-emerald-950"
                              : "bg-gray-100 dark:bg-zinc-700",
                        )}
                      >
                        <Text
                          className={cn(
                            "text-[10px] font-semibold",
                            pushStatus?.unavailable
                              ? "text-amber-700 dark:text-amber-300"
                              : pushStatus?.enabled
                                ? "text-emerald-700 dark:text-emerald-300"
                                : "text-gray-600 dark:text-gray-300",
                          )}
                        >
                          {pushStatus?.unavailable
                            ? "UNAVAILABLE"
                            : pushStatus?.enabled
                              ? "ON"
                              : "OFF"}
                        </Text>
                      </View>
                    }
                  />
                  <Button
                    variant={pushStatus?.enabled ? "outline" : "default"}
                    disabled={!canTogglePushNotifications}
                    onPress={onTogglePushNotifications}
                  >
                    {isUpdatingPushPreference
                      ? "Saving..."
                      : pushStatus?.enabled
                        ? "Disable Push Notifications"
                        : "Enable Push Notifications"}
                  </Button>
                </View>
              </SettingsSection>

              <SettingsSection title="Contact">
                <SettingsRow
                  icon="mail-outline"
                  title="Email"
                  subtitle={email}
                  trailing={
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      Verified
                    </Text>
                  }
                />
              </SettingsSection>

              {isSuperAdmin ? (
                <SettingsSection title="Admin Tools">
                  <SettingsRow
                    icon="shield-checkmark-outline"
                    title="Global Admin Dashboard"
                    subtitle="Review platform stats and manage leagues."
                    onPress={() => {
                      triggerSelectionHaptic();
                      router.push("/admin" as any);
                    }}
                    trailing={
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={isDarkColorScheme ? "#9ca3af" : "#6b7280"}
                      />
                    }
                  />
                </SettingsSection>
              ) : null}

              <SettingsSection title="Session">
                <SettingsRow
                  icon="log-out-outline"
                  title={isSigningOut ? "Signing Out..." : "Sign Out"}
                  subtitle="End this session on this device."
                  danger
                  disabled={isSigningOut}
                  onPress={onPressSignOut}
                  trailing={
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#dc2626"
                    />
                  }
                />
              </SettingsSection>
            </View>
          ) : (
            <View className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
              <Text className="text-center text-base leading-6 text-gray-500 dark:text-gray-400">
                Unable to load profile data. Please try signing in again.
              </Text>
              <View className="mt-4">
                <Button variant="destructive" onPress={onPressSignOut}>
                  Sign Out
                </Button>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
