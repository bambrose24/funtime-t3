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

type Props = {
  leagueId: number;
  weekToPick: RouterOutputs["league"]["weekToPick"];
  teams: RouterOutputs["teams"]["getTeams"];
};

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
    <div className="col-span-12 flex flex-col items-center gap-4 py-4">
      <div className="flex flex-col items-center">
        <Text.H2>Make Your Picks</Text.H2>
        <div>
          Week {week}, {season}
        </div>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-2 py-1">
          <div className="flex flex-col gap-6">
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
              return (
                <RadioGroup
                  key={game.gid}
                  value={winner?.toString()}
                  onValueChange={(val) => {
                    picksField.update(idx, {
                      gid: game.gid,
                      winner: Number(val),
                    });
                  }}
                >
                  <div className="grid w-full grid-cols-5 gap-2">
                    <div className="col-span-2 flex items-center justify-between gap-2">
                      <div className="flex items-center justify-center">
                        <TeamLogo
                          abbrev={away.abbrev ?? ""}
                          width={32}
                          height={32}
                        />
                      </div>
                      <div className="flex items-center justify-center">
                        <RadioGroupItem
                          value={away.teamid.toString()}
                          id={`pick_option_${away.teamid.toString()}`}
                        />
                      </div>
                      <div className="flex items-center justify-center">
                        <Text.Small>{away.abbrev}</Text.Small>
                      </div>
                    </div>

                    <div className="col-span-1 flex items-center justify-center">
                      @
                    </div>
                    <div className="col-span-2 flex items-center justify-between gap-2">
                      <Text.Small>{home.abbrev}</Text.Small>
                      <div className="flex items-center justify-center">
                        <RadioGroupItem
                          value={home.teamid.toString()}
                          id={`pick_option_${home.teamid.toString()}`}
                        />
                      </div>

                      <div className="flex items-center justify-center">
                        <TeamLogo
                          abbrev={home.abbrev ?? ""}
                          width={32}
                          height={32}
                        />
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
