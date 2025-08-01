"use client";

import { Text } from "~/components/ui/text";
import { TeamLogo } from "~/components/shared/TeamLogo";
import { useDictify } from "~/utils/hooks/useIdToValMemo";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { type RouterOutputs } from "~/trpc/types";
import { Card } from "~/components/ui/card";

type Props = {
  myPicks: RouterOutputs["league"]["picksSummary"][number];
  games: RouterOutputs["games"]["getGames"];
  teams: RouterOutputs["teams"]["getTeams"];
  league: RouterOutputs["league"]["get"];
  session: RouterOutputs["session"]["current"];
  simulatedGames: Record<number, number>; // gid -> winner
  selectGame: (gid: number, winner: number) => void;
};

export function YourPicksList(props: Props) {
  const { myPicks, games, teams } = props;

  const teamIdToTeam = useDictify(teams, (t) => t.teamid);
  const gameIdToGame = useDictify(games, (g) => g.gid);

  return (
    <div className="flex flex-col gap-2">
      {myPicks?.picks?.map((p) => {
        const game = gameIdToGame.get(p.gid);
        if (!game) {
          return null;
        }
        const homeTeam = teamIdToTeam.get(game.home);
        const awayTeam = teamIdToTeam.get(game.away);
        const choseHome = p.winner === game.home;
        const choseAway = p.winner === game.away;
        const isSimulated = p.gid in props.simulatedGames;
        const simulatedWinner = props.simulatedGames[p.gid];
        const gameWinner = simulatedWinner ?? game.winner;

        const status: "simulated" | "empty-state" | "correct" | "wrong" =
          isSimulated
            ? "simulated"
            : !gameWinner || !p.winner
              ? "empty-state"
              : gameWinner === p.winner
                ? "correct"
                : "wrong";

        if (!homeTeam || !awayTeam) {
          return null;
        }
        return (
          <div
            key={p.gid}
            className={cn(
              "flex w-full flex-col rounded-xl border-2 border-transparent p-1",
              status === "simulated" && "border-simulated",
            )}
          >
            <div className="grid w-full grid-cols-7">
              <Button
                variant="ghost"
                onClick={() => {
                  props.selectGame(p.gid, awayTeam.teamid);
                }}
                className={cn(
                  "col-span-3 flex flex-row items-center justify-center gap-1 rounded-lg p-1",
                  status === "simulated" &&
                    choseAway &&
                    (gameWinner === awayTeam.teamid
                      ? "border-2 border-correct"
                      : "border-2 border-wrong"),
                  status === "correct" &&
                    choseAway &&
                    "border-2 border-correct",
                  status === "wrong" && choseAway && "border-2 border-wrong",
                  status === "empty-state" &&
                    choseAway &&
                    "border-2 border-pending",
                  // choseAway ? "border-2" : "",
                  // correct ? "border-correct" : "border-wrong",
                  // !game.done ? "border-blue-500 dark:border-blue-700" : "",
                )}
              >
                <TeamLogo abbrev={awayTeam.abbrev ?? ""} />
                <Text.Small
                // className={cn(
                //   gameWinner !== undefined
                //     ? gameWinner === awayTeam.teamid
                //       ? "text-correct"
                //       : "text-wrong"
                //     : "",
                // )}
                >
                  {awayTeam.abbrev}
                </Text.Small>
              </Button>
              <div className="col-span-1 flex flex-row items-center justify-center">
                <Text.Small>@</Text.Small>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  props.selectGame(p.gid, homeTeam.teamid);
                }}
                className={cn(
                  "col-span-3 flex flex-row items-center justify-center gap-1 rounded-lg p-1",
                  status === "simulated" &&
                    choseHome &&
                    (gameWinner === homeTeam.teamid
                      ? "border-2 border-correct"
                      : "border-2 border-wrong"),
                  status === "correct" &&
                    choseHome &&
                    "border-2 border-correct",
                  status === "wrong" && choseHome && "border-2 border-wrong",
                  status === "empty-state" &&
                    choseHome &&
                    "border-2 border-pending",
                )}
              >
                <Text.Small
                // className={cn(
                //   gameWinner !== undefined
                //     ? gameWinner === homeTeam.teamid
                //       ? "text-correct"
                //       : "text-wrong"
                //     : "",
                // )}
                >
                  {homeTeam.abbrev}
                </Text.Small>
                <TeamLogo abbrev={homeTeam.abbrev ?? ""} />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CompactYourPicksList(props: Props) {
  const { myPicks, games, teams, selectGame } = props;

  const teamIdToTeam = useDictify(teams, (t) => t.teamid);
  const gameIdToGame = useDictify(games, (g) => g.gid);

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
      {myPicks?.picks?.map((p, idx) => {
        const game = gameIdToGame.get(p.gid);
        if (!game) {
          return null;
        }
        const homeTeam = teamIdToTeam.get(game.home);
        const awayTeam = teamIdToTeam.get(game.away);
        const choseHome = p.winner === game.home;
        const choseAway = p.winner === game.away;
        const isSimulated = p.gid in props.simulatedGames;
        const simulatedWinner = props.simulatedGames[p.gid];
        const gameWinner = simulatedWinner ?? game.winner;

        const gameIsTiebreaker = game.is_tiebreaker;
        const pickScore = myPicks.tiebreakerScore;

        const status: "simulated" | "empty-state" | "correct" | "wrong" =
          isSimulated
            ? "simulated"
            : !gameWinner || !p.winner
              ? "empty-state"
              : gameWinner === p.winner
                ? "correct"
                : "wrong";

        if (!homeTeam || !awayTeam) {
          return null;
        }
        return (
          <div
            key={p.gid}
            className={cn(
              "col-span-1 flex w-full flex-row items-center",
              idx % 2 === 0 ? "justify-end" : "justify-start",
            )}
          >
            <Card>
              <div
                className={cn(
                  "grid w-[120px] grid-cols-5 flex-row items-center justify-between rounded-xl border-2 border-transparent p-0.5",
                  status === "simulated" && "border-simulated",
                )}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    selectGame(p.gid, awayTeam.teamid);
                  }}
                  className={cn(
                    "col-span-2 flex flex-row items-center justify-center rounded-lg p-1",
                    status === "simulated" &&
                      choseAway &&
                      (gameWinner === awayTeam.teamid
                        ? "border-2 border-correct"
                        : "border-2 border-wrong"),
                    status === "correct" &&
                      choseAway &&
                      "border-2 border-correct",
                    status === "wrong" && choseAway && "border-2 border-wrong",
                    status === "empty-state" &&
                      choseAway &&
                      "border-2 border-pending",
                  )}
                >
                  <Text.Small>{awayTeam.abbrev}</Text.Small>
                </Button>
                <div className="col-span-1 flex flex-row justify-center">
                  <Text.Small>@</Text.Small>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    selectGame(p.gid, homeTeam.teamid);
                  }}
                  className={cn(
                    "col-span-2 flex flex-row items-center justify-center rounded-lg p-1",
                    status === "simulated" &&
                      choseHome &&
                      (gameWinner === homeTeam.teamid
                        ? "border-2 border-correct"
                        : "border-2 border-wrong"),
                    status === "correct" &&
                      choseHome &&
                      "border-2 border-correct",
                    status === "wrong" && choseHome && "border-2 border-wrong",
                    status === "empty-state" &&
                      choseHome &&
                      "border-2 border-pending",
                  )}
                >
                  <Text.Small>{homeTeam.abbrev}</Text.Small>
                </Button>
                {gameIsTiebreaker === true ? (
                  <div className="col-span-5 flex items-center justify-center">
                    <Text.Small className="text-muted-foreground">
                      Score: {pickScore ?? 0}
                    </Text.Small>
                  </div>
                ) : null}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
