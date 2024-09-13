"use client";

import { Card } from "../ui/card";
import { TeamLogo } from "../shared/TeamLogo";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/types";
import { format } from "date-fns-tz";
import { EASTERN_TIMEZONE } from "~/utils/const";
import { isBefore } from "date-fns";

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

  const gameStarted = isBefore(new Date(game.ts), new Date());
  const gameEnded = game.done ?? false;
  const gameOngoing = !gameEnded && gameStarted;

  const status: "simulated" | "ongoing" | "correct" | "wrong" | "empty-state" =
    isSimulated
      ? "simulated"
      : gameOngoing
        ? "ongoing"
        : !gameStarted
          ? "empty-state"
          : myChosenTeam === winner
            ? "correct"
            : "wrong";

  const formatGameTime = (
    quarter: number | undefined | null,
    seconds: number | undefined | null,
  ) => {
    if (
      quarter === undefined ||
      quarter === null ||
      seconds === undefined ||
      seconds === null
    )
      return "In Progress";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `Q${quarter} - ${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const subtitle = gameEnded
    ? "Final"
    : gameStarted
      ? formatGameTime(
          game.current_quarter,
          game.current_quarter_seconds_remaining,
        )
      : format(game.ts, "EEE, MMM d, h:mm aa", {
          timeZone: EASTERN_TIMEZONE,
        });

  return (
    <Card
      className={cn(
        "max-h-[130px] min-h-[130px] min-w-[130px] max-w-[130px] shrink-0 border-2 border-border p-1 transition-colors",
        {
          "border-warning": status === "simulated",
          "border-pending": status === "ongoing",
          "border-correct": status === "correct",
          "border-wrong": status === "wrong",
        },
      )}
      data-gameid={game.gid}
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
        <div className="col-span-3 text-wrap px-1 text-xs">{subtitle}</div>
      </div>
    </Card>
  );
}
