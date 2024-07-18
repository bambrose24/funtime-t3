"use client";

import { Text } from "~/components/ui/text";
import { TeamLogo } from "~/components/shared/TeamLogo";
import { useDictify } from "~/utils/hooks/useIdToValMemo";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { type RouterOutputs } from "~/trpc/types";

type Props = {
  myPicks: RouterOutputs["league"]["picksSummary"][number];
  games: RouterOutputs["games"]["getGames"];
  teams: RouterOutputs["teams"]["getTeams"];
  league: RouterOutputs["league"]["get"];
  session: RouterOutputs["session"]["current"];
  simulatedGids: Array<number>;
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
        const isSimulated = props.simulatedGids.includes(p.gid);

        const status: "simulated" | "empty-state" | "correct" | "wrong" =
          isSimulated
            ? "simulated"
            : !game.winner || !p.winner
              ? "empty-state"
              : game.winner === p.winner
                ? "correct"
                : "wrong";

        if (!homeTeam || !awayTeam) {
          return null;
        }
        return (
          <div
            key={p.pickid}
            className={cn(
              "flex w-full flex-col rounded-xl border-2 border-transparent p-1",
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
                  choseAway && "border-2",
                  status === "simulated" &&
                    game.winner === awayTeam.teamid &&
                    "border-simulated",
                  status === "correct" && "border-correct",
                  status === "wrong" && "border-wrong",
                  status === "empty-state" && "border-pending",
                  // choseAway ? "border-2" : "",
                  // correct ? "border-correct" : "border-wrong",
                  // !game.done ? "border-blue-500 dark:border-blue-700" : "",
                )}
              >
                <TeamLogo abbrev={awayTeam.abbrev ?? ""} />
                <Text.Small>{awayTeam.abbrev}</Text.Small>
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
                  choseHome && "border-2",
                  status === "simulated" &&
                    game.winner === homeTeam.teamid &&
                    "border-simulated",
                  status === "correct" && "border-correct",
                  status === "wrong" && "border-wrong",
                  status === "empty-state" && "border-pending",
                )}
              >
                <Text.Small>{homeTeam.abbrev}</Text.Small>
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
    <div className="grid grid-cols-2 gap-x-8 gap-y-0.5">
      {myPicks?.picks?.map((p, idx) => {
        const game = gameIdToGame.get(p.gid);
        if (!game) {
          return null;
        }
        const homeTeam = teamIdToTeam.get(game.home);
        const awayTeam = teamIdToTeam.get(game.away);
        const choseHome = p.winner === game.home;
        const choseAway = p.winner === game.away;
        const correct = p.correct;

        if (!homeTeam || !awayTeam) {
          return null;
        }
        return (
          <div
            key={p.pickid}
            className={cn(
              "col-span-1 flex w-full flex-row items-center",
              idx % 2 === 0 ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "grid w-[120px] grid-cols-5 flex-row items-center justify-between rounded-xl border-2 border-transparent p-0.5",
                props.simulatedGids.includes(p.gid) && "border-warning",
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
                  choseAway ? "border-2" : "",
                  correct ? "border-correct" : "border-wrong",
                  !game.done ? "border-blue-500 dark:border-blue-700" : "",
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
                  choseHome ? "border-2" : "",
                  correct ? "border-correct" : "border-wrong",
                  // highest precedence is marking it blue while the game is ongoing
                  !game.done ? "border-blue-500 dark:border-blue-700" : "",
                )}
              >
                <Text.Small>{homeTeam.abbrev}</Text.Small>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
