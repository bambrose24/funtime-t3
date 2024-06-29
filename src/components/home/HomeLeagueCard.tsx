"use client";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Text } from "../ui/text";
import { useMemo } from "react";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import type { RouterOutputs } from "~/trpc/types";

type LeagueCardData = NonNullable<RouterOutputs["home"]["summary"]>[number];

export function HomeLeagueCard({ data }: { data: LeagueCardData }) {
  const router = useRouter();

  const weekWins = useMemo(() => {
    return data.league.WeekWinners.map((w) => {
      return { week: w.week, league_id: data.league.league_id };
    });
  }, [data]);

  const href = `/league/${data.league.league_id}`;

  router.prefetch(href, {
    kind: PrefetchKind.FULL,
  });

  return (
    <Link href={`/league/${data.league.league_id}`} passHref>
      <Card className="min-w-[240px] flex-grow hover:border-primary">
        <CardHeader className="text-center font-bold">
          {data.league.name}
        </CardHeader>
        <CardContent>
          <div className="flex w-full flex-col gap-3">
            <div className="flex w-full flex-row justify-between">
              <Text.Small>Correct Picks</Text.Small>
              <Text.Small className="font-semibold">
                {data.pickCounts.correct ?? 0} /{" "}
                {(data.pickCounts.correct ?? 0) + (data.pickCounts.wrong ?? 0)}
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
