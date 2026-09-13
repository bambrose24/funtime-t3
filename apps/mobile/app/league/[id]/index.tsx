import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { clientApi } from "@/lib/trpc/react";
import { ClientPickPage } from "@/components/picks/ClientPickPage";
import { ClientLeaderboardPage } from "@/components/leaderboard/ClientLeaderboardPage";
import { LeagueMessageBoard } from "@/components/messages/LeagueMessageBoard";
import { LeagueMyProfile } from "@/components/profile/LeagueMyProfile";
import { LeagueSuperbowlBoard } from "@/components/superbowl/LeagueSuperbowlBoard";
import { LeagueInfoTab } from "@/components/league/LeagueInfoTab";
import { LeagueOverviewTab } from "@/components/league/LeagueOverviewTab";
import { LeagueScreenHeader } from "@/components/league/LeagueScreenHeader";
import { usePrefetchForLeague } from "@/hooks/usePrefetchForLeague";
import { cn } from "@/lib/utils";
import { parseTabParam, type TabType } from "@/lib/league/leagueTabs";
import { useLeagueUnreadMessages } from "@/hooks/useLeagueUnreadMessages";
import { getUnreadBadgeLabel } from "@/lib/messages/unreadBadge";
import { useColorScheme } from "@/lib/useColorScheme";

export default function LeagueScreen() {
  const { id, tab, week } = useLocalSearchParams<{
    id: string;
    tab?: string;
    week?: string;
  }>();
  const { isDarkColorScheme } = useColorScheme();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const initialTab = parseTabParam(tab);
    return initialTab === "messages" ? "overview" : initialTab;
  });
  const [isChatVisible, setIsChatVisible] = useState(
    () => parseTabParam(tab) === "messages",
  );
  const [isPicksModalVisible, setIsPicksModalVisible] = useState(false);
  const scaleValue = useState(new Animated.Value(1))[0];
  const translateValue = useState(new Animated.Value(0))[0];
  const tabOpacity = useState(new Animated.Value(1))[0];
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  useEffect(() => {
    const nextTab = parseTabParam(tab);
    if (nextTab === "messages") {
      setActiveTab("overview");
      setIsChatVisible(true);
      return;
    }
    setActiveTab((currentTab) =>
      currentTab === nextTab ? currentTab : nextTab,
    );
  }, [tab]);

  useEffect(() => {
    Animated.timing(scaleValue, {
      toValue: isPicksModalVisible ? 0.95 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(translateValue, {
      toValue: isPicksModalVisible ? -20 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isPicksModalVisible, scaleValue, translateValue]);

  const leagueIdNumber = id ? parseInt(id, 10) : undefined;
  const { unreadCount } = useLeagueUnreadMessages(leagueIdNumber);
  const unreadBadgeLabel = getUnreadBadgeLabel(unreadCount);
  const selectedWeekFromParams = useMemo(() => {
    if (typeof week !== "string" || week.length === 0) {
      return undefined;
    }
    const parsedWeek = Number(week);
    if (!Number.isInteger(parsedWeek) || parsedWeek <= 0) {
      return undefined;
    }
    return parsedWeek;
  }, [week]);

  usePrefetchForLeague(leagueIdNumber, {
    immediate: true,
    aggressive: true,
  });

  const buildLeagueHref = useCallback(
    (params: { tab?: TabType; week?: number }) => {
      const query = new URLSearchParams();
      if (params.tab && params.tab !== "overview") {
        query.set("tab", params.tab);
      }
      if (params.week && Number.isInteger(params.week) && params.week > 0) {
        query.set("week", params.week.toString());
      }
      const queryString = query.toString();
      return queryString.length > 0
        ? `/league/${id}?${queryString}`
        : `/league/${id}`;
    },
    [id],
  );

  const switchToTab = (nextTab: TabType) => {
    if (nextTab === activeTab || isTabTransitioning) return;

    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });

    router.replace(
      buildLeagueHref({
        tab: nextTab,
        week: selectedWeekFromParams,
      }) as any,
    );

    setIsTabTransitioning(true);
    tabOpacity.stopAnimation();
    Animated.timing(tabOpacity, {
      toValue: 0,
      duration: 90,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        setIsTabTransitioning(false);
        return;
      }

      setActiveTab(nextTab);
      Animated.timing(tabOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setIsTabTransitioning(false);
      });
    });
  };

  const openChat = () => {
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });
    setIsChatVisible(true);
  };

  const closeChat = () => setIsChatVisible(false);

  const { data: leagueData, isLoading: leagueLoading } =
    clientApi.league.get.useQuery(
      { leagueId: leagueIdNumber! },
      {
        enabled: !!leagueIdNumber && !isNaN(leagueIdNumber),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
      },
    );
  const { data: session } = clientApi.session.current.useQuery();
  const { data: isSuperAdmin } = clientApi.generalAdmin.isSuperAdmin.useQuery();
  const isLeagueAdmin = Boolean(
    session?.dbUser?.leaguemembers.find(
      (member) =>
        member.league_id === leagueIdNumber && member.role === "admin",
    ),
  );

  useEffect(() => {
    if (
      activeTab === "superbowl" &&
      leagueData &&
      !leagueData.superbowl_competition
    ) {
      setActiveTab("overview");
    }
  }, [activeTab, leagueData]);

  if (!id) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg-light dark:bg-app-bg-dark">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500 dark:text-gray-400">
            League not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const showSuperbowlTab =
    leagueData?.superbowl_competition ?? activeTab === "superbowl";
  const tabs: { key: TabType; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "picks", label: "Pick" },
    { key: "leaderboard", label: "Leaderboard" },
    { key: "info", label: "Info" },
    ...(showSuperbowlTab
      ? [{ key: "superbowl" as TabType, label: "Super Bowl" }]
      : []),
    { key: "profile", label: "My Profile" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <LeagueOverviewTab
            leagueId={id}
            selectedWeekParam={selectedWeekFromParams}
            onSelectWeek={(selectedWeek) =>
              router.replace(
                buildLeagueHref({
                  tab: activeTab,
                  week: selectedWeek,
                }) as any,
              )
            }
            onSwitchToPicks={() => switchToTab("picks")}
            isPicksModalVisible={isPicksModalVisible}
            setIsPicksModalVisible={setIsPicksModalVisible}
            isLeagueAdmin={isLeagueAdmin}
          />
        );
      case "picks":
        return <ClientPickPage leagueId={id} />;
      case "leaderboard":
        return <ClientLeaderboardPage leagueId={id} />;
      case "messages":
        return <LeagueMessageBoard leagueId={id} />;
      case "info":
        return <LeagueInfoTab leagueId={id} />;
      case "profile":
        return <LeagueMyProfile leagueId={id} />;
      case "superbowl":
        return <LeagueSuperbowlBoard leagueId={id} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg-light dark:bg-app-bg-dark">
      <Animated.View
        className="flex-1"
        style={{
          transform: [{ scale: scaleValue }, { translateY: translateValue }],
        }}
      >
        <LeagueScreenHeader
          leagueId={id}
          leagueIdNumber={leagueIdNumber}
          leagueData={leagueData}
          leagueLoading={leagueLoading}
          unreadCount={unreadCount}
          unreadBadgeLabel={unreadBadgeLabel}
          isLeagueAdmin={isLeagueAdmin}
          isSuperAdmin={Boolean(isSuperAdmin)}
          onOpenChat={openChat}
        />

        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            <View className="flex-row items-end">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => switchToTab(tab.key)}
                    className="relative mr-6 pb-3 pt-2"
                    hitSlop={8}
                  >
                    <View className="flex-row items-center gap-1.5">
                      <Text
                        className={cn(
                          "text-sm font-semibold tracking-tight",
                          isActive
                            ? "text-gray-900 dark:text-gray-100"
                            : "text-gray-500 dark:text-gray-400",
                        )}
                      >
                        {tab.label}
                      </Text>
                    </View>
                    <View
                      className={cn(
                        "absolute -bottom-px left-0 right-0 h-0.5 rounded-full",
                        isActive
                          ? "bg-gray-900 dark:bg-gray-100"
                          : "bg-transparent",
                      )}
                    />
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          <View className="h-px bg-gray-200 dark:bg-zinc-700" />
        </View>

        <Animated.View className="flex-1" style={{ opacity: tabOpacity }}>
          {renderTabContent()}
        </Animated.View>
      </Animated.View>

      <Modal
        visible={isChatVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={closeChat}
      >
        <View className="flex-1 justify-end bg-black/60">
          <SafeAreaView className="h-full bg-app-bg-light dark:bg-app-bg-dark">
            <View className="flex-row items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-zinc-800">
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-green-500" />
                <View>
                  <Text className="text-base font-bold text-app-fg-light dark:text-app-fg-dark">
                    League chat
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {leagueData?.name ?? "League"}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close league chat"
                onPress={closeChat}
                className="bg-app-card-light dark:bg-app-card-dark rounded-full p-2"
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={isDarkColorScheme ? "#e5e7eb" : "#374151"}
                />
              </Pressable>
            </View>
            <LeagueMessageBoard leagueId={id} />
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
