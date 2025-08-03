import React, { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clientApi } from "@/lib/trpc/react";
import { type RouterOutputs } from "~/trpc/types";
import { PickGameCard } from "./PickGameCard";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { createComponentLogger } from "@/lib/logging";
import { Input } from "../ui/input";

type Props = {
  leagueId: string;
};

const picksSchema = z.object({
  picks: z
    .array(
      z.union([
        z.object({
          type: z.literal("toPick"),
          gid: z.number().int(),
          winner: z.number().int().nullable(),
          isRandom: z.boolean(),
        }),
        z.object({
          type: z.literal("alreadyStarted"),
          gid: z.number().int(),
          cannotPick: z.literal(true),
          alreadyPickedWinner: z.number().int().nullable(),
        }),
      ]),
    )
    .refine(
      (picks) =>
        picks.every(
          (pick) =>
            pick.type === "alreadyStarted" ||
            (pick.type === "toPick" && pick.winner !== null),
        ),
      {
        message: "All available games must be picked",
        path: ["picks"],
      },
    ),
  tiebreakerScore: z.object({
    gid: z.number().int(),
    score: z
      .string()
      .min(1, "You must pick a score")
      .refine(
        (val) =>
          !isNaN(Number(val)) &&
          Number.isInteger(Number(val)) &&
          Number(val) > 0 &&
          Number(val) < 200,
        {
          message: "Score must be between 1 and 200",
        },
      ),
  }),
});

type PicksFormData = z.infer<typeof picksSchema>;

type PickFormProps = {
  league: RouterOutputs["league"]["get"];
  weekToPick: RouterOutputs["league"]["weekToPick"];
  teams: RouterOutputs["teams"]["getTeams"];
  existingPicks: RouterOutputs["member"]["picksForWeek"];
  leagueIdNumber: number;
};

function PickForm({ league, weekToPick, teams, existingPicks, leagueIdNumber }: PickFormProps) {
  const { week, season, games } = weekToPick;
  const [submitting, setSubmitting] = useState(false);
  const logger = createComponentLogger('PickForm', { leagueId: leagueIdNumber });

  // Create team lookup
  const teamById = new Map(teams.map((t) => [t.teamid, t]));

  // Find tiebreaker game
  const tiebreakerGame = games.find((g) => g.is_tiebreaker);

  // Check if user has already submitted picks
  const hasSubmittedAlready = existingPicks.length > 0;

  const form = useForm<PicksFormData>({
    resolver: zodResolver(picksSchema),
    defaultValues: {
      picks: games.map((g) => {
        const existingPick = existingPicks.find((p) => p.gid === g.gid);
        if (g.ts < new Date()) {
          return {
            gid: g.gid,
            type: "alreadyStarted",
            alreadyPickedWinner: existingPick?.winner ?? null,
            cannotPick: true,
          };
        }
        return {
          type: "toPick",
          gid: g.gid,
          winner: existingPick?.winner ? existingPick.winner : null,
          isRandom: existingPick?.is_random ?? false,
        };
      }),
      tiebreakerScore: {
        gid: tiebreakerGame?.gid ?? 0,
        score:
          existingPicks
            .find((p) => p.gid === tiebreakerGame?.gid)
            ?.score?.toString() ?? "",
      },
    },
    mode: "onChange",
  });

  const picksField = useFieldArray({
    control: form.control,
    name: "picks",
  });

  const { mutateAsync: submitPicks } = clientApi.picks.submitPicks.useMutation();

  const onSubmit = async (data: PicksFormData) => {
    try {
      setSubmitting(true);

      const picksToSubmit = data.picks
        .map((p) => {
          if (p.type !== "toPick" || !p.winner) {
            return null;
          }
          const score =
            data.tiebreakerScore.gid === p.gid &&
            Number.isInteger(Number(data.tiebreakerScore.score))
              ? Number(data.tiebreakerScore.score)
              : undefined;
          return {
            ...p,
            winner: p.winner,
            ...(score !== undefined ? { score } : {}),
          };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);

      await submitPicks({
        picks: picksToSubmit,
        leagueIds: [leagueIdNumber],
        overrideMemberId: undefined,
      });

      Alert.alert(
        "Success!",
        `Your picks are in for week ${week}!\n\nYou can come back to update them until the week starts.`,
        [{ text: "OK" }],
      );
    } catch (error) {
      logger.error("Error submitting picks", { 
        error: error instanceof Error ? error.message : String(error),
        leagueId: leagueIdNumber,
        week 
      });
      Alert.alert(
        "Error",
        "There was an error submitting your picks. Please try again or contact support.",
        [{ text: "OK" }],
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onTeamPick = ({
    gid,
    idx,
    winner,
  }: {
    gid: number;
    idx: number;
    winner: number;
  }) => {
    const game = games.find((g) => g.gid === gid);
    if (!game || game.ts < new Date()) {
      return;
    }

    picksField.update(idx, {
      type: "toPick",
      gid,
      winner,
      isRandom: false,
    });
  };

  const randomizePicks = () => {
    picksField.fields.forEach((f, idx) => {
      const game = games.find((g) => g.gid === f.gid);
      if (!game || game.ts < new Date()) {
        return;
      }
      const winner = Math.random() < 0.5 ? game.away : game.home;
      picksField.update(idx, {
        type: "toPick",
        gid: f.gid,
        winner,
        isRandom: true,
      });
    });
  };

  const isFormValid = form.formState.isValid;
  const isFormDirty = form.formState.isDirty;

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View className="px-4 py-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-center text-2xl font-bold">
            {hasSubmittedAlready ? "Update Your Picks" : "Make Your Picks"}
          </Text>
          <Text className="text-center text-gray-600 dark:text-gray-400">
            Week {week}, {season}
          </Text>
        </View>

        <Button onPress={randomizePicks} variant="secondary" className="mb-6">
          Randomize Picks
        </Button>

        <View className="mb-6 gap-4">
          {picksField.fields.map((field, idx) => {
            const game = games.find((g) => g.gid === field.gid);
            if (!game) return null;

            const winner =
              field.type === "toPick"
                ? field.winner
                : field.alreadyPickedWinner;
            const homeTeam = teamById.get(game.home);
            const awayTeam = teamById.get(game.away);

            if (!homeTeam || !awayTeam) return null;

            return (
              <PickGameCard
                key={field.gid}
                game={game}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                selectedWinner={winner}
                onTeamSelect={(teamId: number) =>
                  onTeamPick({ gid: game.gid, idx, winner: teamId })
                }
                disabled={field.type === "alreadyStarted"}
                tiebreakerScore={
                  game.is_tiebreaker ? (
                    <View className="mt-3 border-t-2 border-primary/20 pt-3">
                      <Text className="mb-2 text-sm font-medium text-foreground">
                        Tiebreaker Score
                      </Text>
                      <Input
                        placeholder="Total score"
                        keyboardType="numeric"
                        value={form.watch("tiebreakerScore.score")}
                        onChangeText={(text: string) =>
                          form.setValue("tiebreakerScore.score", text, {
                            shouldValidate: true,
                          })
                        }
                      />
                      <Text className="mt-2 text-xs text-muted-foreground">
                        You must enter a score between 1 and 200
                      </Text>
                    </View>
                  ) : null
                }
              />
            );
          })}
        </View>

        {/* Submit Button */}
        <Button
          onPress={form.handleSubmit(onSubmit)}
          disabled={submitting || !isFormValid || !isFormDirty}
          variant="default"
          size="lg"
        >
          {submitting
            ? "Submitting..."
            : hasSubmittedAlready
              ? "Update Picks"
              : "Submit Picks"}
        </Button>

        {/* Form validation errors */}
        {form.formState.errors.picks && (
          <Text className="mt-2 text-center text-red-500">
            {form.formState.errors.picks.message}
          </Text>
        )}
        {form.formState.errors.tiebreakerScore?.score && (
          <Text className="mt-2 text-center text-red-500">
            {form.formState.errors.tiebreakerScore.score.message}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

export function ClientPickPage({ leagueId }: Props) {
  const leagueIdNumber = parseInt(leagueId, 10);
  
  // Fetch all required data (should be prefetched and cached)
  const { data: league, isLoading: leagueLoading } = clientApi.league.get.useQuery({
    leagueId: leagueIdNumber,
  }, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const { data: weekToPick, isLoading: weekLoading } = clientApi.league.weekToPick.useQuery({
    leagueId: leagueIdNumber,
  }, {
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });

  const { data: teams, isLoading: teamsLoading } = clientApi.teams.getTeams.useQuery(undefined, {
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const { data: existingPicks, isLoading: picksLoading } = clientApi.member.picksForWeek.useQuery({
    leagueId: leagueIdNumber,
    week: weekToPick?.week ?? 0,
  }, {
    enabled: !!weekToPick?.week,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Show loading state
  if (leagueLoading || weekLoading || teamsLoading || picksLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-base text-gray-500 dark:text-gray-400">
          Loading picks...
        </Text>
      </View>
    );
  }

  // Show error if data is missing
  if (!league || !weekToPick || !teams || !existingPicks) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-center text-base text-gray-500 dark:text-gray-400">
          Unable to load picks data. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <PickForm
      league={league}
      weekToPick={weekToPick}
      teams={teams}
      existingPicks={existingPicks}
      leagueIdNumber={leagueIdNumber}
    />
  );
}