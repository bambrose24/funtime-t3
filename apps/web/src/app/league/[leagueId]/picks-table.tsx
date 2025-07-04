"use client";

import {
  flexRender,
  type ColumnDef,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Suspense, useMemo } from "react";
import sortBy from "lodash/sortBy";
import { cn } from "~/lib/utils";
import { Skeleton } from "~/components/ui/skeleton";
import { useDictify } from "~/utils/hooks/useIdToValMemo";
import Link from "next/link";
import { type RouterOutputs } from "~/trpc/types";
import { clientApi } from "~/trpc/react";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Info } from "lucide-react";

type Props = {
  picksSummary: RouterOutputs["league"]["picksSummary"];
  games: RouterOutputs["games"]["getGames"];
  teams: RouterOutputs["teams"]["getTeams"];
  simulatedGames: Record<number, number>;
};

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Pick = Props["picksSummary"][number];

export function PicksTable(props: Props) {
  return (
    <Suspense fallback={<PicksTableSkeleton />}>
      <PicksTableImpl {...props} />
    </Suspense>
  );
}

function PicksTableSkeleton() {
  return <Skeleton className="h-full w-full rounded-md" />;
}

// TODO use simulatedGames
function PicksTableImpl({ picksSummary, games, teams, simulatedGames }: Props) {
  const teamIdToTeam = useDictify(teams, (t) => t.teamid);
  const user = clientApi.session.current.useQuery();
  const gameIdToGame = useDictify(games, (g) => g.gid);

  const sortedData = useMemo(() => {
    return sortBy(picksSummary, (p) => {
      return -p.correctPicks;
    });
  }, [picksSummary]);
  const columns: ColumnDef<Pick>[] = [
    {
      maxSize: 30,
      accessorFn: (data) => {
        return data;
      },
      cell: (c) => {
        const value = c.cell.getValue() as Pick;
        const isViewer = user.data?.dbUser?.leaguemembers.some(
          (m) => m.membership_id === value.membership_id,
        );

        if (isViewer) {
          return (
            <Link
              href={`/league/${value.league_id}/player/${value.membership_id}`}
            >
              <Badge variant="default">{value.people.username}</Badge>
            </Link>
          );
        }
        return (
          <Link
            href={`/league/${value.league_id}/player/${value.membership_id}`}
            className="hover:underline"
          >
            {value.people.username}
          </Link>
        );
      },
      header: "Player",
      id: "player",
    },
    {
      accessorKey: "correctPicks",
      header: "Correct",
      id: "correct",
    },
    {
      accessorKey: "tiebreakerScore",
      // header: "Tiebreaker Score",
      header: (_data) => {
        return (
          <div className="flex items-center gap-1">
            Score
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  The tiebreaker score is the total score of the last game in
                  the week. If there are multiple players with the same total
                  picks correct, the player with the closest total score wins.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      id: "tiebreakerScore",
      maxSize: 10,
    },
    ...games.map((g): ColumnDef<Pick> => {
      return {
        id: g.gid?.toString(),
        accessorFn: (data) => {
          const winner = data?.picks.find((p) => p.gid === g.gid)?.winner;

          if (!winner) {
            return "--";
          }
          const winnerTeam = teamIdToTeam.get(winner);
          if (!winnerTeam) {
            return "--";
          }
          return winnerTeam?.abbrev;
        },
        header: () => {
          return (
            <div className="flex flex-col">
              <div>{teamIdToTeam.get(g.away)?.abbrev}</div>
              <div>{teamIdToTeam.get(g.home)?.abbrev}</div>
            </div>
          );
        },
      };
    }),
  ];

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-lg border bg-card p-1">
      <Table>
        <TableHeader className="rounded-t-lg">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn("text-center", {
                      "sticky left-0 z-10 bg-card transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted":
                        index === 0,
                    })}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="py-2"
              >
                {row.getVisibleCells().map((cell, index) => {
                  const gid = Number(cell.column.id);
                  const pick = cell.row.original?.picks.find(
                    (p) => p.gid === gid,
                  );
                  const game = gameIdToGame.get(gid);

                  let bgColor: "yellow" | "green" | "red" | undefined =
                    undefined;

                  const simulatedWinner = simulatedGames[gid];
                  if (game?.done === true || simulatedWinner) {
                    if (!pick) {
                      bgColor = "yellow";
                    } else if (
                      pick?.correct === 1 ||
                      (pick.winner && pick.winner === simulatedWinner)
                    ) {
                      bgColor = "green";
                    } else if (
                      pick?.correct !== null ||
                      (simulatedWinner && pick.winner !== simulatedWinner)
                    ) {
                      bgColor = "red";
                    }
                  } else if (!game && cell.column.getIndex() > 1) {
                    // TODO make columnIndexToGame map
                    // TODO is this for missing picks? or picks we can't see yet?
                    // seems like it's both
                    // bgColor = "yellow";
                  }
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn("p-0", {
                        "sticky left-0 z-10 bg-card transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted":
                          index === 0,
                      })}
                    >
                      <div
                        className={cn(
                          bgColor === "red"
                            ? "bg-wrong text-wrong-foreground"
                            : bgColor === "green"
                              ? "bg-correct text-correct-foreground"
                              : bgColor === "yellow"
                                ? "bg-yellow-500 dark:bg-yellow-700"
                                : "",
                          "flex h-full w-full flex-row items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap p-1",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
