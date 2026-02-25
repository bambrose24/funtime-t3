import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectOption } from "@/components/ui/select-option";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { clientApi } from "@/lib/trpc/react";

type Props = {
  leagueId: string;
};

export function LeagueSuperbowlBoard({ leagueId }: Props) {
  const leagueIdNumber = Number(leagueId);
  const [afcTeamId, setAfcTeamId] = useState<string>("");
  const [nfcTeamId, setNfcTeamId] = useState<string>("");
  const [winnerTeamId, setWinnerTeamId] = useState<string>("");
  const [score, setScore] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

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
      {
        leagueId: leagueIdNumber,
      },
      {
        enabled: Number.isFinite(leagueIdNumber) && !!viewerMembership,
      },
    );

  const { mutateAsync: updateSuperbowlPick } =
    clientApi.member.updateOrCreateSuperbowlPick.useMutation();

  const afcTeams = useMemo(
    () => (teams ?? []).filter((team) => team.conference === "AFC"),
    [teams],
  );
  const nfcTeams = useMemo(
    () => (teams ?? []).filter((team) => team.conference === "NFC"),
    [teams],
  );

  const teamById = useMemo(() => {
    return new Map((teams ?? []).map((team) => [team.teamid, team]));
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
    if (!myPick) {
      setFormInitialized(true);
      return;
    }
    if (myPick.winner && myPick.loser) {
      const winnerTeam = teamById.get(myPick.winner);
      const loserTeam = teamById.get(myPick.loser);
      if (winnerTeam?.conference === "AFC" || loserTeam?.conference === "AFC") {
        setAfcTeamId(
          winnerTeam?.conference === "AFC"
            ? String(winnerTeam.teamid)
            : String(loserTeam?.teamid ?? ""),
        );
      }
      if (winnerTeam?.conference === "NFC" || loserTeam?.conference === "NFC") {
        setNfcTeamId(
          winnerTeam?.conference === "NFC"
            ? String(winnerTeam.teamid)
            : String(loserTeam?.teamid ?? ""),
        );
      }
      setWinnerTeamId(String(myPick.winner));
      if (myPick.score) {
        setScore(String(myPick.score));
      }
    }
    setFormInitialized(true);
  }, [formInitialized, myPick, teamById]);

  const onSubmit = async () => {
    if (!viewerMembership) {
      return;
    }
    if (!afcTeamId || !nfcTeamId || !winnerTeamId) {
      Alert.alert("Incomplete Pick", "Select AFC team, NFC team, and winner.");
      return;
    }

    const parsedScore = Number(score);
    if (!Number.isFinite(parsedScore) || parsedScore < 1 || parsedScore > 200) {
      Alert.alert("Invalid Score", "Score must be between 1 and 200.");
      return;
    }

    const winner = Number(winnerTeamId);
    const loser = winner === Number(afcTeamId) ? Number(nfcTeamId) : Number(afcTeamId);

    try {
      setSubmitting(true);
      await updateSuperbowlPick({
        memberId: viewerMembership.membership_id,
        winnerTeamId: winner,
        loserTeamId: loser,
        score: parsedScore,
      });
      await utils.league.superbowlPicks.invalidate({ leagueId: leagueIdNumber });
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

  if (teamsLoading || superbowlLoading) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-base text-gray-500 dark:text-gray-400">
          Loading Super Bowl board...
        </Text>
      </View>
    );
  }

  const selectedAfcTeam = afcTeams.find((team) => String(team.teamid) === afcTeamId);
  const selectedNfcTeam = nfcTeams.find((team) => String(team.teamid) === nfcTeamId);
  const picks = superbowlData?.superbowlPicks ?? [];

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <View className="gap-4">
        <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 gap-4">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
            Your Super Bowl Pick
          </Text>

          <View className="gap-2">
            <Text className="text-sm text-gray-600 dark:text-gray-400">AFC Team</Text>
            {afcTeams.map((team) => (
              <SelectOption
                key={`sb_afc_${team.teamid}`}
                selected={afcTeamId === String(team.teamid)}
                onPress={() => {
                  setAfcTeamId(String(team.teamid));
                  setWinnerTeamId("");
                }}
                className="justify-start px-3 py-2"
              >
                <View className="flex-row items-center gap-2">
                  <TeamLogo abbrev={team.abbrev ?? ""} width={20} height={20} />
                  <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                    {team.loc} {team.name}
                  </Text>
                </View>
              </SelectOption>
            ))}
          </View>

          <View className="gap-2">
            <Text className="text-sm text-gray-600 dark:text-gray-400">NFC Team</Text>
            {nfcTeams.map((team) => (
              <SelectOption
                key={`sb_nfc_${team.teamid}`}
                selected={nfcTeamId === String(team.teamid)}
                onPress={() => {
                  setNfcTeamId(String(team.teamid));
                  setWinnerTeamId("");
                }}
                className="justify-start px-3 py-2"
              >
                <View className="flex-row items-center gap-2">
                  <TeamLogo abbrev={team.abbrev ?? ""} width={20} height={20} />
                  <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                    {team.loc} {team.name}
                  </Text>
                </View>
              </SelectOption>
            ))}
          </View>

          {selectedAfcTeam && selectedNfcTeam ? (
            <View className="gap-2">
              <Text className="text-sm text-gray-600 dark:text-gray-400">Winner</Text>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <SelectOption
                    selected={winnerTeamId === String(selectedAfcTeam.teamid)}
                    onPress={() => setWinnerTeamId(String(selectedAfcTeam.teamid))}
                    className="justify-start px-3 py-2"
                  >
                    <View className="flex-row items-center gap-2">
                      <TeamLogo
                        abbrev={selectedAfcTeam.abbrev ?? ""}
                        width={20}
                        height={20}
                      />
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                        {selectedAfcTeam.abbrev}
                      </Text>
                    </View>
                  </SelectOption>
                </View>
                <View className="flex-1">
                  <SelectOption
                    selected={winnerTeamId === String(selectedNfcTeam.teamid)}
                    onPress={() => setWinnerTeamId(String(selectedNfcTeam.teamid))}
                    className="justify-start px-3 py-2"
                  >
                    <View className="flex-row items-center gap-2">
                      <TeamLogo
                        abbrev={selectedNfcTeam.abbrev ?? ""}
                        width={20}
                        height={20}
                      />
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-sm">
                        {selectedNfcTeam.abbrev}
                      </Text>
                    </View>
                  </SelectOption>
                </View>
              </View>
            </View>
          ) : null}

          <View className="gap-2">
            <Text className="text-sm text-gray-600 dark:text-gray-400">Total Score</Text>
            <Input
              value={score}
              onChangeText={setScore}
              keyboardType="number-pad"
              placeholder="Score (1-200)"
            />
          </View>

          <Button onPress={onSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Save Super Bowl Pick"}
          </Button>
        </View>

        <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 gap-3">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
            League Super Bowl Board
          </Text>
          {picks.length === 0 ? (
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              No picks have been submitted.
            </Text>
          ) : (
            picks.map((pick) => {
              const winner = pick.winner ? teamById.get(pick.winner) : null;
              const loser = pick.loser ? teamById.get(pick.loser) : null;
              const hidden = pick.winner === null || pick.loser === null || pick.score === null;
              return (
                <View
                  key={`sb_pick_${pick.pickid}`}
                  className="rounded-lg border border-gray-200 px-3 py-2 dark:border-zinc-700"
                >
                  <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold">
                    @{pick.leaguemembers?.people.username}
                  </Text>
                  {hidden ? (
                    <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Pick hidden until season starts.
                    </Text>
                  ) : (
                    <Text className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {winner ? `${winner.loc} ${winner.name}` : pick.winner} over{" "}
                      {loser ? `${loser.loc} ${loser.name}` : pick.loser} • Score{" "}
                      {pick.score}
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
}
