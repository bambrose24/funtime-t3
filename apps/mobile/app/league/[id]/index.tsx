import React, { useState, useEffect, Suspense } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  ScrollView,
  Modal,
  Animated,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { clientApi } from "@/lib/trpc/react";
import { useUser } from "@/hooks/useUser";
import { ClientPickPage } from "@/components/picks/ClientPickPage";
import { ClientLeaderboardPage } from "@/components/leaderboard/ClientLeaderboardPage";
import { type RouterOutputs } from "~/trpc/types";
import { useColorScheme } from "@/lib/useColorScheme";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { usePrefetchForLeague } from "@/hooks/usePrefetchForLeague";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type TabType = "overview" | "picks" | "leaderboard";

export default function LeagueScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();

  // Initialize tab from route parameter, defaulting to "overview"
  const initialTab =
    tab && ["overview", "picks", "leaderboard"].includes(tab)
      ? (tab as TabType)
      : "overview";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isPicksModalVisible, setIsPicksModalVisible] = useState(false);
  const { isDarkColorScheme } = useColorScheme();
  const scaleValue = useState(new Animated.Value(1))[0];
  const translateValue = useState(new Animated.Value(0))[0];

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
  const { prefetchLeagueData } = usePrefetchForLeague(leagueIdNumber, {
    immediate: true, // Start prefetching right away
    aggressive: true, // Prefetch historical data too
  });

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

  const tabs: { key: TabType; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "picks", label: "Pick" },
    { key: "leaderboard", label: "Leaderboard" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <LeagueOverview
            leagueId={id}
            onSwitchToPicks={() => setActiveTab("picks")}
            isPicksModalVisible={isPicksModalVisible}
            setIsPicksModalVisible={setIsPicksModalVisible}
          />
        );
      case "picks":
        return <ClientPickPage leagueId={id} />;
      case "leaderboard":
        return <ClientLeaderboardPage leagueId={id} />;
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

        {/* Tab Navigation */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            <View className="flex-row">
              {tabs.map((tab) => (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  className="mr-6 px-4 py-3"
                >
                  <Text
                    className={cn(
                      "text-base font-medium",
                      activeTab === tab.key
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-500 dark:text-gray-400",
                    )}
                  >
                    {tab.label}
                  </Text>
                  {/* Active Tab Indicator */}
                  {activeTab === tab.key && (
                    <View className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gray-900 dark:bg-gray-100" />
                  )}
                </Pressable>
              ))}
            </View>
          </ScrollView>
          {/* Bottom Border */}
          <View className="h-px bg-gray-200 dark:bg-zinc-700" />
        </View>

        {/* Tab Content */}
        <View className="flex-1">{renderTabContent()}</View>
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

  // Dependent queries that wait for activeWeek
  const gamesQuery = clientApi.games.getGames.useQuery(
    {
      week: activeWeekQuery.data?.week ?? 0,
      season: leagueQuery.data?.season ?? 0,
    },
    {
      enabled: !!activeWeekQuery.data?.week && !!leagueQuery.data?.season,
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: true,
    },
  );

  const picksSummaryQuery = clientApi.league.picksSummary.useQuery(
    {
      leagueId: leagueIdNumber,
      week: activeWeekQuery.data?.week ?? 0,
    },
    {
      enabled: !!activeWeekQuery.data?.week,
      staleTime: 1 * 60 * 1000, // 1 minute (picks change frequently)
      refetchOnWindowFocus: true,
    },
  );

  const userPicksQuery = clientApi.member.picksForWeek.useQuery(
    {
      leagueId: leagueIdNumber,
      week: activeWeekQuery.data?.week ?? 0,
    },
    {
      enabled: !!activeWeekQuery.data?.week,
      staleTime: 1 * 60 * 1000, // 1 minute
      refetchOnWindowFocus: true,
    },
  );

  // Prefetch dependent data when we have activeWeek
  useEffect(() => {
    if (activeWeekQuery.data?.week && leagueQuery.data?.season) {
      utils.games.getGames.prefetch({
        week: activeWeekQuery.data.week,
        season: leagueQuery.data.season,
      });
      utils.league.picksSummary.prefetch({
        leagueId: leagueIdNumber,
        week: activeWeekQuery.data.week,
      });
      utils.member.picksForWeek.prefetch({
        leagueId: leagueIdNumber,
        week: activeWeekQuery.data.week,
      });
    }
  }, [
    activeWeekQuery.data?.week,
    leagueQuery.data?.season,
    leagueIdNumber,
    utils,
  ]);

  return {
    leagueData: leagueQuery.data,
    activeWeek: activeWeekQuery.data,
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
  const {
    leagueData,
    activeWeek,
    games,
    teams,
    picksSummary,
    userPicks,
    isLoading,
    isUserPicksLoading,
    isError,
  } = useLeagueOverviewData(leagueId);

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

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View className="py-6">
        {/* Week Header - Remove league name since it's already in nav */}
        <View className="mb-6 px-4">
          {isLoading ? (
            <Skeleton className="mx-auto h-6 w-32 rounded" />
          ) : (
            activeWeek && (
              <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-lg font-semibold">
                Week {activeWeek.week}, {leagueData?.season}
              </Text>
            )
          )}
        </View>

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
        {!isLoading && !isUserPicksLoading && activeWeek && (
          <View className="mx-4 mb-6">
            {userPicks && userPicks.length > 0 ? (
              <Pressable
                onPress={() => setIsPicksModalVisible(true)}
                className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-zinc-600 dark:bg-zinc-700"
              >
                <Text className="text-center font-medium text-gray-700 dark:text-gray-300">
                  View Your Picks
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={onSwitchToPicks}
                className="rounded-lg bg-blue-500 px-4 py-2"
              >
                <Text className="text-center font-medium text-white">
                  Make Picks Now
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Games This Week */}
        {games && games.length > 0 && (
          <View className="mb-6">
            <Text className="text-app-fg-light dark:text-app-fg-dark mb-3 px-4 text-lg font-semibold">
              This Week's Games
            </Text>
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

        {/* Picks Table */}
        {picksSummary && picksSummary.length > 0 && games && (
          <View className="mb-6">
            <Text className="text-app-fg-light dark:text-app-fg-dark mb-3 px-4 text-lg font-semibold">
              League Picks
            </Text>
            <MobilePicksTable
              picksSummary={picksSummary}
              games={games}
              teams={teamById}
            />
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
              <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-zinc-700">
                <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-semibold">
                  Your Week {activeWeek?.week}, {leagueData?.season} Picks
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

              {/* Modal Content */}
              <View className="p-4">
                {userPicks && userPicks.length > 0 ? (
                  <View className="flex-row flex-wrap justify-between gap-3">
                    {userPicks.map((pick) => {
                      const game = games?.find((g) => g.gid === pick.gid);
                      if (!game) return null;

                      const homeTeam = teams?.find(
                        (t) => t.teamid === game.home,
                      );
                      const awayTeam = teams?.find(
                        (t) => t.teamid === game.away,
                      );

                      if (!homeTeam || !awayTeam) return null;

                      const choseHome = pick.winner === game.home;
                      const choseAway = pick.winner === game.away;
                      const gameWinner = game.winner;

                      const status =
                        !gameWinner || !pick.winner
                          ? "empty-state"
                          : gameWinner === pick.winner
                            ? "correct"
                            : "wrong";

                      return (
                        <View
                          key={pick.gid}
                          className="rounded-xl border-2 border-gray-200 bg-white px-5 py-3 dark:border-zinc-700 dark:bg-zinc-800"
                          style={{ width: "48%" }}
                        >
                          {/* Teams Layout: Away @ Home */}
                          <View className="flex-row items-center justify-center gap-2">
                            {/* Away Team */}
                            <View
                              className={`flex-1 flex-row items-center justify-center gap-1 rounded-md border px-2 py-1.5 ${
                                choseAway && status === "correct"
                                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                  : choseAway && status === "wrong"
                                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                    : choseAway && status === "empty-state"
                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                      : "border-gray-300 dark:border-zinc-600"
                              }`}
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
                              className={`flex-1 flex-row items-center justify-center gap-1 rounded-md border px-2 py-1.5 ${
                                choseHome && status === "correct"
                                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                  : choseHome && status === "wrong"
                                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                    : choseHome && status === "empty-state"
                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                      : "border-gray-300 dark:border-zinc-600"
                              }`}
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
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View className="flex-1 items-center justify-center py-20">
                    <Text className="text-center text-gray-600 dark:text-gray-400">
                      No picks found for this week
                    </Text>
                  </View>
                )}
              </View>
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

  // Sort picks summary by correct picks (desc), then by tiebreaker accuracy (asc)
  const sortedPicksSummary = [...picksSummary].sort((a, b) => {
    // First sort by correct picks (highest first)
    if (a.correctPicks !== b.correctPicks) {
      return b.correctPicks - a.correctPicks;
    }

    // If correct picks are tied and we have an actual tiebreaker score, sort by accuracy
    if (actualTiebreakerScore !== null && tiebreakerGame) {
      const aTiebreakerPick = a.picks.find((p) => p.gid === tiebreakerGame.gid);
      const bTiebreakerPick = b.picks.find((p) => p.gid === tiebreakerGame.gid);

      const aTiebreakerScore = (aTiebreakerPick as any)?.score || 0;
      const bTiebreakerScore = (bTiebreakerPick as any)?.score || 0;

      const aDiff = Math.abs(actualTiebreakerScore - aTiebreakerScore);
      const bDiff = Math.abs(actualTiebreakerScore - bTiebreakerScore);

      return aDiff - bDiff; // Closest to actual score wins (lowest difference)
    }

    // If no tiebreaker or game not done, maintain original order
    return 0;
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-700">
        {/* Header Row */}
        <View className="flex-row bg-gray-50 dark:bg-zinc-800">
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
        {sortedPicksSummary.map((member, index) => {
          const isCurrentUser = member.people.uid === currentUserId;
          const rowBgColor = isCurrentUser
            ? "bg-blue-50 dark:bg-blue-900/20"
            : "bg-white dark:bg-zinc-900";

          return (
            <View
              key={member.membership_id}
              className={`flex-row ${rowBgColor}`}
            >
              {/* Player Name */}
              <View className="w-24 justify-center border-r border-gray-200 px-2 py-3 dark:border-zinc-700">
                <View className="flex-row items-center">
                  <Text
                    className={`text-xs ${
                      isCurrentUser
                        ? "font-bold text-blue-600 dark:text-blue-400"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                    numberOfLines={1}
                  >
                    {member.people.username}
                  </Text>
                  {isCurrentUser && (
                    <View className="ml-1 rounded-full bg-blue-500 px-1.5 py-0.5">
                      <Text className="text-xs font-medium text-white">
                        You
                      </Text>
                    </View>
                  )}
                </View>
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

                let bgColor = "bg-white dark:bg-zinc-900"; // Default
                if (pick?.correct === 1) {
                  bgColor = "bg-green-100 dark:bg-green-900/50"; // Correct
                } else if (pick?.correct === 0) {
                  bgColor = "bg-red-100 dark:bg-red-900/50"; // Wrong
                } else if (!pick) {
                  bgColor = "bg-yellow-100 dark:bg-yellow-900/50"; // No pick
                }

                return (
                  <View
                    key={`${member.membership_id}-${game.gid}`}
                    className={`w-12 justify-center border-r border-gray-200 px-1 py-3 dark:border-zinc-700 ${bgColor}`}
                  >
                    <Text className="text-center text-xs text-gray-900 dark:text-gray-100">
                      {pickedTeam?.abbrev || "-"}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
