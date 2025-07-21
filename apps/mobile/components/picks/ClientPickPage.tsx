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
import { Input } from "../ui/input";

type Props = {
  league: RouterOutputs["league"]["get"];
  weekToPick: RouterOutputs["league"]["weekToPick"];
  teams: RouterOutputs["teams"]["getTeams"];
  existingPicks: RouterOutputs["member"]["picksForWeek"];
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
        message: "All games must be picked",
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

export function ClientPickPage({
  weekToPick,
  teams,
  league,
  existingPicks,
}: Props) {
  const { week, season, games } = weekToPick;
  const { league_id: leagueId } = league;

  const [submitting, setSubmitting] = useState(false);

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

  const { mutateAsync: submitPicks } =
    clientApi.picks.submitPicks.useMutation();

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
        leagueIds: [leagueId],
        overrideMemberId: undefined,
      });

      Alert.alert(
        "Success!",
        `Your picks are in for week ${week}!\n\nYou can come back to update them until the week starts.`,
        [{ text: "OK" }],
      );
    } catch (error) {
      console.error("Error submitting picks:", error);
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
