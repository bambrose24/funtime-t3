"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLogout } from "~/app/(auth)/auth/useLogout";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/types";
import { TeamLogo } from "~/components/shared/TeamLogo";
import { useEffect } from "react";
import { Input } from "~/components/ui/input";
import { clientApi } from "~/trpc/react";
import { toast } from "sonner";

type Props = {
  data: NonNullable<RouterOutputs["league"]["fromJoinCode"]>;
  session: RouterOutputs["session"]["current"];
  teams: RouterOutputs["teams"]["getTeams"];
};
const schema = z.object({
  superbowlAfcTeamId: z
    .string()
    .min(1)
    .refine((val) => !isNaN(Number(val)) && Number.isInteger(Number(val))),
  superbowlNfcTeamId: z
    .string()
    .min(1)
    .refine((val) => !isNaN(Number(val)) && Number.isInteger(Number(val))),
  superbowlWinnerTeam: z
    .string()
    .min(1)
    .refine((val) => !isNaN(Number(val)) && Number.isInteger(Number(val))),
  superbowlTotalScore: z
    .string()
    .min(1)
    .refine((val) => !isNaN(Number(val)) && Number.isInteger(Number(val))),
});

export function JoinLeagueClientPage({ data, session, teams }: Props) {
  const { mutateAsync: register } = clientApi.league.register.useMutation();
  const trpcUtils = clientApi.useUtils();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      superbowlAfcTeamId: "",
      superbowlNfcTeamId: "",
      superbowlWinnerTeam: "",
      superbowlTotalScore: "",
    },
  });

  const afcTeamId = form.watch("superbowlAfcTeamId");
  const nfcTeamId = form.watch("superbowlNfcTeamId");

  useEffect(() => {
    form.setValue("superbowlWinnerTeam", "");
  }, [afcTeamId, nfcTeamId, form]);

  const logout = useLogout();

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (
    formData,
  ) => {
    const winnerTeamId = Number(formData.superbowlWinnerTeam);
    const loserTeamId = Number(
      formData.superbowlWinnerTeam === formData.superbowlAfcTeamId
        ? formData.superbowlNfcTeamId
        : formData.superbowlAfcTeamId,
    );
    await register({
      code: data.share_code!,
      superbowl: {
        loserTeamId,
        winnerTeamId,
        score: Number(formData.superbowlTotalScore),
      },
    });
    toast.success(`Successfully registered for ${data.name}`);
    await trpcUtils.invalidate();
    window.location.href = `/league/${data.league_id}`;
  };

  const afcTeam = teams.find((t) => t.teamid.toString() === afcTeamId);
  const nfcTeam = teams.find((t) => t.teamid.toString() === nfcTeamId);

  return (
    <Form {...form}>
      <form
        className="col-span-12 flex justify-center"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card className="max-w-[600px]">
          <CardHeader>
            <CardTitle>Join {data.name}</CardTitle>
            <CardDescription>
              Register below to join. You are logged in as{" "}
              <span className="font-bold">{session.dbUser?.username}</span>. Not
              you?{" "}
              <span onClick={logout} className="cursor-pointer underline">
                Log out
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-lg font-bold">League Rules</span>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <span className="text-lg">Late Policy</span>
                  <Text.Small>
                    {data.late_policy === "allow_late_and_lock_after_start"
                      ? "Late picks are allowed. You can make picks for games that haven't started yet, even if you missed earlier games. However, you won't be able to see other players' picks until you submit yours."
                      : "Picks close at the start of the first game of the week. No late picks are allowed."}
                  </Text.Small>
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                  <span className="text-lg">Pick Policy</span>
                  <Text.Small>
                    {data.pick_policy === "choose_winner"
                      ? "You'll be picking the winner of each game."
                      : "Pick policy not specified."}
                  </Text.Small>
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                  <span className="text-lg">Reminders</span>
                  <Text.Small>
                    {data.reminder_policy === "three_hours_before"
                      ? "You'll receive a reminder email about 3 hours before the first game of the week if you haven't made your picks yet."
                      : "No automatic reminders will be sent."}
                  </Text.Small>
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                  <span className="text-lg">Super Bowl Competition</span>
                  <Text.Small>
                    {data.superbowl_competition
                      ? "This league includes a Super Bowl competition. You'll pick the winner, loser, and total score of the Super Bowl. The most accurate prediction wins!"
                      : "This league does not include a Super Bowl competition."}
                  </Text.Small>
                  {data.superbowl_competition && (
                    <div className="mt-4 grid grid-cols-[1fr_32px_1fr] gap-y-3">
                      <FormField
                        control={form.control}
                        name="superbowlAfcTeamId"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>AFC Team</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {teams
                                    .filter((t) => t.conference === "AFC")
                                    .map((team, idx) => (
                                      <SelectItem
                                        key={idx}
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
                      <div />
                      <FormField
                        control={form.control}
                        name="superbowlNfcTeamId"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>NFC Team</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {teams
                                    .filter((t) => t.conference === "NFC")
                                    .map((team, idx) => (
                                      <SelectItem
                                        key={idx}
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
                        name="superbowlWinnerTeam"
                        render={({ field }) => (
                          <>
                            <RadioGroup
                              name={field.name}
                              onValueChange={field.onChange}
                              value={field.value.toString()}
                              defaultValue={field.value.toString()}
                              className={cn(
                                "flex flex-col items-center justify-center",
                                {
                                  "transition-all duration-500": true,
                                  "h-0 opacity-0": !afcTeam || !nfcTeam,
                                },
                              )}
                            >
                              {afcTeam && (
                                <FormLabel>
                                  <TeamLogo
                                    abbrev={afcTeam.abbrev ?? ""}
                                    width={64}
                                    height={64}
                                  />
                                </FormLabel>
                              )}
                              <RadioGroupItem
                                value={afcTeam?.teamid.toString() ?? ""}
                              />
                            </RadioGroup>
                            <Text.Small
                              className={cn(
                                "flex items-center justify-center font-normal text-secondary-foreground",
                                {
                                  "transition-all duration-500": true,
                                  "h-0 opacity-0": !afcTeam || !nfcTeam,
                                },
                              )}
                            >
                              vs
                            </Text.Small>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value.toString()}
                              value={field.value.toString()}
                              className={cn(
                                "flex flex-col items-center gap-2",
                                {
                                  "transition-all duration-500": true,
                                  "h-0 opacity-0": !afcTeam || !nfcTeam,
                                },
                              )}
                            >
                              {nfcTeam && (
                                <FormLabel>
                                  <TeamLogo
                                    abbrev={nfcTeam.abbrev ?? ""}
                                    width={64}
                                    height={64}
                                  />
                                </FormLabel>
                              )}
                              <RadioGroupItem
                                value={nfcTeam?.teamid.toString() ?? ""}
                              />
                            </RadioGroup>
                          </>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="superbowlTotalScore"
                        render={({ field }) => (
                          <FormItem
                            className={cn("col-span-3 mt-4 w-full", {
                              "transition-all duration-500": true,
                              "h-0 opacity-0": !afcTeam || !nfcTeam,
                            })}
                          >
                            <FormLabel>Total Score</FormLabel>
                            <Input {...field} type="number" />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={
                form.formState.isSubmitting ||
                form.formState.isSubmitSuccessful ||
                !form.formState.isValid
              }
              loading={form.formState.isSubmitting}
              type="submit"
            >
              Register
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
