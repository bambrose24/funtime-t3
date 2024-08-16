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
import { ExternalLink, Pencil } from "lucide-react";
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
import { capitalize, orderBy } from "lodash";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";

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
    data: { members: membersData },
  } = clientApi.league.admin.members.useQuery(
    {
      leagueId,
    },
    { initialData: membersProp },
  );

  const members = orderBy(membersData, (m) =>
    m.people.username.toLocaleLowerCase(),
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
              <TableHead>Role</TableHead>
              <TableHead>Wins</TableHead>
              <TableHead>Missed Picks</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              return (
                <TableRow key={member.membership_id} className="group">
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
                  <TableCell>{capitalize(member.role ?? "")}</TableCell>
                  <TableCell className="flex gap-1">
                    {member.WeekWinners.length === 0
                      ? "--"
                      : member.WeekWinners.map((weekWin, idx) => (
                          <Badge key={idx}>Week {weekWin.week}</Badge>
                        ))}
                  </TableCell>
                  <TableCell>{member.misssedPicks}</TableCell>
                  <TableCell className="sticky right-0 flex items-center justify-end">
                    <div className="border-x border-border bg-card px-2 transition-colors group-hover:bg-transparent md:border-none">
                      <MemberActions member={member} league={league} />
                    </div>
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

type MemberProps = {
  league: Props["league"];
  member: Props["members"]["members"][number];
};

function MemberActions({ member, league }: MemberProps) {
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
                <Pencil className="h-4 w-4" /> Edit Player
              </div>
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {member.people.username}</DialogTitle>
              <DialogDescription>
                Make changes to {member.people.username}&apos;s membership in
                this league.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <RoleChangeRow member={member} league={league} />
              <Separator />
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    Remove {member.people.username} from {league.name}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>Are you sure?</DialogHeader>
                  <DialogDescription>
                    This action cannot be undone. By confirming, you are
                    removing {member.people.username} from the league.
                  </DialogDescription>
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      type="button"
                      className="w-full"
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
                      Yes, remove {member.people.username} from {league.name}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <DialogFooter className="flex w-full">
              <Button
                variant="secondary"
                className="w-full"
                type="button"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </DropdownMenuContent>
      </DropdownMenu>
    </Dialog>
  );
}

const roles = ["admin", "player"] as const;
const roleChangeSchema = z.object({
  role: z.enum(roles),
});

function RoleChangeRow({ member, league }: MemberProps) {
  const form = useForm<z.infer<typeof roleChangeSchema>>({
    resolver: zodResolver(roleChangeSchema),
    defaultValues: {
      role: member.role ?? "player",
    },
  });

  const trpcUtils = clientApi.useUtils();
  const { mutateAsync: changeMemberRole } =
    clientApi.league.admin.changeMemberRole.useMutation({
      onSettled: async () => {
        await trpcUtils.league.admin.invalidate();
      },
    });

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (data) => {
    await changeMemberRole({
      leagueId: league.league_id,
      memberId: member.membership_id,
      role: data.role,
    });
    toast.success(
      `Updated ${member.people.username}'s role to ${capitalize(data.role)}`,
    );
    form.reset();
  };

  const invalid = !form.formState.isValid || !form.formState.isDirty;
  const loading = form.formState.isSubmitting;
  const disabled = invalid || loading;

  return (
    <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
      <Form {...form}>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center text-lg">Role</div>
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => {
                      return (
                        <SelectItem key={role} value={role}>
                          {capitalize(role)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <Button
            variant="secondary"
            type="submit"
            disabled={disabled}
            loading={loading}
          >
            Save
          </Button>
        </div>
      </Form>
    </form>
  );
}
