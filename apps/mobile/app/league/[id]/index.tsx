import React, { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  ScrollView,
  Modal,
  Animated,
  RefreshControl,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { formatDistanceToNow } from "date-fns";
import { clientApi } from "@/lib/trpc/react";
import { useUser } from "@/hooks/useUser";
import { ClientPickPage } from "@/components/picks/ClientPickPage";
import { ClientLeaderboardPage } from "@/components/leaderboard/ClientLeaderboardPage";
import { LeagueMessageBoard } from "@/components/messages/LeagueMessageBoard";
import { LeagueMyProfile } from "@/components/profile/LeagueMyProfile";
import { LeagueSuperbowlBoard } from "@/components/superbowl/LeagueSuperbowlBoard";
import { type RouterOutputs } from "~/trpc/types";
import { useColorScheme } from "@/lib/useColorScheme";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { usePrefetchForLeague } from "@/hooks/usePrefetchForLeague";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { createComponentLogger } from "@/lib/logging";

type TabType =
  | "overview"
  | "picks"
  | "leaderboard"
  | "messages"
  | "profile"
  | "superbowl";

const TAB_KEYS: TabType[] = [
  "overview",
  "picks",
  "leaderboard",
  "messages",
  "profile",
  "superbowl",
];

function parseTabParam(tabParam?: string): TabType {
  if (tabParam && TAB_KEYS.includes(tabParam as TabType)) {
    return tabParam as TabType;
  }
  return "overview";
}

export default function LeagueScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const [activeTab, setActiveTab] = useState<TabType>(parseTabParam(tab));
  const [isPicksModalVisible, setIsPicksModalVisible] = useState(false);
  const { isDarkColorScheme } = useColorScheme();
  const scaleValue = useState(new Animated.Value(1))[0];
  const translateValue = useState(new Animated.Value(0))[0];
  const tabOpacity = useState(new Animated.Value(1))[0];
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  useEffect(() => {
    const nextTab = parseTabParam(tab);
    setActiveTab((currentTab) =>
      currentTab === nextTab ? currentTab : nextTab,
    );
  }, [tab]);

  // Animate background when modal opens/closes
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

  // Parse league ID and set up comprehensive prefetching
  const leagueIdNumber = id ? parseInt(id, 10) : undefined;

  // Prefetch ALL league data immediately when screen loads
  usePrefetchForLeague(leagueIdNumber, {
    immediate: true, // Start prefetching right away
    aggressive: true, // Prefetch historical data too
  });

  const switchToTab = (nextTab: TabType) => {
    if (nextTab === activeTab || isTabTransitioning) return;

    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });

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

  // Fetch league data to display league name (this should be cached from prefetch)
  const { data: leagueData, isLoading: leagueLoading } =
    clientApi.league.get.useQuery(
      { leagueId: leagueIdNumber! },
      {
        enabled: !!leagueIdNumber && !isNaN(leagueIdNumber),
        staleTime: 5 * 60 * 1000, // 5 minutes
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
  const canManageLeague = isLeagueAdmin || Boolean(isSuperAdmin);

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
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
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
    { key: "messages", label: "Messages" },
    ...(showSuperbowlTab
      ? [{ key: "superbowl" as TabType, label: "Super Bowl" }]
      : []),
    { key: "profile", label: "My Profile" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <LeagueOverview
            leagueId={id}
            onSwitchToPicks={() => switchToTab("picks")}
            isPicksModalVisible={isPicksModalVisible}
            setIsPicksModalVisible={setIsPicksModalVisible}
          />
        );
      case "picks":
        return <ClientPickPage leagueId={id} />;
      case "leaderboard":
        return <ClientLeaderboardPage leagueId={id} />;
      case "messages":
        return <LeagueMessageBoard leagueId={id} />;
      case "profile":
        return <LeagueMyProfile leagueId={id} />;
      case "superbowl":
        return <LeagueSuperbowlBoard leagueId={id} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <Animated.View
        className="flex-1"
        style={{
          transform: [{ scale: scaleValue }, { translateY: translateValue }],
        }}
      >
        {/* Header */}
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
                className="text-app-fg-light dark:text-app-fg-dark text-center text-xl font-bold"
                numberOfLines={1}
              >
                {leagueLoading ? "Loading..." : (leagueData?.name ?? "League")}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              {canManageLeague ? (
                <Pressable
                  onPress={() => router.push(`/league/${id}/admin` as any)}
                  className="bg-app-card-light dark:bg-app-card-dark rounded-lg p-2"
                >
                  <Ionicons
                    name="shield-checkmark-outline"
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

        {/* Tab Navigation */}
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
                    <View
                      className={cn(
                        "absolute -bottom-px left-0 right-0 h-0.5 rounded-full",
                        isActive ? "bg-gray-900 dark:bg-gray-100" : "bg-transparent",
                      )}
                    />
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          {/* Bottom Border */}
          <View className="h-px bg-gray-200 dark:bg-zinc-700" />
        </View>

        {/* Tab Content */}
        <Animated.View className="flex-1" style={{ opacity: tabOpacity }}>
          {renderTabContent()}
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

// Custom hook for prefetching and persisting league overview data
function useLeagueOverviewData(leagueId: string) {
  const leagueIdNumber = parseInt(leagueId, 10);
  const utils = clientApi.useUtils();

  // Prefetch data when component mounts and on focus
  useFocusEffect(
    React.useCallback(() => {
      // Prefetch core data immediately
      utils.league.get.prefetch({ leagueId: leagueIdNumber });
      utils.time.activeWeekByLeague.prefetch({ leagueId: leagueIdNumber });
      utils.teams.getTeams.prefetch();
    }, [leagueIdNumber, utils]),
  );

  // Query with persistence and revalidation settings
  const leagueQuery = clientApi.league.get.useQuery(
    { leagueId: leagueIdNumber },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  );

  const activeWeekQuery = clientApi.time.activeWeekByLeague.useQuery(
    { leagueId: leagueIdNumber },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  );

  const teamsQuery = clientApi.teams.getTeams.useQuery(undefined, {
    staleTime: 30 * 60 * 1000, // 30 minutes (teams rarely change)
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  // Get user's existing picks to determine the correct week to show
  const allUserPicksQuery = clientApi.member.picksForWeek.useQuery(
    {
      leagueId: leagueIdNumber,
      week: activeWeekQuery.data?.week ?? 1, // Use week 1 as fallback
    },
    {
      enabled: !!leagueIdNumber,
      staleTime: 1 * 60 * 1000, // 1 minute
      refetchOnWindowFocus: true,
    },
  );

  // Determine the correct week to display (following web app logic)
  const displayWeek = useMemo(() => {
    const activeWeek = activeWeekQuery.data?.week;
    const userPicks = allUserPicksQuery.data || [];

    if (activeWeek) {
      return activeWeek;
    }

    // If no active week but user has picks, use their most recent pick week
    if (userPicks.length > 0) {
      return userPicks[0]?.week ?? 1;
    }

    // Default to week 1
    return 1;
  }, [activeWeekQuery.data?.week, allUserPicksQuery.data]);

  // Dependent queries that wait for displayWeek
  const gamesQuery = clientApi.games.getGames.useQuery(
    {
      week: displayWeek,
      season: leagueQuery.data?.season ?? 0,
    },
    {
      enabled: !!displayWeek && !!leagueQuery.data?.season,
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: true,
    },
  );

  const picksSummaryQuery = clientApi.league.picksSummary.useQuery(
    {
      leagueId: leagueIdNumber,
      week: displayWeek,
    },
    {
      enabled: !!displayWeek,
      staleTime: 1 * 60 * 1000, // 1 minute (picks change frequently)
      refetchOnWindowFocus: true,
    },
  );

  const userPicksQuery = clientApi.member.picksForWeek.useQuery(
    {
      leagueId: leagueIdNumber,
      week: displayWeek,
    },
    {
      enabled: !!leagueIdNumber && !!displayWeek,
      staleTime: 1 * 60 * 1000, // 1 minute
      refetchOnWindowFocus: true,
    },
  );

  // Prefetch dependent data when we have displayWeek
  useEffect(() => {
    if (displayWeek && leagueQuery.data?.season) {
      utils.games.getGames.prefetch({
        week: displayWeek,
        season: leagueQuery.data.season,
      });
      utils.league.picksSummary.prefetch({
        leagueId: leagueIdNumber,
        week: displayWeek,
      });
      utils.member.picksForWeek.prefetch({
        leagueId: leagueIdNumber,
        week: displayWeek,
      });
    }
  }, [displayWeek, leagueQuery.data?.season, leagueIdNumber, utils]);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      leagueQuery.refetch(),
      activeWeekQuery.refetch(),
      teamsQuery.refetch(),
      allUserPicksQuery.refetch(),
      gamesQuery.refetch(),
      picksSummaryQuery.refetch(),
      userPicksQuery.refetch(),
    ]);
  }, [
    leagueQuery,
    activeWeekQuery,
    teamsQuery,
    allUserPicksQuery,
    gamesQuery,
    picksSummaryQuery,
    userPicksQuery,
  ]);

  return {
    leagueData: leagueQuery.data,
    activeWeek: activeWeekQuery.data,
    displayWeek,
    games: gamesQuery.data,
    teams: teamsQuery.data,
    picksSummary: picksSummaryQuery.data,
    userPicks: userPicksQuery.data,
    isLoading:
      leagueQuery.isLoading ||
      activeWeekQuery.isLoading ||
      teamsQuery.isLoading,
    isUserPicksLoading: userPicksQuery.isLoading,
    isError:
      leagueQuery.isError || activeWeekQuery.isError || teamsQuery.isError,
    refetchAll,
  };
}

// League Overview Component with Suspense and Error Boundaries
function LeagueOverview({
  leagueId,
  onSwitchToPicks,
  isPicksModalVisible,
  setIsPicksModalVisible,
}: {
  leagueId: string;
  onSwitchToPicks: () => void;
  isPicksModalVisible: boolean;
  setIsPicksModalVisible: (visible: boolean) => void;
}) {
  const { isDarkColorScheme } = useColorScheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const {
    leagueData,
    activeWeek,
    displayWeek,
    games,
    teams,
    picksSummary,
    userPicks,
    isLoading,
    isUserPicksLoading,
    isError,
    refetchAll,
  } = useLeagueOverviewData(leagueId);

  const now = new Date();
  const totalGames = games?.length ?? 0;
  const myPickCount = userPicks?.length ?? 0;
  const openGamesCount =
    games?.filter((game) => new Date(game.ts) > now).length ?? 0;
  const lockedGamesCount = Math.max(totalGames - openGamesCount, 0);
  const submittedMembersCount =
    picksSummary?.filter((member) => member.picks.length > 0).length ?? 0;
  const totalMembersCount = picksSummary?.length ?? 0;
  const picksRemainingCount = Math.max(totalGames - myPickCount, 0);
  const weekProgressLabel =
    totalGames > 0
      ? `${myPickCount}/${totalGames} picks submitted`
      : "No games posted yet";
  const leagueProgressLabel =
    totalMembersCount > 0
      ? `${submittedMembersCount}/${totalMembersCount} members submitted`
      : "League submissions will appear once picks are posted";
  const refreshStatusLabel = isRefreshing
    ? "Refreshing..."
    : lastRefreshedAt
      ? `Updated ${formatDistanceToNow(lastRefreshedAt, { addSuffix: true })}`
      : "Pull down to refresh latest standings and picks";
  const picksActionLabel =
    totalGames === 0
      ? "Awaiting Schedule"
      : myPickCount === 0
        ? "Start Picks"
        : openGamesCount === 0
          ? "Review Locked Picks"
          : myPickCount < totalGames
            ? `Finish Picks (${myPickCount}/${totalGames})`
            : "Review Picks";
  const picksActionDescription =
    totalGames === 0
      ? `Week ${displayWeek} matchups will appear once published.`
      : openGamesCount === 0
        ? "Kickoff locks are active. You can still review your submitted picks."
        : picksRemainingCount > 0
          ? `${picksRemainingCount} pick${picksRemainingCount === 1 ? "" : "s"} left before kickoff.`
          : "All picks submitted. You can still update games that have not started.";
  const pickOutcomeSummary = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let pending = 0;

    for (const pick of userPicks ?? []) {
      const game = games?.find((candidate) => candidate.gid === pick.gid);
      if (!game || !pick.winner || !game.winner) {
        pending += 1;
        continue;
      }
      if (game.winner === pick.winner) {
        correct += 1;
      } else {
        wrong += 1;
      }
    }

    return { correct, wrong, pending };
  }, [games, userPicks]);

  useEffect(() => {
    if (!isLoading && !isUserPicksLoading && !lastRefreshedAt) {
      setLastRefreshedAt(new Date());
    }
  }, [isLoading, isUserPicksLoading, lastRefreshedAt]);

  const onRefresh = useCallback(async () => {
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });

    setIsRefreshing(true);
    try {
      await refetchAll();
      setLastRefreshedAt(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchAll]);

  // Show error state
  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-center text-base text-red-500 dark:text-red-400">
          Failed to load league data. Pull to refresh.
        </Text>
      </View>
    );
  }

  // Show skeleton loading for initial load - no intermediate loading state needed

  // Create team lookup map
  const teamById = teams ? new Map(teams.map((t) => [t.teamid, t])) : new Map();

  const logger = createComponentLogger("LeagueOverview");
  logger.debug("Picks summary data", {
    picksSummaryLength: picksSummary?.length || 0,
    gamesLength: games?.length || 0,
    teamsLength: teams?.length || 0,
    activeWeek,
    displayWeek,
  });

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={isDarkColorScheme ? "#e5e7eb" : "#374151"}
        />
      }
    >
      <View className="py-6">
        {/* Week Header - Remove league name since it's already in nav */}
        <View className="mb-6 px-4">
          {isLoading ? (
            <Skeleton className="mx-auto h-6 w-32 rounded" />
          ) : (
            displayWeek && (
              <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-lg font-semibold">
                Week {displayWeek}, {leagueData?.season}
              </Text>
            )
          )}
        </View>

        {/* Week Status Summary */}
        {!isLoading && !isUserPicksLoading && (
          <View className="mx-4 mb-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
            <View className="flex-row items-center justify-between">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold">
                Week Snapshot
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {refreshStatusLabel}
              </Text>
            </View>
            <View className="mt-2 flex-row flex-wrap gap-2">
              <View className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 dark:border-emerald-800 dark:bg-emerald-950">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-emerald-700 dark:text-emerald-300">
                  Open: {openGamesCount}
                </Text>
              </View>
              <View className="rounded-full border border-gray-200 bg-white px-2.5 py-1 dark:border-zinc-700 dark:bg-zinc-800">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-gray-600 dark:text-gray-300">
                  Locked: {lockedGamesCount}
                </Text>
              </View>
              <View className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 dark:border-blue-800 dark:bg-blue-950">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-blue-700 dark:text-blue-300">
                  Your Picks: {myPickCount}/{totalGames}
                </Text>
              </View>
            </View>
            <Text className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {leagueProgressLabel}
            </Text>
          </View>
        )}

        {/* Loading Skeletons */}
        {(isLoading || isUserPicksLoading) && (
          <>
            {/* Picks Button Skeleton */}
            <View className="mx-4 mb-6">
              <Skeleton className="h-10 rounded-lg" />
            </View>

            {/* Games Section Skeleton */}
            <View className="mb-6">
              <Skeleton className="mx-4 mb-3 h-6 w-40" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingRight: 32,
                }}
              >
                <View className="flex-row gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-28 rounded-lg" />
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Picks Table Skeleton */}
            <View className="mx-4 mb-6">
              <Skeleton className="mb-4 h-6 w-32" />
              <View className="rounded-lg border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                {/* Table Header */}
                <View className="flex-row border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
                  <Skeleton className="h-4 w-20" />
                  <View className="flex-1" />
                  <Skeleton className="h-4 w-16" />
                </View>
                {/* Table Rows */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <View
                    key={i}
                    className="flex-row items-center border-b border-gray-100 px-3 py-3 dark:border-zinc-700"
                  >
                    <Skeleton className="h-4 w-24" />
                    <View className="flex-1" />
                    <Skeleton className="h-4 w-8" />
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Your Picks - Only show after loading is complete */}
        {!isLoading && !isUserPicksLoading && displayWeek && (
          <View className="mx-4 mb-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              Your Week Picks
            </Text>
            <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {weekProgressLabel}
            </Text>
            <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {picksActionDescription}
            </Text>

            <View className="mt-3 gap-2">
              <Pressable
                onPress={onSwitchToPicks}
                disabled={totalGames === 0}
                className={cn(
                  "rounded-lg px-4 py-2.5",
                  totalGames === 0
                    ? "bg-gray-300 dark:bg-zinc-700"
                    : "bg-blue-500",
                )}
              >
                <Text className="text-center font-medium text-white">
                  {picksActionLabel}
                </Text>
              </Pressable>
              {myPickCount > 0 ? (
                <Pressable
                  onPress={() => setIsPicksModalVisible(true)}
                  className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 dark:border-zinc-600 dark:bg-zinc-700"
                >
                  <Text className="text-center font-medium text-gray-700 dark:text-gray-300">
                    View Pick Summary
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        )}

        {/* Games This Week */}
        {games && games.length > 0 && (
          <View className="mb-6">
            <View className="mb-3 flex-row items-center justify-between px-4">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-semibold">
                This Week's Games
              </Text>
              <View className="flex-row items-center gap-1.5">
                <View className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 dark:border-emerald-800 dark:bg-emerald-950">
                  <Text className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    {openGamesCount} open
                  </Text>
                </View>
                <Pressable
                  className="rounded-full border border-gray-200 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <Text className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                    {lockedGamesCount} locked
                  </Text>
                </Pressable>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingRight: 32,
              }}
            >
              <View className="flex-row gap-3">
                {games.map((game) => {
                  const userPick = userPicks?.find((p) => p.gid === game.gid);
                  return (
                    <MobileGameCard
                      key={game.gid}
                      game={game}
                      homeTeam={teamById.get(game.home)}
                      awayTeam={teamById.get(game.away)}
                      myChosenTeam={userPick?.winner}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {!isLoading && !isUserPicksLoading && (!games || games.length === 0) && (
          <View className="mx-4 mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 dark:border-zinc-700 dark:bg-zinc-800">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              No Games Posted Yet
            </Text>
            <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Week {displayWeek} matchups will appear here once the schedule is available.
            </Text>
          </View>
        )}

        {/* Picks Table */}
        {picksSummary && picksSummary.length > 0 && games && (
          <View className="mb-6">
            <Text className="text-app-fg-light dark:text-app-fg-dark mb-3 px-4 text-lg font-semibold">
              League Picks
            </Text>
            {games.length > 5 ? (
              <Text className="mb-2 px-4 text-xs text-gray-500 dark:text-gray-400">
                Swipe horizontally to view every game column.
              </Text>
            ) : null}
            <MobilePicksTable
              picksSummary={picksSummary}
              games={games}
              teams={teamById}
            />
          </View>
        )}

        {!isLoading &&
          !isUserPicksLoading &&
          games &&
          games.length > 0 &&
          (!picksSummary || picksSummary.length === 0) && (
            <View className="mx-4 mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 dark:border-zinc-700 dark:bg-zinc-800">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
                No League Picks Yet
              </Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Picks will populate once members submit for this week.
              </Text>
            </View>
          )}
      </View>

      {/* Picks Modal */}
      <Modal
        visible={isPicksModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPicksModalVisible(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        >
          <Pressable
            className="flex-1"
            onPress={() => setIsPicksModalVisible(false)}
          />
          <View className="bg-app-bg-light dark:bg-app-bg-dark rounded-t-3xl">
            <SafeAreaView>
              {/* Modal Header */}
              <View className="border-b border-gray-200 px-4 py-3 dark:border-zinc-700">
                <View className="flex-row items-center justify-between">
                  <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-semibold">
                    Your Week {displayWeek}, {leagueData?.season} Picks
                  </Text>
                  <Pressable
                    onPress={() => setIsPicksModalVisible(false)}
                    className="rounded-full p-2"
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={isDarkColorScheme ? "#ffffff" : "#000000"}
                    />
                  </Pressable>
                </View>
                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {pickOutcomeSummary.correct} correct / {pickOutcomeSummary.wrong} wrong / {pickOutcomeSummary.pending} pending
                </Text>
              </View>

              {/* Modal Content */}
              <ScrollView
                style={{ maxHeight: 520 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              >
                {userPicks && userPicks.length > 0 ? (
                  <>
                    <View className="mb-3 flex-row flex-wrap gap-2">
                      <View className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 dark:border-green-800 dark:bg-green-950">
                        <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-green-700 dark:text-green-300">
                          Correct: {pickOutcomeSummary.correct}
                        </Text>
                      </View>
                      <View className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 dark:border-red-800 dark:bg-red-950">
                        <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-red-700 dark:text-red-300">
                          Wrong: {pickOutcomeSummary.wrong}
                        </Text>
                      </View>
                      <View className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 dark:border-blue-800 dark:bg-blue-950">
                        <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-blue-700 dark:text-blue-300">
                          Pending: {pickOutcomeSummary.pending}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row flex-wrap justify-between gap-3">
                      {userPicks.map((pick) => {
                        const game = games?.find((g) => g.gid === pick.gid);
                        if (!game) return null;

                        const homeTeam = teamById.get(game.home);
                        const awayTeam = teamById.get(game.away);
                        const pickedTeam = pick.winner ? teamById.get(pick.winner) : null;

                        if (!homeTeam || !awayTeam) return null;

                        const choseHome = pick.winner === game.home;
                        const choseAway = pick.winner === game.away;
                        const gameWinner = game.winner;
                        const gameStarted = new Date(game.ts) <= new Date();
                        const gameEnded = Boolean(game.done);
                        const status =
                          !gameWinner || !pick.winner
                            ? "empty-state"
                            : gameWinner === pick.winner
                              ? "correct"
                              : "wrong";
                        const statusLabel =
                          status === "correct"
                            ? "Correct"
                            : status === "wrong"
                              ? "Wrong"
                              : gameStarted && !gameEnded
                                ? "Live"
                                : "Pending";
                        const kickoffLabel = new Date(game.ts).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        });

                        return (
                          <View
                            key={pick.gid}
                            className={cn(
                              "rounded-xl border-2 bg-white px-4 py-3 dark:bg-zinc-800",
                              status === "correct"
                                ? "border-green-300 dark:border-green-700"
                                : status === "wrong"
                                  ? "border-red-300 dark:border-red-700"
                                  : "border-gray-200 dark:border-zinc-700",
                            )}
                            style={{ width: "48%" }}
                          >
                            <View className="mb-2 flex-row items-center justify-between">
                              <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                                {kickoffLabel}
                              </Text>
                              <View
                                className={cn(
                                  "rounded-full px-2 py-0.5",
                                  status === "correct"
                                    ? "bg-green-100 dark:bg-green-900/40"
                                    : status === "wrong"
                                      ? "bg-red-100 dark:bg-red-900/40"
                                      : "bg-blue-100 dark:bg-blue-900/40",
                                )}
                              >
                                <Text
                                  className={cn(
                                    "text-[10px] font-semibold uppercase",
                                    status === "correct"
                                      ? "text-green-700 dark:text-green-300"
                                      : status === "wrong"
                                        ? "text-red-700 dark:text-red-300"
                                        : "text-blue-700 dark:text-blue-300",
                                  )}
                                >
                                  {statusLabel}
                                </Text>
                              </View>
                            </View>

                            {/* Teams Layout: Away @ Home */}
                            <View className="flex-row items-center justify-center gap-2">
                              {/* Away Team */}
                              <View
                                className={cn(
                                  "flex-1 flex-row items-center justify-center gap-1 rounded-md border px-2 py-1.5",
                                  choseAway && status === "correct"
                                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                    : choseAway && status === "wrong"
                                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                      : choseAway && status === "empty-state"
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-gray-300 dark:border-zinc-600",
                                )}
                              >
                                <TeamLogo
                                  abbrev={awayTeam.abbrev ?? ""}
                                  width={16}
                                  height={16}
                                />
                                <Text className="text-app-fg-light dark:text-app-fg-dark text-xs font-medium">
                                  {awayTeam.abbrev}
                                </Text>
                              </View>

                              <Text className="px-1 text-xs text-gray-500 dark:text-gray-400">
                                @
                              </Text>

                              {/* Home Team */}
                              <View
                                className={cn(
                                  "flex-1 flex-row items-center justify-center gap-1 rounded-md border px-2 py-1.5",
                                  choseHome && status === "correct"
                                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                    : choseHome && status === "wrong"
                                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                      : choseHome && status === "empty-state"
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-gray-300 dark:border-zinc-600",
                                )}
                              >
                                <TeamLogo
                                  abbrev={homeTeam.abbrev ?? ""}
                                  width={16}
                                  height={16}
                                />
                                <Text className="text-app-fg-light dark:text-app-fg-dark text-xs font-medium">
                                  {homeTeam.abbrev}
                                </Text>
                              </View>
                            </View>

                            <Text className="mt-2 text-center text-[11px] text-gray-600 dark:text-gray-400">
                              Pick: {pickedTeam?.abbrev ?? "-"}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    {openGamesCount > 0 ? (
                      <Pressable
                        onPress={() => {
                          setIsPicksModalVisible(false);
                          onSwitchToPicks();
                        }}
                        className="mt-4 rounded-lg bg-blue-500 px-4 py-2.5"
                      >
                        <Text className="text-center font-medium text-white">
                          Edit Open Picks
                        </Text>
                      </Pressable>
                    ) : null}
                  </>
                ) : (
                  <View className="items-center justify-center py-14">
                    <Text className="text-center text-gray-600 dark:text-gray-400">
                      No picks found for this week.
                    </Text>
                    <Pressable
                      onPress={() => {
                        setIsPicksModalVisible(false);
                        onSwitchToPicks();
                      }}
                      className="mt-4 rounded-lg bg-blue-500 px-4 py-2.5"
                    >
                      <Text className="text-center font-medium text-white">
                        Open Picks Tab
                      </Text>
                    </Pressable>
                  </View>
                )}
              </ScrollView>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Mobile Game Card Component (similar to web GameCard but mobile-optimized)
function MobileGameCard({
  game,
  homeTeam,
  awayTeam,
  myChosenTeam,
}: {
  game: RouterOutputs["games"]["getGames"][number];
  homeTeam?: RouterOutputs["teams"]["getTeams"][number];
  awayTeam?: RouterOutputs["teams"]["getTeams"][number];
  myChosenTeam?: number | null;
}) {
  if (!homeTeam || !awayTeam) return null;

  const gameTime = new Date(game.ts);
  const gameStarted = gameTime < new Date();
  const gameEnded = game.done ?? false;
  const gameOngoing = !gameEnded && gameStarted;
  const winner = game.winner;

  // Status logic from web GameCard
  const status: "ongoing" | "correct" | "wrong" | "empty-state" = gameOngoing
    ? "ongoing"
    : !gameStarted
      ? "empty-state"
      : !myChosenTeam || !winner
        ? "empty-state"
        : myChosenTeam === winner
          ? "correct"
          : "wrong";

  const formatGameTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < -24) {
      return "Final";
    } else if (diffInHours < 0) {
      return "In Progress";
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <View
      className={cn(
        "h-24 w-28 rounded-lg border-2 bg-white p-2 transition-colors dark:bg-zinc-800",
        {
          "border-pending": status === "ongoing",
          "border-correct": status === "correct",
          "border-wrong": status === "wrong",
          "border-gray-200 dark:border-zinc-700": status === "empty-state",
        },
      )}
    >
      {/* Away Team Row */}
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center justify-center gap-3">
          <TeamLogo abbrev={awayTeam.abbrev ?? ""} width={20} height={20} />
          <Text
            className={cn(
              "text-xs font-medium",
              winner && winner === awayTeam.teamid
                ? "text-correct"
                : winner && winner !== awayTeam.teamid
                  ? "text-wrong"
                  : "text-gray-700 dark:text-gray-300",
            )}
          >
            {awayTeam.abbrev}
          </Text>
        </View>
        {gameStarted && (
          <Text className="min-w-[20px] text-center text-sm font-bold text-gray-900 dark:text-gray-100">
            {game.awayscore || 0}
          </Text>
        )}
      </View>

      {/* Home Team Row */}
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center justify-center gap-3">
          <TeamLogo abbrev={homeTeam.abbrev ?? ""} width={20} height={20} />
          <Text
            className={cn(
              "text-xs font-medium",
              winner && winner === homeTeam.teamid
                ? "text-correct"
                : winner && winner !== homeTeam.teamid
                  ? "text-wrong"
                  : "text-gray-700 dark:text-gray-300",
            )}
          >
            {homeTeam.abbrev}
          </Text>
        </View>
        {gameStarted && (
          <Text className="min-w-[20px] text-center text-sm font-bold text-gray-900 dark:text-gray-100">
            {game.homescore || 0}
          </Text>
        )}
      </View>

      {/* Game Time/Status */}
      <View className="flex-1 justify-end">
        <Text className="text-center text-xs text-gray-500 dark:text-gray-400">
          {gameEnded ? "Final" : formatGameTime(gameTime)}
        </Text>
      </View>
    </View>
  );
}

// Mobile Picks Table Component
function MobilePicksTable({
  picksSummary,
  games,
  teams,
}: {
  picksSummary: RouterOutputs["league"]["picksSummary"];
  games: RouterOutputs["games"]["getGames"];
  teams: Map<number, RouterOutputs["teams"]["getTeams"][number]>;
}) {
  // Get current user to highlight their row
  const { user } = useUser();
  const currentUserId = user?.uid;
  // Find tiebreaker game and its actual total score
  const tiebreakerGame = games.find((g) => g.is_tiebreaker);
  const actualTiebreakerScore =
    tiebreakerGame && tiebreakerGame.done
      ? (tiebreakerGame.homescore || 0) + (tiebreakerGame.awayscore || 0)
      : null;
  const now = new Date();
  const gameStateById = new Map(
    games.map((game) => [
      game.gid,
      {
        started: new Date(game.ts) <= now,
        done: Boolean(game.done),
      },
    ]),
  );

  // Sort picks summary by correct picks (desc), then by tiebreaker accuracy (asc)
  const sortedPicksSummary = [...picksSummary].sort((a, b) => {
    // First sort by correct picks (highest first)
    if (a.correctPicks !== b.correctPicks) {
      return b.correctPicks - a.correctPicks;
    }

    // If correct picks are tied and we have an actual tiebreaker score, sort by accuracy
    if (actualTiebreakerScore !== null && tiebreakerGame) {
      const aTiebreakerScore = a.tiebreakerScore ?? 0;
      const bTiebreakerScore = b.tiebreakerScore ?? 0;

      const aDiff = Math.abs(actualTiebreakerScore - aTiebreakerScore);
      const bDiff = Math.abs(actualTiebreakerScore - bTiebreakerScore);

      return aDiff - bDiff; // Closest to actual score wins (lowest difference)
    }

    // If no tiebreaker or game not done, maintain original order
    return 0;
  });
  const rankedPicksSummary: {
    member: RouterOutputs["league"]["picksSummary"][number];
    rank: number;
  }[] = [];
  sortedPicksSummary.forEach((member, index) => {
    const previousMember = sortedPicksSummary[index - 1];
    if (!previousMember) {
      rankedPicksSummary.push({ member, rank: 1 });
      return;
    }

    const sameCorrectPicks = previousMember.correctPicks === member.correctPicks;
    const sameTiebreakerDiff =
      actualTiebreakerScore === null || !tiebreakerGame
        ? true
        : Math.abs((previousMember.tiebreakerScore ?? 0) - actualTiebreakerScore) ===
          Math.abs((member.tiebreakerScore ?? 0) - actualTiebreakerScore);
    const previousRank = rankedPicksSummary[index - 1]?.rank ?? index;

    rankedPicksSummary.push({
      member,
      rank:
        sameCorrectPicks && sameTiebreakerDiff ? previousRank : index + 1,
    });
  });
  const submittedMembersCount = rankedPicksSummary.filter(
    ({ member }) => member.picks.length > 0,
  ).length;

  return (
    <View className="gap-2">
      <View className="px-1">
        <View className="flex-row flex-wrap gap-2">
          <View className="rounded-full border border-green-200 bg-green-50 px-2 py-1 dark:border-green-800 dark:bg-green-950">
            <Text className="text-[10px] font-semibold text-green-700 dark:text-green-300">
              Correct
            </Text>
          </View>
          <View className="rounded-full border border-red-200 bg-red-50 px-2 py-1 dark:border-red-800 dark:bg-red-950">
            <Text className="text-[10px] font-semibold text-red-700 dark:text-red-300">
              Wrong
            </Text>
          </View>
          <View className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 dark:border-blue-800 dark:bg-blue-950">
            <Text className="text-[10px] font-semibold text-blue-700 dark:text-blue-300">
              Pending
            </Text>
          </View>
          <View className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 dark:border-amber-800 dark:bg-amber-950">
            <Text className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
              Not Picked
            </Text>
          </View>
        </View>
        <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {submittedMembersCount}/{rankedPicksSummary.length} members submitted at least one pick.
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-700">
          {/* Header Row */}
          <View className="flex-row bg-gray-50 dark:bg-zinc-800">
            {/* Rank Column */}
            <View className="w-12 border-r border-gray-200 px-2 py-3 dark:border-zinc-700">
              <Text className="text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                Rank
              </Text>
            </View>
            {/* Player Column */}
            <View className="w-24 border-r border-gray-200 px-2 py-3 dark:border-zinc-700">
              <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Player
              </Text>
            </View>
            {/* Correct Picks Column */}
            <View className="w-16 border-r border-gray-200 px-2 py-3 dark:border-zinc-700">
              <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Correct
              </Text>
            </View>
            {/* Game Columns */}
            {games.map((game) => {
              const homeTeam = teams.get(game.home);
              const awayTeam = teams.get(game.away);
              return (
                <View
                  key={game.gid}
                  className="w-12 border-r border-gray-200 px-1 py-3 dark:border-zinc-700"
                >
                  <Text className="text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {awayTeam?.abbrev}
                  </Text>
                  <Text className="text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {homeTeam?.abbrev}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Data Rows */}
          {rankedPicksSummary.map(({ member, rank }, index) => {
            const isCurrentUser = member.people.uid === currentUserId;
            const rowBgColor = isCurrentUser
              ? "bg-blue-50 dark:bg-blue-900/20"
              : index % 2 === 0
                ? "bg-white dark:bg-zinc-900"
                : "bg-gray-50 dark:bg-zinc-950";

            return (
              <View
                key={member.membership_id}
                className={`flex-row ${rowBgColor}`}
              >
                {/* Rank */}
                <View className="w-12 justify-center border-r border-gray-200 px-2 py-3 dark:border-zinc-700">
                  <Text
                    className={cn(
                      "text-center text-xs font-semibold",
                      isCurrentUser
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-200",
                    )}
                  >
                    {rank}
                  </Text>
                </View>
                {/* Player Name */}
                <View className="w-24 justify-center border-r border-gray-200 px-2 py-3 dark:border-zinc-700">
                  <Text
                    className={cn(
                      "text-xs",
                      isCurrentUser
                        ? "font-bold text-blue-600 dark:text-blue-400"
                        : "text-gray-900 dark:text-gray-100",
                    )}
                    numberOfLines={1}
                  >
                    {member.people.username}
                  </Text>
                </View>
                {/* Correct Count */}
                <View className="w-16 justify-center border-r border-gray-200 px-2 py-3 dark:border-zinc-700">
                  <Text className="text-center text-xs text-gray-900 dark:text-gray-100">
                    {member.correctPicks}
                  </Text>
                </View>
                {/* Game Picks */}
                {games.map((game) => {
                  const pick = member.picks.find((p) => p.gid === game.gid);
                  const pickedTeam = pick?.winner ? teams.get(pick.winner) : null;
                  const gameState = gameStateById.get(game.gid);

                  let bgColor = "bg-blue-50 dark:bg-blue-950/40";
                  let textColor = "text-gray-900 dark:text-gray-100";
                  let cellValue = pickedTeam?.abbrev ?? "-";

                  if (pick?.correct === 1) {
                    bgColor = "bg-green-100 dark:bg-green-900/50";
                  } else if (pick?.correct === 0) {
                    bgColor = "bg-red-100 dark:bg-red-900/50";
                  } else if (!pick) {
                    if (gameState?.started) {
                      bgColor = "bg-zinc-200 dark:bg-zinc-700";
                      textColor = "text-zinc-700 dark:text-zinc-200";
                      cellValue = "x";
                    } else {
                      bgColor = "bg-amber-100 dark:bg-amber-900/50";
                    }
                  }

                  return (
                    <View
                      key={`${member.membership_id}-${game.gid}`}
                      className={`w-12 justify-center border-r border-gray-200 px-1 py-3 dark:border-zinc-700 ${bgColor}`}
                    >
                      <Text className={`text-center text-xs ${textColor}`}>
                        {cellValue}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
