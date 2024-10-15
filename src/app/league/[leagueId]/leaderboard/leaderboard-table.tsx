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
import { clientApi } from "~/trpc/react";
import { type serverApi } from "~/trpc/server";
import { Badge } from "~/components/ui/badge";

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

export function LeaderboardTable(props: TableProps) {
  const { data: session } = clientApi.session.current.useQuery();

  const columns: ColumnDef<Column>[] = [
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
      header: "Rank",
      cell: ({ row }) => row.original.rank,
    },
    {
      id: "username",
      header: "Player",
      cell: ({ row }) => {
        const isMe = session?.dbUser?.uid === row.original.member.user_id;
        return (
          <Link
            href={`/league/${row.original.member.league_id}/player/${row.original.member.membership_id}`}
            className="hover:underline"
          >
            {isMe ? (
              <Badge variant="default">
                {row.original.member.people.username}
              </Badge>
            ) : (
              row.original.member.people.username
            )}
          </Link>
        );
      },
    },
    {
      id: "correct",
      header: "Correct",
      cell: ({ row }) => row.original.correct,
    },
  ];

  const table = useReactTable({
    data: props.leaderboard?.correctCountsSorted ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
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
