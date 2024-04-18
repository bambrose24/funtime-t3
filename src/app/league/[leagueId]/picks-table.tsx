"use client";

import { type serverApi } from "~/trpc/server";
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
import _ from "lodash";
import { cn } from "~/lib/utils";
import { Skeleton } from "~/components/ui/skeleton";
import { useDictify } from "~/utils/hooks/useIdToValMemo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";

type Props = {
  picksSummary: Awaited<ReturnType<typeof serverApi.league.picksSummary>>;
  games: Awaited<ReturnType<typeof serverApi.games.getGames>>;
  teams: Awaited<ReturnType<typeof serverApi.teams.getTeams>>;
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

function PicksTableImpl({ picksSummary, games, teams }: Props) {
  const router = useRouter();

  const teamIdToTeam = useDictify(teams, (t) => t.teamid);
  const gameIdToGame = useDictify(games, (g) => g.gid);

  const sortedData = useMemo(() => {
    return _.sortBy(
      picksSummary,

      (p) => {
        return -p.correctPicks;
      },
    );
  }, [picksSummary]);

  const columns: ColumnDef<Pick>[] = [
    {
      maxSize: 30,
      accessorFn: (data) => {
        return data;
      },
      cell: (c) => {
        const value = c.cell.getValue() as Pick;
        const href = `/league/${value.league_id}/player/${value.membership_id}`;
        router.prefetch(href, {
          kind: PrefetchKind.FULL,
        });
        return (
          <Link href={href} className="hover:underline">
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
    ...games.map((g): ColumnDef<Pick> => {
      return {
        id: g.gid?.toString(),
        accessorFn: (data) => {
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          if (!data?.gameIdToPick || !data?.gameIdToPick?.get) {
            return "--";
          }
          const winner = data?.gameIdToPick?.get(g.gid)?.winner;

          if (!winner) {
            return "--";
          }
          const winnerTeam = teamIdToTeam.get(winner);
          if (!winnerTeam) {
            return "--";
          }
          return winnerTeam?.abbrev;
        },
        header: `${teamIdToTeam.get(g.away)?.abbrev} ${teamIdToTeam.get(g.home)?.abbrev}`,
      };
    }),
  ];

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-center">
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
                {row.getVisibleCells().map((cell) => {
                  const gid = Number(cell.column.id);
                  let pick;
                  let game;
                  if (cell?.row?.original?.gameIdToPick?.get?.(gid)) {
                    pick = cell.row.original?.gameIdToPick?.get(gid);
                    game = gameIdToGame.get(gid);
                  }

                  let bgColor: "yellow" | "green" | "red" | undefined =
                    undefined;
                  if (game?.done) {
                    if (!pick) {
                      bgColor = "yellow";
                    } else if (pick?.correct) {
                      bgColor = "green";
                    } else if (pick?.correct !== null) {
                      bgColor = "red";
                    }
                  } else if (!game && cell.column.getIndex() > 1) {
                    // TODO make columnIndexToGame map
                    bgColor = "yellow";
                  }
                  return (
                    <TableCell key={cell.id} className="p-0">
                      <div
                        className={cn(
                          bgColor === "red"
                            ? "bg-red-500 dark:bg-red-700"
                            : bgColor === "green"
                              ? "bg-green-500 dark:bg-green-700"
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
