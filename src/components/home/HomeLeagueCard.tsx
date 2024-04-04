"use client";

import { type serverApi } from "~/trpc/server";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Text } from "../ui/text";
import { useMemo } from "react";
import { Badge } from "../ui/badge";
import Link from "next/link";

type LeagueCardData = NonNullable<
  Awaited<ReturnType<(typeof serverApi)["home"]["summary"]>>
>[number];

export function HomeLeagueCard({ data }: { data: LeagueCardData }) {
  const { correct, total } = useMemo(() => {
    const correct = data.leaguemembers.reduce((prev, curr) => {
      const correctPicks = curr.picks.filter((p) => p.correct).length;
      return prev + correctPicks;
    }, 0);
    const total = data.leaguemembers.reduce((prev, curr) => {
      const correctPicks = curr.picks.length;
      return prev + correctPicks;
    }, 0);
    return { correct, total };
  }, [data]);

  const weekWins = useMemo(() => {
    return data.WeekWinners.map((w) => {
      return { week: w.week, league_id: data.league_id };
    });
  }, [data]);

  return (
    <Link href={`/league/${data.league_id}`} passHref>
      <Card className="min-w-[240px] flex-grow hover:border-primary">
        <CardHeader className="text-center font-bold">{data.name}</CardHeader>
        <CardContent>
          <div className="flex w-full flex-col gap-3">
            <div className="flex w-full flex-row justify-between">
              <Text.Small>Correct Picks</Text.Small>
              <Text.Small className="font-semibold">
                {correct} / {total}
              </Text.Small>
            </div>
            <Separator />
            <div className="flex w-full flex-row items-center justify-between">
              <Text.Small>Week Wins</Text.Small>
              <div className="flex max-w-[160px] flex-row flex-wrap justify-end gap-1">
                {weekWins.length === 0
                  ? "None"
                  : weekWins.map((w) => {
                      return (
                        <Badge key={`week_win_${w.week}_${w.league_id}`}>
                          Week {w.week}
                        </Badge>
                      );
                    })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
