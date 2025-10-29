"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GameCard } from "~/components/league/GameCard";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { PicksTable } from "./picks-table";
import { CompactYourPicksList, YourPicksList } from "./your-picks-list";
// import cloneDeep from "lodash/cloneDeep";
import { AlertCircleIcon, MessagesSquare, Trophy } from "lucide-react";
import Link from "next/link";
import { ScenariosButton } from "~/components/league/ScenariosButton";
import { LeagueWeekMessageSheetContent } from "~/components/messages/LeagueWeekMessageSheetContent";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Sheet, SheetTrigger } from "~/components/ui/sheet";
import { clientApi } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/types";
import { useDictify } from "~/utils/hooks/useIdToValMemo";

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
  weekWinners: RouterOutputs["league"]["weekWinners"];
  weeksWithPicks: RouterOutputs["picks"]["weeksWithPicks"];
  viewerHasPicks: boolean;
};

const REFETCH_INTERVAL_MS = 1000 * 60 * 2;

export function ClientLeaguePage(props: ClientLeaguePageProps) {
  const { teams, league, session, currentGame } = props;
  const { data: weeksWithPicks } = clientApi.picks.weeksWithPicks.useQuery(
    {
      leagueId: props.leagueId,
    },
    { initialData: props.weeksWithPicks, refetchInterval: REFETCH_INTERVAL_MS },
  );

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
    {
      initialData: props.picksSummary,
      refetchInterval: REFETCH_INTERVAL_MS,
    },
  );

  const { data: weekWinners } = clientApi.league.weekWinners.useQuery(
    { week: props.week, leagueId: props.leagueId },
    { initialData: props.weekWinners, refetchInterval: REFETCH_INTERVAL_MS },
  );

  const weeksOptions = useMemo(() => {
    return weeksWithPicks.weeks.reverse();
  }, [weeksWithPicks.weeks]);

  const [chatSheetOpen, setChatSheetOpen] = useState(false);

  const firstGame = games.at(0);
  const week = firstGame?.week;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [overrideGidToWinner, setOverrideGidToWinner] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    setOverrideGidToWinner({});
  }, [week]);

  const gameToGid = useDictify(games, (g) => g.gid);

  const picksSummary = useMemo(() => {
    const picksSummaryCloned = structuredClone(picksSummaryData);
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

  const simulatedGids = Object.keys(overrideGidToWinner).map((gid) =>
    Number(gid),
  );
  const simulatedGameCount = simulatedGids.length;

  const banner: "make-picks" | "winners" | null =
    weekWinners.winners.length > 0
      ? "winners"
      : !props.viewerHasPicks && !searchParams.get("week")
        ? "make-picks"
        : null;

  return (
    <>
      <div className="col-span-12 flex flex-row justify-center py-4">
        <Text.H1>{league.name}</Text.H1>
      </div>
      {banner === "winners" ? (
        <div className="col-span-12 flex justify-center">
          <div>
            <Alert
              variant="success"
              className="flex items-center justify-center gap-2"
            >
              <AlertTitle className="flex flex-row items-center gap-2 text-secondary-foreground">
                <Trophy className="z-40 h-4 w-4" />
                Congrats to this week&apos;s{" "}
                {weekWinners.winners.length > 1 ? "winners" : "winner"}:
                {weekWinners.winners.map((w, idx) => {
                  const user = w.leaguemembers.people;
                  if (!user) {
                    return null;
                  }
                  return (
                    <div key={idx} className="flex items-center">
                      <Link
                        className="font-bold underline"
                        href={`/league/${league.league_id}/player/${w.membership_id}`}
                      >
                        <Text.Small>{user.username}</Text.Small>
                      </Link>
                    </div>
                  );
                })}
              </AlertTitle>
            </Alert>
          </div>
        </div>
      ) : banner === "make-picks" ? (
        <Alert className="col-span-12 flex items-center">
          <AlertTitle>
            You need to make your picks for this week. Make them{" "}
            <Link
              href={`/league/${league.league_id}/pick`}
              className="underline"
            >
              here
            </Link>
            .
          </AlertTitle>
        </Alert>
      ) : simulatedGameCount === 0 ? (
        <div className="col-span-12 flex justify-center">
          <ScenariosButton
            picksSummary={picksSummary}
            games={games}
            teams={teams}
            league={league}
            week={week ?? 0}
          />
        </div>
      ) : null}
      <div className="hidden xl:col-span-2 xl:flex">
        <div className="flex w-full flex-col gap-4">
          {currentGame && firstGame && (
            <Select
              onValueChange={(value) => {
                router.push(`${pathname}?week=${value}`);
              }}
            >
              <SelectTrigger className="w-full ring-2 ring-input focus:ring-2">
                <SelectValue placeholder={`Week ${firstGame.week}`} />
              </SelectTrigger>
              <SelectContent>
                {weeksOptions.reverse().map((weekOption) => {
                  return (
                    <SelectItem key={weekOption} value={weekOption.toString()}>
                      Week {weekOption}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
          {week !== undefined && (
            <Sheet
              open={chatSheetOpen}
              onOpenChange={(open) => {
                setChatSheetOpen(open);
              }}
            >
              <SheetTrigger asChild>
                <Button
                  variant="secondary"
                  className="flex items-center gap-2 "
                >
                  <MessagesSquare className="h-4 w-4 " />
                  Chat
                </Button>
              </SheetTrigger>
              <LeagueWeekMessageSheetContent
                className="w-[600px]"
                week={week}
                leagueId={league.league_id}
                closeSheet={() => {
                  setChatSheetOpen(false);
                }}
              />
            </Sheet>
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
                      {myPicks.tiebreakerScore}
                    </Text.Small>
                  </div>
                </div>
                <Separator />
              </CardHeader>
              <CardContent>
                <YourPicksList
                  {...props}
                  simulatedGames={overrideGidToWinner}
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
          <div className="flex w-full justify-between gap-2 xl:hidden">
            {week !== undefined && (
              <div className="w-full">
                <Sheet
                  open={chatSheetOpen}
                  onOpenChange={(open) => setChatSheetOpen(open)}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="secondary"
                      className="flex w-full items-center gap-2"
                    >
                      <MessagesSquare className="h-4 w-4" />
                      Chat
                    </Button>
                  </SheetTrigger>
                  <LeagueWeekMessageSheetContent
                    className="w-full"
                    week={week}
                    leagueId={league.league_id}
                    closeSheet={() => {
                      setChatSheetOpen(false);
                    }}
                  />
                </Sheet>
              </div>
            )}
            {currentGame && firstGame && (
              <div className="w-full">
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
                    {[...Array(currentGame.week).keys()]
                      .reverse()
                      .map((weekMinusOne) => {
                        const realWeek = weekMinusOne + 1;
                        return (
                          <SelectItem
                            key={realWeek}
                            value={realWeek.toString()}
                          >
                            Week {realWeek}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <ScrollArea>
            <div className="flex flex-row gap-2">
              {games.map((g) => {
                const homeTeam = teams.find((t) => t.teamid === g.home)!;
                const awayTeam = teams.find((t) => t.teamid === g.away)!;
                const myPick = myPicks?.picks.find((p) => p.gid === g.gid);
                return (
                  <GameCard
                    key={g.gid}
                    game={g}
                    myChosenTeam={myPick?.winner}
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
              <Alert variant="default" className="flex w-full items-center">
                <AlertTitle className="flex w-full items-center gap-4">
                  <div className="flex items-center gap-2">
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
          <div className="flex flex-col xl:hidden">
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
                      <DrawerTitle className="text-center">
                        Your Week {firstGame.week}, {firstGame.season} Picks
                      </DrawerTitle>
                      <DrawerDescription className="text-center">
                        {league.name}
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="overflow-scroll">
                      <CompactYourPicksList
                        {...props}
                        simulatedGames={overrideGidToWinner}
                        selectGame={selectGame}
                        myPicks={myPicks}
                      />
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="secondary" type="button">
                          Close
                        </Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>
          <PicksTable
            picksSummary={picksSummary}
            teams={teams}
            games={games}
            simulatedGames={overrideGidToWinner}
          />
        </div>
      </div>
    </>
  );
}
