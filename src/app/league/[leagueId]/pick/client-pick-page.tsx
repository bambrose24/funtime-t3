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
    }),
  ),
  tiebreakerScore: z.object({
    gid: z.number().int(),
    score: z.number().int(),
  }),
});

export function ClientPickPage({ weekToPick, teams }: Props) {
  const { week, season, games } = weekToPick;

  const teamById = useDictify(teams, (t) => t.teamid);
  const gameById = useDictify(games, (g) => g.gid);

  const form = useForm<z.infer<typeof picksSchema>>({
    resolver: zodResolver(picksSchema),
    defaultValues: {
      picks: games.map((g) => {
        return {
          gid: g.gid,
          winner: undefined,
        };
      }),
      tiebreakerScore: {
        gid: games.find((g) => g.is_tiebreaker)?.gid,
        score: 0,
      },
    },
  });
  const picksField = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormProvider)
    name: "picks",
  });

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
    <div className="col-span-12 flex flex-col items-center gap-4">
      <div className="flex flex-col items-center">
        <Text.H2>Make Your Picks</Text.H2>
        <div>
          Week {week}, {season}
        </div>
      </div>

      <div className="flex flex-col gap-3">
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

          const pick = (winner: number) => {
            onTeamPick({
              idx,
              gid: game.gid,
              winner,
            });
          };
          return (
            <Card key={game.gid}>
              <CardContent className="flex flex-col gap-2 py-2">
                <RadioGroup
                  value={winner?.toString()}
                  onValueChange={(val) => {
                    pick(Number(val));
                  }}
                >
                  <div className="grid w-full grid-cols-5 gap-2">
                    <div
                      className="col-span-1 flex cursor-pointer items-center justify-center"
                      onClick={() => {
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
                      className="col-span-1 flex cursor-pointer items-center justify-start pl-2"
                      onClick={() => pick(away.teamid)}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value={away.teamid.toString()}
                          id={`pick_option_${away.teamid.toString()}`}
                        />
                        <Text.Small>{away.abbrev}</Text.Small>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      @
                    </div>
                    <div
                      className="col-span-1 flex cursor-pointer items-center justify-end pr-2"
                      onClick={() => pick(home.teamid)}
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
                      onClick={() => pick(home.teamid)}
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
                        {format(game.ts, "MMM d yyyy, h:mm a zzz", {
                          timeZone: EASTERN_TIMEZONE,
                        })}
                      </Text.Small>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Text.Small className="text-xs text-muted-foreground">
                        {game.homerecord}
                      </Text.Small>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}