"use client";

import { useEffect } from "react";
import { type serverApi } from "~/trpc/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import * as React from "react";

import { LeaderboardTable } from "./leaderboard-table";
import { LeaderboardChart } from "./leaderboard-chart";
import { Defined } from "~/utils/defined";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  leaderboard: Awaited<ReturnType<typeof serverApi.leaderboard.league>>;
};

export function ClientLeaderboardPage(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
        const idx = props.leaderboard?.correctCountsSorted.findIndex(
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

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    const memberIds = (
      Object.keys(rowSelection)
        .map((idx) => {
          return props.leaderboard?.correctCountsSorted
            ?.at(Number(idx))
            ?.member?.membership_id?.toString();
        })
        .filter(Defined) ?? []
    ).join(",");

    if (memberIds) {
      params.set("members", memberIds);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [rowSelection, searchParams, props, pathname, router]);

  return (
    <div className="h-full w-full justify-center p-4">
      <div className="grid w-full grid-cols-5 gap-4 md:grid-cols-7">
        <div className="col-span-5 md:col-span-2">
          <Card className="overflow-scroll px-2">
            <CardHeader>
              <CardTitle>
                {props.leaderboard?.league?.name} Leaderboard
              </CardTitle>
            </CardHeader>
            <LeaderboardTable
              {...props}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
            />
          </Card>
        </div>
        <div className="col-span-4 hidden md:col-span-5 md:block">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Weekly Standings</CardTitle>
              <CardDescription>
                Select players to view them in the graph
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-full w-full justify-center">
              <LeaderboardChart
                className="h-[70vh] w-[50vw]"
                entries={[...(props.leaderboard?.weekTotals.entries() ?? [])]
                  .filter((m) => {
                    return memberIds.has(m[0]);
                  })
                  .map((m) => {
                    const [memberId, weekTotals] = m;
                    const id =
                      props.leaderboard?.correctCountsSorted?.find(
                        (m) => m.member.membership_id === Number(memberId),
                      )?.member?.people?.username ?? "";

                    const data = [...weekTotals].map(([week, total]) => {
                      return {
                        x: week,
                        y: total,
                      };
                    });
                    return {
                      id,
                      data,
                    };
                  })}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}