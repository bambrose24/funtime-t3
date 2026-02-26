"use client";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Text } from "../ui/text";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import type { RouterOutputs } from "~/trpc/types";

type LeagueCardData = NonNullable<RouterOutputs["home"]["summary"]>[number];

// Card renders from home.summary payload (no per-card fetch fan-out).
export function HomeLeagueCard({ data }: { data: LeagueCardData }) {
  const weekWins = data.viewerWeekWins ?? [];
  const correctPickCount = data.viewerCorrectPickCount ?? {
    correct: 0,
    total: 0,
  };

  return (
    <Link href={`/league/${data.league_id}`} passHref className="max-w-[240px]">
      <Card className="min-w-[240px] transition-colors hover:border-primary">
        <CardHeader className="text-center font-bold">{data.name}</CardHeader>
        <CardContent>
          <div className="flex w-full flex-col gap-3">
            <div className="flex w-full flex-row justify-between">
              <Text.Small>Correct Picks</Text.Small>
              <Text.Small>
                {correctPickCount.correct} / {correctPickCount.total}
              </Text.Small>
            </div>
            <Separator />
            <div className="flex w-full flex-row items-center justify-between gap-1">
              <Text.Small>Week Wins</Text.Small>
              <div className="flex max-w-[160px] flex-row flex-wrap justify-end gap-1">
                {weekWins.length === 0
                  ? "None"
                  : weekWins.map((week) => {
                      return (
                        <Badge key={`week_win_${week}_${data.league_id}`}>
                          Week {week}
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
