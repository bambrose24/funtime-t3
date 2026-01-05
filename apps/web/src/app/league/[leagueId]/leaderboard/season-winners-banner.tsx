"use client";

import React from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type RouterOutputs } from "~/trpc/types";

type Leaderboard = NonNullable<RouterOutputs["leaderboard"]["league"]>;

type Props = {
  leaderboard: Leaderboard;
};

function getRankLabel(rank: number): string {
  switch (rank) {
    case 1:
      return "1st";
    case 2:
      return "2nd";
    case 3:
      return "3rd";
    case 4:
      return "4th";
    default:
      return `${rank}th`;
  }
}

export function SeasonWinnersBanner({ leaderboard }: Props) {
  if (!leaderboard.isSeasonOver) {
    return null;
  }

  const topFinishersByRank = leaderboard.topFinishersByRank;
  const ranks = Object.keys(topFinishersByRank)
    .map(Number)
    .sort((a, b) => a - b);

  if (ranks.length === 0) {
    return null;
  }

  return (
    <div className="col-span-12 flex justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>{leaderboard.league.season} Season Complete</CardTitle>
              <CardDescription>Final standings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[2.5rem_3rem_1fr] gap-y-2 text-sm">
            {ranks.map((rank) => {
              const finishers = topFinishersByRank[rank] ?? [];
              if (finishers.length === 0) return null;

              const correctCount = finishers[0]?.correct ?? 0;
              const names = finishers.map((f) => ({
                username: f.member.people.username,
                membershipId: f.member.membership_id,
              }));

              return (
                <React.Fragment key={rank}>
                  <span className="font-medium text-muted-foreground">
                    {getRankLabel(rank)}
                  </span>
                  <span className="text-muted-foreground">{correctCount}</span>
                  <span className="flex flex-wrap gap-x-1">
                    {names.map((name, idx) => (
                      <span key={name.membershipId}>
                        <Link
                          href={`/league/${leaderboard.league.league_id}/player/${name.membershipId}`}
                          className="hover:underline"
                        >
                          {name.username}
                        </Link>
                        {idx < names.length - 1 && ", "}
                      </span>
                    ))}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

