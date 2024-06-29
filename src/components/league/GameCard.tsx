"use client";

import { Card } from "../ui/card";
import { TeamLogo } from "../shared/TeamLogo";
import { type getTeams } from "~/server/util/getTeams";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
import { type serverApi } from "~/trpc/server";
dayjs.extend(localizedFormat);

type Props = {
  game: Awaited<ReturnType<typeof serverApi.games.getGames>>[number];
  homeTeam: Awaited<ReturnType<typeof serverApi.teams.getTeams>>[number];
  awayTeam: Awaited<ReturnType<typeof getTeams>>[number];
  onClickTeamId: (teamId: number) => void;
  simulatedWinner: number | undefined;
};

export function GameCard({
  game,
  homeTeam,
  awayTeam,
  onClickTeamId,
  simulatedWinner,
}: Props) {
  const isSimulated = simulatedWinner && simulatedWinner !== game.winner;
  const winner = simulatedWinner ?? game.winner;

  return (
    <Card
      className={cn(
        "max-h-[130px] min-h-[130px] min-w-[130px] max-w-[130px] shrink-0 p-1",
        Boolean(isSimulated)
          ? "border-warning border-2"
          : game.done
            ? "border-2 border-primary"
            : "",
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
              winner === awayTeam.teamid ? "text-correct" : "",
              winner !== awayTeam.teamid ? "text-wrong" : "",
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
              winner === homeTeam.teamid
                ? "text-correct"
                : Boolean(winner)
                  ? "text-wrong"
                  : "",
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
