"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
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
import { clientApi } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/types";
import { Defined } from "~/utils/defined";

const superbowlFormSchema = z.object({
  afcTeamId: z.string(),
  nfcTeamId: z.string(),
  winnerTeamId: z.string(),
  score: z.string().min(1),
});

export function EditSuperbowlForm({
  memberId,
  leagueId,
  playerProfile: playerProfileProp,
  onCancel,
}: {
  memberId: number;
  leagueId: number;
  playerProfile: RouterOutputs["playerProfile"]["get"];
  onCancel: () => void;
}) {
  const { data: teams } = clientApi.teams.getTeams.useQuery();

  const nfcTeams = teams?.filter((team) => team.conference === "NFC");
  const afcTeams = teams?.filter((team) => team.conference === "AFC");

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
  const initialAfcTeamId = afcTeams?.find((team) =>
    initialTeamIds.includes(team.teamid),
  )?.teamid;
  const initialNfcTeamId = nfcTeams?.find((team) =>
    initialTeamIds.includes(team.teamid),
  )?.teamid;
  const initialScore = playerProfile.member.superbowl.at(0)?.score;
  const form = useForm<z.infer<typeof superbowlFormSchema>>({
    resolver: zodResolver(superbowlFormSchema),
    mode: "onChange",
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

    onCancel();
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-3"
    >
      <div>
        <h3 className="text-sm font-medium">Edit your Super Bowl pick</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          You can change this until the season starts. After kickoff it locks.
        </p>
      </div>
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
                      {teams
                        ?.filter((team) => team.conference === "AFC")
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
                    <SelectTrigger aria-label="NFC Team">
                      <SelectValue placeholder="NFC Team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams
                        ?.filter((team) => team.conference === "NFC")
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
                    <SelectTrigger aria-label="Winner">
                      <SelectValue placeholder="Winner" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams
                        ?.filter((team) =>
                          [afcTeamId, nfcTeamId].includes(
                            team.teamid.toString(),
                          ),
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
                <FormLabel htmlFor="profileSuperbowlTotalScore">
                  Total Score
                </FormLabel>
                <FormControl>
                  <Input
                    id="profileSuperbowlTotalScore"
                    type="number"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
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
