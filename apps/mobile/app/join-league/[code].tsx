import React, { useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { clientApi } from "@/lib/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectOption } from "@/components/ui/select-option";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { useColorScheme } from "@/lib/useColorScheme";

type ConferencePickerField = "afc" | "nfc";

export default function JoinLeagueCodeScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const leagueCode = typeof code === "string" ? code : "";
  const utils = clientApi.useUtils();

  const [afcTeamId, setAfcTeamId] = useState<string>("");
  const [nfcTeamId, setNfcTeamId] = useState<string>("");
  const [winnerTeamId, setWinnerTeamId] = useState<string>("");
  const [totalScore, setTotalScore] = useState("");
  const [activeConferencePicker, setActiveConferencePicker] =
    useState<ConferencePickerField | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: session, isLoading: sessionLoading } =
    clientApi.session.current.useQuery();
  const { data: leagueData, isLoading: leagueLoading } =
    clientApi.league.fromJoinCode.useQuery(
      { code: leagueCode },
      { enabled: leagueCode.length > 0 },
    );
  const { data: teams, isLoading: teamsLoading } = clientApi.teams.getTeams.useQuery(
    undefined,
    { enabled: Boolean(leagueData?.superbowl_competition) },
  );
  const { mutateAsync: register } = clientApi.league.register.useMutation();

  const isInLeague = useMemo(() => {
    if (!session?.dbUser || !leagueData) {
      return false;
    }
    return session.dbUser.leaguemembers.some(
      (member) => member.league_id === leagueData.league_id,
    );
  }, [leagueData, session?.dbUser]);

  const afcTeams = useMemo(
    () =>
      (teams ?? [])
        .filter((team) => team.conference === "AFC")
        .sort((a, b) => `${a.loc} ${a.name}`.localeCompare(`${b.loc} ${b.name}`)),
    [teams],
  );
  const nfcTeams = useMemo(
    () =>
      (teams ?? [])
        .filter((team) => team.conference === "NFC")
        .sort((a, b) => `${a.loc} ${a.name}`.localeCompare(`${b.loc} ${b.name}`)),
    [teams],
  );

  const selectedAfcTeam = afcTeams.find(
    (team) => team.teamid.toString() === afcTeamId,
  );
  const selectedNfcTeam = nfcTeams.find(
    (team) => team.teamid.toString() === nfcTeamId,
  );

  const superbowlRequired = Boolean(leagueData?.superbowl_competition);
  const validScore = /^\d+$/.test(totalScore) && Number(totalScore) > 0;
  const superbowlReady =
    !superbowlRequired ||
    (Boolean(afcTeamId) &&
      Boolean(nfcTeamId) &&
      Boolean(winnerTeamId) &&
      validScore);
  const registerButtonText = superbowlRequired
    ? superbowlReady
      ? "Register for League"
      : "Finish Super Bowl pick"
    : "Register for League";

  const onRegister = async () => {
    if (!leagueData) {
      return;
    }

    if (!superbowlReady) {
      Alert.alert(
        "Incomplete Registration",
        "Finish your Super Bowl pick before registering.",
      );
      return;
    }

    try {
      setSubmitting(true);
      const winner = Number(winnerTeamId);
      const loser = winner === Number(afcTeamId) ? Number(nfcTeamId) : Number(afcTeamId);

      await register({
        code: leagueData.share_code ?? leagueCode,
        superbowl: superbowlRequired
          ? {
              winnerTeamId: winner,
              loserTeamId: loser,
              score: Number(totalScore),
            }
          : undefined,
      });
      await utils.invalidate();
      router.replace(`/league/${leagueData.league_id}` as any);
    } catch (error) {
      console.error("League registration failed", error);
      Alert.alert(
        "Registration Failed",
        "Unable to register for this league. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!leagueCode) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-4 text-center text-2xl font-bold">
            League Code Missing
          </Text>
          <Button onPress={() => router.replace("/join-league" as any)}>
            Enter League Code
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (sessionLoading || leagueLoading || (superbowlRequired && teamsLoading)) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Loading league...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!leagueData) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-center text-2xl font-bold">
            League Not Found
          </Text>
          <Text className="mb-4 text-center text-base text-gray-600 dark:text-gray-400">
            The join code is invalid or expired.
          </Text>
          <Button onPress={() => router.replace("/join-league" as any)}>
            Try Another Code
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!session?.dbUser) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-center text-2xl font-bold">
            Sign In Required
          </Text>
          <Text className="mb-4 text-center text-base text-gray-600 dark:text-gray-400">
            Sign in to join {leagueData.name}.
          </Text>
          <Button
            onPress={() =>
              router.replace(
                `/auth?redirectTo=${encodeURIComponent(`/join-league/${leagueCode}`)}` as any,
              )
            }
          >
            Go to Login
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (isInLeague) {
    return (
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-center text-2xl font-bold">
            You're Already In
          </Text>
          <Text className="mb-4 text-center text-base text-gray-600 dark:text-gray-400">
            You are already registered for {leagueData.name}.
          </Text>
          <Button onPress={() => router.replace(`/league/${leagueData.league_id}` as any)}>
            Go to League
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
      >
        <View className="mx-auto w-full max-w-3xl gap-6">
          <View className="flex-row items-start gap-3">
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
            <View className="flex-1 gap-2">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-3xl font-bold">
                Join {leagueData.name}
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                You're signing in as @{session.dbUser.username}.
              </Text>
            </View>
          </View>

          <View className="gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
              League Rules
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Late Policy:{" "}
              {leagueData.late_policy === "allow_late_and_lock_after_start"
                ? "Late picks are allowed for games that have not started."
                : "Picks close at the first game start."}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Reminders:{" "}
              {leagueData.reminder_policy === "three_hours_before"
                ? "Enabled (3 hours before kickoff)"
                : "Disabled"}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Super Bowl Competition:{" "}
              {leagueData.superbowl_competition ? "Enabled" : "Disabled"}
            </Text>
          </View>

          {superbowlRequired && (
            <View className="gap-5 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
                Super Bowl Pick (Required)
              </Text>

              <View className="gap-2">
                <Pressable
                  onPress={() =>
                    setActiveConferencePicker((current) =>
                      current === "afc" ? null : "afc",
                    )
                  }
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <Text className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    AFC Team
                  </Text>
                  {selectedAfcTeam ? (
                    <View className="mt-1 flex-row items-center gap-2">
                      <TeamLogo
                        abbrev={selectedAfcTeam.abbrev ?? ""}
                        width={18}
                        height={18}
                      />
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold">
                        {selectedAfcTeam.loc} {selectedAfcTeam.name}
                      </Text>
                    </View>
                  ) : (
                    <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Select AFC team
                    </Text>
                  )}
                </Pressable>

                {activeConferencePicker === "afc" ? (
                  <View className="rounded-lg border border-gray-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
                    <View className="flex-row flex-wrap gap-2">
                      {afcTeams.map((team) => {
                        const selected = afcTeamId === team.teamid.toString();
                        return (
                          <Pressable
                            key={`afc_${team.teamid}`}
                            onPress={() => {
                              setAfcTeamId(team.teamid.toString());
                              setWinnerTeamId("");
                              setActiveConferencePicker(null);
                            }}
                            className={
                              selected
                                ? "rounded-md border border-blue-500 bg-blue-50 px-2.5 py-2 dark:border-blue-500 dark:bg-blue-950"
                                : "rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                            }
                          >
                            <View className="flex-row items-center gap-1.5">
                              <TeamLogo abbrev={team.abbrev ?? ""} width={14} height={14} />
                              <Text
                                className={
                                  selected
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
              </View>

              <View className="gap-2">
                <Pressable
                  onPress={() =>
                    setActiveConferencePicker((current) =>
                      current === "nfc" ? null : "nfc",
                    )
                  }
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <Text className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    NFC Team
                  </Text>
                  {selectedNfcTeam ? (
                    <View className="mt-1 flex-row items-center gap-2">
                      <TeamLogo
                        abbrev={selectedNfcTeam.abbrev ?? ""}
                        width={18}
                        height={18}
                      />
                      <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-semibold">
                        {selectedNfcTeam.loc} {selectedNfcTeam.name}
                      </Text>
                    </View>
                  ) : (
                    <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Select NFC team
                    </Text>
                  )}
                </Pressable>

                {activeConferencePicker === "nfc" ? (
                  <View className="rounded-lg border border-gray-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
                    <View className="flex-row flex-wrap gap-2">
                      {nfcTeams.map((team) => {
                        const selected = nfcTeamId === team.teamid.toString();
                        return (
                          <Pressable
                            key={`nfc_${team.teamid}`}
                            onPress={() => {
                              setNfcTeamId(team.teamid.toString());
                              setWinnerTeamId("");
                              setActiveConferencePicker(null);
                            }}
                            className={
                              selected
                                ? "rounded-md border border-blue-500 bg-blue-50 px-2.5 py-2 dark:border-blue-500 dark:bg-blue-950"
                                : "rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                            }
                          >
                            <View className="flex-row items-center gap-1.5">
                              <TeamLogo abbrev={team.abbrev ?? ""} width={14} height={14} />
                              <Text
                                className={
                                  selected
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
              </View>

              {selectedAfcTeam && selectedNfcTeam && (
                <View className="gap-2">
                  <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-medium">
                    Winner
                  </Text>
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <SelectOption
                        selected={winnerTeamId === selectedAfcTeam.teamid.toString()}
                        onPress={() => setWinnerTeamId(selectedAfcTeam.teamid.toString())}
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
                        selected={winnerTeamId === selectedNfcTeam.teamid.toString()}
                        onPress={() => setWinnerTeamId(selectedNfcTeam.teamid.toString())}
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
              )}

              <View className="gap-2">
                <Text className="text-app-fg-light dark:text-app-fg-dark text-sm font-medium">
                  Total Score
                </Text>
                <Input
                  value={totalScore}
                  onChangeText={setTotalScore}
                  placeholder="e.g. 47"
                  keyboardType="number-pad"
                />
                {totalScore.length > 0 && !validScore ? (
                  <Text className="text-xs text-red-500">
                    Enter a whole number greater than 0.
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          <View className="gap-3">
            <Button onPress={onRegister} disabled={submitting || !superbowlReady}>
              {submitting ? "Registering..." : registerButtonText}
            </Button>
            <Button variant="outline" onPress={() => router.back()} disabled={submitting}>
              Back
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
