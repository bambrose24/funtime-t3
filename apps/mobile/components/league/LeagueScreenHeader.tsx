import { useCallback } from "react";
import { Alert, Pressable, Share, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { type RouterOutputs } from "~/trpc/types";
import { useColorScheme } from "@/lib/useColorScheme";
import { createComponentLogger } from "@/lib/logging";
import { getShareLeagueInvite } from "@/lib/league/getShareLeagueInvite";

type Props = {
  leagueId: string;
  leagueIdNumber?: number;
  leagueData?: RouterOutputs["league"]["get"];
  leagueLoading: boolean;
  unreadCount: number;
  unreadBadgeLabel: string | null;
  isLeagueAdmin: boolean;
  isSuperAdmin: boolean;
  onOpenChat: () => void;
};

export function LeagueScreenHeader({
  leagueId,
  leagueIdNumber,
  leagueData,
  leagueLoading,
  unreadCount,
  unreadBadgeLabel,
  isLeagueAdmin,
  isSuperAdmin,
  onOpenChat,
}: Props) {
  const logger = createComponentLogger("LeagueScreen");
  const { isDarkColorScheme } = useColorScheme();
  const canManageLeague = isLeagueAdmin || isSuperAdmin;
  const shareInvite = getShareLeagueInvite(leagueData ?? null);
  const canShareInvite = isLeagueAdmin && Boolean(shareInvite);

  const onShareInvite = useCallback(async () => {
    if (!shareInvite) {
      return;
    }

    try {
      await Share.share({
        title: "League Invite",
        message: shareInvite.message,
        url: shareInvite.url,
      });
    } catch (error) {
      logger.error("Failed to share invite", {
        leagueId: leagueIdNumber,
        error: error instanceof Error ? error.message : String(error),
      });
      Alert.alert("Unable to share invite", "Please try again in a moment.");
    }
  }, [leagueIdNumber, logger, shareInvite]);

  return (
    <View className="border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
      <View className="flex-row items-center justify-between">
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
        <View className="mx-4 flex-1">
          <Text
            className="text-center text-xl font-bold text-app-fg-light dark:text-app-fg-dark"
            numberOfLines={1}
          >
            {leagueLoading ? "Loading..." : (leagueData?.name ?? "League")}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              unreadCount > 0
                ? `Open league chat, ${unreadBadgeLabel} unread messages`
                : "Open league chat"
            }
            onPress={onOpenChat}
            className="bg-app-card-light dark:bg-app-card-dark relative rounded-lg p-2"
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color={isDarkColorScheme ? "#e5e7eb" : "#374151"}
            />
            {unreadBadgeLabel ? (
              <View className="absolute -right-1 -top-1 min-w-5 items-center rounded-full bg-red-600 px-1.5 py-0.5">
                <Text className="text-[10px] font-bold text-white">
                  {unreadBadgeLabel}
                </Text>
              </View>
            ) : null}
          </Pressable>
          {canManageLeague ? (
            <Pressable
              onPress={() => router.push(`/league/${leagueId}/admin` as any)}
              className="bg-app-card-light dark:bg-app-card-dark rounded-lg p-2"
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={isDarkColorScheme ? "#e5e7eb" : "#374151"}
              />
            </Pressable>
          ) : null}
          {canShareInvite ? (
            <Pressable
              onPress={onShareInvite}
              className="bg-app-card-light dark:bg-app-card-dark rounded-lg p-2"
            >
              <Ionicons
                name="share-social-outline"
                size={20}
                color={isDarkColorScheme ? "#e5e7eb" : "#374151"}
              />
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => router.push("/account")}
            className="bg-app-card-light dark:bg-app-card-dark rounded-lg p-2"
          >
            <Ionicons
              name="person"
              size={20}
              color={isDarkColorScheme ? "#e5e7eb" : "#374151"}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
