"use client";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Text } from "../ui/text";
import { useMemo } from "react";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import type { RouterOutputs } from "~/trpc/types";
import { clientApi } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
import { useUserEnforced } from "~/utils/hooks/useUserEnforced";

type LeagueCardData = NonNullable<RouterOutputs["home"]["summary"]>[number];

export function HomeLeagueCard({ data }: { data: LeagueCardData }) {
  const { data: leagueData, isPending: leagueDataPending } =
    clientApi.league.get.useQuery({
      leagueId: data.league_id,
    });

  const user = useUserEnforced();
  const userMemberIds = user.dbUser.leaguemembers.map((m) => m.membership_id);
  const weekWins = useMemo(() => {
    return (
      leagueData?.WeekWinners?.filter((w) =>
        userMemberIds.includes(w.membership_id),
      ).map((w) => {
        return { week: w.week, league_id: data.league_id };
      }) ?? []
    );
  }, [leagueData?.WeekWinners, userMemberIds, data.league_id]);

  return (
    <Link href={`/league/${data.league_id}`} passHref>
      <Card className="min-w-[240px] transition-colors hover:border-primary">
        <CardHeader className="text-center font-bold">{data.name}</CardHeader>
        <CardContent>
          <div className="flex w-full flex-col gap-3">
            <div className="flex w-full flex-row justify-between">
              <Text.Small>Correct Picks</Text.Small>
              <Text.Small>
                <CorrectPicksCounts leagueId={data.league_id} />
              </Text.Small>
            </div>
            <Separator />
            <div className="flex w-full flex-row items-center justify-between">
              <Text.Small>Week Wins</Text.Small>
              <div className="flex max-w-[160px] flex-row flex-wrap justify-end gap-1">
                {leagueDataPending && (
                  <Skeleton className="h-[18px] w-[60px]" />
                )}
                {!leagueDataPending && weekWins.length === 0
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

function CorrectPicksCounts({ leagueId }: { leagueId: number }) {
  const counts = clientApi.league.correctPickCount.useQuery({
    leagueId,
  });

  if (counts.isPending || !counts.data) {
    return <Skeleton className="h-[18px] w-[60px]" />;
  }
  return (
    <>
      {counts.data.correct} / {counts.data.total}
    </>
  );
}
