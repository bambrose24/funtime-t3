import React, { useMemo, useState } from "react";
import { Alert, SafeAreaView, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectOption } from "@/components/ui/select-option";
import { clientApi } from "@/lib/trpc/react";

export default function LeagueAdminPicksScreen() {
  const { id, memberId } = useLocalSearchParams<{
    id: string;
    memberId?: string;
  }>();
  const leagueIdNumber = Number(id);
  const memberIdNumber = Number(memberId);
  const [busyGid, setBusyGid] = useState<number | null>(null);
  const [scoreDrafts, setScoreDrafts] = useState<Record<number, string>>({});

  const utils = clientApi.useUtils();
  const { data: session, isLoading: sessionLoading } =
    clientApi.session.current.useQuery();
  const { data: isSuperAdmin, isLoading: superAdminLoading } =
    clientApi.generalAdmin.isSuperAdmin.useQuery();

  const viewerMember = useMemo(() => {
    return session?.dbUser?.leaguemembers.find(
      (member) => member.league_id === leagueIdNumber,
    );
  }, [leagueIdNumber, session?.dbUser?.leaguemembers]);
  const canManageLeague =
    viewerMember?.role === "admin" || Boolean(isSuperAdmin);

  const { data: league, isLoading: leagueLoading } = clientApi.league.get.useQuery(
    { leagueId: leagueIdNumber },
    {
      enabled: Number.isFinite(leagueIdNumber) && canManageLeague,
    },
  );
  const { data: weekToPick, isLoading: weekLoading } =
    clientApi.league.weekToPick.useQuery(
      { leagueId: leagueIdNumber },
      { enabled: Number.isFinite(leagueIdNumber) && canManageLeague },
    );
  const { data: teams } = clientApi.teams.getTeams.useQuery();
  const { data: allGames, isLoading: gamesLoading } = clientApi.games.getGames.useQuery(
    {
      season: league?.season ?? 0,
    },
    { enabled: !!league?.season },
  );
  const { data: memberPicks, isLoading: picksLoading } =
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
  const { data: membersData } = clientApi.league.admin.members.useQuery(
    { leagueId: leagueIdNumber },
    { enabled: Number.isFinite(leagueIdNumber) && canManageLeague },
  );

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
    if (!latestWeek) {
      return allGames;
    }
    return allGames.filter((game) => game.week <= latestWeek);
  }, [allGames, weekToPick?.week]);

  const loading =
    sessionLoading ||
    superAdminLoading ||
    (canManageLeague && (leagueLoading || weekLoading || gamesLoading || picksLoading));

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
      >
        <View className="gap-4">
          <View className="gap-1">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
              Edit Picks
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Editing picks for @{member?.people.username ?? memberIdNumber}
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

            return (
              <View
                key={game.gid}
                className="gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold">
                  Week {game.week}: {awayTeam.abbrev} @ {homeTeam.abbrev}
                </Text>

                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <SelectOption
                      selected={selectedWinner === game.away}
                      onPress={() => savePick(game.gid, game.away)}
                      className="justify-start px-3 py-2"
                    >
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                        {awayTeam.loc} {awayTeam.name}
                      </Text>
                    </SelectOption>
                  </View>
                  <View className="flex-1">
                    <SelectOption
                      selected={selectedWinner === game.home}
                      onPress={() => savePick(game.gid, game.home)}
                      className="justify-start px-3 py-2"
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
                      keyboardType="number-pad"
                      placeholder="Score (1-200)"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyGid === game.gid || !selectedWinner}
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

                {busyGid === game.gid ? (
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
