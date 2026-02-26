import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { clientApi } from "@/lib/trpc/react";
import { LeagueTabLoadingSkeleton } from "@/components/league/LeagueTabLoadingSkeleton";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  leagueId: string;
};

type TeamPickerField = "winner" | "loser";

export function LeagueMyProfile({ leagueId }: Props) {
  const leagueIdNumber = Number(leagueId);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditingSuperbowl, setIsEditingSuperbowl] = useState(false);
  const [activePickerField, setActivePickerField] = useState<TeamPickerField | null>(
    null,
  );
  const [winnerTeamId, setWinnerTeamId] = useState("");
  const [loserTeamId, setLoserTeamId] = useState("");
  const [score, setScore] = useState("");
  const [savingPick, setSavingPick] = useState(false);
  const utils = clientApi.useUtils();

  const {
    data: session,
    isLoading: sessionLoading,
    refetch: refetchSession,
  } =
    clientApi.session.current.useQuery();

  const viewerMembership = useMemo(() => {
    return session?.dbUser?.leaguemembers.find(
      (member) => member.league_id === leagueIdNumber,
    );
  }, [leagueIdNumber, session?.dbUser?.leaguemembers]);

  const {
    data: profileData,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } =
    clientApi.playerProfile.get.useQuery(
      {
        leagueId: leagueIdNumber,
        memberId: viewerMembership?.membership_id ?? 0,
      },
      { enabled: !!viewerMembership },
    );

  const {
    data: leagueData,
    isLoading: leagueLoading,
    refetch: refetchLeague,
  } = clientApi.league.get.useQuery(
    { leagueId: leagueIdNumber },
    { enabled: !!viewerMembership },
  );

  const {
    data: hasSeasonStarted,
    isLoading: hasSeasonStartedLoading,
    refetch: refetchHasSeasonStarted,
  } = clientApi.league.hasStarted.useQuery(
    { leagueId: leagueIdNumber },
    { enabled: !!viewerMembership },
  );

  const { data: teams, refetch: refetchTeams } = clientApi.teams.getTeams.useQuery(undefined, {
    enabled: !!viewerMembership,
  });
  const { mutateAsync: updateSuperbowlPick } =
    clientApi.member.updateOrCreateSuperbowlPick.useMutation();

  const teamById = useMemo(() => {
    return new Map((teams ?? []).map((team) => [team.teamid, team]));
  }, [teams]);
  const sortedTeams = useMemo(() => {
    return [...(teams ?? [])].sort((a, b) => {
      const conferenceA = a.conference ?? "";
      const conferenceB = b.conference ?? "";
      if (conferenceA !== conferenceB) {
        return conferenceA.localeCompare(conferenceB);
      }
      return `${a.loc} ${a.name}`.localeCompare(`${b.loc} ${b.name}`);
    });
  }, [teams]);

  if (sessionLoading || profileLoading || leagueLoading || hasSeasonStartedLoading) {
    return <LeagueTabLoadingSkeleton rows={3} />;
  }

  if (!viewerMembership || !profileData) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-base text-gray-500 dark:text-gray-400">
          Unable to load your league profile.
        </Text>
      </View>
    );
  }

  const member = profileData.member;
  const superbowlPick = member.superbowl[0];
  const superbowlWinner = superbowlPick ? teamById.get(superbowlPick.winner) : null;
  const superbowlLoser = superbowlPick ? teamById.get(superbowlPick.loser) : null;
  const selectedWinner = winnerTeamId ? teamById.get(Number(winnerTeamId)) : null;
  const selectedLoser = loserTeamId ? teamById.get(Number(loserTeamId)) : null;
  const correctPicks = profileData.correctPicks;
  const wrongPicks = profileData.wrongPicks;
  const totalPicks = correctPicks + wrongPicks;
  const winRate = totalPicks > 0 ? Math.round((correctPicks / totalPicks) * 100) : null;
  const canEditSuperbowl =
    Boolean(leagueData?.superbowl_competition) &&
    Boolean(viewerMembership) &&
    hasSeasonStarted === false;
  const validScore =
    /^\d+$/.test(score) && Number(score) >= 1 && Number(score) <= 200;
  const canSavePick =
    canEditSuperbowl &&
    !!winnerTeamId &&
    !!loserTeamId &&
    winnerTeamId !== loserTeamId &&
    validScore &&
    !savingPick;

  const resetSuperbowlDraft = useCallback(() => {
    setWinnerTeamId(superbowlPick?.winner ? String(superbowlPick.winner) : "");
    setLoserTeamId(superbowlPick?.loser ? String(superbowlPick.loser) : "");
    setScore(superbowlPick?.score ? String(superbowlPick.score) : "");
  }, [superbowlPick?.loser, superbowlPick?.score, superbowlPick?.winner]);

  useEffect(() => {
    if (!isEditingSuperbowl) {
      resetSuperbowlDraft();
    }
  }, [isEditingSuperbowl, resetSuperbowlDraft]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });
    try {
      await Promise.all([
        refetchSession(),
        refetchProfile(),
        refetchLeague(),
        refetchHasSeasonStarted(),
        refetchTeams(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    refetchHasSeasonStarted,
    refetchLeague,
    refetchProfile,
    refetchSession,
    refetchTeams,
  ]);

  const onSaveSuperbowlPick = async () => {
    if (!viewerMembership) {
      return;
    }
    if (!canSavePick) {
      Alert.alert(
        "Incomplete Pick",
        "Choose winner, loser, and a score between 1 and 200.",
      );
      return;
    }
    try {
      setSavingPick(true);
      await updateSuperbowlPick({
        memberId: viewerMembership.membership_id,
        winnerTeamId: Number(winnerTeamId),
        loserTeamId: Number(loserTeamId),
        score: Number(score),
      });
      await Promise.all([
        utils.playerProfile.get.invalidate({
          leagueId: leagueIdNumber,
          memberId: viewerMembership.membership_id,
        }),
        utils.league.superbowlPicks.invalidate({ leagueId: leagueIdNumber }),
      ]);
      setIsEditingSuperbowl(false);
      setActivePickerField(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {
          // No-op if haptics are unavailable.
        },
      );
      Alert.alert("Saved", "Super Bowl pick updated.");
    } catch (error) {
      console.error("Failed to update Super Bowl pick", error);
      Alert.alert("Update Failed", "Unable to update Super Bowl pick.");
    } finally {
      setSavingPick(false);
    }
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#6b7280"
        />
      }
    >
      <View className="gap-4">
        <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-bold">
            @{member.people.username}
          </Text>
          <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {member.people.email}
          </Text>
          <Text className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Role: {member.role}
          </Text>
        </View>

        <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-3 text-base font-semibold">
            Season Summary
          </Text>
          <View className="gap-1.5">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Correct Picks: {correctPicks}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Wrong Picks: {wrongPicks}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Pick Accuracy: {winRate !== null ? `${winRate}%` : "--"}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Week Wins: {member.WeekWinners.length}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Messages Posted: {member.leaguemessages.length}
            </Text>
          </View>
          {member.WeekWinners.length > 0 ? (
            <View className="mt-3 flex-row flex-wrap gap-2">
              {member.WeekWinners.map((win) => (
                <View
                  key={`week_win_${win.week}`}
                  className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 dark:border-blue-800 dark:bg-blue-950"
                >
                  <Text className="text-xs font-semibold text-blue-700 dark:text-blue-200">
                    Week {win.week}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-3 text-base font-semibold">
            Super Bowl Pick
          </Text>
          {!leagueData?.superbowl_competition ? (
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Super Bowl competition is not enabled for this league.
            </Text>
          ) : (
            <View className="gap-3">
              {superbowlPick ? (
                <>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Winner:{" "}
                    {superbowlWinner
                      ? `${superbowlWinner.loc} ${superbowlWinner.name}`
                      : superbowlPick.winner}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Loser:{" "}
                    {superbowlLoser
                      ? `${superbowlLoser.loc} ${superbowlLoser.name}`
                      : superbowlPick.loser}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Total Score: {superbowlPick.score}
                  </Text>
                </>
              ) : (
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  No Super Bowl pick submitted.
                </Text>
              )}

              {canEditSuperbowl ? (
                isEditingSuperbowl ? (
                  <View className="mt-1 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
                    <Pressable
                      onPress={() =>
                        setActivePickerField((curr) =>
                          curr === "winner" ? null : "winner",
                        )
                      }
                      className="rounded-md border border-gray-200 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <Text className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Winner
                      </Text>
                      {selectedWinner ? (
                        <View className="mt-1 flex-row items-center gap-2">
                          <TeamLogo
                            abbrev={selectedWinner.abbrev ?? ""}
                            width={18}
                            height={18}
                          />
                          <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold">
                            {selectedWinner.loc} {selectedWinner.name}
                          </Text>
                        </View>
                      ) : (
                        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Select winner
                        </Text>
                      )}
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        setActivePickerField((curr) =>
                          curr === "loser" ? null : "loser",
                        )
                      }
                      className="rounded-md border border-gray-200 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <Text className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Loser
                      </Text>
                      {selectedLoser ? (
                        <View className="mt-1 flex-row items-center gap-2">
                          <TeamLogo
                            abbrev={selectedLoser.abbrev ?? ""}
                            width={18}
                            height={18}
                          />
                          <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold">
                            {selectedLoser.loc} {selectedLoser.name}
                          </Text>
                        </View>
                      ) : (
                        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Select loser
                        </Text>
                      )}
                    </Pressable>

                    {activePickerField ? (
                      <View className="rounded-lg border border-gray-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800">
                        <Text className="mb-2 px-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Select {activePickerField}
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                          {sortedTeams.map((team) => {
                            const teamId = String(team.teamid);
                            const isSelected =
                              activePickerField === "winner"
                                ? winnerTeamId === teamId
                                : loserTeamId === teamId;
                            return (
                              <Pressable
                                key={`my_profile_sb_${activePickerField}_${team.teamid}`}
                                onPress={() => {
                                  if (activePickerField === "winner") {
                                    setWinnerTeamId(teamId);
                                    if (loserTeamId === teamId) {
                                      setLoserTeamId("");
                                    }
                                  } else {
                                    setLoserTeamId(teamId);
                                    if (winnerTeamId === teamId) {
                                      setWinnerTeamId("");
                                    }
                                  }
                                  setActivePickerField(null);
                                }}
                                className={
                                  isSelected
                                    ? "rounded-md border border-blue-500 bg-blue-50 px-2.5 py-2 dark:border-blue-500 dark:bg-blue-950"
                                    : "rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                                }
                              >
                                <View className="flex-row items-center gap-1.5">
                                  <TeamLogo
                                    abbrev={team.abbrev ?? ""}
                                    width={14}
                                    height={14}
                                  />
                                  <Text
                                    className={
                                      isSelected
                                        ? "text-[11px] font-semibold text-blue-700 dark:text-blue-200"
                                        : "text-[11px] font-semibold text-gray-700 dark:text-gray-200"
                                    }
                                  >
                                    {team.abbrev}
                                  </Text>
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    ) : null}

                    <View className="gap-1.5">
                      <Text className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Total Score
                      </Text>
                      <Input
                        value={score}
                        onChangeText={setScore}
                        keyboardType="number-pad"
                        placeholder="1 - 200"
                      />
                      {score.length > 0 && !validScore ? (
                        <Text className="text-xs text-red-500">
                          Enter a whole number between 1 and 200.
                        </Text>
                      ) : null}
                    </View>

                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <Button onPress={onSaveSuperbowlPick} disabled={!canSavePick}>
                          {savingPick ? "Saving..." : "Save Pick"}
                        </Button>
                      </View>
                      <View className="flex-1">
                        <Button
                          variant="outline"
                          onPress={() => {
                            setIsEditingSuperbowl(false);
                            setActivePickerField(null);
                            resetSuperbowlDraft();
                          }}
                        >
                          Cancel
                        </Button>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Button
                    variant="outline"
                    onPress={() => {
                      resetSuperbowlDraft();
                      setIsEditingSuperbowl(true);
                    }}
                  >
                    {superbowlPick ? "Edit Super Bowl Pick" : "Add Super Bowl Pick"}
                  </Button>
                )
              ) : hasSeasonStarted ? (
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Picks are locked because the season has started.
                </Text>
              ) : null}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
