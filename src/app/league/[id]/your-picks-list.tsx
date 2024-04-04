"use client";

import { useMemo } from "react";
import { Text } from "~/components/ui/text";
import { TeamLogo } from "~/components/shared/TeamLogo";
import { type serverApi } from "~/trpc/server";
import { useDictify } from "~/utils/hooks/useIdToValMemo";
import { cn } from "~/lib/utils";

type Props = {
  myPicks: Awaited<ReturnType<typeof serverApi.league.picksSummary>>[number];
  games: Awaited<ReturnType<typeof serverApi.games.getGames>>;
  teams: Awaited<ReturnType<typeof serverApi.teams.getTeams>>;
  league: Awaited<ReturnType<typeof serverApi.league.get>>;
  session: Awaited<ReturnType<typeof serverApi.session.current>>;
};

export function YourPicksList(props: Props) {
  const { myPicks, games, teams } = props;

  const teamIdToTeam = useDictify(teams, (t) => t.teamid);
  const gameIdToGame = useDictify(games, (g) => g.gid);

  return (
    <div className="flex flex-col gap-4">
      {myPicks?.picks?.map((p) => {
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
          <div key={p.pickid} className="flex w-full flex-col">
            <div className="flex w-full flex-row items-center justify-around">
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-lg p-1",
                  choseAway ? "border-2" : "",
                  correct
                    ? "border-green-500 dark:border-green-700"
                    : "border-red-500 dark:border-red-700",
                  !game.done ? "border-blue-500 dark:border-blue-700" : "",
                )}
              >
                <TeamLogo
                  abbrev={awayTeam.abbrev ?? ""}
                  width={32}
                  height={32}
                />
                <Text.Small>{awayTeam.abbrev}</Text.Small>
              </div>
              <Text.Small>@</Text.Small>
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-lg p-1",
                  choseHome ? "border-2" : "",
                  correct
                    ? "border-green-500 dark:border-green-700"
                    : "border-red-500 dark:border-red-700",
                  // highest precedence is marking it blue while the game is ongoing
                  !game.done ? "border-blue-500 dark:border-blue-700" : "",
                )}
              >
                <TeamLogo
                  abbrev={homeTeam.abbrev ?? ""}
                  width={32}
                  height={32}
                />
                <Text.Small>{homeTeam.abbrev}</Text.Small>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
