"use client";

import { type getGamesBySeason } from "~/server/util/getGamesBySeason";
import { Card } from "../ui/card";
import { TeamLogo } from "../shared/TeamLogo";
import { type getTeams } from "~/server/util/getTeams";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
dayjs.extend(localizedFormat);

type Props = {
  game: Awaited<ReturnType<typeof getGamesBySeason>>[number];
  homeTeam: Awaited<ReturnType<typeof getTeams>>[number];
  awayTeam: Awaited<ReturnType<typeof getTeams>>[number];
  onClickTeamId: (teamId: number) => void;
  simulated?: boolean;
};

export function GameCard({
  game,
  homeTeam,
  awayTeam,
  onClickTeamId,
  simulated = false,
}: Props) {
  return (
    <Card
      className={cn(
        "min-h-[120px] min-w-[120px] p-2",
        simulated ? "border-yellow-300" : game.done ? "border-primary" : "",
      )}
    >
      <div className="grid grid-cols-3 gap-y-2">
        <div className="flex flex-row items-center justify-center">
          <TeamLogo
            abbrev={awayTeam.abbrev ?? ""}
            alt={`Team logo for ${awayTeam.loc} ${awayTeam.name}`}
          />
        </div>
        <div className="flex flex-row items-center justify-center">
          <Button
            variant="link"
            className="text-card-foreground"
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
          <TeamLogo
            abbrev={homeTeam.abbrev ?? ""}
            alt={`Team logo for ${homeTeam.loc} ${homeTeam.name}`}
          />
        </div>
        <div className="flex flex-row items-center justify-center">
          <Button
            variant="link"
            className="text-card-foreground"
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
        <div className="col-span-3 text-xs">
          {dayjs(game.ts).format("llll")}
        </div>
      </div>
    </Card>
  );
}