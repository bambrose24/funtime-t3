import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  Alert,
  Modal,
  Platform,
  ScrollView,
  SafeAreaView,
  Pressable,
  RefreshControl,
  Switch,
} from "react-native";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Updates from "expo-updates";
import { useColorScheme } from "@/lib/useColorScheme";
import { supabase } from "@/lib/supabase/client";
import { clientApi } from "@/lib/trpc/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  APP_DIAGNOSTICS_FIELDS,
  buildAppDiagnostics,
  formatAppDiagnosticsForClipboard,
} from "@/lib/settings/appDiagnostics";
import { cn } from "@/lib/utils";

type SettingsSectionProps = {
  title: string;
  children: React.ReactNode;
};

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="gap-2.5">
      <Text className="text-xs font-semibold uppercase tracking-[1px] text-gray-500 dark:text-gray-400">
        {title}
      </Text>
      <View className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        {children}
      </View>
    </View>
  );
}

type SettingsRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  value?: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  disabled?: boolean;
};

function SettingsRow({
  icon,
  title,
  value,
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
        "px-3 py-3",
        onPress ? "active:bg-gray-100 dark:active:bg-zinc-700" : "",
        disabled ? "opacity-50" : "",
      )}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={cn(
            "h-8 w-8 items-center justify-center rounded-md",
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
              "text-sm font-medium",
              danger
                ? "text-red-600 dark:text-red-400"
                : "text-app-fg-light dark:text-app-fg-dark",
            )}
          >
            {title}
          </Text>
          {value ? (
            <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {value}
            </Text>
          ) : null}
          {!value && subtitle ? (
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
    <View className="gap-4">
      <View className="rounded-xl border border-gray-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
        <View className="flex-row items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-44 rounded" />
          </View>
        </View>
      </View>

      <View className="rounded-xl border border-gray-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
        <Skeleton className="mb-2 h-4 w-24 rounded" />
        <Skeleton className="mb-2 h-4 w-full rounded" />
        <Skeleton className="h-10 w-full rounded-md" />
      </View>

      <View className="rounded-xl border border-gray-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
        <Skeleton className="mb-3 h-4 w-28 rounded" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </View>
    </View>
  );
}

export default function AccountScreen() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [loadedUsername, setLoadedUsername] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isDiagnosticsSheetOpen, setIsDiagnosticsSheetOpen] = useState(false);
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  const [updateCheckStatus, setUpdateCheckStatus] = useState<string | null>(null);
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
  const pushStatusState = pushStatus?.unavailable
    ? "Unavailable"
    : pushStatus?.enabled
      ? "Enabled"
      : "Disabled";
  const pushGuidance = pushStatus?.unavailable
    ? "Notification delivery settings are temporarily unavailable."
    : !pushStatus?.tokenCount
      ? "Allow notifications on a physical device to register a push token."
      : pushStatus.enabled
        ? "Weekly reminders and league updates will be delivered to your device."
        : "Turn this on to receive reminders, summaries, and message alerts.";
  const lastSyncLabel = lastSyncedAt
    ? `Synced ${lastSyncedAt.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })}`
    : "Syncing status...";
  const appDiagnostics = useMemo(() => {
    const appVersion = Constants.expoConfig?.version;
    const buildVersionFromPlatform =
      Platform.OS === "ios"
        ? Constants.platform?.ios?.buildNumber
        : Platform.OS === "android"
          ? Constants.platform?.android?.versionCode?.toString()
          : null;
    const bundleIdentifier =
      Platform.OS === "ios"
        ? Constants.expoConfig?.ios?.bundleIdentifier
        : Platform.OS === "android"
          ? Constants.expoConfig?.android?.package
          : null;

    return buildAppDiagnostics({
      appVersion,
      buildVersion: buildVersionFromPlatform ?? appVersion ?? null,
      bundleIdentifier,
      applicationName: Constants.expoConfig?.name,
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
      updateId: Updates.updateId,
      createdAt: Updates.createdAt,
      runtimeVersion: Updates.runtimeVersion ?? Constants.expoRuntimeVersion,
      updateChannel: Updates.channel,
      updatesEnabled: Updates.isEnabled,
      platform: Platform.OS,
      executionEnvironment: Constants.executionEnvironment,
    });
  }, []);
  const appVersionSummary =
    appDiagnostics.appVersion === "n/a"
      ? "Version unavailable"
      : `v${appDiagnostics.appVersion} (${appDiagnostics.buildVersion})`;
  const appVersionTypeSummary = `${appDiagnostics.otaSource} • ${appDiagnostics.otaVersion}`;

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
      setLastSyncedAt(new Date());
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
      setLastSyncedAt(new Date());
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
      setLastSyncedAt(new Date());
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

  const onCopyAppDiagnostics = useCallback(async () => {
    try {
      const diagnosticsText = formatAppDiagnosticsForClipboard(appDiagnostics);
      await Clipboard.setStringAsync(diagnosticsText);
      triggerSuccessHaptic();
      Alert.alert("Copied", "App diagnostics copied to clipboard.");
    } catch (error) {
      console.error("Failed to copy app diagnostics", error);
      Alert.alert("Copy Failed", "Unable to copy diagnostics right now.");
    }
  }, [appDiagnostics, triggerSuccessHaptic]);

  const onCheckForUpdates = useCallback(async () => {
    if (!Updates.isEnabled) {
      Alert.alert(
        "Updates Disabled",
        "OTA updates are disabled for this app build.",
      );
      return;
    }

    setIsCheckingForUpdates(true);
    setUpdateCheckStatus("Checking for updates...");
    triggerSelectionHaptic();

    try {
      const update = await Updates.checkForUpdateAsync();
      if (!update.isAvailable) {
        setUpdateCheckStatus(
          `Up to date • ${new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}`,
        );
        Alert.alert("Up to Date", "You are already on the latest OTA update.");
        return;
      }

      setUpdateCheckStatus("Downloading update...");
      const fetchedUpdate = await Updates.fetchUpdateAsync();
      if (!fetchedUpdate.isNew) {
        setUpdateCheckStatus("No new update downloaded.");
        Alert.alert("No New Update", "No newer OTA package was downloaded.");
        return;
      }

      setUpdateCheckStatus("Update ready to apply.");
      Alert.alert(
        "Update Ready",
        "A new OTA update has been downloaded. Restart now to apply it?",
        [
          { text: "Later", style: "cancel" },
          {
            text: "Restart",
            onPress: () => {
              void Updates.reloadAsync().catch((error) => {
                console.error("Failed to reload app for OTA update", error);
                Alert.alert(
                  "Restart Failed",
                  "Please close and reopen the app to apply the update.",
                );
              });
            },
          },
        ],
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to check for updates right now.";
      console.error("OTA update check failed", error);
      setUpdateCheckStatus("Update check failed.");
      Alert.alert("Update Check Failed", errorMessage);
    } finally {
      setIsCheckingForUpdates(false);
    }
  }, [triggerSelectionHaptic]);

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <View className="px-5 pb-3 pt-4">
        <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold tracking-tight">
          Settings
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
        <View className="gap-5 px-4 py-4">
          {userLoading ? (
            <AccountLoadingSkeleton />
          ) : userData?.dbUser ? (
            <View className="gap-5">
              <View className="rounded-xl border border-gray-200 bg-white px-3 py-3 dark:border-zinc-700 dark:bg-zinc-800">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1 flex-row items-center gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                      <Text className="text-sm font-bold text-blue-700 dark:text-blue-300">
                        {initials}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
                        @{username}
                      </Text>
                      <Text
                        className="text-xs text-gray-500 dark:text-gray-400"
                        numberOfLines={1}
                      >
                        {email}
                      </Text>
                      <Text className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                        {lastSyncLabel}
                      </Text>
                    </View>
                  </View>
                  {isSuperAdmin ? (
                    <View className="rounded-full bg-emerald-100 px-2 py-1 dark:bg-emerald-950">
                      <Text className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                        ADMIN
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <SettingsSection title="Account">
                <SettingsRow
                  icon="at-outline"
                  title="Username"
                  value={`@${username}`}
                />
                <View className="h-px bg-gray-200 dark:bg-zinc-700" />
                <View className="gap-2 p-3">
                  <View className="flex-row items-center gap-2">
                    <Input
                      className="flex-1"
                      value={usernameDraft}
                      onChangeText={setUsernameDraft}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="New username"
                    />
                    <Button
                      size="sm"
                      disabled={!canSubmitUsername}
                      onPress={onUpdateUsername}
                    >
                      {isUpdatingUsername ? "Saving..." : "Save"}
                    </Button>
                  </View>
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
                    <Pressable
                      disabled={
                        trimmedUsernameDraft === username || isUpdatingUsername
                      }
                      onPress={() => setUsernameDraft(username)}
                      className={cn(
                        "rounded-md px-2 py-1",
                        trimmedUsernameDraft === username || isUpdatingUsername
                          ? "opacity-40"
                          : "active:bg-gray-100 dark:active:bg-zinc-700",
                      )}
                    >
                      <Text className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Reset
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <View className="h-px bg-gray-200 dark:bg-zinc-700" />
                <SettingsRow
                  icon="mail-outline"
                  title="Email"
                  value={email}
                  trailing={
                    <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-gray-500 dark:text-gray-400">
                      Verified
                    </Text>
                  }
                />
              </SettingsSection>

              <SettingsSection title="Notifications">
                <SettingsRow
                  icon="notifications-outline"
                  title="Notification Status"
                  value={pushStatusState}
                  trailing={
                    <View
                      className={cn(
                        "rounded-full px-2 py-0.5",
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
                          ? "N/A"
                          : pushStatus?.enabled
                            ? "ON"
                            : "OFF"}
                      </Text>
                    </View>
                  }
                />
                <View className="h-px bg-gray-200 dark:bg-zinc-700" />
                <View className="gap-2 p-3">
                  <View className="flex-row flex-wrap gap-2">
                    <View className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-zinc-700 dark:bg-zinc-900">
                      <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-gray-600 dark:text-gray-300">
                        Tokens: {pushStatus?.tokenCount ?? 0}
                      </Text>
                    </View>
                    <View
                      className={cn(
                        "rounded-full border px-2.5 py-1",
                        pushStatus?.enabled
                          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
                          : "border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900",
                      )}
                    >
                      <Text
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-[0.8px]",
                          pushStatus?.enabled
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-gray-600 dark:text-gray-300",
                        )}
                      >
                        Preference: {pushStatus?.enabled ? "On" : "Off"}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {pushStatusSummary}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {pushGuidance}
                  </Text>

                  <View className="mt-1 flex-row items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900">
                    <View className="flex-1 pr-3">
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-medium">
                        Allow Push Notifications
                      </Text>
                      <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {canTogglePushNotifications
                          ? "Toggle notification delivery for this account."
                          : "Enable OS notifications and register a token first."}
                      </Text>
                    </View>
                    <Switch
                      value={Boolean(pushStatus?.enabled)}
                      onValueChange={() => {
                        void onTogglePushNotifications();
                      }}
                      disabled={!canTogglePushNotifications}
                      trackColor={{ false: "#9ca3af", true: "#22c55e" }}
                      thumbColor={pushStatus?.enabled ? "#ffffff" : "#f3f4f6"}
                    />
                  </View>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdatingPushPreference}
                    onPress={() => void onRefresh()}
                  >
                    {isUpdatingPushPreference ? "Saving..." : "Refresh Notification Status"}
                  </Button>
                </View>
              </SettingsSection>

              <SettingsSection title="App Info">
                <View className="gap-3 p-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-semibold">
                        {appVersionSummary}
                      </Text>
                      <Text className="mt-1 text-xs font-semibold uppercase tracking-[0.8px] text-gray-500 dark:text-gray-400">
                        {appVersionTypeSummary}
                      </Text>
                      {updateCheckStatus ? (
                        <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {updateCheckStatus}
                        </Text>
                      ) : null}
                    </View>
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() => setIsDiagnosticsSheetOpen(true)}
                    >
                      Details
                    </Button>
                  </View>

                  <View className="flex-row gap-2">
                    <Button
                      className="flex-1"
                      variant="secondary"
                      onPress={() => void onCheckForUpdates()}
                      disabled={isCheckingForUpdates}
                    >
                      <View className="flex-row items-center gap-2">
                        {isCheckingForUpdates ? (
                          <ActivityIndicator
                            size="small"
                            color={isDarkColorScheme ? "#d1d5db" : "#111827"}
                          />
                        ) : null}
                        <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {isCheckingForUpdates ? "Checking..." : "Check for updates"}
                        </Text>
                      </View>
                    </Button>
                    <Button
                      className="flex-1"
                      variant="secondary"
                      onPress={() => void onCopyAppDiagnostics()}
                    >
                      <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Copy app info
                      </Text>
                    </Button>
                  </View>
                </View>
              </SettingsSection>

              {isSuperAdmin ? (
                <SettingsSection title="Admin">
                  <SettingsRow
                    icon="shield-checkmark-outline"
                    title="Global Admin Dashboard"
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
            <View className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
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

      <Modal
        visible={isDiagnosticsSheetOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsDiagnosticsSheetOpen(false)}
      >
        <View className="flex-1 bg-black/55">
          <Pressable
            className="flex-1"
            onPress={() => setIsDiagnosticsSheetOpen(false)}
          />
          <View className="max-h-[82%] rounded-t-3xl border border-gray-200 bg-white px-5 pb-5 pt-4 dark:border-zinc-700 dark:bg-zinc-900">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold tracking-tight">
                App diagnostics
              </Text>
              <Pressable
                className="rounded-full bg-gray-100 p-2 dark:bg-zinc-800"
                onPress={() => setIsDiagnosticsSheetOpen(false)}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={isDarkColorScheme ? "#d1d5db" : "#374151"}
                />
              </Pressable>
            </View>

            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {APP_DIAGNOSTICS_FIELDS.map((field, index) => (
                <View key={field.key}>
                  <View className="py-3">
                    <Text className="text-xs font-semibold uppercase tracking-[0.9px] text-gray-500 dark:text-gray-400">
                      {field.label}
                    </Text>
                    <Text className="text-app-fg-light dark:text-app-fg-dark mt-1 text-2xl font-medium leading-8">
                      {appDiagnostics[field.key]}
                    </Text>
                  </View>
                  {index < APP_DIAGNOSTICS_FIELDS.length - 1 ? (
                    <View className="h-px bg-gray-200 dark:bg-zinc-700" />
                  ) : null}
                </View>
              ))}
            </ScrollView>

            <View className="mt-2">
              <Button
                variant="secondary"
                onPress={() => void onCopyAppDiagnostics()}
              >
                <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Copy diagnostics
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
