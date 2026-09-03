"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";
import { AlertCircleIcon, Trophy } from "lucide-react";
import { useLogout } from "~/app/(auth)/auth/useLogout";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
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
import { useEffect, useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import { clientApi } from "~/trpc/react";
import { toast } from "sonner";

type Props = {
  data: NonNullable<RouterOutputs["league"]["fromJoinCode"]>;
  session: RouterOutputs["session"]["current"];
  teams: RouterOutputs["teams"]["getTeams"];
};
const registrationSchema = z.object({
  superbowlAfcTeamId: z.string(),
  superbowlNfcTeamId: z.string(),
  superbowlWinnerTeam: z.string(),
  superbowlTotalScore: z.string(),
});

const requiredTeamId = (message: string) =>
  z
    .string()
    .min(1, message)
    .refine((value) => Number.isInteger(Number(value)), message);

const requiredSuperbowlPickSchema = z.object({
  superbowlAfcTeamId: requiredTeamId("Choose an AFC team."),
  superbowlNfcTeamId: requiredTeamId("Choose an NFC team."),
  superbowlWinnerTeam: requiredTeamId("Choose the team you think will win."),
  superbowlTotalScore: requiredTeamId("Enter the combined final score."),
});

type RegistrationValues = z.infer<typeof registrationSchema>;

export function JoinLeagueClientPage({ data, session, teams }: Props) {
  const { mutateAsync: register } = clientApi.league.register.useMutation();
  const trpcUtils = clientApi.useUtils();
  const [hasAttemptedRegistration, setHasAttemptedRegistration] =
    useState(false);
  const superbowlSectionRef = useRef<HTMLDivElement>(null);

  const form = useForm<RegistrationValues>({
    resolver: zodResolver(
      data.superbowl_competition
        ? requiredSuperbowlPickSchema
        : registrationSchema,
    ),
    mode: "onChange",
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
    try {
      await register({
        code: data.share_code!,
        ...(data.superbowl_competition
          ? {
              superbowl: {
                winnerTeamId: Number(formData.superbowlWinnerTeam),
                loserTeamId: Number(
                  formData.superbowlWinnerTeam === formData.superbowlAfcTeamId
                    ? formData.superbowlNfcTeamId
                    : formData.superbowlAfcTeamId,
                ),
                score: Number(formData.superbowlTotalScore),
              },
            }
          : {}),
      });
      toast.success(`Successfully registered for ${data.name}`);
      await trpcUtils.invalidate();
      window.location.href = `/league/${data.league_id}`;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to register for league",
      );
    }
  };

  const afcTeam = teams.find((t) => t.teamid.toString() === afcTeamId);
  const nfcTeam = teams.find((t) => t.teamid.toString() === nfcTeamId);
  const superbowlPickCompleteCount = [
    afcTeamId,
    nfcTeamId,
    form.watch("superbowlWinnerTeam"),
    form.watch("superbowlTotalScore"),
  ].filter(Boolean).length;

  const onInvalid = (errors: FieldErrors<RegistrationValues>) => {
    if (!data.superbowl_competition || Object.keys(errors).length === 0) {
      return;
    }

    setHasAttemptedRegistration(true);
    window.requestAnimationFrame(() => {
      superbowlSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const registerButtonText = data.superbowl_competition
    ? "Register with Super Bowl pick"
    : "Register";

  return (
    <Form {...form}>
      <form
        className="col-span-12 flex justify-center"
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
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
            {data.superbowl_competition && (
              <Alert className="mt-4 border-amber-500/50 bg-amber-500/10 text-foreground [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400">
                <Trophy className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Super Bowl pick required</AlertTitle>
                <AlertDescription>
                  Your registration is not complete until you choose both teams,
                  a winner, and the combined final score below.
                </AlertDescription>
              </Alert>
            )}
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
                <div
                  ref={superbowlSectionRef}
                  className="flex scroll-mt-4 flex-col gap-2"
                >
                  <span className="text-lg">Super Bowl Competition</span>
                  <Text.Small>
                    {data.superbowl_competition
                      ? "This pick is required to join this league. Choose both teams, the winner, and the combined final score."
                      : "This league does not include a Super Bowl competition."}
                  </Text.Small>
                  {data.superbowl_competition && (
                    <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 sm:p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="font-medium">
                          Make your Super Bowl pick
                        </span>
                        <Text.Small className="shrink-0 font-medium text-amber-700 dark:text-amber-300">
                          Required · {superbowlPickCompleteCount}/4 complete
                        </Text.Small>
                      </div>
                      {hasAttemptedRegistration && !form.formState.isValid && (
                        <Alert
                          variant="destructive"
                          className="mb-4"
                          aria-live="assertive"
                        >
                          <AlertCircleIcon
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          <AlertTitle>Finish your Super Bowl pick</AlertTitle>
                          <AlertDescription>
                            Choose both teams, select the winner, and enter the
                            combined final score before registering.
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="grid grid-cols-[1fr_32px_1fr] gap-y-3">
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
                                  <SelectTrigger
                                    className="w-full"
                                    aria-label="AFC Team"
                                  >
                                    <SelectValue placeholder="Choose team" />
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
                                  <SelectTrigger
                                    className="w-full"
                                    aria-label="NFC Team"
                                  >
                                    <SelectValue placeholder="Choose team" />
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
                            <FormItem className="contents">
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
                                  aria-label={
                                    afcTeam
                                      ? `Pick ${afcTeam.loc} ${afcTeam.name} to win`
                                      : "Pick AFC team to win"
                                  }
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
                                  aria-label={
                                    nfcTeam
                                      ? `Pick ${nfcTeam.loc} ${nfcTeam.name} to win`
                                      : "Pick NFC team to win"
                                  }
                                />
                              </RadioGroup>
                              <FormMessage className="col-span-3 text-center" />
                            </FormItem>
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
                              <FormLabel htmlFor="superbowlTotalScore">
                                Total Score
                              </FormLabel>
                              <Input
                                {...field}
                                id="superbowlTotalScore"
                                type="number"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
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
                form.formState.isSubmitting || form.formState.isSubmitSuccessful
              }
              loading={form.formState.isSubmitting}
              type="submit"
            >
              {registerButtonText}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
