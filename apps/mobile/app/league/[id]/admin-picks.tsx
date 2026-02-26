import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectOption } from "@/components/ui/select-option";
import { clientApi } from "@/lib/trpc/react";
import { useColorScheme } from "@/lib/useColorScheme";
import { cn } from "@/lib/utils";

export default function LeagueAdminPicksScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const { id, memberId } = useLocalSearchParams<{
    id: string;
    memberId?: string;
  }>();
  const leagueIdNumber = Number(id);
  const memberIdNumber = Number(memberId);
  const [busyGid, setBusyGid] = useState<number | null>(null);
  const [scoreDrafts, setScoreDrafts] = useState<Record<number, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const utils = clientApi.useUtils();
  const { data: session, isLoading: sessionLoading, refetch: refetchSession } =
    clientApi.session.current.useQuery();
  const {
    data: isSuperAdmin,
    isLoading: superAdminLoading,
    refetch: refetchSuperAdmin,
  } =
    clientApi.generalAdmin.isSuperAdmin.useQuery();

  const viewerMember = useMemo(() => {
    return session?.dbUser?.leaguemembers.find(
      (member) => member.league_id === leagueIdNumber,
    );
  }, [leagueIdNumber, session?.dbUser?.leaguemembers]);
  const canManageLeague =
    viewerMember?.role === "admin" || Boolean(isSuperAdmin);

  const { data: league, isLoading: leagueLoading, refetch: refetchLeague } = clientApi.league.get.useQuery(
    { leagueId: leagueIdNumber },
    {
      enabled: Number.isFinite(leagueIdNumber) && canManageLeague,
    },
  );
  const { data: weekToPick, isLoading: weekLoading, refetch: refetchWeekToPick } =
    clientApi.league.weekToPick.useQuery(
      { leagueId: leagueIdNumber },
      { enabled: Number.isFinite(leagueIdNumber) && canManageLeague },
    );
  const { data: teams, refetch: refetchTeams } = clientApi.teams.getTeams.useQuery();
  const { data: allGames, isLoading: gamesLoading, refetch: refetchGames } = clientApi.games.getGames.useQuery(
    {
      season: league?.season ?? 0,
    },
    { enabled: !!league?.season },
  );
  const { data: memberPicks, isLoading: picksLoading, refetch: refetchMemberPicks } =
    clientApi.league.admin.memberPicks.useQuery(
      {
        leagueId: leagueIdNumber,
        memberId: memberIdNumber,
      },
      {
        enabled:
          Number.isFinite(leagueIdNumber) &&
          Number.isFinite(memberIdNumber) &&
          canManageLeague,
      },
    );
  const { data: membersData, refetch: refetchMembers } = clientApi.league.admin.members.useQuery(
    { leagueId: leagueIdNumber },
    { enabled: Number.isFinite(leagueIdNumber) && canManageLeague },
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });

    try {
      await refetchSession();
      await refetchSuperAdmin();
      if (canManageLeague) {
        await Promise.all([
          refetchLeague(),
          refetchWeekToPick(),
          refetchTeams(),
          refetchGames(),
          refetchMemberPicks(),
          refetchMembers(),
        ]);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [
    canManageLeague,
    refetchGames,
    refetchLeague,
    refetchMemberPicks,
    refetchMembers,
    refetchSession,
    refetchSuperAdmin,
    refetchTeams,
    refetchWeekToPick,
  ]);

  const { mutateAsync: setPick } = clientApi.league.admin.setPick.useMutation();

  const member = membersData?.members.find(
    (leagueMember) => leagueMember.membership_id === memberIdNumber,
  );

  const teamById = useMemo(() => {
    return new Map((teams ?? []).map((team) => [team.teamid, team]));
  }, [teams]);

  const pickByGameId = useMemo(() => {
    return new Map((memberPicks ?? []).map((pick) => [pick.gid, pick]));
  }, [memberPicks]);

  const gamesToShow = useMemo(() => {
    const latestWeek = weekToPick?.week;
    if (!allGames) {
      return [];
    }
    const scopedGames = latestWeek
      ? allGames.filter((game) => game.week <= latestWeek)
      : allGames;
    return [...scopedGames].sort((a, b) => {
      if (a.week !== b.week) {
        return a.week - b.week;
      }
      return new Date(a.ts).getTime() - new Date(b.ts).getTime();
    });
  }, [allGames, weekToPick?.week]);

  const loading =
    sessionLoading ||
    superAdminLoading ||
    (canManageLeague && (leagueLoading || weekLoading || gamesLoading || picksLoading));
  const nowMs = Date.now();
  const editableGamesCount = gamesToShow.filter(
    (game) => Boolean(isSuperAdmin) || new Date(game.ts).getTime() > nowMs,
  ).length;
  const lockedGamesCount = Math.max(gamesToShow.length - editableGamesCount, 0);
  const pickedGamesCount = gamesToShow.filter((game) =>
    pickByGameId.has(game.gid),
  ).length;
  const tiebreakerPendingCount = gamesToShow.filter((game) => {
    if (!game.is_tiebreaker) {
      return false;
    }
    const pick = pickByGameId.get(game.gid);
    return !pick?.score;
  }).length;

  const savePick = async (gameId: number, winner: number, score?: number) => {
    try {
      setBusyGid(gameId);
      await setPick({
        leagueId: leagueIdNumber,
        memberId: memberIdNumber,
        gameId,
        winner,
        ...(typeof score === "number" ? { score } : {}),
      });
      await utils.league.admin.memberPicks.invalidate({
        leagueId: leagueIdNumber,
        memberId: memberIdNumber,
      });
    } catch (error) {
      console.error("Failed to set pick", error);
      Alert.alert(
        "Pick Update Failed",
        error instanceof Error ? error.message : "Unable to update pick.",
      );
    } finally {
      setBusyGid(null);
    }
  };

  if (
    !id ||
    Number.isNaN(leagueIdNumber) ||
    !memberId ||
    Number.isNaN(memberIdNumber)
  ) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-gray-500 dark:text-gray-400">
            Member context is missing.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Loading picks editor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!canManageLeague) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6 gap-3">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-2xl font-bold">
            Admin Access Required
          </Text>
          <Text className="text-center text-base text-gray-600 dark:text-gray-400">
            You need league admin or super-admin permissions to edit picks.
          </Text>
          <Button onPress={() => router.back()}>Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View className="gap-4">
          <View className="flex-row items-start gap-3 px-1">
            <Pressable
              onPress={() => router.back()}
              className="mt-1 rounded-lg bg-app-card-light p-2 dark:bg-app-card-dark"
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={isDarkColorScheme ? "#e5e7eb" : "#374151"}
              />
            </Pressable>
            <View className="flex-1 gap-1">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
                Edit Picks
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Editing picks for @{member?.people.username ?? memberIdNumber}
              </Text>
            </View>
          </View>

          <View className="gap-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              Editor Snapshot
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <View className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 dark:border-blue-800 dark:bg-blue-950">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-blue-700 dark:text-blue-300">
                  Picks: {pickedGamesCount}/{gamesToShow.length}
                </Text>
              </View>
              <View className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 dark:border-emerald-800 dark:bg-emerald-950">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-emerald-700 dark:text-emerald-300">
                  Editable: {editableGamesCount}
                </Text>
              </View>
              <View className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 dark:border-amber-800 dark:bg-amber-950">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-amber-700 dark:text-amber-300">
                  Locked: {lockedGamesCount}
                </Text>
              </View>
              <View className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-zinc-700 dark:bg-zinc-900">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-gray-600 dark:text-gray-300">
                  TB Missing: {tiebreakerPendingCount}
                </Text>
              </View>
            </View>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Non-super-admin edits lock at kickoff. Super-admin overrides remain available.
            </Text>
          </View>

          {gamesToShow.map((game) => {
            const homeTeam = teamById.get(game.home);
            const awayTeam = teamById.get(game.away);
            if (!homeTeam || !awayTeam) {
              return null;
            }

            const currentPick = pickByGameId.get(game.gid);
            const selectedWinner = currentPick?.winner;
            const scoreDraft =
              scoreDrafts[game.gid] ?? currentPick?.score?.toString() ?? "";
            const gameStarted = new Date(game.ts).getTime() <= nowMs;
            const canEditThisGame = Boolean(isSuperAdmin) || !gameStarted;
            const gameBusy = busyGid === game.gid;
            const kickoffLabel = new Date(game.ts).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            });
            const statusLabel = !gameStarted
              ? "Open"
              : game.done
                ? "Final"
                : "Live";
            const selectedWinnerTeam = selectedWinner
              ? teamById.get(selectedWinner)
              : null;
            const winningTeam = game.winner ? teamById.get(game.winner) : null;

            return (
              <View
                key={game.gid}
                className={cn(
                  "gap-3 rounded-xl border bg-white p-4 dark:bg-zinc-800",
                  canEditThisGame
                    ? "border-gray-200 dark:border-zinc-700"
                    : "border-amber-300 dark:border-amber-700",
                )}
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold">
                      Week {game.week}: {awayTeam.abbrev} @ {homeTeam.abbrev}
                    </Text>
                    <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Kickoff: {kickoffLabel}
                    </Text>
                    <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      Current pick: {selectedWinnerTeam?.abbrev ?? "--"}
                      {game.is_tiebreaker
                        ? ` - Tiebreaker: ${currentPick?.score ?? "--"}`
                        : ""}
                    </Text>
                  </View>
                  <View
                    className={cn(
                      "rounded-full px-2 py-1",
                      statusLabel === "Open"
                        ? "bg-emerald-100 dark:bg-emerald-900/40"
                        : statusLabel === "Live"
                          ? "bg-blue-100 dark:bg-blue-900/40"
                          : "bg-zinc-200 dark:bg-zinc-700",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wide",
                        statusLabel === "Open"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : statusLabel === "Live"
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-zinc-700 dark:text-zinc-200",
                      )}
                    >
                      {statusLabel}
                    </Text>
                  </View>
                </View>
                {!canEditThisGame ? (
                  <Text className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    Locked after kickoff for league admins.
                  </Text>
                ) : gameStarted ? (
                  <Text className="text-xs text-blue-600 dark:text-blue-400">
                    Kickoff passed. Super-admin override enabled.
                  </Text>
                ) : null}
                {game.done && winningTeam ? (
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    Final winner: {winningTeam.abbrev}
                  </Text>
                ) : null}

                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <SelectOption
                      selected={selectedWinner === game.away}
                      disabled={!canEditThisGame || gameBusy}
                      onPress={() => savePick(game.gid, game.away)}
                      className={`justify-start px-3 py-2 ${
                        !canEditThisGame || gameBusy ? "opacity-50" : ""
                      }`}
                    >
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                        {awayTeam.loc} {awayTeam.name}
                      </Text>
                    </SelectOption>
                  </View>
                  <View className="flex-1">
                    <SelectOption
                      selected={selectedWinner === game.home}
                      disabled={!canEditThisGame || gameBusy}
                      onPress={() => savePick(game.gid, game.home)}
                      className={`justify-start px-3 py-2 ${
                        !canEditThisGame || gameBusy ? "opacity-50" : ""
                      }`}
                    >
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                        {homeTeam.loc} {homeTeam.name}
                      </Text>
                    </SelectOption>
                  </View>
                </View>

                {game.is_tiebreaker ? (
                  <View className="gap-2">
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                      Tiebreaker Score
                    </Text>
                    <Input
                      value={scoreDraft}
                      onChangeText={(value) =>
                        setScoreDrafts((prev) => ({ ...prev, [game.gid]: value }))
                      }
                      editable={canEditThisGame && !gameBusy}
                      keyboardType="number-pad"
                      placeholder="Score (1-200)"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={gameBusy || !selectedWinner || !canEditThisGame}
                      onPress={() => {
                        if (!selectedWinner) {
                          return;
                        }
                        const parsed = Number(scoreDraft);
                        if (!Number.isFinite(parsed) || parsed < 1 || parsed > 200) {
                          Alert.alert(
                            "Invalid Score",
                            "Score must be a number between 1 and 200.",
                          );
                          return;
                        }
                        savePick(game.gid, selectedWinner, parsed);
                      }}
                    >
                      Save Tiebreaker Score
                    </Button>
                  </View>
                ) : null}

                {gameBusy ? (
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Saving...
                  </Text>
                ) : null}
              </View>
            );
          })}

          <Button variant="outline" onPress={() => router.back()}>
            Back
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
