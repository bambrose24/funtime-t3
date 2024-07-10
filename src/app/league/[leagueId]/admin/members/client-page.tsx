"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { clientApi } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ExternalLink, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  leagueId: number;
  league: RouterOutputs["league"]["get"];
  members: RouterOutputs["league"]["admin"]["members"];
};

export function LeagueAdminMembersClientPage({
  leagueId,
  league,
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
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>{members.length} total</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Player</TableHead>
              <TableHead className="text-center">Wins</TableHead>
              <TableHead className="text-center">Missed Picks</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              return (
                <TableRow key={member.membership_id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/league/${leagueId}/player/${member.membership_id}`}
                      className="hover:underline"
                    >
                      <div className="flex flex-col items-start">
                        <div className="text-sm font-medium">
                          {member.people.username}
                        </div>
                        <div className="text-xs font-light">
                          {member.people.email}
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>None</TableCell>
                  <TableCell className="text-center">
                    {member.misssedPicks}
                  </TableCell>
                  <TableCell className="flex items-center justify-end">
                    <MemberActions member={member} league={league} />
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

function MemberActions({
  member,
  league,
}: {
  league: Props["league"];
  member: Props["members"]["members"][number];
}) {
  const [open, setOpen] = useState(false);
  const utils = clientApi.useUtils();
  const removeMember = clientApi.league.admin.removeMember.useMutation({
    onSettled: async () => {
      await utils.league.admin.invalidate();
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{member.people.username}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link
              href={`/league/${member.league_id}/player/${member.membership_id}`}
            >
              <div className="flex items-center gap-2">
                Profile <ExternalLink className="h-4 w-4" />
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
              <div className="flex items-center gap-2">
                <X className="h-4 w-4" /> Remove Player
              </div>
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently remove{" "}
                <span className="font-bold">{member.people.username}</span> from
                the <span className="font-bold">{league.name}</span> league.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex w-full justify-between">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                type="button"
                loading={removeMember.isPending}
                disabled={removeMember.isPending}
                onClick={async () => {
                  await removeMember.mutateAsync({
                    memberId: member.membership_id,
                    leagueId: member.league_id,
                  });
                  toast.success(
                    `Successfully removed ${member.people.username} from ${league.name}.`,
                  );
                  setOpen(false);
                }}
              >
                Remove {member.people.username}
              </Button>
            </DialogFooter>
          </DialogContent>
        </DropdownMenuContent>
      </DropdownMenu>
    </Dialog>
  );
}
