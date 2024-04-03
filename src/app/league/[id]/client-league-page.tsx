"use client";
import { GameCard } from "~/components/league/GameCard";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { type serverApi } from "~/trpc/server";
import { PicksTable } from "./picks-table";

type ClientLeaguePageProps = {
  picksSummary: Awaited<ReturnType<typeof serverApi.league.picksSummary>>;
  games: Awaited<ReturnType<typeof serverApi.games.getGames>>;
  teams: Awaited<ReturnType<typeof serverApi.teams.getTeams>>;
  league: Awaited<ReturnType<typeof serverApi.league.get>>;
};

export function ClientLeaguePage({
  picksSummary,
  games,
  teams,
  league,
}: ClientLeaguePageProps) {
  const firstGame = games.at(0);
  return (
    <div className="w-full justify-center p-4">
      <div className="flex flex-row justify-center py-4">
        <Text.H1>{league.name}</Text.H1>
      </div>
      <div className="grid grid-cols-5 gap-4">
        <div className="hidden md:col-span-1 md:col-start-1 md:flex">
          <Card className="h-[300px] w-full">
            <CardHeader>
              {firstGame && (
                <CardTitle>
                  Your picks for {firstGame.week}, {firstGame.season}
                </CardTitle>
              )}
            </CardHeader>
          </Card>
        </div>
        <div className="col-span-5 col-start-1 row-start-1 md:col-span-4 md:col-start-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-2 overflow-auto">
              {games.map((g) => {
                const homeTeam = teams.find((t) => t.teamid === g.home)!;
                const awayTeam = teams.find((t) => t.teamid === g.away)!;
                return (
                  <GameCard
                    key={g.gid}
                    game={g}
                    awayTeam={awayTeam}
                    homeTeam={homeTeam}
                    onClickTeamId={(teamId) => {
                      console.log(teamId);
                    }}
                  />
                );
              })}
            </div>
            <PicksTable
              picksSummary={picksSummary}
              teams={teams}
              games={games}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
