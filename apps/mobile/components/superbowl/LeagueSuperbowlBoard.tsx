import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { LeagueTabLoadingSkeleton } from "@/components/league/LeagueTabLoadingSkeleton";
import { clientApi } from "@/lib/trpc/react";
import { cn } from "@/lib/utils";

type Props = {
  leagueId: string;
};

type TeamPickerField = "winner" | "loser";

export function LeagueSuperbowlBoard({ leagueId }: Props) {
  const leagueIdNumber = Number(leagueId);
  const [winnerTeamId, setWinnerTeamId] = useState<string>("");
  const [loserTeamId, setLoserTeamId] = useState<string>("");
  const [score, setScore] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  const [activePickerField, setActivePickerField] = useState<TeamPickerField | null>(
    null,
  );

  const utils = clientApi.useUtils();
  const { data: session } = clientApi.session.current.useQuery();
  const { data: teams, isLoading: teamsLoading } = clientApi.teams.getTeams.useQuery();

  const viewerMembership = useMemo(() => {
    return session?.dbUser?.leaguemembers.find(
      (member) => member.league_id === leagueIdNumber,
    );
  }, [leagueIdNumber, session?.dbUser?.leaguemembers]);

  const { data: superbowlData, isLoading: superbowlLoading } =
    clientApi.league.superbowlPicks.useQuery(
      { leagueId: leagueIdNumber },
      {
        enabled: Number.isFinite(leagueIdNumber) && !!viewerMembership,
      },
    );

  const { data: hasSeasonStarted, isLoading: hasSeasonStartedLoading } =
    clientApi.league.hasStarted.useQuery(
      { leagueId: leagueIdNumber },
      {
        enabled: Number.isFinite(leagueIdNumber) && !!viewerMembership,
      },
    );

  const { mutateAsync: updateSuperbowlPick } =
    clientApi.member.updateOrCreateSuperbowlPick.useMutation();

  const teamById = useMemo(() => {
    return new Map((teams ?? []).map((team) => [team.teamid, team]));
  }, [teams]);

  const sortedTeams = useMemo(() => {
    return [...(teams ?? [])].sort((a, b) => {
      const aConference = a.conference ?? "";
      const bConference = b.conference ?? "";
      if (aConference !== bConference) {
        return aConference.localeCompare(bConference);
      }
      return `${a.loc} ${a.name}`.localeCompare(`${b.loc} ${b.name}`);
    });
  }, [teams]);

  const myPick = useMemo(() => {
    if (!viewerMembership) {
      return null;
    }
    return (
      superbowlData?.superbowlPicks.find(
        (pick) => pick.member_id === viewerMembership.membership_id,
      ) ?? null
    );
  }, [superbowlData?.superbowlPicks, viewerMembership]);

  useEffect(() => {
    if (formInitialized) {
      return;
    }

    if (!viewerMembership) {
      setFormInitialized(true);
      return;
    }

    if (myPick) {
      if (myPick.winner) {
        setWinnerTeamId(String(myPick.winner));
      }
      if (myPick.loser) {
        setLoserTeamId(String(myPick.loser));
      }
      if (myPick.score) {
        setScore(String(myPick.score));
      }
    }

    setFormInitialized(true);
  }, [formInitialized, myPick, viewerMembership]);

  const scoreValue = Number(score);
  const scoreIsValid =
    Number.isFinite(scoreValue) && scoreValue >= 1 && scoreValue <= 200;
  const isEditable = formInitialized && !hasSeasonStarted;
  const canSubmit =
    isEditable &&
    !!viewerMembership &&
    !!winnerTeamId &&
    !!loserTeamId &&
    winnerTeamId !== loserTeamId &&
    scoreIsValid &&
    !submitting;

  const selectedWinner = winnerTeamId ? teamById.get(Number(winnerTeamId)) : null;
  const selectedLoser = loserTeamId ? teamById.get(Number(loserTeamId)) : null;

  const onSavePick = async () => {
    if (!viewerMembership) {
      return;
    }
    if (hasSeasonStarted) {
      Alert.alert("Locked", "Super Bowl picks are locked after the season starts.");
      return;
    }
    if (!winnerTeamId || !loserTeamId) {
      Alert.alert("Incomplete Pick", "Select both a winner and loser.");
      return;
    }
    if (winnerTeamId === loserTeamId) {
      Alert.alert("Invalid Pick", "Winner and loser must be different teams.");
      return;
    }
    if (!scoreIsValid) {
      Alert.alert("Invalid Score", "Score must be between 1 and 200.");
      return;
    }

    try {
      setSubmitting(true);
      await updateSuperbowlPick({
        memberId: viewerMembership.membership_id,
        winnerTeamId: Number(winnerTeamId),
        loserTeamId: Number(loserTeamId),
        score: scoreValue,
      });
      await utils.league.superbowlPicks.invalidate({ leagueId: leagueIdNumber });
      setActivePickerField(null);
      Alert.alert("Saved", "Super Bowl pick updated.");
    } catch (error) {
      console.error("Failed to update Super Bowl pick", error);
      Alert.alert(
        "Update Failed",
        error instanceof Error ? error.message : "Unable to update Super Bowl pick.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (teamsLoading || superbowlLoading || hasSeasonStartedLoading) {
    return <LeagueTabLoadingSkeleton rows={4} />;
  }

  const picks = superbowlData?.superbowlPicks ?? [];

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <View className="gap-4">
        <View className="gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <View>
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              Your Super Bowl pick
            </Text>
            <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {isEditable
                ? "Set winner, loser, and total score. Picks lock when the season starts."
                : "Picks are locked because the season has started."}
            </Text>
          </View>

          <View className="gap-2">
            <Pressable
              onPress={() => {
                if (isEditable) {
                  setActivePickerField((curr) =>
                    curr === "winner" ? null : "winner",
                  );
                }
              }}
              disabled={!isEditable}
              className={cn(
                "rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900",
                isEditable ? "active:opacity-80" : "opacity-95",
              )}
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
                  {isEditable ? "Select winner" : "--"}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                if (isEditable) {
                  setActivePickerField((curr) => (curr === "loser" ? null : "loser"));
                }
              }}
              disabled={!isEditable}
              className={cn(
                "rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900",
                isEditable ? "active:opacity-80" : "opacity-95",
              )}
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
                  {isEditable ? "Select loser" : "--"}
                </Text>
              )}
            </Pressable>

            {isEditable && activePickerField ? (
              <View className="rounded-lg border border-gray-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
                <Text className="mb-2 px-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Select {activePickerField}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {sortedTeams.map((team) => {
                    const teamId = String(team.teamid);
                    const isSelected =
                      activePickerField === "winner"
                        ? teamId === winnerTeamId
                        : teamId === loserTeamId;
                    return (
                      <Pressable
                        key={`sb_pick_team_${activePickerField}_${team.teamid}`}
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
                        className={cn(
                          "rounded-md border px-2 py-1.5",
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950"
                            : "border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800",
                        )}
                      >
                        <View className="flex-row items-center gap-1.5">
                          <TeamLogo abbrev={team.abbrev ?? ""} width={14} height={14} />
                          <Text className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">
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
                editable={isEditable}
              />
              {isEditable && score.length > 0 && !scoreIsValid ? (
                <Text className="text-xs text-red-500">
                  Enter a whole number between 1 and 200.
                </Text>
              ) : null}
            </View>

            {isEditable ? (
              <Button onPress={onSavePick} disabled={!canSubmit}>
                {submitting ? "Saving..." : "Save Super Bowl Pick"}
              </Button>
            ) : null}
          </View>
        </View>

        <View className="gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
            League Super Bowl Board
          </Text>

          {picks.length === 0 ? (
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              No picks have been submitted.
            </Text>
          ) : (
            <View className="overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-700">
              <View className="flex-row items-center bg-gray-50 px-2.5 py-2 dark:bg-zinc-900">
                <View style={{ flex: 1.6 }}>
                  <Text className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Member
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    W
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    L
                  </Text>
                </View>
                <View style={{ width: 42 }}>
                  <Text className="text-right text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Score
                  </Text>
                </View>
              </View>

              {picks.map((pick, index) => {
                const winner = pick.winner ? teamById.get(pick.winner) : null;
                const loser = pick.loser ? teamById.get(pick.loser) : null;
                const hidden =
                  pick.winner === null || pick.loser === null || pick.score === null;
                const username = pick.leaguemembers?.people.username ?? "member";

                return (
                  <View
                    key={`sb_pick_${pick.pickid}`}
                    className={cn(
                      "flex-row items-center px-2.5 py-2",
                      index < picks.length - 1
                        ? "border-t border-gray-200 dark:border-zinc-700"
                        : "",
                    )}
                  >
                    <View style={{ flex: 1.6, paddingRight: 6 }}>
                      <Text
                        className="text-app-fg-light dark:text-app-fg-dark text-xs font-semibold"
                        numberOfLines={1}
                      >
                        @{username}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      {hidden ? (
                        <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                          --
                        </Text>
                      ) : (
                        <View className="self-start rounded-md border border-gray-200 bg-gray-50 px-1.5 py-1 dark:border-zinc-700 dark:bg-zinc-900">
                          <View className="flex-row items-center gap-1.5">
                            {winner ? (
                              <TeamLogo
                                abbrev={winner.abbrev ?? ""}
                                width={12}
                                height={12}
                              />
                            ) : null}
                            <Text className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">
                              {winner?.abbrev ?? "--"}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      {hidden ? (
                        <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                          --
                        </Text>
                      ) : (
                        <View className="self-start rounded-md border border-gray-200 bg-gray-50 px-1.5 py-1 dark:border-zinc-700 dark:bg-zinc-900">
                          <View className="flex-row items-center gap-1.5">
                            {loser ? (
                              <TeamLogo
                                abbrev={loser.abbrev ?? ""}
                                width={12}
                                height={12}
                              />
                            ) : null}
                            <Text className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">
                              {loser?.abbrev ?? "--"}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>

                    <View style={{ width: 42 }}>
                      <Text className="text-right text-xs text-gray-700 dark:text-gray-300">
                        {hidden ? "--" : pick.score}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
