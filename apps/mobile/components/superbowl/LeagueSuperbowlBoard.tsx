import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { LeagueTabLoadingSkeleton } from "@/components/league/LeagueTabLoadingSkeleton";
import { clientApi } from "@/lib/trpc/react";
import { cn } from "@/lib/utils";
import { type RouterOutputs } from "~/trpc/types";

type Props = {
  leagueId: string;
};

type TeamPickerField = "winner" | "loser";
type ConferenceFilter = "ALL" | "AFC" | "NFC";
type SuperbowlPick = RouterOutputs["league"]["superbowlPicks"]["superbowlPicks"][number];
type ContestResult = {
  pick: SuperbowlPick;
  winnerCorrect: boolean;
  loserCorrect: boolean;
  scoreDiff: number;
  rank: number;
  isWinner: boolean;
};

function calculateContestResults(
  picks: SuperbowlPick[],
  actualWinner: number | null,
  actualLoser: number | null,
  actualTotalScore: number | null,
): ContestResult[] {
  if (actualWinner === null || actualLoser === null || actualTotalScore === null) {
    return [];
  }

  const withBaseScores = picks.map((pick) => {
    const winnerCorrect = pick.winner === actualWinner;
    const loserCorrect = pick.loser === actualLoser;
    const scoreDiff =
      typeof pick.score === "number"
        ? Math.abs(pick.score - actualTotalScore)
        : Number.POSITIVE_INFINITY;
    return {
      pick,
      winnerCorrect,
      loserCorrect,
      scoreDiff,
      rank: 0,
      isWinner: false,
    };
  });

  withBaseScores.sort((a, b) => {
    if (a.winnerCorrect !== b.winnerCorrect) {
      return a.winnerCorrect ? -1 : 1;
    }
    if (a.loserCorrect !== b.loserCorrect) {
      return a.loserCorrect ? -1 : 1;
    }
    if (a.scoreDiff !== b.scoreDiff) {
      return a.scoreDiff - b.scoreDiff;
    }
    const aUsername = a.pick.leaguemembers?.people.username ?? "";
    const bUsername = b.pick.leaguemembers?.people.username ?? "";
    return aUsername.localeCompare(bUsername);
  });

  withBaseScores.forEach((result, index) => {
    if (index === 0) {
      result.rank = 1;
      result.isWinner = true;
      return;
    }

    const previous = withBaseScores[index - 1];
    if (!previous) {
      result.rank = index + 1;
      result.isWinner = false;
      return;
    }

    const tiedWithPrevious =
      previous.winnerCorrect === result.winnerCorrect &&
      previous.loserCorrect === result.loserCorrect &&
      previous.scoreDiff === result.scoreDiff;
    result.rank = tiedWithPrevious ? previous.rank : index + 1;
    result.isWinner = result.rank === 1;
  });

  return withBaseScores;
}

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
  const [pickerConferenceFilter, setPickerConferenceFilter] =
    useState<ConferenceFilter>("ALL");

  const utils = clientApi.useUtils();
  const { data: session } = clientApi.session.current.useQuery();
  const { data: teams, isLoading: teamsLoading } = clientApi.teams.getTeams.useQuery();
  const { data: leagueData, isLoading: leagueLoading } = clientApi.league.get.useQuery(
    { leagueId: leagueIdNumber },
    {
      enabled: Number.isFinite(leagueIdNumber),
    },
  );
  const { data: bracketData, isLoading: bracketLoading } =
    clientApi.postseason.getBracket.useQuery(
      { season: leagueData?.season ?? 0 },
      {
        enabled: Boolean(leagueData?.season),
      },
    );

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
  const filteredPickerTeams = useMemo(() => {
    if (pickerConferenceFilter === "ALL") {
      return sortedTeams;
    }
    return sortedTeams.filter(
      (team) => (team.conference ?? "") === pickerConferenceFilter,
    );
  }, [pickerConferenceFilter, sortedTeams]);

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
  const alphabeticalPicks = useMemo(() => {
    return [...(superbowlData?.superbowlPicks ?? [])].sort((a, b) => {
      const aUser = a.leaguemembers?.people.username ?? "";
      const bUser = b.leaguemembers?.people.username ?? "";
      return aUser.localeCompare(bUser);
    });
  }, [superbowlData?.superbowlPicks]);

  const allBracketGames = useMemo(() => {
    if (!bracketData) {
      return [];
    }
    return [
      ...bracketData.wild_card.AFC,
      ...bracketData.wild_card.NFC,
      ...bracketData.divisional.AFC,
      ...bracketData.divisional.NFC,
      ...bracketData.conference.AFC,
      ...bracketData.conference.NFC,
      ...bracketData.super_bowl,
    ];
  }, [bracketData]);

  const finalSuperBowlGame = useMemo(() => {
    return (
      bracketData?.super_bowl.find(
        (game) =>
          Boolean(game.done) &&
          game.winner !== null &&
          game.home_team !== null &&
          game.away_team !== null,
      ) ?? null
    );
  }, [bracketData?.super_bowl]);
  const finalSuperBowlWinner = finalSuperBowlGame?.winner ?? null;
  const finalSuperBowlLoser =
    finalSuperBowlGame && finalSuperBowlWinner !== null
      ? finalSuperBowlWinner === finalSuperBowlGame.home_team
        ? finalSuperBowlGame.away_team
        : finalSuperBowlGame.home_team
      : null;
  const finalSuperBowlTotalScore =
    finalSuperBowlGame &&
    typeof finalSuperBowlGame.home_score === "number" &&
    typeof finalSuperBowlGame.away_score === "number"
      ? finalSuperBowlGame.home_score + finalSuperBowlGame.away_score
      : null;

  const contestResults = useMemo(() => {
    return calculateContestResults(
      alphabeticalPicks,
      finalSuperBowlWinner,
      finalSuperBowlLoser,
      finalSuperBowlTotalScore,
    );
  }, [
    alphabeticalPicks,
    finalSuperBowlLoser,
    finalSuperBowlTotalScore,
    finalSuperBowlWinner,
  ]);
  const contestResultsByMemberId = useMemo(() => {
    return new Map(
      contestResults.map((result) => [result.pick.member_id ?? -1, result]),
    );
  }, [contestResults]);

  const sortedPicks = useMemo(() => {
    if (contestResults.length === 0) {
      return alphabeticalPicks;
    }
    return [...alphabeticalPicks].sort((a, b) => {
      const aResult = contestResultsByMemberId.get(a.member_id ?? -1);
      const bResult = contestResultsByMemberId.get(b.member_id ?? -1);
      return (aResult?.rank ?? Number.MAX_SAFE_INTEGER) - (bResult?.rank ?? Number.MAX_SAFE_INTEGER);
    });
  }, [alphabeticalPicks, contestResults.length, contestResultsByMemberId]);

  const completedPicksCount = sortedPicks.filter(
    (pick) => pick.winner !== null && pick.loser !== null && pick.score !== null,
  ).length;
  const pendingPicksCount = Math.max(sortedPicks.length - completedPicksCount, 0);
  const playoffTeamIds = useMemo(() => {
    if (!bracketData) {
      return new Set<number>();
    }
    return new Set(Object.keys(bracketData.seeds).map(Number));
  }, [bracketData]);
  const remainingTeamIds = useMemo(() => {
    if (!bracketData) {
      return new Set<number>();
    }
    const eliminated = new Set<number>();
    allBracketGames.forEach((game) => {
      if (!game.winner || !game.home_team || !game.away_team) {
        return;
      }
      const losingTeamId = game.winner === game.home_team ? game.away_team : game.home_team;
      if (losingTeamId) {
        eliminated.add(losingTeamId);
      }
    });
    const remaining = new Set<number>();
    playoffTeamIds.forEach((teamId) => {
      if (!eliminated.has(teamId)) {
        remaining.add(teamId);
      }
    });
    return remaining;
  }, [allBracketGames, bracketData, playoffTeamIds]);
  const isTeamEliminated = useCallback(
    (teamId: number | null) => {
      if (!teamId) {
        return false;
      }
      if (!playoffTeamIds.has(teamId)) {
        return false;
      }
      return !remainingTeamIds.has(teamId);
    },
    [playoffTeamIds, remainingTeamIds],
  );

  const bracketSummary = useMemo(() => {
    if (!bracketData) {
      return null;
    }

    const totalGames = allBracketGames.length;
    const completedGames = allBracketGames.filter((game) => Boolean(game.done)).length;
    const remainingGames = Math.max(totalGames - completedGames, 0);
    const totalSeededTeams =
      (bracketData.seedsByConference.AFC?.length ?? 0) +
      (bracketData.seedsByConference.NFC?.length ?? 0);

    return {
      totalGames,
      completedGames,
      remainingGames,
      totalSeededTeams,
      hasData: totalGames > 0,
      wildCardTotal:
        bracketData.wild_card.AFC.length + bracketData.wild_card.NFC.length,
      wildCardDone:
        bracketData.wild_card.AFC.filter((game) => game.done).length +
        bracketData.wild_card.NFC.filter((game) => game.done).length,
      divisionalTotal:
        bracketData.divisional.AFC.length + bracketData.divisional.NFC.length,
      divisionalDone:
        bracketData.divisional.AFC.filter((game) => game.done).length +
        bracketData.divisional.NFC.filter((game) => game.done).length,
      conferenceTotal:
        bracketData.conference.AFC.length + bracketData.conference.NFC.length,
      conferenceDone:
        bracketData.conference.AFC.filter((game) => game.done).length +
        bracketData.conference.NFC.filter((game) => game.done).length,
      superBowlDone: bracketData.super_bowl.some((game) => Boolean(game.done)),
      rounds: [
        {
          title: "Wild Card",
          games: [...bracketData.wild_card.AFC, ...bracketData.wild_card.NFC],
        },
        {
          title: "Divisional",
          games: [...bracketData.divisional.AFC, ...bracketData.divisional.NFC],
        },
        {
          title: "Conference",
          games: [...bracketData.conference.AFC, ...bracketData.conference.NFC],
        },
        {
          title: "Super Bowl",
          games: [...bracketData.super_bowl],
        },
      ],
    };
  }, [allBracketGames, bracketData]);
  const contestComplete = contestResults.length > 0;

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
  if (leagueLoading || bracketLoading) {
    return <LeagueTabLoadingSkeleton rows={3} />;
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <View className="gap-4">
        <View className="gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
            Postseason Snapshot
          </Text>
          {bracketSummary?.hasData ? (
            <>
              <View className="flex-row flex-wrap gap-2">
                <View className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-zinc-700 dark:bg-zinc-900">
                  <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-gray-600 dark:text-gray-300">
                    Games: {bracketSummary.completedGames}/{bracketSummary.totalGames}
                  </Text>
                </View>
                <View className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 dark:border-emerald-800 dark:bg-emerald-950">
                  <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-emerald-700 dark:text-emerald-300">
                    Remaining: {bracketSummary.remainingGames}
                  </Text>
                </View>
                <View className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 dark:border-blue-800 dark:bg-blue-950">
                  <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-blue-700 dark:text-blue-300">
                    Teams: {bracketSummary.totalSeededTeams}
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                Wild Card {bracketSummary.wildCardDone}/{bracketSummary.wildCardTotal} - Divisional {bracketSummary.divisionalDone}/{bracketSummary.divisionalTotal} - Conference {bracketSummary.conferenceDone}/{bracketSummary.conferenceTotal} - Super Bowl {bracketSummary.superBowlDone ? "Final" : "Pending"}
              </Text>
            </>
          ) : (
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              Bracket data is not published yet for this season.
            </Text>
          )}
        </View>

        {bracketSummary?.hasData ? (
          <View className="gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              Playoff Bracket
            </Text>
            {bracketSummary.rounds.map((round) => (
              <View key={`bracket_round_${round.title}`} className="gap-2">
                <Text className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {round.title}
                </Text>
                {round.games.length === 0 ? (
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    No games published.
                  </Text>
                ) : (
                  round.games.map((game) => {
                    const awayTeam = game.away_team ? teamById.get(game.away_team) : null;
                    const homeTeam = game.home_team ? teamById.get(game.home_team) : null;
                    const winnerId = game.winner;
                    const awayIsWinner = winnerId !== null && winnerId === game.away_team;
                    const homeIsWinner = winnerId !== null && winnerId === game.home_team;
                    const awayEliminated =
                      !awayIsWinner && isTeamEliminated(game.away_team);
                    const homeEliminated =
                      !homeIsWinner && isTeamEliminated(game.home_team);
                    return (
                      <View
                        key={`bracket_game_${round.title}_${game.game_id}`}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2">
                            {awayTeam ? (
                              <TeamLogo
                                abbrev={awayTeam.abbrev ?? ""}
                                width={14}
                                height={14}
                              />
                            ) : null}
                            <Text
                              className={cn(
                                "text-xs font-semibold",
                                awayIsWinner
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-gray-700 dark:text-gray-300",
                                awayEliminated ? "line-through text-red-500 dark:text-red-400" : "",
                              )}
                            >
                              {awayTeam?.abbrev ?? "TBD"}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            {typeof game.away_score === "number" ? (
                              <Text className="text-xs text-gray-600 dark:text-gray-300">
                                {game.away_score}
                              </Text>
                            ) : null}
                            <Text className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              @
                            </Text>
                            {typeof game.home_score === "number" ? (
                              <Text className="text-xs text-gray-600 dark:text-gray-300">
                                {game.home_score}
                              </Text>
                            ) : null}
                          </View>
                          <View className="flex-row items-center gap-2">
                            <Text
                              className={cn(
                                "text-xs font-semibold",
                                homeIsWinner
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-gray-700 dark:text-gray-300",
                                homeEliminated ? "line-through text-red-500 dark:text-red-400" : "",
                              )}
                            >
                              {homeTeam?.abbrev ?? "TBD"}
                            </Text>
                            {homeTeam ? (
                              <TeamLogo
                                abbrev={homeTeam.abbrev ?? ""}
                                width={14}
                                height={14}
                              />
                            ) : null}
                          </View>
                        </View>
                        <Text className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                          {game.done ? "Final" : "Pending"}
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>
            ))}
          </View>
        ) : null}

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
                <View className="mb-2 flex-row gap-2 px-1">
                  {(["ALL", "AFC", "NFC"] as ConferenceFilter[]).map(
                    (conference) => (
                      <Pressable
                        key={`picker_filter_${conference}`}
                        onPress={() => setPickerConferenceFilter(conference)}
                        className={cn(
                          "rounded-full border px-2.5 py-1",
                          pickerConferenceFilter === conference
                            ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950"
                            : "border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800",
                        )}
                      >
                        <Text
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wide",
                            pickerConferenceFilter === conference
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-gray-600 dark:text-gray-300",
                          )}
                        >
                          {conference}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {filteredPickerTeams.map((team) => {
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
          <View className="flex-row flex-wrap gap-2">
            <View className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-zinc-700 dark:bg-zinc-900">
              <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-gray-600 dark:text-gray-300">
                Picks: {completedPicksCount}/{sortedPicks.length}
              </Text>
            </View>
            <View className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 dark:border-amber-800 dark:bg-amber-950">
              <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-amber-700 dark:text-amber-300">
                Pending: {pendingPicksCount}
              </Text>
            </View>
          </View>

          {contestComplete ? (
            <View className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950">
              <Text className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                Contest Finalized
              </Text>
              <Text className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                Super Bowl: {teamById.get(finalSuperBowlWinner ?? 0)?.abbrev ?? "--"} over{" "}
                {teamById.get(finalSuperBowlLoser ?? 0)?.abbrev ?? "--"}{" "}
                {typeof finalSuperBowlTotalScore === "number"
                  ? `(${finalSuperBowlTotalScore})`
                  : ""}
              </Text>
            </View>
          ) : null}

          {sortedPicks.length === 0 ? (
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              No picks have been submitted.
            </Text>
          ) : (
            <View className="overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-700">
              <View className="flex-row items-center bg-gray-50 px-2.5 py-2 dark:bg-zinc-900">
                {contestComplete ? (
                  <View style={{ width: 36 }}>
                    <Text className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      #
                    </Text>
                  </View>
                ) : null}
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

              {sortedPicks.map((pick, index) => {
                const winner = pick.winner ? teamById.get(pick.winner) : null;
                const loser = pick.loser ? teamById.get(pick.loser) : null;
                const hidden =
                  pick.winner === null || pick.loser === null || pick.score === null;
                const username = pick.leaguemembers?.people.username ?? "member";
                const isViewerPick =
                  pick.member_id === viewerMembership?.membership_id;
                const contestResult = contestResultsByMemberId.get(pick.member_id ?? -1);
                const winnerEliminated = isTeamEliminated(pick.winner);
                const loserEliminated = isTeamEliminated(pick.loser);

                return (
                  <View
                    key={`sb_pick_${pick.pickid}`}
                    className={cn(
                      "flex-row items-center px-2.5 py-2",
                      contestResult?.isWinner
                        ? "bg-emerald-50 dark:bg-emerald-950/30"
                        : "",
                      isViewerPick
                        ? "bg-blue-50 dark:bg-blue-950/20"
                        : "",
                      index < sortedPicks.length - 1
                        ? "border-t border-gray-200 dark:border-zinc-700"
                        : "",
                    )}
                  >
                    {contestComplete ? (
                      <View style={{ width: 36 }}>
                        <Text
                          className={cn(
                            "text-xs font-semibold",
                            contestResult?.isWinner
                              ? "text-emerald-700 dark:text-emerald-300"
                              : "text-gray-600 dark:text-gray-300",
                          )}
                        >
                          {contestResult?.rank ?? "--"}
                        </Text>
                      </View>
                    ) : null}

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
                            <Text
                              className={cn(
                                "text-[10px] font-semibold text-gray-700 dark:text-gray-200",
                                winnerEliminated ? "line-through text-red-500 dark:text-red-400" : "",
                                contestResult?.winnerCorrect
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "",
                              )}
                            >
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
                            <Text
                              className={cn(
                                "text-[10px] font-semibold text-gray-700 dark:text-gray-200",
                                loserEliminated ? "line-through text-red-500 dark:text-red-400" : "",
                                contestResult?.loserCorrect
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "",
                              )}
                            >
                              {loser?.abbrev ?? "--"}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>

                    <View style={{ width: 42 }}>
                      <Text
                        className={cn(
                          "text-right text-xs text-gray-700 dark:text-gray-300",
                          contestResult?.scoreDiff === 0
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "",
                        )}
                      >
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
