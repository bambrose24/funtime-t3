"use client";

import { Card } from "../ui/card";
import { TeamLogo } from "../shared/TeamLogo";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/types";
dayjs.extend(localizedFormat);

type Props = {
  game: RouterOutputs["games"]["getGames"][number];
  homeTeam: RouterOutputs["teams"]["getTeams"][number];
  awayTeam: RouterOutputs["teams"]["getTeams"][number];
  myChosenTeam: number | undefined | null;
  onClickTeamId: (teamId: number) => void;
  simulatedWinner: number | undefined;
};

export function GameCard({
  game,
  homeTeam,
  myChosenTeam,
  awayTeam,
  onClickTeamId,
  simulatedWinner,
}: Props) {
  const isSimulated = simulatedWinner && simulatedWinner !== game.winner;
  const winner = simulatedWinner ?? game.winner;

  const status: "simulated" | "empty-state" | "correct" | "wrong" = isSimulated
    ? "simulated"
    : !winner || !myChosenTeam
      ? "empty-state"
      : myChosenTeam === winner
        ? "correct"
        : "wrong";

  return (
    <Card
      className={cn(
        "max-h-[130px] min-h-[130px] min-w-[130px] max-w-[130px] shrink-0 p-1",
        status === "simulated" && "border-2 border-warning",
        status === "empty-state" && "border-pending border-2",
        status === "correct" && "border-2 border-correct",
        status === "wrong" && "border-2 border-wrong",
        // Boolean(isSimulated)
        //   ? "border-2 border-warning"
        //   : game.done
        //     ? !myChosenTeam
        //       ? "border-2 border-blue-500 dark:border-blue-700"
        //       : myChosenTeam === game.winner
        //         ? "border-2 border-correct"
        //         : "border-2 border-wrong"
        //     : "",
      )}
    >
      <div className="grid grid-cols-3 gap-y-1">
        <div className="flex flex-row items-center justify-center">
          <TeamLogo abbrev={awayTeam.abbrev ?? ""} width={28} height={28} />
        </div>
        <div className="flex flex-row items-center justify-center">
          <Button
            variant="link"
            className={cn(
              "px-1 py-0.5 text-card-foreground",
              winner && winner === awayTeam.teamid ? "text-correct" : "",
              winner && winner !== awayTeam.teamid ? "text-wrong" : "",
            )}
            onClick={(e) => {
              e.preventDefault();
              onClickTeamId(awayTeam.teamid);
            }}
          >
            {awayTeam.abbrev}
          </Button>
        </div>
        <div className="flex flex-row items-center justify-center">
          {game.awayscore}
        </div>
        <div className="flex flex-row items-center justify-center">
          <TeamLogo abbrev={homeTeam.abbrev ?? ""} width={28} height={28} />
        </div>
        <div className="flex flex-row items-center justify-center">
          <Button
            variant="link"
            className={cn(
              "text-card-foreground",
              winner && winner === homeTeam.teamid ? "text-correct" : "",
              winner && winner === awayTeam.teamid ? "text-wrong" : "",
            )}
            onClick={(e) => {
              e.preventDefault();
              onClickTeamId(homeTeam.teamid);
            }}
          >
            {homeTeam.abbrev}
          </Button>
        </div>
        <div className="flex flex-row items-center justify-center">
          {game.homescore}
        </div>
        <Separator className="col-span-3" />
        <div className="col-span-3 text-wrap text-xs">
          {dayjs(game.ts).format("llll")}
        </div>
      </div>
    </Card>
  );
}
