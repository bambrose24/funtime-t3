"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { clientApi } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/types";
import { Defined } from "~/utils/defined";
import { useUserEnforced } from "~/utils/hooks/useUserEnforced";

type Props = {
  leagueId: number;
  memberId: number;
  playerProfile: RouterOutputs["playerProfile"]["get"];
  hasLeagueStarted: RouterOutputs["league"]["hasStarted"];
  league: RouterOutputs["league"]["get"];
  teams: RouterOutputs["teams"]["getTeams"];
};

export function ClientMemberPage({
  leagueId,
  memberId,
  playerProfile: initialPlayerProfile,
  hasLeagueStarted: hasLeagueStartedProp,
  league: initialLeague,
  teams: initialTeams,
}: Props) {
  const user = useUserEnforced();
  const isViewer = user.dbUser.leaguemembers.some(
    (m) => m.membership_id === memberId,
  );

  const [editSuperBowlDialogOpen, setEditSuperBowlDialogOpen] = useState(false);

  const { data: playerProfile } = clientApi.playerProfile.get.useQuery(
    {
      leagueId,
      memberId,
    },
    {
      initialData: initialPlayerProfile,
    },
  );

  const { data: league } = clientApi.league.get.useQuery(
    {
      leagueId,
    },
    { initialData: initialLeague },
  );

  const { data: hasLeagueStarted } = clientApi.league.hasStarted.useQuery(
    {
      leagueId,
    },
    {
      initialData: hasLeagueStartedProp,
    },
  );

  const { data: teams } = clientApi.teams.getTeams.useQuery(undefined, {
    initialData: initialTeams,
  });

  const superbowl = playerProfile.member.superbowl.at(0);
  const superbowlWinner = teams.find((t) => t.teamid === superbowl?.winner);
  const superbowlLoser = teams.find((t) => t.teamid === superbowl?.loser);

  console.log("playerProfile", playerProfile);
  const correct = playerProfile.correctPicks;
  const wrong = playerProfile.wrongPicks;
  const total = correct + wrong;

  const email = playerProfile.member.people.email;

  return (
    <div className="col-span-12 flex w-full flex-row justify-center py-4 md:col-span-6 md:col-start-4">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>{playerProfile.member.people.username}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full flex-row justify-between">
              <div>Email</div>
              <div className="flex flex-row gap-1">
                {!Boolean(email) ? (
                  <div className="text-sm">None</div>
                ) : (
                  <Link href={`mailto:${email}`} className="underline">
                    {playerProfile.member.people.email}
                  </Link>
                )}
              </div>
            </div>
            <Separator />
            <div className="flex w-full flex-row justify-between">
              <div>Correct Picks</div>
              <div className="flex">
                <span className="flex items-center">
                  {correct} / {total}
                </span>
                <span className="ml-2">
                  {total > 0
                    ? `(${Math.floor(
                        (playerProfile.correctPicks /
                          (playerProfile.wrongPicks +
                            playerProfile.correctPicks)) *
                          100,
                      )}%)`
                    : null}
                </span>
              </div>
            </div>
            <Separator />
            <div className="flex w-full flex-row justify-between">
              <div>Messages Sent</div>
              <div>{playerProfile.member.leaguemessages.length}</div>
            </div>
            <Separator />
            <div className="flex w-full flex-row justify-between">
              <div>Weeks Won</div>
              <div className="flex flex-row gap-1">
                {playerProfile.member.WeekWinners.length === 0 && (
                  <div className="text-sm">None</div>
                )}
                {playerProfile.member.WeekWinners.map((w, i) => {
                  return <Badge key={i}>Week {w.week}</Badge>;
                })}
              </div>
            </div>
            <Separator />
            {league.superbowl_competition === true &&
              (hasLeagueStarted === true || isViewer) && (
                <>
                  <div className="flex w-full flex-row justify-between">
                    <div>Super Bowl</div>
                    <div className="flex gap-4">
                      <div className="flex items-center text-sm">
                        {superbowlWinner
                          ? `${superbowlWinner?.abbrev} over ${superbowlLoser?.abbrev} (score ${superbowl?.score})`
                          : `No pick`}
                      </div>
                      {isViewer && hasLeagueStarted !== true ? (
                        <Dialog
                          open={editSuperBowlDialogOpen}
                          onOpenChange={setEditSuperBowlDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button variant="secondary">Edit</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Edit your Super Bowl pick
                              </DialogTitle>
                              <DialogDescription>
                                You can edit your Super Bowl pick while the
                                season has not started. When it starts, your
                                pick will be locked in.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex w-full flex-col gap-4">
                              <EditSuperbowlForm
                                memberId={memberId}
                                leagueId={leagueId}
                                playerProfile={playerProfile}
                                closeDialog={() => {
                                  setEditSuperBowlDialogOpen(false);
                                }}
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : null}
                    </div>
                  </div>
                  <Separator />
                </>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const superbowlFormSchema = z.object({
  afcTeamId: z.string(),
  nfcTeamId: z.string(),
  winnerTeamId: z.string(),
  score: z.string().min(1),
});

function EditSuperbowlForm({
  memberId,
  leagueId,
  playerProfile: playerProfileProp,
  closeDialog,
}: {
  memberId: number;
  leagueId: number;
  playerProfile: RouterOutputs["playerProfile"]["get"];
  closeDialog: () => void;
}) {
  const { data: teams } = clientApi.teams.getTeams.useQuery();

  const nfcTeams = teams?.filter((t) => t.conference === "NFC");
  const afcTeams = teams?.filter((t) => t.conference === "AFC");

  const { data: playerProfile } = clientApi.playerProfile.get.useQuery(
    {
      leagueId,
      memberId,
    },
    { initialData: playerProfileProp },
  );

  const initialWinnerTeamId = playerProfile.member.superbowl.at(0)?.winner;

  const initialTeamIds = [
    playerProfile.member.superbowl.at(0)?.loser,
    playerProfile.member.superbowl.at(0)?.winner,
  ].filter(Defined);
  const initialAfcTeamId = afcTeams?.find((t) =>
    initialTeamIds.includes(t.teamid),
  )?.teamid;
  const initialNfcTeamId = nfcTeams?.find((t) =>
    initialTeamIds.includes(t.teamid),
  )?.teamid;
  const initialScore = playerProfile.member.superbowl.at(0)?.score;
  const form = useForm<z.infer<typeof superbowlFormSchema>>({
    resolver: zodResolver(superbowlFormSchema),
    defaultValues: {
      winnerTeamId: initialWinnerTeamId?.toString() ?? "",
      afcTeamId: initialAfcTeamId?.toString() ?? "",
      nfcTeamId: initialNfcTeamId?.toString() ?? "",
      score: initialScore?.toString() ?? "",
    },
  });

  const nfcTeamId = form.watch("nfcTeamId");
  const afcTeamId = form.watch("afcTeamId");

  const resetScoreAndWinner = () => {
    form.setValue("score", "");
    form.setValue("winnerTeamId", "");
  };

  console.log("nfc and afc team ids", nfcTeamId, afcTeamId);

  const trpcUtils = clientApi.useUtils();
  const { mutateAsync: updateOrCreateSuperbowlPick } =
    clientApi.member.updateOrCreateSuperbowlPick.useMutation({
      onSettled: async () => {
        await trpcUtils.playerProfile.get.refetch({ leagueId, memberId });
      },
    });

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (data) => {
    const loserTeamId = Number(
      data.winnerTeamId === data.afcTeamId ? data.nfcTeamId : data.afcTeamId,
    );
    const winnerTeamId = Number(data.winnerTeamId);
    const score = Number(data.score);

    if (!winnerTeamId || !score || !loserTeamId) {
      throw new Error("Invalid data in form");
    }
    await updateOrCreateSuperbowlPick({
      winnerTeamId,
      memberId,
      loserTeamId,
      score,
    });

    toast.success(`Super Bowl pick updated`);

    closeDialog();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
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
                    <SelectTrigger>
                      <SelectValue placeholder="AFC Team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams
                        ?.filter((t) => t.conference === "AFC")
                        .map((team) => {
                          return (
                            <SelectItem
                              key={team.teamid}
                              value={team.teamid.toString()}
                            >
                              {team.loc} {team.name}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </FormControl>
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
                    <SelectTrigger>
                      <SelectValue placeholder="NFC Team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams
                        ?.filter((t) => t.conference === "NFC")
                        .map((team) => {
                          return (
                            <SelectItem
                              key={team.teamid}
                              value={team.teamid.toString()}
                            >
                              {team.loc} {team.name}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </FormControl>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Winner" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams
                        ?.filter((t) =>
                          [afcTeamId, nfcTeamId].includes(t.teamid.toString()),
                        )
                        .map((team) => {
                          return (
                            <SelectItem
                              key={team.teamid}
                              value={team.teamid.toString()}
                            >
                              {team.loc} {team.name}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="score"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Total Score</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <DialogClose asChild>
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            loading={form.formState.isSubmitting}
            disabled={
              form.formState.isSubmitting ||
              form.formState.isSubmitSuccessful ||
              !form.formState.isValid
            }
          >
            Save
          </Button>
        </div>
      </Form>
    </form>
  );
}
