"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { TeamLogo } from "~/components/shared/TeamLogo";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Text } from "~/components/ui/text";
import { type RouterOutputs } from "~/trpc/types";
import { useDictify } from "~/utils/hooks/useIdToValMemo";
import { format } from "date-fns-tz";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { useUserEnforced } from "~/utils/hooks/useUserEnforced";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useLogout } from "~/app/(auth)/auth/useLogout";
import { Separator } from "~/components/ui/separator";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { clientApi } from "~/trpc/react";
import { toast } from "sonner";

type Props = {
  leagueId: number;
  weekToPick: RouterOutputs["league"]["weekToPick"];
  teams: RouterOutputs["teams"]["getTeams"];
};

const EASTERN_TIMEZONE = "America/New_York";

const picksSchema = z.object({
  picks: z.array(
    z.object({
      gid: z.number().int(),
      winner: z.number().int().nullable(),
      isRandom: z.boolean().default(false),
    }),
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

export function ClientPickPage({ weekToPick, teams, leagueId }: Props) {
  const { week, season, games } = weekToPick;

  const { dbUser } = useUserEnforced();

  const logout = useLogout();

  const teamById = useDictify(teams, (t) => t.teamid);
  const gameById = useDictify(games, (g) => g.gid);

  const tiebreakerGame = games.find((g) => g.is_tiebreaker);

  const form = useForm<z.infer<typeof picksSchema>>({
    resolver: zodResolver(picksSchema),
    defaultValues: {
      picks: games.map((g) => {
        return {
          gid: g.gid,
          winner: undefined,
          isRandom: false,
        };
      }),
      tiebreakerScore: {
        gid: tiebreakerGame?.gid,
        score: "",
      },
    },
    reValidateMode: "onChange",
    criteriaMode: "all",
  });

  const picksField = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormProvider)
    name: "picks",
  });

  const { mutateAsync: submitPicks } =
    clientApi.picks.submitPicks.useMutation();

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (data) => {
    try {
      await submitPicks({
        picks: data.picks.map((p) => {
          return { ...p, winner: p.winner! };
        }),
        leagueId,
        overrideMemberId: undefined,
      });
      toast.success(`Your picks have been submitted!`);
    } catch (e) {
      console.error(`Error submitting picks`, e);
      toast.error(
        `There was an error submitting your picks. Contact Bob at bambrose24@gmail.com`,
      );
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
    picksField.update(idx, {
      gid,
      winner,
      isRandom: false,
    });
  };

  const randomizePicks = () => {
    picksField.fields.forEach((f, idx) => {
      const game = gameById.get(f.gid);
      if (!game) {
        return;
      }
      const winner = Math.random() < 0.5 ? game.away : game?.home;
      picksField.update(idx, {
        gid: f.gid,
        winner,
        isRandom: true,
      });
    });
  };

  if (!week || !season || !games.length) {
    return (
      <div className="col-span-12 flex max-w-[1000px] flex-col gap-4 md:col-span-6 md:col-start-4 xl:col-span-4 xl:col-start-5">
        <Card className="w-full">
          <CardHeader className="flex w-full items-center">
            <Text.H2>Season Over!</Text.H2>
          </CardHeader>
          <CardContent className="flex justify-center">
            The season is over. Play again next year!
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="col-span-12 flex flex-col gap-3 md:col-span-8 md:col-start-3 lg:col-span-4 lg:col-start-5"
    >
      <Form {...form}>
        <div className="flex flex-col items-center justify-center">
          <Text.H2>Make Your Picks</Text.H2>
          <div>
            Week {week}, {season}
          </div>
        </div>
        <div className="mb-4 flex flex-col gap-3 ">
          <Alert
            variant="default"
            className="col-span-8 col-start-3 row-start-2 flex flex-row items-center lg:col-span-4 lg:col-start-5"
          >
            <AlertTitle className="flex w-full flex-row items-center justify-center gap-2">
              <AlertCircleIcon className="h-4 w-4" />
              <div>
                You are picking as{" "}
                <span className="font-bold">{dbUser.username}</span>. Not you?{" "}
                <Button
                  variant="link"
                  className="p-0 text-foreground underline"
                  type="button"
                  onClick={async () => {
                    await logout();
                  }}
                >
                  Log out
                </Button>
                .
              </div>
            </AlertTitle>
          </Alert>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={randomizePicks}
          >
            Randomize Picks
          </Button>
          {picksField.fields.map(({ gid, winner }, idx) => {
            const game = gameById.get(gid);
            if (!game) {
              return null;
            }
            const home = teamById.get(game.home);
            const away = teamById.get(game.away);
            if (!home || !away) {
              throw new Error(
                `Could not find home or away team for game ${game.gid}`,
              );
            }
            const winnerTeam = winner ? teamById.get(winner) : undefined;

            const pick = (winner: number) => {
              console.log(`going to pick ${winner} for ${game.gid}`);
              onTeamPick({
                idx,
                gid: game.gid,
                winner,
              });
            };

            const getGradient = (team: NonNullable<typeof winnerTeam>) => {
              const { primary_color, secondary_color, tertiary_color } = team;
              return tertiary_color
                ? `linear-gradient(to right, ${primary_color}, ${secondary_color}, ${tertiary_color})`
                : `linear-gradient(to right, ${primary_color}, ${secondary_color})`;
            };

            return (
              <Card
                key={game.gid}
                className={cn("w-full", winnerTeam && "border-transparent")}
              >
                <div
                  style={{
                    background: winnerTeam ? getGradient(winnerTeam) : "",
                  }}
                  className="w-full rounded-lg p-1 transition-all lg:p-1.5"
                >
                  <CardContent className="flex flex-col gap-2 rounded-sm bg-card py-2">
                    <RadioGroup
                      value={winner?.toString()}
                      onValueChange={(val) => {
                        pick(Number(val));
                      }}
                    >
                      <div className="grid w-full grid-cols-5 gap-2">
                        <div
                          className="col-span-1 flex cursor-pointer items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            pick(away.teamid);
                          }}
                        >
                          <TeamLogo
                            abbrev={away.abbrev ?? ""}
                            width={40}
                            height={40}
                          />
                        </div>
                        <div
                          className="col-span-1 flex cursor-pointer items-center justify-start md:pl-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            pick(away.teamid);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem
                              value={away.teamid.toString()}
                              id={`pick_option_${away.teamid.toString()}`}
                            />
                            <Text.Small>{away.abbrev}</Text.Small>
                          </div>
                        </div>
                        <div className="col-span-1 flex items-center justify-center pb-0.5">
                          @
                        </div>
                        <div
                          className="col-span-1 flex cursor-pointer items-center justify-end md:pr-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            pick(home.teamid);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Text.Small>{home.abbrev}</Text.Small>
                            <div className="flex items-center justify-center">
                              <RadioGroupItem
                                value={home.teamid.toString()}
                                id={`pick_option_${home.teamid.toString()}`}
                              />
                            </div>
                          </div>
                        </div>

                        <div
                          className="col-span-1 flex cursor-pointer items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            pick(home.teamid);
                          }}
                        >
                          <TeamLogo
                            abbrev={home.abbrev ?? ""}
                            width={40}
                            height={40}
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Text.Small className="text-xs text-muted-foreground">
                            {game.awayrecord}
                          </Text.Small>
                        </div>
                        <div className="col-span-3 flex justify-center">
                          <Text.Small className="text-xs">
                            {format(game.ts, "EEE MMM d yyyy, h:mm a zzz", {
                              timeZone: EASTERN_TIMEZONE,
                            })}
                          </Text.Small>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Text.Small className="text-xs text-muted-foreground">
                            {game.homerecord}
                          </Text.Small>
                        </div>
                        {game.is_tiebreaker === true && (
                          <div className="col-span-5 mt-2 flex w-full flex-col items-center gap-2 text-center">
                            <Separator />
                            <div className="w-full">
                              <FormField
                                control={form.control}
                                name="tiebreakerScore.score"
                                render={({ field, fieldState }) => {
                                  const valid =
                                    fieldState.isTouched &&
                                    !fieldState.error &&
                                    !fieldState.invalid;
                                  return (
                                    <FormItem>
                                      <FormLabel>Tiebreaker Score</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          step="1"
                                          className={cn(
                                            "w-full focus-visible:ring-2",
                                            fieldState.invalid
                                              ? "ring-2 ring-wrong"
                                              : valid
                                                ? "ring-2 ring-correct"
                                                : "",
                                          )}
                                        />
                                      </FormControl>
                                      <Text.Small>
                                        You must enter a score between 1 and 200
                                      </Text.Small>
                                    </FormItem>
                                  );
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </div>
              </Card>
            );
          })}
          <Separator className="col-span-5" />
          <Button
            type="submit"
            disabled={
              form.formState.isSubmitted ||
              form.formState.isSubmitting ||
              !form.formState.isValid
            }
          >
            Submit Picks
          </Button>
        </div>
      </Form>
    </form>
  );
}
