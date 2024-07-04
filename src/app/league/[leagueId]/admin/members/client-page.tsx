"use client";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { clientApi } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/types";
import { Text } from "~/components/ui/text";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import Link from "next/link";

type Props = {
  leagueId: number;
  league: RouterOutputs["league"]["get"];
  members: RouterOutputs["league"]["admin"]["members"];
};

export function LeagueAdminMembersClientPage({
  leagueId,
  members: membersProp,
}: Props) {
  const {
    data: { members },
  } = clientApi.league.admin.members.useQuery(
    {
      leagueId,
    },
    { initialData: membersProp },
  );
  return (
    <Card>
      <CardHeader>
        <Text.H3>Members</Text.H3>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>{members.length} total</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Wins</TableHead>
              <TableHead className="text-right">Correct Picks</TableHead>
              <TableHead className="text-right">Wrong Picks</TableHead>
              <TableHead className="text-right">Missed Picks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              return (
                <TableRow key={member.membership_id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/league/${leagueId}/member/${member.membership_id}`}
                      className="hover:underline"
                    >
                      {member.people.username}
                    </Link>
                  </TableCell>
                  <TableCell>{member.people.email}</TableCell>
                  <TableCell>None</TableCell>
                  <TableCell className="text-right">
                    {member.correctPicks}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.wrongPicks}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.misssedPicks}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
