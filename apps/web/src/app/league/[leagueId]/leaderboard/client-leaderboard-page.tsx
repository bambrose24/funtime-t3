"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import * as React from "react";

import { LeaderboardTable } from "./leaderboard-table";
import { LeaderboardChart2 } from "./leaderboard-chart-2";
import { SeasonWinnersBanner } from "./season-winners-banner";
import { Defined } from "~/utils/defined";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ScrollArea } from "~/components/ui/scroll-area";
import { type RouterOutputs } from "~/trpc/types";
import { clientApi } from "~/trpc/react";

type Props = {
  leagueId: number;
  leaderboard: RouterOutputs["leaderboard"]["league"];
};

export function ClientLeaderboardPage(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: leaderboard } = clientApi.leaderboard.league.useQuery(
    {
      leagueId: props.leagueId,
    },
    { initialData: props.leaderboard },
  );

  const membersParam = searchParams.get("members");

  let memberIds: Set<number> = new Set<number>();
  if (Array.isArray(membersParam)) {
    memberIds = new Set(
      membersParam.map((m) => {
        return Number(m);
      }),
    );
  } else {
    memberIds = new Set(
      membersParam?.split(",").map((m) => {
        return Number(m);
      }),
    );
  }

  const [rowSelection, setRowSelection] = React.useState<
    Record<number, boolean>
  >(() => {
    return [...memberIds].reduce(
      (prev, curr) => {
        const idx = leaderboard?.correctCountsSorted.findIndex(
          (p) => p.member.membership_id === curr,
        );
        if (idx) {
          prev[idx] = true;
        }
        return prev;
      },
      {} as Record<number, boolean>,
    );
  });

  const members = [...memberIds]
    .map((memberId) => {
      const member = leaderboard?.correctCountsSorted.find(
        (m) => m.member.membership_id === memberId,
      );
      if (!member) {
        return null;
      }
      return {
        memberId,
        username: member.member.people.username ?? "",
      };
    })
    .filter(Defined);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    const memberIds = (
      Object.keys(rowSelection)
        .map((idx) => {
          return leaderboard?.correctCountsSorted
            ?.at(Number(idx))
            ?.member?.membership_id?.toString();
        })
        .filter(Defined) ?? []
    ).join(",");

    if (memberIds) {
      params.set("members", memberIds);
      router.replace(`${pathname}?${params.toString()}`);
    } else {
      router.replace(`${pathname}`);
    }
  }, [rowSelection, searchParams, leaderboard, pathname, router]);

  const chartData = leaderboard?.chartableMembersData;

  return (
    <>
      {leaderboard && <SeasonWinnersBanner leaderboard={leaderboard} />}
      <div className="col-span-12 max-h-[1000px] md:col-span-4">
        <Card className="p-2">
          <ScrollArea>
            <div className="max-h-[90vh]">
              <CardHeader>
                <CardTitle>{leaderboard?.league?.name} Leaderboard</CardTitle>
              </CardHeader>

              <LeaderboardTable
                leaderboard={leaderboard}
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
              />
            </div>
          </ScrollArea>
        </Card>
      </div>
      <div className="col-span-12 hidden md:col-span-8 md:block">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Weekly Standings</CardTitle>
            <CardDescription>
              Select players to view them in the graph
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-full w-full justify-center">
            {chartData && (
              <LeaderboardChart2
                data={chartData}
                members={members}
                className="h-[65vh] w-[50vw]"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
