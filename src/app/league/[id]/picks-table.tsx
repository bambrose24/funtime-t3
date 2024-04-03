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
import { useMemo } from "react";
import _ from "lodash";
import { cn } from "~/lib/utils";

type Props = {
  picksSummary: Awaited<ReturnType<typeof serverApi.league.picksSummary>>;
  games: Awaited<ReturnType<typeof serverApi.games.getGames>>;
  teams: Awaited<ReturnType<typeof serverApi.teams.getTeams>>;
};

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Pick = Props["picksSummary"][number];

export function PicksTable({ picksSummary, games, teams }: Props) {
  const teamIdToTeam = useMemo(() => {
    return teams.reduce((prev, curr) => {
      prev.set(curr.teamid, curr);
      return prev;
    }, new Map<number, (typeof teams)[number]>());
  }, [teams]);

  const gameIdToGame = useMemo(() => {
    return games.reduce((prev, curr) => {
      prev.set(curr.gid, curr);
      return prev;
    }, new Map<number, (typeof games)[number]>());
  }, [games]);

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
        return data?.people?.username;
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
                  <TableHead key={header.id}>
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

                  if (
                    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
                    cell &&
                    cell.row &&
                    cell.row.original &&
                    cell.row.original.gameIdToPick &&
                    cell.row.original.gameIdToPick.get &&
                    cell.row.original.gameIdToPick.get(gid)
                  ) {
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
                  }
                  return (
                    <TableCell key={cell.id} className="p-0">
                      <div
                        className={cn(
                          bgColor === "red"
                            ? "bg-red-700"
                            : bgColor === "green"
                              ? "bg-green-700"
                              : bgColor === "yellow"
                                ? "bg-yellow-700"
                                : "",
                          "flex h-full w-full flex-row items-center justify-center p-1",
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
