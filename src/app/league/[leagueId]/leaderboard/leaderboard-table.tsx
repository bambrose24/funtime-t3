// LeaderboardTable.tsx
import {
  type ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import Link from "next/link";
import React from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  TableRow,
  TableCell,
  Table,
  TableHead,
  TableBody,
  TableHeader,
} from "~/components/ui/table";
import { type serverApi } from "~/trpc/server";

type TableProps = {
  leaderboard: Awaited<ReturnType<typeof serverApi.leaderboard.league>>;
  rowSelection: Record<number, boolean>;
  setRowSelection: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >;
};

type Column = NonNullable<
  Awaited<ReturnType<typeof serverApi.leaderboard.league>>
>["correctCountsSorted"][number];

export const columns: ColumnDef<Column>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select Person"
      />
    ),
  },
  {
    id: "rank",
    accessorFn: (row) => {
      return row.rank;
    },
    header: "Rank",
    cell: ({ row }) => {
      return <div>{row.getValue("rank")}</div>;
    },
  },
  {
    id: "username",
    accessorFn: (d) => {
      return d;
    },
    header: "Player",
    cell: ({ cell }) => {
      const c = cell.getValue() as Column;
      return (
        <Link
          href={`/league/${c.member.league_id}/player/${c.member.membership_id}`}
          className="hover:underline"
        >
          {c.member.people.username}
        </Link>
      );
    },
  },
  {
    id: "correct",
    accessorFn: (d) => d.correct,
    header: "Correct",
    cell: ({ row }) => {
      return <div>{row.getValue("correct")}</div>;
    },
  },
];

export function LeaderboardTable(props: TableProps) {
  const table = useReactTable({
    data: props.leaderboard?.correctCountsSorted ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: props.setRowSelection,
    state: {
      rowSelection: props.rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter players..."
          value={
            (table.getColumn("username")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("username")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
