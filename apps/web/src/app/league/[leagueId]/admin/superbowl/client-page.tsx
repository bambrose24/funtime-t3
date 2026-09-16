"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CircleDashed, LockKeyhole, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { TeamLogo } from "~/components/shared/TeamLogo";
import { clientApi } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/types";

type SuperbowlAdminData = RouterOutputs["league"]["admin"]["superbowlPicks"];
type SuperbowlAdminMember = SuperbowlAdminData["members"][number];
type Teams = NonNullable<RouterOutputs["teams"]["getTeams"]>;

const superbowlFormSchema = z.object({
  afcTeamId: z.string().min(1),
  nfcTeamId: z.string().min(1),
  winnerTeamId: z.string().min(1),
  score: z.string().min(1),
});

export function LeagueAdminSuperbowlClientPage({
  leagueId,
  initialData,
  teams,
}: {
  leagueId: number;
  initialData: SuperbowlAdminData;
  teams: Teams;
}) {
  const [editingMember, setEditingMember] =
    useState<SuperbowlAdminMember | null>(null);
  const { data } = clientApi.league.admin.superbowlPicks.useQuery(
    { leagueId },
    { initialData },
  );
  const { enabled, members } = data;
  const submittedCount = members.filter((member) => member.pick).length;
  const editingUsername = editingMember?.people.username ?? "";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-3 border-b bg-muted/20">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="space-y-1">
            <CardTitle>Super Bowl Picks</CardTitle>
            <p className="max-w-2xl text-sm text-muted-foreground">
              See every member&apos;s predicted winner, runner-up, and combined
              final score. Members who never submitted a pick still appear here
              so you can add one for them.
            </p>
          </div>
          {enabled && (
            <div className="flex shrink-0 items-center gap-2">
              <Badge className="gap-1.5 bg-green-700 hover:bg-green-700 dark:bg-green-600">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {submittedCount} submitted
              </Badge>
              <Badge
                variant="outline"
                className="gap-1.5 text-muted-foreground"
              >
                <CircleDashed className="h-3.5 w-3.5" aria-hidden="true" />
                {members.length - submittedCount} waiting
              </Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
          Only league admins can open this page.
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!enabled ? (
          <div className="px-6 py-10 text-center">
            <p className="font-medium">Super Bowl picks are turned off</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This league does not have the Super Bowl competition enabled.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[680px]">
              <TableCaption>
                {submittedCount} of {members.length} members have submitted a
                pick
                {members.length - submittedCount > 0
                  ? `. ${members.length - submittedCount} still need one.`
                  : "."}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead>Runner-up</TableHead>
                  <TableHead className="text-right">Total score</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const winner =
                    member.pick?.teams_superbowl_winnerToteams ?? null;
                  const loser =
                    member.pick?.teams_superbowl_loserToteams ?? null;

                  return (
                    <TableRow key={member.membership_id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/league/${leagueId}/player/${member.membership_id}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {member.people.username}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {winner ? (
                          <TeamPrediction team={winner} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {loser ? (
                          <TeamPrediction team={loser} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {member.pick?.score ?? (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.pick ? (
                          <Badge
                            variant="secondary"
                            className="gap-1 text-green-800 dark:text-green-300"
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            Submitted
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            Not submitted
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Edit Super Bowl pick for ${member.people.username}`}
                          onClick={() => setEditingMember(member)}
                        >
                          <Pencil
                            className="mr-1.5 h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          {member.pick ? "Edit" : "Add pick"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {editingMember ? (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setEditingMember(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMember.pick ? "Edit" : "Add"} Super Bowl pick
              </DialogTitle>
                <DialogDescription>
                  {`Set ${editingUsername}'s winner, runner-up, and combined final score.`}
                </DialogDescription>
            </DialogHeader>
            <AdminSuperbowlPickForm
              key={editingMember.membership_id}
              leagueId={leagueId}
              member={editingMember}
              teams={teams}
              onCancel={() => setEditingMember(null)}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </Card>
  );
}

function TeamPrediction({
  team,
}: {
  team: { abbrev: string | null; loc: string; name: string };
}) {
  return (
    <div className="flex items-center gap-2">
      {team.abbrev && <TeamLogo abbrev={team.abbrev} width={22} height={22} />}
      <span>
        <span className="font-medium">{team.abbrev}</span>
        <span className="ml-2 hidden text-muted-foreground lg:inline">
          {team.loc} {team.name}
        </span>
      </span>
    </div>
  );
}

function AdminSuperbowlPickForm({
  leagueId,
  member,
  teams,
  onCancel,
}: {
  leagueId: number;
  member: SuperbowlAdminMember;
  teams: Teams;
  onCancel: () => void;
}) {
  const utils = clientApi.useUtils();
  const { mutateAsync: setSuperbowlPick } =
    clientApi.league.admin.setSuperbowlPick.useMutation({
      onSuccess: async () => {
        await utils.league.admin.superbowlPicks.invalidate({ leagueId });
      },
    });

  const afcTeams = teams.filter((team) => team.conference === "AFC");
  const nfcTeams = teams.filter((team) => team.conference === "NFC");
  const initialTeamIds = [member.pick?.winner, member.pick?.loser].filter(
    (teamId): teamId is number => typeof teamId === "number",
  );
  const initialAfcTeamId = afcTeams.find((team) =>
    initialTeamIds.includes(team.teamid),
  )?.teamid;
  const initialNfcTeamId = nfcTeams.find((team) =>
    initialTeamIds.includes(team.teamid),
  )?.teamid;

  const form = useForm<z.infer<typeof superbowlFormSchema>>({
    resolver: zodResolver(superbowlFormSchema),
    mode: "onChange",
    defaultValues: {
      winnerTeamId: member.pick?.winner?.toString() ?? "",
      afcTeamId: initialAfcTeamId?.toString() ?? "",
      nfcTeamId: initialNfcTeamId?.toString() ?? "",
      score: member.pick?.score?.toString() ?? "",
    },
  });

  const nfcTeamId = form.watch("nfcTeamId");
  const afcTeamId = form.watch("afcTeamId");

  const resetScoreAndWinner = () => {
    form.setValue("score", "");
    form.setValue("winnerTeamId", "");
  };

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (data) => {
    const loserTeamId = Number(
      data.winnerTeamId === data.afcTeamId ? data.nfcTeamId : data.afcTeamId,
    );
    const winnerTeamId = Number(data.winnerTeamId);
    const score = Number(data.score);

    if (!winnerTeamId || !score || !loserTeamId) {
      toast.error("Choose both teams, a winner, and a total score");
      return;
    }

    try {
      await setSuperbowlPick({
        leagueId,
        memberId: member.membership_id,
        winnerTeamId,
        loserTeamId,
        score,
      });
      toast.success(
        member.pick
          ? `Updated Super Bowl pick for ${member.people.username}`
          : `Added Super Bowl pick for ${member.people.username}`,
      );
      onCancel();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't save that Super Bowl pick",
      );
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, () => {
        toast.error("Choose both teams, a winner, and a total score");
      })}
      className="flex flex-col gap-3"
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="afcTeamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AFC Team</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      resetScoreAndWinner();
                      field.onChange(val);
                    }}
                  >
                    <SelectTrigger aria-label="AFC Team">
                      <SelectValue placeholder="AFC Team" />
                    </SelectTrigger>
                    <SelectContent>
                      {afcTeams.map((team) => (
                        <SelectItem
                          key={team.teamid}
                          value={team.teamid.toString()}
                        >
                          {team.loc} {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nfcTeamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NFC Team</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      resetScoreAndWinner();
                      field.onChange(val);
                    }}
                  >
                    <SelectTrigger aria-label="NFC Team">
                      <SelectValue placeholder="NFC Team" />
                    </SelectTrigger>
                    <SelectContent>
                      {nfcTeams.map((team) => (
                        <SelectItem
                          key={team.teamid}
                          value={team.teamid.toString()}
                        >
                          {team.loc} {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="winnerTeamId"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Winner</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Winner">
                      <SelectValue placeholder="Winner" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams
                        .filter((team) =>
                          [afcTeamId, nfcTeamId].includes(
                            team.teamid.toString(),
                          ),
                        )
                        .map((team) => (
                          <SelectItem
                            key={team.teamid}
                            value={team.teamid.toString()}
                          >
                            {team.loc} {team.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="score"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel htmlFor="adminSuperbowlTotalScore">
                  Total Score
                </FormLabel>
                <FormControl>
                  <Input
                    id="adminSuperbowlTotalScore"
                    type="number"
                    min={1}
                    max={200}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting}
          >
            Save
          </Button>
        </div>
      </Form>
    </form>
  );
}
