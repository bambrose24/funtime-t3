"use client";
import { GameCard } from "~/components/league/GameCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { type serverApi } from "~/trpc/server";
import { PicksTable } from "./picks-table";
import { YourPicksList } from "./your-picks-list";
import { useMemo } from "react";
import { Separator } from "~/components/ui/separator";

type ClientLeaguePageProps = {
  picksSummary: Awaited<ReturnType<typeof serverApi.league.picksSummary>>;
  games: Awaited<ReturnType<typeof serverApi.games.getGames>>;
  teams: Awaited<ReturnType<typeof serverApi.teams.getTeams>>;
  league: Awaited<ReturnType<typeof serverApi.league.get>>;
  session: Awaited<ReturnType<typeof serverApi.session.current>>;
};

export function ClientLeaguePage(props: ClientLeaguePageProps) {
  const { picksSummary, games, teams, league, session } = props;
  const firstGame = games.at(0);

  const myPicks = useMemo(() => {
    return picksSummary.find((p) => p.user_id === session.dbUser?.uid);
  }, [picksSummary, session]);

  return (
    <div className="w-full justify-center p-4">
      <div className="flex flex-row justify-center py-4">
        <Text.H1>{league.name}</Text.H1>
      </div>
      <div className="grid grid-cols-5 gap-4 2xl:grid-cols-7">
        <div className="hidden md:col-span-1 md:col-start-1 md:flex">
          <div className="w-full">
            {myPicks && firstGame && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-balance pb-2 text-center">
                    Your picks for Week {firstGame.week}, {firstGame.season}
                  </CardTitle>
                  <div className="flex flex-col gap-1">
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                      <Text.Muted>Correct:</Text.Muted>
                      <Text.Small className="font-semibold text-card-foreground">
                        {myPicks.correctPicks} / {games.length}
                      </Text.Small>
                    </div>
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                      <Text.Muted>Tiebreaker Score:</Text.Muted>
                      <Text.Small className="font-semibold text-card-foreground">
                        {
                          myPicks.picks.find(
                            (p) => p.score !== null && p.score > 0,
                          )?.score
                        }
                      </Text.Small>
                    </div>
                  </div>
                  <Separator />
                </CardHeader>
                <CardContent>
                  <YourPicksList {...props} myPicks={myPicks} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <div className="col-span-5 col-start-1 md:col-span-4 md:col-start-2 2xl:col-span-6">
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
