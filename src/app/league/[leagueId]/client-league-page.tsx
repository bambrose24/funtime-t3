"use client";
import { GameCard } from "~/components/league/GameCard";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { type serverApi } from "~/trpc/server";
import { PicksTable } from "./picks-table";
import { YourPicksList, CompactYourPicksList } from "./your-picks-list";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import { cloneDeep } from "lodash";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { useDictify } from "~/utils/hooks/useIdToValMemo";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { type RouterOutputs } from "~/trpc/types";
import { clientApi } from "~/trpc/react";

type ClientLeaguePageProps = {
  week: number;
  leagueId: number;
  season: number;
  picksSummary: RouterOutputs["league"]["picksSummary"];
  games: RouterOutputs["games"]["getGames"];
  teams: RouterOutputs["teams"]["getTeams"];
  league: RouterOutputs["league"]["get"];
  session: RouterOutputs["session"]["current"];
  currentGame: RouterOutputs["time"]["activeWeekByLeague"];
};

const REFETCH_INTERVAL_MS = 1000 * 30;

export function ClientLeaguePage(props: ClientLeaguePageProps) {
  const { teams, league, session, currentGame } = props;

  const { data: games } = clientApi.games.getGames.useQuery(
    {
      week: props.week,
      season: props.season,
    },
    {
      initialData: props.games,
      refetchInterval: REFETCH_INTERVAL_MS,
    },
  );
  const { data: picksSummaryData } = clientApi.league.picksSummary.useQuery(
    {
      leagueId: props.leagueId,
      week: props.week,
    },
    { initialData: props.picksSummary, refetchInterval: REFETCH_INTERVAL_MS },
  );

  // TODO pass these to trpc useQuery's as initialData instead of just relying on these pieces of info so that we can pollInterval for every 5 minutes or something
  const firstGame = games.at(0);
  const week = firstGame?.week;

  const router = useRouter();
  const pathname = usePathname();

  const [overrideGidToWinner, setOverrideGidToWinner] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    setOverrideGidToWinner({});
  }, [week]);

  const gameToGid = useDictify(games, (g) => g.gid);

  const picksSummary = useMemo(() => {
    const picksSummaryCloned = cloneDeep(picksSummaryData);
    picksSummaryCloned.forEach((p) => {
      p.picks = p.picks.map((p) => {
        const gid = p.gid;
        if (gid in overrideGidToWinner) {
          p.correct = overrideGidToWinner[gid] === p.winner ? 1 : 0;
        }
        return p;
      });
      p.correctPicks = p.picks.reduce(
        (prev, curr) => prev + (curr.correct ?? 0),
        0,
      );
    });
    return picksSummaryCloned;
  }, [picksSummaryData, overrideGidToWinner]);

  const myPicks = picksSummary.find((p) => p.user_id === session.dbUser?.uid);

  const selectGame = useCallback(
    (gid: number, winner: number) => {
      setOverrideGidToWinner((prev) => {
        const realWinner = gameToGid.get(gid)?.winner;
        if (gid in prev) {
          if (prev[gid] === winner || winner === realWinner) {
            delete prev[gid];
            return { ...prev };
          }
        }
        if (winner === realWinner) {
          return { ...prev };
        }
        return { ...prev, [gid]: winner };
      });
    },
    [gameToGid],
  );

  const simulatedGameCount = Object.keys(overrideGidToWinner).length;

  return (
    <>
      <div className="col-span-12 flex flex-row justify-center py-4">
        <Text.H1>{league.name}</Text.H1>
      </div>
      <div className="hidden xl:col-span-2 xl:flex">
        <div className="flex w-full flex-col gap-4">
          {currentGame && firstGame && (
            <Select
              onValueChange={(value) => {
                const week = Number(value);
                router.push(`${pathname}?week=${week}`);
              }}
            >
              <SelectTrigger className="w-full ring-2 ring-input focus:ring-2">
                <SelectValue placeholder={`Week ${firstGame.week}`} />
              </SelectTrigger>
              <SelectContent>
                {[...Array(currentGame.week).keys()].map((weekMinusOne) => {
                  const realWeek = weekMinusOne + 1;
                  return (
                    <SelectItem key={realWeek} value={realWeek.toString()}>
                      Week {realWeek}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
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
                <YourPicksList
                  {...props}
                  selectGame={selectGame}
                  myPicks={myPicks}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <div className="col-span-12 xl:col-span-10">
        <div className="flex flex-col gap-4">
          <div className="w-full xl:hidden">
            {currentGame && firstGame && (
              <Select
                onValueChange={(value) => {
                  const week = Number(value);
                  router.push(`${pathname}?week=${week}`);
                }}
              >
                <SelectTrigger className="w-full ring-2 ring-input focus:ring-2">
                  <SelectValue placeholder={`Week ${firstGame.week}`} />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(currentGame.week).keys()].map((weekMinusOne) => {
                    const realWeek = weekMinusOne + 1;
                    return (
                      <SelectItem key={realWeek} value={realWeek.toString()}>
                        Week {realWeek}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>
          <ScrollArea>
            <div className="flex flex-row gap-2">
              {games.map((g) => {
                const homeTeam = teams.find((t) => t.teamid === g.home)!;
                const awayTeam = teams.find((t) => t.teamid === g.away)!;
                return (
                  <GameCard
                    key={g.gid}
                    game={g}
                    awayTeam={awayTeam}
                    homeTeam={homeTeam}
                    simulatedWinner={overrideGidToWinner[g.gid]}
                    onClickTeamId={(teamId) => {
                      selectGame(g.gid, teamId);
                    }}
                  />
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {simulatedGameCount > 0 && (
            <div className="w-full">
              <Alert
                variant="default"
                className="flex w-full flex-row items-center"
              >
                <AlertTitle className="flex w-full  flex-row items-center justify-between">
                  <div className="flex flex-row gap-2">
                    <AlertCircleIcon className="h-4 w-4" />
                    {simulatedGameCount} game
                    {simulatedGameCount > 1 ? "s" : ""} simluated
                  </div>
                  <Button
                    onClick={() => {
                      console.log("unsetting overridden winners");
                      setOverrideGidToWinner({});
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Reset
                  </Button>
                </AlertTitle>
              </Alert>
            </div>
          )}
          <div className="flex flex-row xl:hidden">
            {myPicks && firstGame && (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="secondary" className="w-full">
                    View Your Picks
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                      <DrawerTitle>
                        Your Week {firstGame.week}, {firstGame.season} Picks
                      </DrawerTitle>
                      <DrawerDescription>{league.name}</DrawerDescription>
                    </DrawerHeader>
                    <div className="overflow-scroll">
                      <CompactYourPicksList
                        {...props}
                        selectGame={selectGame}
                        myPicks={myPicks}
                      />
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="secondary">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>
          <PicksTable picksSummary={picksSummary} teams={teams} games={games} />
        </div>
      </div>
    </>
  );
}
